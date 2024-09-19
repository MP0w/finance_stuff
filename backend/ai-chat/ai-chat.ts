import { anthropic } from "@ai-sdk/anthropic";
import { CoreMessage, streamText } from "ai";


export class AIChat {
  private messages: CoreMessage[] = [];
  private context: AIChatContext;

  constructor(context: AIChatContext) {
    this.messages = [];
    this.context = context;
  }

  async *onUserMessage(message: string) {
    this.messages.push({ role: "user", content: message });

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: `
      You are a personal finance and budgeting expert, respectful and honest assistant. 
      You are having a chat with the user so try to write concise messages, like if you were sending SMS messages, eventually there will be follow up questions, do not reply with long messages unless really necessary, typically 100/200 characters are more thanenough.
      IMPORTANT:You cannot really reply on anything else that is not the about the user personal finance and budgeting, in that case reply with a short message redirecting the topic.

      The user currency is: ${this.context.currency}
      These is a CVS containing a summary of the user finances in the last months:
      <cvs>
      ${this.context.cvs}
      </cvs>

      Some statistics about the user finances:
      <statistics>
      ${this.context.stats}
      </statistics>

      The user current portfolio is:
      <portfolio>
      ${this.context.currentPortfolio}
      </portfolio>
      `,
      messages: this.messages,
    });

    let fullResponse = "";

    for await (const delta of result.textStream) {
      fullResponse += delta;
      yield delta;
    }

    // const usedTokens = await result.usage;

    this.messages.push({ role: "assistant", content: fullResponse });
  }
}
