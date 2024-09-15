import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import {
  AccountingEntries,
  AccountingEntriesDTO,
  Entries,
  Table,
} from "../../types";
import expressAsyncHandler from "express-async-handler";

export function accountingEntriesRouter(app: Application) {
  app.get(
    "/accounting_entries",
    expressAsyncHandler(async (req, res) => {
      const accountingEntries = await dbConnection<AccountingEntries>(
        Table.AccountingEntries
      )
        .select()
        .where({ user_id: req.userId })
        .orderBy("date", "asc")
        .limit(1000);

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

  async function upsertEntry(id: string, req: Request, res: Response) {
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

      res.send({});
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
      upsertEntry(generateUUID(), req, res);
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
