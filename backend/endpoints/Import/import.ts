import { anthropic } from "@ai-sdk/anthropic";
import { CoreMessage, generateObject } from "ai";
import { Application } from "express";
import expressAsyncHandler from "express-async-handler";
import NodeCache from "node-cache";
import { dbConnection, generateUUID } from "../../dbConnection";
import {
  AccountingEntries,
  Accounts,
  Table,
  ImportProposal,
} from "../../types";
import { z } from "zod";

type UserAccountState = {
  accountingEntries: { id: string; date: string }[];
  accounts: { id: string; name: string }[];
  investments: { id: string; name: string }[];
};

type ImportProposalState = {
  id: string;
  csv: string;
  userAccountState: UserAccountState;
  steps: (
    | { type: "proposal"; proposal: ImportProposal }
    | { type: "input"; message: string }
  )[];
};

const importCache = new NodeCache({
  stdTTL: 60 * 60 * 3,
  checkperiod: 60 * 60 * 3,
  deleteOnExpire: true,
});

async function getImportProposal(
  state: ImportProposalState
): Promise<ImportProposal> {
  const stateMessages: CoreMessage[] = state.steps.map((step) => ({
    role: step.type === "input" ? "user" : "assistant",
    content:
      step.type === "input" ? step.message : JSON.stringify(step.proposal),
  }));

  const promptMessages: CoreMessage[] = [
    {
      role: "system",
      content: `
        You are an AI assistant that helps users import their accounting data from a CSV file into our system.
        The user will provide you with a CSV file and some information about their accounts, investments and accountingEntries (STATE).
        You will need to propose a list of new accounts, investments, accounting entries and entries that should be created.

        Definitions of the entities:
        Accounts -> these are fiat acocunts, like bank accounts, cash, etc
        Investments -> these are investments accounts, like stocks brokers, cryptos, etc...
        AccountingEntries -> this is an object used to link entries together to then display in tables. Accounting entries main purpose is to cluster Entries into a date. IMPORTANT: there can't be two for the same date, so use existing ones.
        Entries -> these are the values for an account at a specific date (AccountingEntry). For an entry to exist it needs an accountingEntry to be associated with. Invested only makes sense for investment accounts and might not be inferred, priority is the value.

        Output should be a valid JSON object containing:
          newAccountingEntries -> accountingEntries that should be created with a temporary ID (format: tmp-<uuid>). If state contains accountingEntries for the same dates do not create new ones.
          newAccounts -> fiat accounts that should be created with a temporary ID (format: tmp-<uuid>)
          newInvestments -> investments accounts that should be created with a temporary ID (format: tmp-<uuid>)
          newEntries -> entries that should be created, linked to an accountingEntry (existing ones or one from newAccountingEntries) and an account (existing ones or one from newAccounts or newInvestments).

        Each one of those array can be empty if nothing should be created for that kind.
        For Dates use the following format: yyyy-MM-dd
        `,
    },
    {
      role: "user",
      content: `
        This is the csv to import:
        <csv>
        ${state.csv}
        </csv>

        The state is:
        <state>
        ${JSON.stringify(
          {
            accountingEntries: state.userAccountState.accountingEntries.map(
              (a) => ({
                id: a.id,
                date: a.date,
              })
            ),
            accounts: state.userAccountState.accounts.map((a) => ({
              id: a.id,
              name: a.name,
            })),
            investments: state.userAccountState.investments.map((a) => ({
              id: a.id,
              name: a.name,
            })),
          },
          null,
          2
        )}
        </state>
        `,
    },
  ];

  console.log(promptMessages);

  const result = await generateObject({
    model: anthropic("claude-3-5-sonnet-20240620"),
    schema: z.object({
      newAccountingEntries: z.array(
        z.object({
          id: z.string(),
          date: z.string(),
        })
      ),
      newAccounts: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ),
      newInvestments: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ),
      newEntries: z.array(
        z.object({
          accountId: z.string(),
          accountingEntryId: z.string(),
          value: z.number(),
          invested: z.number().optional(),
        })
      ),
    }),
    messages: promptMessages.concat(stateMessages),
  });

  return result.object;
}

async function getUserAccountState(userId: string): Promise<UserAccountState> {
  const accounts = await dbConnection<Accounts>(Table.Accounts).where({
    user_id: userId,
  });

  const accountingEntries = await dbConnection<AccountingEntries>(
    Table.AccountingEntries
  ).where({
    user_id: userId,
  });

  return {
    accounts: accounts.filter((a) => a.type === "fiat"),
    investments: accounts.filter((a) => a.type === "investment"),
    accountingEntries,
  };
}

export function importRouter(app: Application) {
  app.post(
    "/import",
    expressAsyncHandler(async (req, res) => {
      const csv = req.body.csv;
      if (!csv || !csv.length) {
        res.status(400).send({ error: "Invalid CSV" });
        return;
      }

      const userAccountState = await getUserAccountState(req.userId);

      const state: ImportProposalState = {
        id: generateUUID(),
        userAccountState,
        csv,
        steps: [],
      };

      const proposal = await getImportProposal(state);

      state.steps.push({ type: "proposal", proposal });
      importCache.set(state.id, state);

      res.send({
        ...proposal,
      });
    })
  );

  app.put(
    "/import/:id",
    expressAsyncHandler(async (req, res) => {
      if (!req.params.id || !req.body.input) {
        res.status(400).send({ error: "Invalid args" });
        return;
      }

      let state: ImportProposalState | undefined = importCache.get(
        req.params.id
      );

      if (!state) {
        res.status(404).send({ error: "import not found" });
        return;
      }

      state = {
        ...state,
        userAccountState: await getUserAccountState(req.userId),
      };

      const input = req.params.input;
      state.steps.push({ type: "input", message: input });
      const newProposal = await getImportProposal(state);
      state.steps.push({ type: "proposal", proposal: newProposal });
      importCache.set(state.id, state);

      res.send({
        ...newProposal,
      });
    })
  );
}
