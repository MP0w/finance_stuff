import { Application } from "express";

export function accountsRouter(app: Application) {
  app.get("/account/:id", (req, res) => {
    res.send(req.params["id"]);
  });

  app.post("/entry", (_, res) => {
    res.send({});
  });

  app.put("/entry/:id", (_, res) => {
    res.send({});
  });

  app.delete("/entry/:id", (_, res) => {
    res.send({});
  });
}
