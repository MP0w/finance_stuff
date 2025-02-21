import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import { Entries, Table } from "../../types";
import expressAsyncHandler from "express-async-handler";

export function entriesRouter(app: Application) {
  app.get(
    "/entries/:account_id",
    expressAsyncHandler(async (req, res) => {
      const account_id = req.params.account_id;

      const entries = await dbConnection<Entries>(Table.Entries)
        .select()
        .where({ account_id, user_id: req.userId })
        .limit(1000);

      res.send(entries);
    })
  );

  app.get(
    "/entry/:id",
    expressAsyncHandler(async (req, res) => {
      const entries = await dbConnection<Entries>(Table.Entries)
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .limit(1);

      const entry = entries.at(0);

      res.status(entry ? 200 : 401).send(entry);
    })
  );

  async function upsertEntry(id: string, req: Request, res: Response) {
    const account_id: string | undefined = req.body.account_id;
    const accounting_entry_id: string | undefined =
      req.body.accounting_entry_id;
    const value = parseFloat(req.body.value);
    const invested = req.body.invested ? parseFloat(req.body.invested) : null;

    if (isNaN(value)) {
      throw Error("Invalid value");
    }

    if (invested && isNaN(invested)) {
      throw Error("Invalid invested value");
    }

    if (!account_id || !accounting_entry_id || value === undefined) {
      throw Error("Invalid params");
    }

    await dbConnection<Entries>(Table.Entries)
      .insert({
        id,
        account_id,
        accounting_entry_id,
        user_id: req.userId,
        value: value,
        invested: invested,
        updated_at: new Date(),
      })
      .onConflict("id")
      .merge();

    res.send({});
  }

  app.post(
    "/entry",
    expressAsyncHandler(async (req, res) => {
      upsertEntry(generateUUID(), req, res);
    })
  );

  app.put(
    "/entry/:id",
    expressAsyncHandler(async (req, res) => {
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
    })
  );

  app.delete(
    "/entry/:id",
    expressAsyncHandler(async (req, res) => {
      await dbConnection<Entries>(Table.Entries)
        .delete()
        .where({ id: req.params.id, user_id: req.userId });

      res.send({});
    })
  );
}
