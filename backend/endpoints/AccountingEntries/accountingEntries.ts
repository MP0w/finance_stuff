import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import { AccountingEntries, Table } from "../../types";

export function accountingEntriesRouter(app: Application) {
  app.get("/accounting_entries", async (req, res) => {
    const entries = await dbConnection<AccountingEntries>(
      Table.AccountingEntries
    )
      .select()
      .where({ user_id: req.userId })
      .limit(1000);

    res.send(entries);
  });

  app.get("/accounting_entry/:id", async (req, res) => {
    const entries = await dbConnection<AccountingEntries>(
      Table.AccountingEntries
    )
      .select()
      .where({ id: req.params.id, user_id: req.userId })
      .limit(1);

    const entry = entries.at(0);

    res.status(entry ? 200 : 401).send(entry);
  });

  async function upsertEntry(id: string, req: Request, res: Response) {
    const date: Date | undefined = req.body.date;

    if (!date) {
      throw Error("Invalid params");
    }

    await dbConnection<AccountingEntries>(Table.AccountingEntries).upsert({
      id,
      date,
      user_id: req.userId,
      updated_at: new Date(),
    });

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
