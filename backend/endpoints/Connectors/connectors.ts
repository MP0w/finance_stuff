import { Application } from "express";
import expressAsyncHandler from "express-async-handler";
import { connectorSettings } from "finance_stuff_connectors";

export function connectorsRouter(app: Application) {
  app.get(
    "/connectors-settings",
    expressAsyncHandler(async (_, res) => {
      res.send(connectorSettings);
    })
  );

  app.get(
    "/connections",
    expressAsyncHandler(async (_, res) => {
      res.send([]);
    })
  );

  app.get(
    "/connections/:id",
    expressAsyncHandler(async (_, res) => {
      res.send([]);
    })
  );

  app.post(
    "/connections/:id",
    expressAsyncHandler(async (_, res) => {
      res.send([]);
    })
  );

  app.put(
    "/connections/:id",
    expressAsyncHandler(async (_, res) => {
      res.send([]);
    })
  );

  app.delete(
    "/connections/:id",
    expressAsyncHandler(async (_, res) => {
      res.send([]);
    })
  );
}
