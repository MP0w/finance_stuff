import { Application } from "express";
import { usersRouter } from "./Users/users";
import { accountsRouter } from "./Accounts/accounts";
import { entriesRouter } from "./Entries/entries";
import { accountingEntriesRouter } from "./AccountingEntries/accountingEntries";
import { verifyToken } from "./auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import getUuidByString from "uuid-by-string";
import cors from "cors";
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
    res.send("simplefi");
  });

  app.use(async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      res.status(401).send({ error: "UNAUTHORIZED" });
      return;
    }

    const user = await verifyToken(token as string);
    req.userId = getUuidByString(user.uid);
    req.user = user;

    next();
  });

  usersRouter(app);
  accountsRouter(app);
  accountingEntriesRouter(app);
  entriesRouter(app);
}
