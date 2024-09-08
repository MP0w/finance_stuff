import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import {
  AccountingEntries,
  AccountingEntriesDTO,
  Entries,
  Table,
} from "../../types";

export function accountingEntriesRouter(app: Application) {
  app.get("/accounting_entries", async (req, res) => {
    const accountingEntries = await dbConnection<AccountingEntries>(
      Table.AccountingEntries
    )
      .select()
      .where({ user_id: req.userId })
      .orderBy("date", "desc")
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

    const accountingEntriesDTO: AccountingEntriesDTO[] = accountingEntries.map(
      (entry) => ({
        ...entry,
        entries: entriesByAccountingEntryId[entry.id] || [],
      })
    );

    res.send(accountingEntriesDTO);
  });

  app.get("/accounting_entry/:id", async (req, res) => {
    const accountingEntries = await dbConnection<AccountingEntries>(
      Table.AccountingEntries
    )
      .select()
      .where({ id: req.params.id, user_id: req.userId })
      .limit(1);

    const accountingEntry = accountingEntries.at(0);

    if (!accountingEntry) {
      return res.status(404).send({ message: "Accounting entry not found" });
    }

    const entries = await dbConnection<Entries>(Table.Entries)
      .select()
      .where({ accounting_entry_id: accountingEntry.id, user_id: req.userId });

    const accountingEntryDTO: AccountingEntriesDTO = {
      ...accountingEntry,
      entries,
    };

    return res.status(200).send(accountingEntryDTO);
  });

  async function upsertEntry(id: string, req: Request, res: Response) {
    const date: Date | undefined = req.body.date;

    if (!date) {
      throw Error("Invalid params");
    }

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
  }

  app.post("/accounting_entry", async (req, res) => {
    upsertEntry(generateUUID(), req, res);
  });

  app.put("/accounting_entry/:id", async (req, res) => {
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
  });

  app.delete("/accounting_entry/:id", async (req, res) => {
    await dbConnection<AccountingEntries>(Table.AccountingEntries)
      .delete()
      .where({ id: req.params.id, user_id: req.userId });

    res.send({});
  });
}
