import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import {
  AccountingEntries,
  AccountingEntriesDTO,
  Entries,
  Table,
  Users,
} from "../../types";
import expressAsyncHandler from "express-async-handler";
import {
  connectorProvider,
  getConnectionWithDecryptedSettings,
} from "../Connectors/connectors";
import { ConnectorId } from "finance_stuff_connectors";

function isDateRecentEnough(date: Date): boolean {
  const daysFromToday =
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

  return daysFromToday > -15;
}

async function liveEntries(userId: string, accountingEntryId: string) {
  const connections = await getConnectionWithDecryptedSettings(userId);

  if (connections.length === 0) {
    return {
      entries: [],
      failedConnections: [],
    };
  }

  const failedConnections: { connectorId: string; accountId: string }[] = [];
  const user = await dbConnection<Users>(Table.Users)
    .select()
    .where({ id: userId })
    .limit(1)
    .first();
  const currency = user?.currency ?? "USD";

  const balances: Map<string, { value: number; cost: number | undefined }> =
    new Map();

  let outdatedTTL: number | undefined;

  for (const c of connections) {
    try {
      const settings = c.settings;
      settings.currency = currency;

      const connector = connectorProvider.getConnector(
        c.connector_id as ConnectorId,
        settings
      );

      const value = await connector.getBalance();

      if (value.outdated && value.ttl) {
        outdatedTTL = Math.max(outdatedTTL ?? 0, value.ttl);
      }

      const currentBalance = balances.get(c.account_id) ?? {
        value: 0,
        cost: undefined,
      };
      balances.set(c.account_id, {
        value: currentBalance.value + value.value,
        cost: value.cost
          ? value.cost + (currentBalance.cost ?? 0)
          : currentBalance.cost,
      });
    } catch (error) {
      console.error(error);
      failedConnections.push({
        connectorId: c.connector_id,
        accountId: c.account_id,
      });
    }
  }

  const entries: Entries[] = [];

  for (const [accountId, balance] of balances) {
    entries.push({
      id: generateUUID(),
      accounting_entry_id: accountingEntryId,
      account_id: accountId,
      user_id: userId,
      value: parseFloat(balance.value.toFixed(2)),
      invested: balance.cost ? parseFloat(balance.cost.toFixed(2)) : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  return {
    entries,
    failedConnections,
    outdatedTTL,
  };
}

export async function fillInMissingAccountingEntriesIfNeeded(userId: string) {
  let lastAccountingEntry = (
    await dbConnection<AccountingEntries>(Table.AccountingEntries)
      .select()
      .where({ user_id: userId })
      .orderBy("date", "desc")
      .limit(1)
  ).at(0);

  if (!lastAccountingEntry || !isDateRecentEnough(lastAccountingEntry.date)) {
    return;
  }

  const live = await liveEntries(userId, lastAccountingEntry.id);
  if (live.entries.length === 0) {
    return;
  }

  const entries = await dbConnection<Entries>(Table.Entries).select().where({
    user_id: userId,
    accounting_entry_id: lastAccountingEntry.id,
  });

  const existingEntries = new Set(entries.map((entry) => entry.account_id));
  const missingEntries = live.entries.filter(
    (entry) => !existingEntries.has(entry.account_id)
  );

  await dbConnection<Entries>(Table.Entries).insert(missingEntries);
}

export async function getAccoutingEntries(userId: string) {
  let accountingEntries = await dbConnection<AccountingEntries>(
    Table.AccountingEntries
  )
    .select()
    .where({ user_id: userId })
    .orderBy("date", "asc")
    .limit(1000);

  if (accountingEntries.length === 0) {
    await createAccountingEntriesForUser(userId);

    accountingEntries = await dbConnection<AccountingEntries>(
      Table.AccountingEntries
    )
      .select()
      .where({ user_id: userId })
      .orderBy("date", "asc")
      .limit(1000);
  }

  const allEntries = await dbConnection<Entries>(Table.Entries)
    .select()
    .whereIn(
      "accounting_entry_id",
      accountingEntries.map((entry) => entry.id)
    )
    .andWhere({ user_id: userId });

  const entriesByAccountingEntryId = allEntries.reduce((acc, entry) => {
    if (!acc[entry.accounting_entry_id]) {
      acc[entry.accounting_entry_id] = [];
    }
    acc[entry.accounting_entry_id].push(entry);
    return acc;
  }, {} as Record<string, Entries[]>);

  const accountingEntriesDTO: AccountingEntriesDTO[] = accountingEntries.map(
    (entry) => ({
      ...entry,
      entries: entriesByAccountingEntryId[entry.id] || [],
    })
  );

  return accountingEntriesDTO;
}

export function accountingEntriesRouter(app: Application) {
  app.get(
    "/accounting_entries",
    expressAsyncHandler(async (req, res) => {
      res.send(await getAccoutingEntries(req.userId));
    })
  );

  app.get(
    "/live_accounting_entry",
    expressAsyncHandler(async (req, res) => {
      const live = await liveEntries(req.userId, "live");
      if (live.entries.length === 0) {
        res.send({});
        return;
      }

      let lastAccountingEntry = (
        await dbConnection<AccountingEntries>(Table.AccountingEntries)
          .select()
          .where({ user_id: req.userId })
          .orderBy("date", "desc")
          .limit(1)
      ).at(0);

      const entries = lastAccountingEntry
        ? await dbConnection<Entries>(Table.Entries).select().where({
            user_id: req.userId,
            accounting_entry_id: lastAccountingEntry.id,
          })
        : undefined;

      const allAccountIds = new Set([
        ...live.entries.map((entry) => entry.account_id),
        ...(entries?.map((entry) => entry.account_id) ?? []),
      ]);

      const mergedEntries = Array.from(allAccountIds)
        .map((accountId) => {
          const liveEntry = live.entries.find(
            (entry) => entry.account_id === accountId
          );

          const existingEntry = entries?.find(
            (entry) => entry.account_id === accountId
          );

          if (liveEntry) {
            return {
              ...liveEntry,
              invested: liveEntry.invested ?? existingEntry?.invested ?? null,
            };
          }

          return existingEntry
            ? {
                ...existingEntry,
                id: generateUUID(),
                accounting_entry_id: "mock",
              }
            : undefined;
        })
        .filter((e) => e !== undefined);

      const accountingEntryDTO: AccountingEntriesDTO = {
        id: "mock",
        user_id: req.userId,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        entries: mergedEntries,
      };

      res.send({
        live: accountingEntryDTO,
        failedConnections: live.failedConnections,
        hasOutdated: !!live.outdatedTTL,
        outdatedTTL: live.outdatedTTL ? live.outdatedTTL + 5 : undefined,
      });
    })
  );

  app.get(
    "/accounting_entry/:id",
    expressAsyncHandler(async (req, res) => {
      const accountingEntries = await dbConnection<AccountingEntries>(
        Table.AccountingEntries
      )
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .limit(1);

      const accountingEntry = accountingEntries.at(0);

      if (!accountingEntry) {
        res.status(404).send({ error: "Accounting entry not found" });
        return;
      }

      const entries = await dbConnection<Entries>(Table.Entries)
        .select()
        .where({
          accounting_entry_id: accountingEntry.id,
          user_id: req.userId,
        });

      const accountingEntryDTO: AccountingEntriesDTO = {
        ...accountingEntry,
        entries,
      };

      res.status(200).send(accountingEntryDTO);
    })
  );

  async function upsertEntry(
    id: string,
    req: Request,
    res: Response,
    successHandler?: (date: Date) => Promise<void>
  ) {
    const date = req.body.date ? new Date(req.body.date) : undefined;

    if (!date) {
      throw Error("Invalid params");
    }

    try {
      await dbConnection<AccountingEntries>(Table.AccountingEntries)
        .insert({
          id,
          date,
          user_id: req.userId,
          updated_at: new Date(),
        })
        .onConflict("id")
        .merge();

      if (successHandler) {
        await successHandler(date);
      } else {
        res.send({});
      }
    } catch (error) {
      console.log(error);
      const isDupe = (error as Error).message.includes(
        `duplicate key value violates unique constraint "accounting_entries_user_id_date_unique"`
      );
      res.status(500).send({
        error: isDupe
          ? "You cannot create two entries for the same date"
          : "Failed to create entry",
      });
    }
  }

  app.post(
    "/accounting_entry",
    expressAsyncHandler(async (req, res) => {
      const id = generateUUID();
      upsertEntry(id, req, res, async (date) => {
        const isRecent = isDateRecentEnough(date);

        if (!isRecent) {
          res.send({});
          return;
        }

        const live = await liveEntries(req.userId, id);
        if (live.entries.length > 0) {
          await dbConnection<Entries>(Table.Entries).insert(live.entries);
        }

        res.send({ failedConnections: live.failedConnections });
      });
    })
  );

  app.put(
    "/accounting_entry/:id",
    expressAsyncHandler(async (req, res) => {
      const entry = (
        await dbConnection<AccountingEntries>(Table.AccountingEntries)
          .select()
          .where({ id: req.params.id })
          .limit(1)
      ).at(0);

      if (!entry || entry.user_id !== req.userId) {
        throw Error("invalid entry");
      }

      upsertEntry(req.params.id, req, res);
    })
  );

  app.delete(
    "/accounting_entry/:id",
    expressAsyncHandler(async (req, res) => {
      await dbConnection<AccountingEntries>(Table.AccountingEntries)
        .delete()
        .where({ id: req.params.id, user_id: req.userId });

      res.send({});
    })
  );
}

function getFirstDaysOfMonth(date: Date, count: number): Date[] {
  const result: Date[] = [];
  const currentDate = new Date(date);

  for (let i = 0; i < count; i++) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    result.push(firstDayOfMonth);

    // Move to the previous month
    if (month === 0) {
      // If it's January, go to December of the previous year
      currentDate.setFullYear(year - 1, 11, 1);
    } else {
      currentDate.setMonth(month - 1);
    }
  }

  return result;
}

export async function createAccountingEntriesForUser(userId: string) {
  const datesToAdd = getFirstDaysOfMonth(new Date(), 1);

  await dbConnection<AccountingEntries>(Table.AccountingEntries).insert(
    datesToAdd.map((date) => ({
      id: generateUUID(),
      date,
      user_id: userId,
      updated_at: new Date(),
    }))
  );
}
