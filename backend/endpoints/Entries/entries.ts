import { Application, Request, Response } from "express";
import { dbConnection, generateUUID } from "../../dbConnection";
import { AccountingEntries, Accounts, Entries, Table } from "../../types";

async function validateAccount(userId: string, accountId: string) {
  const account = await dbConnection<Accounts>(Table.Accounts)
    .select()
    .where({ id: accountId, user_id: userId })
    .limit(1);

  if (!account) {
    throw Error("Invalid account for user");
  }
}

async function validateAccountingEntry(
  accountingEntryId: string,
  userId: string
) {
  const entry = await dbConnection<AccountingEntries>(Table.AccountingEntries)
    .select()
    .where({ id: accountingEntryId, user_id: userId })
    .limit(1);

  if (!entry) {
    throw Error("Invalid accounting entry for user");
  }
}

export function entriesRouter(app: Application) {
  app.get("/entries/:account_id", async (req, res) => {
    const account_id = req.params.account_id;

    await validateAccount(req.userId, account_id);

    const entries = await dbConnection<Entries>(Table.Entries)
      .select()
      .where({ account_id })
      .limit(1000);

    res.send(entries);
  });

  app.get("/entry/:id", async (req, res) => {
    await validateAccount(req.userId, req.params.id);

    const entries = await dbConnection<Entries>(Table.Entries)
      .select()
      .where({ account_id: req.params.id })
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

    await validateAccount(req.userId, account_id);
    await validateAccountingEntry(accounting_entry_id, req.userId);

    await dbConnection<Entries>(Table.Entries).upsert({
      id,
      account_id,
      accounting_entry_id,
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

    if (!entry) {
      throw Error("invalid entry");
    }

    const account = (
      await dbConnection<Accounts>(Table.Entries)
        .select()
        .where({ id: entry.account_id })
        .limit(1)
    ).at(0);

    if (!account) {
      throw Error("no account for entry found");
    }
    await validateAccount(req.userId, account.id);

    upsertEntry(req.params.id, req, res);
  });

  app.delete("/entry/:id", async (req, res) => {
    await dbConnection.transaction(async (trx) => {
      const result = await trx<Entries>(Table.Entries)
        .delete()
        .where({ id: req.params.id })
        .returning("account_id");

      const accountId = result.at(0)?.account_id;

      if (!accountId) {
        throw Error("Entry not found");
      }

      await validateAccount(req.userId, accountId);
    });

    res.send({});
  });
}
