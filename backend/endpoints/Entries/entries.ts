import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import { Entries, Table } from "../../types";

export function entriesRouter(app: Application) {
  app.get("/entries/:account_id", async (req, res) => {
    const account_id = req.params.account_id;

    const entries = await dbConnection<Entries>(Table.Entries)
      .select()
      .where({ account_id, user_id: req.userId })
      .limit(1000);

    res.send(entries);
  });

  app.get("/entry/:id", async (req, res) => {
    const entries = await dbConnection<Entries>(Table.Entries)
      .select()
      .where({ id: req.params.id, user_id: req.userId })
      .limit(1);

    const entry = entries.at(0);

    res.status(entry ? 200 : 401).send(entry);
  });

  async function upsertEntry(id: string, req: Request, res: Response) {
    const account_id: string | undefined = req.body.account_id;
    const accounting_entry_id: string | undefined =
      req.body.accounting_entry_id;
    const value: number | undefined = req.body.value;
    const invested: number | undefined = req.body.value;

    if (!account_id || !accounting_entry_id || !value) {
      throw Error("Invalid params");
    }

    await dbConnection<Entries>(Table.Entries).upsert({
      id,
      account_id,
      accounting_entry_id,
      user_id: req.userId,
      value: value.toString(),
      invested: invested?.toString(),
      updated_at: new Date(),
    });

    res.send({});
  }

  app.post("/entry", async (req, res) => {
    upsertEntry(generateUUID(), req, res);
  });

  app.put("/entry/:id", async (req, res) => {
    const entry = (
      await dbConnection<Entries>(Table.Entries)
        .select()
        .where({ id: req.params.id })
        .limit(1)
    ).at(0);

    if (!entry || entry.user_id !== req.userId) {
      throw Error("invalid entry");
    }

    upsertEntry(req.params.id, req, res);
  });

  app.delete("/entry/:id", async (req, res) => {
    await dbConnection<Entries>(Table.Entries)
      .delete()
      .where({ id: req.params.id, user_id: req.userId });

    res.send({});
  });
}
