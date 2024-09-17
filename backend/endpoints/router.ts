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
}
