import { Application, Request, Response } from "express";
import { Accounts, Table } from "../../types";
import { dbConnection, generateUUID } from "../../dbConnection";
import expressAsyncHandler from "express-async-handler";

export function accountsRouter(app: Application) {
  app.get(
    "/accounts",
    expressAsyncHandler(async (req, res) => {
      const accounts = await dbConnection<Accounts>(Table.Accounts)
        .select()
        .where({ user_id: req.userId })
        .limit(1000);

      res.send(accounts);
    })
  );

  app.get(
    "/account/:id",
    expressAsyncHandler(async (req, res) => {
      const accounts = await dbConnection<Accounts>(Table.Accounts)
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .limit(1);

      const account = accounts.at(0);
      if (!account) {
        res.status(404);
        return;
      }

      res.send(account);
    })
  );

  async function upsertAccount(id: string, req: Request, res: Response) {
    const name = req.body.name;
    const type = req.body.type;

    if (!name || !type) {
      throw Error("Invalid params");
    }

    await dbConnection<Accounts>(Table.Accounts)
      .insert({
        id,
        user_id: req.userId,
        name,
        type,
        updated_at: new Date(),
      })
      .onConflict("id")
      .merge();

    res.send({});
  }

  app.post(
    "/account",
    expressAsyncHandler(async (req, res) => {
      await upsertAccount(generateUUID(), req, res);
    })
  );

  app.put(
    "/account/:id",
    expressAsyncHandler(async (req, res) => {
      const account = (
        await dbConnection<Accounts>(Table.Accounts)
          .select()
          .where({ id: req.params.id })
          .limit(1)
      ).at(0);

      if (!account || account.user_id !== req.userId) {
        throw Error("invalid account");
      }

      await upsertAccount(req.params.id, req, res);
    })
  );

  app.delete(
    "/account/:id",
    expressAsyncHandler(async (req, res) => {
      await dbConnection<Accounts>(Table.Accounts)
        .delete()
        .where({ id: req.params.id, user_id: req.userId });

      res.send({});
    })
  );
}
