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
import { getUser, updateUser } from "../Users/users";

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
  userId: string,
  state: ImportProposalState
): Promise<ImportProposal> {
  const user = await getUser(userId);

  if (!user) {
    throw Error("could not get user");
  }

  if (user.available_ai_tokens <= 0) {
    throw Error("not enough AI credits");
  }

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
        Accounts -> these are fiat accounts, like bank accounts, cash, etc
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
      newAccountingEntries: z
        .array(
          z.object({
            id: z.string(),
            date: z.string(),
          })
        )
        .optional(),
      newAccounts: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        )
        .optional(),
      newInvestments: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        )
        .optional(),
      newEntries: z
        .array(
          z.object({
            accountId: z.string(),
            accountingEntryId: z.string(),
            value: z.number(),
            invested: z.number().optional(),
          })
        )
        .optional(),
    }),
    messages: promptMessages.concat(stateMessages),
  });

  try {
    const usage = result.usage;
    await updateUser(userId, {
      used_ai_total_tokens: user.used_ai_total_tokens + usage.totalTokens,
      used_ai_prompt_tokens: user.used_ai_prompt_tokens + usage.promptTokens,
      available_ai_tokens: user.available_ai_tokens - usage.totalTokens,
    });
  } catch {
    console.error("failed to update user credits");
  }

  const proposal = {
    newAccountingEntries: result.object.newAccountingEntries ?? [],
    newAccounts: result.object.newAccounts ?? [],
    newInvestments: result.object.newInvestments ?? [],
    newEntries: result.object.newEntries ?? [],
  };

  const accountingEntriesByDate =
    state.userAccountState.accountingEntries.reduce((acc, curr) => {
      acc[curr.date] = curr.id;
      return acc;
    }, {} as Record<string, string>);

  const duplicatesNewAccountingEntries = proposal.newAccountingEntries
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

  const allAccounts = state.userAccountState.accounts.concat(
    state.userAccountState.investments
  );
  const allNewAccounts = proposal.newAccounts.concat(proposal.newInvestments);
  const accountsByName = allAccounts.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {} as Record<string, string>);

  const duplicatesNewAccounts = allNewAccounts
    .filter((a) => accountsByName[a.name])
    .reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, { id: string; name: string }>);

  function idForAccount(accountId: string) {
    const dupe = duplicatesNewAccounts[accountId];
    return dupe ? accountsByName[dupe.name] : accountId;
  }

  function idForAccountingEntry(accountingEntryId: string) {
    const dupe = duplicatesNewAccountingEntries[accountingEntryId];
    return dupe ? accountingEntriesByDate[dupe.date] : accountingEntryId;
  }

  return {
    id: state.id,
    newAccountingEntries: proposal.newAccountingEntries.filter(
      (entry) => !duplicatesNewAccountingEntriesIds.includes(entry.id)
    ),
    newAccounts: proposal.newAccounts.filter(
      (a) => !duplicatesNewAccounts[a.id]
    ),
    newInvestments: proposal.newInvestments.filter(
      (a) => !duplicatesNewAccounts[a.id]
    ),
    newEntries: proposal.newEntries.map((entry) => {
      return {
        ...entry,
        accountId: idForAccount(entry.accountId),
        accountingEntryId: idForAccountingEntry(entry.accountingEntryId),
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

      const proposal = await getImportProposal(req.userId, state);

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
      const newProposal = await getImportProposal(req.userId, state);
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

      const deletedTables = new Set((req.body.deletedTables as string[]) ?? []);

      await dbConnection.transaction(async (trx) => {
        try {
          const newAccountsIds = proposal.newAccounts
            .concat(proposal.newInvestments)
            .reduce((acc, curr) => {
              acc[curr.id] = generateUUID();
              return acc;
            }, {} as Record<string, string>);

          const newAccounts = proposal.newAccounts.filter(
            (a) => !deletedTables.has(a.id)
          );

          if (newAccounts.length > 0) {
            await trx<Accounts>(Table.Accounts)
              .insert(
                newAccounts.map((a) => ({
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
          }

          const newInvestments = proposal.newInvestments.filter(
            (a) => !deletedTables.has(a.id)
          );

          if (newInvestments.length > 0) {
            await trx<Accounts>(Table.Accounts)
              .insert(
                newInvestments.map((a) => ({
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
          }

          const newAccountingEntriesIds = proposal.newAccountingEntries.reduce(
            (acc, curr) => {
              acc[curr.id] = generateUUID();
              return acc;
            },
            {} as Record<string, string>
          );

          if (proposal.newAccountingEntries.length > 0) {
            await trx<AccountingEntries>(Table.AccountingEntries).insert(
              proposal.newAccountingEntries.map((a) => ({
                id: newAccountingEntriesIds[a.id],
                date: a.date,
                user_id: req.userId,
                updated_at: new Date(),
              }))
            );
          }

          const newEntries = proposal.newEntries.filter(
            (e) => !deletedTables.has(e.accountId)
          );

          if (newEntries.length > 0) {
            await trx<Entries>(Table.Entries)
              .insert(
                newEntries.map((e) => ({
                  id: generateUUID(),
                  user_id: req.userId,
                  account_id: newAccountsIds[e.accountId] ?? e.accountId,
                  accounting_entry_id:
                    newAccountingEntriesIds[e.accountingEntryId] ??
                    e.accountingEntryId,
                  value: e.value,
                  invested: e.invested,
                  updated_at: new Date(),
                }))
              )
              .onConflict(["account_id", "accounting_entry_id"])
              .merge({
                value: trx.raw("excluded.value"),
                invested: trx.raw(
                  "COALESCE(excluded.invested, entries.invested)"
                ),
                updated_at: new Date(),
              });
          }

          await trx.commit();

          importCache.del(state.id);
          res.send({});
        } catch (error) {
          console.log("ROLLING BACK");
          console.error(error);
          await trx.rollback();
          res.status(500).send({ error: "Error importing" });
        }
      });
    })
  );
}
