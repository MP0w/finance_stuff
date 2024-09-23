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
  Entries,
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
        AccountingEntries -> this is an object used to link entries together to then display in tables. Accounting entries main purpose is to cluster Entries into a date. IMPORTANT: there can't be two for the same date, so use existing accountingEntries ids.
        Entries -> these are the values for an account at a specific date (AccountingEntry). For an entry to exist it needs an accountingEntry to be associated with. Invested only makes sense for investment accounts and might not be inferred, priority is the value.

        Output should be a valid JSON object containing:
          1. newAccountingEntries -> accountingEntries that should be created if one with the same date doesn't already exist in the user state with a temporary ID (format: tmp-<uuid>).
          2. newAccounts -> fiat accounts that should be created with a temporary ID (format: tmp-<uuid>), if one with the same or very similar name exists in the state, use that
          3. newInvestments -> investments accounts that should be created with a temporary ID (format: tmp-<uuid>), if one with the same or very similar name exists in the state, use that
          4. newEntries -> entries that should be created, linked to an accountingEntry (existing ones or one from newAccountingEntries) and an account (existing ones or one from newAccounts or newInvestments).

        Each one of those array can be empty if nothing should be created for that kind.
        For Dates use the following format: yyyy-MM-dd

        WARNING: the user's CSV might be in their own locale, so be careful with the date format and number formats, consider what's more likely (e.g. monthly accounting, thousands VS decimal separator, etc).
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

  const accountingEntriesByDate =
    state.userAccountState.accountingEntries.reduce((acc, curr) => {
      acc[curr.date] = curr.id;
      return acc;
    }, {} as Record<string, string>);

  const duplicatesNewAccountingEntries = result.object.newAccountingEntries
    .filter((entry) => accountingEntriesByDate[entry.date])
    .reduce(
      (acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      },
      {} as Record<
        string,
        {
          date: string;
          id: string;
        }
      >
    );

  const duplicatesNewAccountingEntriesIds = Object.keys(
    duplicatesNewAccountingEntries
  );

  return {
    id: state.id,
    newAccountingEntries: result.object.newAccountingEntries.filter(
      (entry) => !duplicatesNewAccountingEntriesIds.includes(entry.id)
    ),
    newAccounts: result.object.newAccounts,
    newInvestments: result.object.newInvestments,
    newEntries: result.object.newEntries.map((entry) => {
      return {
        ...entry,
        accountingEntryId: duplicatesNewAccountingEntries[
          entry.accountingEntryId
        ]
          ? accountingEntriesByDate[
              duplicatesNewAccountingEntries[entry.accountingEntryId].date
            ]
          : entry.accountingEntryId,
      };
    }),
  };
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
      const input = req.body.input;

      if (!req.params.id || !input) {
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

      state.steps.push({ type: "input", message: input });
      const newProposal = await getImportProposal(state);
      state.steps.push({ type: "proposal", proposal: newProposal });
      importCache.set(state.id, state);

      res.send({
        ...newProposal,
      });
    })
  );

  app.post(
    "/import/:id/confirm",
    expressAsyncHandler(async (req, res) => {
      if (!req.params.id) {
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

      const proposal = state.steps.findLast(
        (s) => s.type === "proposal"
      )?.proposal;

      if (!proposal) {
        res.status(404).send({ error: "Proposal not found" });
        return;
      }

      // import
      try {
        dbConnection.transaction(async (trx) => {
          const newAccountsIds = proposal.newAccounts
            .concat(proposal.newInvestments)
            .reduce((acc, curr) => {
              acc[curr.id] = generateUUID();
              return acc;
            }, {} as Record<string, string>);

          await trx<Accounts>(Table.Accounts)
            .insert(
              proposal.newAccounts.map((a) => ({
                id: newAccountsIds[a.id],
                user_id: req.userId,
                name: a.name,
                type: "fiat",
                updated_at: new Date(),
                currency: "EUR",
              }))
            )
            .onConflict("id")
            .merge();

          await trx<Accounts>(Table.Accounts)
            .insert(
              proposal.newInvestments.map((a) => ({
                id: newAccountsIds[a.id],
                user_id: req.userId,
                name: a.name,
                type: "investment",
                updated_at: new Date(),
                currency: "EUR",
              }))
            )
            .onConflict("id")
            .merge();

          const newAccountingEntriesIds = proposal.newAccountingEntries.reduce(
            (acc, curr) => {
              acc[curr.id] = generateUUID();
              return acc;
            },
            {} as Record<string, string>
          );

          await trx<AccountingEntries>(Table.AccountingEntries)
            .insert(
              proposal.newAccountingEntries.map((a) => ({
                id: newAccountingEntriesIds[a.id],
                date: a.date,
                user_id: req.userId,
                updated_at: new Date(),
              }))
            )
            .onConflict("date")
            .ignore();

          await trx<Entries>(Table.Entries)
            .insert(
              proposal.newEntries.map((e) => ({
                id: generateUUID(),
                account_id: newAccountsIds[e.accountId],
                accounting_entry_id:
                  newAccountingEntriesIds[e.accountingEntryId],
                value: e.value,
                invested: e.invested,
              }))
            )
            .onConflict(["account_id", "accounting_entry_id"])
            .merge({
              value: trx.raw("excluded.value"),
              invested: trx.raw("COALESCE(excluded.invested, ??)", [
                "invested",
              ]),
              updated_at: new Date(),
            });
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error importing" });
        return;
      }

      importCache.del(state.id);

      res.send({});
    })
  );
}
