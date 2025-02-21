import { Application } from "express";
import { usersRouter } from "./Users/users";
import { accountsRouter } from "./Accounts/accounts";
import { entriesRouter } from "./Entries/entries";
import { accountingEntriesRouter } from "./AccountingEntries/accountingEntries";
import { verifyToken } from "./auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import getUuidByString from "uuid-by-string";
import cors from "cors";
import expressAsyncHandler from "express-async-handler";
import { connectorsRouter } from "./Connectors/connectors";
import { importRouter } from "./Import/import";
import { expensesImportRouter } from "./Expenses/expensesImport";
import { expensesRouter } from "./Expenses/expenses";
import { dbConnection } from "../dbConnection";
import { Table } from "../types";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user: DecodedIdToken;
    }
  }
}

export function router(app: Application) {
  app.use(cors());

  app.get("/", (_, res) => {
    res.send("finance_stuff");
  });

  app.get(
    "/stats",
    expressAsyncHandler(async (_, res) => {
      const count = await dbConnection<{ count: number }>(Table.Users)
        .count()
        .first();
      const accountsCount = await dbConnection<{ count: number }>(
        Table.Accounts
      )
        .count()
        .first();
      const entriesCount = await dbConnection<{ count: number }>(Table.Entries)
        .count()
        .first();

      res.send({
        count: count?.count ?? 0,
        accountsCount: accountsCount?.count ?? 0,
        entriesCount: entriesCount?.count ?? 0,
      });
    })
  );

  app.use(
    expressAsyncHandler(async (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).send({ error: "UNAUTHORIZED" });
        return;
      }

      try {
        const user = await verifyToken(token as string);
        req.userId = getUuidByString(user.uid);
        req.user = user;
      } catch (error) {
        const err = error as Error;
        console.error(
          `verify token error ${req.method} ${req.path}\n\n ${err.stack}\n-----`
        );
        res.status(401).send({ error: err.message, code: "INVALID_TOKEN" });
        return;
      }

      next();
    })
  );

  usersRouter(app);
  accountsRouter(app);
  accountingEntriesRouter(app);
  entriesRouter(app);
  connectorsRouter(app);
  importRouter(app);
  expensesImportRouter(app);
  expensesRouter(app);
}
