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

export function accountingEntriesRouter(app: Application) {
  app.get(
    "/accounting_entries",
    expressAsyncHandler(async (req, res) => {
      let accountingEntries = await dbConnection<AccountingEntries>(
        Table.AccountingEntries
      )
        .select()
        .where({ user_id: req.userId })
        .orderBy("date", "asc")
        .limit(1000);

      if (accountingEntries.length === 0) {
        await createAccountingEntriesForUser(req.userId);

        accountingEntries = await dbConnection<AccountingEntries>(
          Table.AccountingEntries
        )
          .select()
          .where({ user_id: req.userId })
          .orderBy("date", "asc")
          .limit(1000);
      }

      const allEntries = await dbConnection<Entries>(Table.Entries)
        .select()
        .whereIn(
          "accounting_entry_id",
          accountingEntries.map((entry) => entry.id)
        )
        .andWhere({ user_id: req.userId });

      const entriesByAccountingEntryId = allEntries.reduce((acc, entry) => {
        if (!acc[entry.accounting_entry_id]) {
          acc[entry.accounting_entry_id] = [];
        }
        acc[entry.accounting_entry_id].push(entry);
        return acc;
      }, {} as Record<string, Entries[]>);

      const accountingEntriesDTO: AccountingEntriesDTO[] =
        accountingEntries.map((entry) => ({
          ...entry,
          entries: entriesByAccountingEntryId[entry.id] || [],
        }));

      res.send(accountingEntriesDTO);
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
        res.status(404).send({ message: "Accounting entry not found" });
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
    successHandler?: () => Promise<void>
  ) {
    const date: Date | undefined = req.body.date;

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
        await successHandler();
      } else {
        res.send({});
      }
    } catch (error) {
      const isDupe = (error as Error).message.includes(
        `duplicate key value violates unique constraint "accounting_entries_user_id_date_unique"`
      );
      res.status(500).send({
        message: isDupe
          ? "You cannot create two entries for the same date"
          : "Failed to create entry",
      });
    }
  }

  app.post(
    "/accounting_entry",
    expressAsyncHandler(async (req, res) => {
      const id = generateUUID();
      upsertEntry(id, req, res, async () => {
        const connections = await getConnectionWithDecryptedSettings(
          req.userId
        );

        const failedConnections: { connectorId: string; accountId: string }[] =
          [];
        const user = await dbConnection<Users>(Table.Users)
          .select()
          .where({ id: req.userId })
          .limit(1)
          .first();
        const currency = user?.currency ?? "USD";

        const balances: Map<string, number> = new Map();

        for (const c of connections) {
          try {
            const settings = c.settings;
            settings.currency = currency;

            const connector = connectorProvider.getConnector(
              c.connector_id as ConnectorId,
              settings
            );

            const value = await connector.getBalance();
            const currentValue = balances.get(c.account_id) ?? 0;
            balances.set(c.account_id, currentValue + value);
          } catch (error) {
            console.error(error);
            failedConnections.push({
              connectorId: c.connector_id,
              accountId: c.account_id,
            });
          }
        }

        for (const [accountId, value] of balances) {
          await dbConnection<Entries>(Table.Entries).insert({
            id: generateUUID(),
            accounting_entry_id: id,
            account_id: accountId,
            user_id: req.userId,
            value: parseFloat(value.toFixed(2)),
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
        res.send({ failedConnections });
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
  const datesToAdd = getFirstDaysOfMonth(new Date(), 6);

  await dbConnection<AccountingEntries>(Table.AccountingEntries).insert(
    datesToAdd.map((date) => ({
      id: generateUUID(),
      date,
      user_id: userId,
      updated_at: new Date(),
    }))
  );
}
