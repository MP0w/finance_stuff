import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, LanguageModelUsage } from "ai";
import { Application } from "express";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import multer from "multer";
import { z } from "zod";
import { CategoryMap } from "../../types";
import PromisePool from "@supercharge/promise-pool";
import { Document } from "@langchain/core/documents";
import { getUser, updateUser } from "../Users/users";

type Transaction = {
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: "e" | "i" | "m";
  category: string | null;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB in bytes
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

async function handleFile(file: Express.Multer.File) {
  const blob = new Blob([file.buffer], { type: "application/pdf" });

  const loader = new PDFLoader(blob, { splitPages: true });
  const docs = await loader.load();

  return handleDoc(docs, undefined);
}

async function handleDoc(
  docs: Document<Record<string, any>>[],
  pagesToRetry?: Set<number>
): Promise<{
  transactions: Transaction[];
  failedPages: number[];
  usage: LanguageModelUsage;
}> {
  const promises = docs.map((doc, index) => {
    if (pagesToRetry && !pagesToRetry.has(index)) {
      return Promise.resolve({
        object: {
          transactions: [] as Transaction[],
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      });
    }

    return generateObject({
      model: anthropic("claude-3-haiku-20240307"),
      schema: z.object({
        transactions: z
          .array(
            z.object({
              date: z.string(),
              description: z.string(),
              amount: z.number(),
              currency: z.string(),
              type: z.enum(["e", "i", "m"]),
              category: z.string().nullable(),
            })
          )
          .optional(),
      }),
      system: `You are an AI assistant that analyzes PDF documents of bank statements.
    The user will provide a text file containing all the text from a bank statement, the text might be from multiple pages with a lot of noise between transactions, do not miss any, we are only interested in transactions so you need to strip out all the text that is unrelated to transactions, like addresses, bank information, etc...
    Output an array of transactions, each transaction should have the following properties:
    - date: string
    - description: string
    - amount: number
    - currency: string
    - type: "e" | "i" | "m"
    - category: string | null

    Legend:
    - Date format is yyyy-MM-dd
    - The type can be "e" for expense, "i" for income or "m" for movement between accounts.
    - The category should be one of the following codes:
    ${Object.keys(CategoryMap)
      .map((key) => `${key}: ${CategoryMap[key as keyof typeof CategoryMap]}`)
      .join("\n")}

    the resulting json should be valid MINIFIED json and nothing else with format {transactions:[]}.
    `,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Here's the bank statement:\n\n${doc.pageContent}`,
            },
          ],
        },
      ],
    });
  });

  const pool = await PromisePool.for(promises)
    .withConcurrency(10)
    .process(async (promise, index) => {
      try {
        const result = await promise;
        return {
          transactions: result.object.transactions ?? [],
          failure: false,
          index: index,
          usage: result.usage,
        };
      } catch (error) {
        console.error(`Error processing page ${index}`, error);
        return {
          transactions: [],
          failure: true,
          index: index,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }
    });

  const failedPages = pool.results
    .filter((result) => result.failure)
    .map((result) => result.index);

  const retryResult =
    failedPages.length > 0 && !pagesToRetry
      ? await handleDoc(docs, new Set(failedPages))
      : {
          transactions: [],
          failedPages,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };

  const transactions = pool.results
    .map((result) => result.transactions ?? [])
    .concat(retryResult.transactions)
    .flat()
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const usage = pool.results
    .map((result) => result.usage)
    .concat(retryResult.usage)
    .reduce(
      (acc, usage) => ({
        promptTokens: acc.promptTokens + usage.promptTokens,
        completionTokens: acc.completionTokens + usage.completionTokens,
        totalTokens: acc.totalTokens + usage.totalTokens,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

  return {
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: Math.abs(transaction.amount),
    })),
    failedPages: retryResult.failedPages,
    usage,
  };
}

export function expensesImportRouter(app: Application) {
  app.post("/expenses/upload", upload.single("pdfFile"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No PDF file uploaded" });
      return;
    }

    try {
      const user = await getUser(req.userId);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (user.available_ai_tokens <= 0) {
        throw Error("not have AI credits");
      }

      const result = await handleFile(req.file);

      res.json(result);

      const aiTokensUsage = {
        used_ai_total_tokens:
          user.used_ai_total_tokens + Math.floor(result.usage.totalTokens / 10),
        used_ai_prompt_tokens:
          user.used_ai_prompt_tokens +
          Math.floor(result.usage.promptTokens / 10),
        available_ai_tokens:
          user.available_ai_tokens - Math.floor(result.usage.totalTokens / 10),
      };
      try {
        await updateUser(user.id, aiTokensUsage);
      } catch (error) {
        console.error("Error updating user", error);
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
}
