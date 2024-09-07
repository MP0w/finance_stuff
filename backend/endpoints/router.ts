import { Application } from "express";
import { usersRouter } from "./Users/users";

export function router(app: Application) {
  app.get("/", (_, res) => {
    res.send("simplefi");
  });

  usersRouter(app);
}
