import { anthropic } from "@ai-sdk/anthropic";
import { CoreMessage, streamText } from "ai";
import { Users } from "../types";
import { AIChatContext, makeAIContext } from "./aiContext";
import { DateTime } from "luxon";
import { getUser, updateUser } from "../endpoints/Users/users";

export class AIChat {
  id: string;
  messages: CoreMessage[] = [];
  private userId: string;
  private context: AIChatContext;
  private user: Users;

  static async createChat(id: string, userId: string) {
    const user = await getUser(userId);

    if (!user) {
      throw Error("could not get user");
    }

    const context = await makeAIContext(user);

    return new AIChat(user, context, id, userId);
  }

  constructor(user: Users, context: AIChatContext, id: string, userId: string) {
    this.messages = [];
    this.id = id;
    this.userId = userId;
    this.user = user;
    this.context = context;
  }

  async refreshContext() {
    try {
      this.context = await makeAIContext(this.user);
    } catch {
      console.error("failed to refresh context");
    }
  }

  clear() {
    this.messages = [];
  }

  async *onUserMessage(message: string) {
    this.messages.push({ role: "user", content: message });

    if (message.length > 5000) {
      const content = "your message is too long, please send a shorter message";
      yield content;
      this.messages.push({
        role: "assistant",
        content,
      });
      return;
    }

    if (!this.user) {
      const content = "something went wrong, please try again";
      yield content;
      this.messages.push({
        role: "assistant",
        content,
      });
      return;
    }

    if (
      this.context.stats.averageTotal === 0 ||
      this.context.currentPortfolio.length === 0
    ) {
      const content =
        "You do not seem to have any accounting yet, add your accounts and entries to start using the AI assistant. The more you track your finances in the app the more accurate we can be. You can also add or import data from previous months/years!";
      yield content;
      this.messages.push({
        role: "assistant",
        content,
      });
      return;
    }

    if (
      !this.context.lastEntryDate ||
      DateTime.fromFormat(this.context.lastEntryDate, "yyyy-MM-dd").diffNow(
        "days"
      ).days < -60
    ) {
      const content =
        "Your accounting data is too old, please add recent data to use the AI assistant. This will make sure it's going to be accurate!";
      yield content;
      this.messages.push({
        role: "assistant",
        content,
      });
      return;
    }

    if (this.user.available_ai_tokens <= 0) {
      const content =
        "you finished the credits available to use the AI assistant, you can buy more to keep using it!";
      yield content;
      this.messages.push({
        role: "assistant",
        content,
      });

      // Refresh user data in case tokens changed
      this.user = (await getUser(this.userId)) ?? this.user;
      return;
    }

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: `
      You are a personal finance and budgeting expert, respectful and honest assistant. 
      You are having a chat with the user so try to write concise messages, like if you were sending SMS messages, eventually there will be follow up questions, do not reply with long messages unless really necessary, typically 100/200 characters are more thanenough.
      IMPORTANT:You cannot really reply on anything else that is not the about the user personal finance and budgeting, in that case reply with a short message redirecting the topic.

      The user currency is: ${this.user.currency}
      These is a csv containing a summary of the user finances in the last months (the user sees a table, do not mention the csv):
      <csv>
      ${this.context.csv}
      </csv>

      Some statistics about the user finances:
      <statistics>
      - Average savings: ${this.context.stats.averageSavings}
      - Average total net worth: ${this.context.stats.averageTotal}
      - Average profits: ${this.context.stats.averageProfits}
      - Monthly income: ${
        this.context.stats.monthlyIncome
          ? this.context.stats.monthlyIncome
          : "UNKNOWN (ask if needed to reply)"
      }
      </statistics>

      The user current portfolio is:
      <portfolio>
      ${this.context.currentPortfolio
        .map((portfolio) => `${portfolio.accountName}: ${portfolio.balance}`)
        .join("\n")}
      </portfolio>
      `,
      messages: this.messages,
    });

    let fullResponse = "";

    for await (const delta of result.textStream) {
      fullResponse += delta;
      yield delta;
    }

    const usage = await result.usage;

    this.messages.push({ role: "assistant", content: fullResponse });

    const aiTokensUsage = {
      used_ai_total_tokens: this.user.used_ai_total_tokens + usage.totalTokens,
      used_ai_prompt_tokens:
        this.user.used_ai_prompt_tokens + usage.promptTokens,
      available_ai_tokens: this.user.available_ai_tokens - usage.totalTokens,
    };
    await updateUser(this.userId, aiTokensUsage);
    this.user = {
      ...this.user,
      ...aiTokensUsage,
    };
  }
}
