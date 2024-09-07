import { Application } from "express";
import { usersRouter } from "./Users/users";
import { accountsRouter } from "./Accounts/accounts";
import { entriesRouter } from "./Entries/entries";
import { accountingEntriesRouter } from "./AccountingEntries/accountingEntries";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function router(app: Application) {
  app.get("/", (_, res) => {
    res.send("simplefi");
  });

  app.use((req, res, next) => {
    const token = req.headers["x-fi-token"];

    // todo actual auth
    if (!token) {
      res.status(401).send({ error: "UNAUTHORIZED" });
      return;
    }

    req.userId = token as string; // TODO: get the user based on auth

    next();
  });

  usersRouter(app);
  accountsRouter(app);
  accountingEntriesRouter(app);
  entriesRouter(app);
}
