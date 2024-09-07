import { Application } from "express";

export function usersRouter(app: Application) {
  app.get("/user/:id", (req, res) => {
    res.send(req.params["id"]);
  });

  app.post("/sign-in", (req, res) => {
    res.send(req.body["token"]);
  });
}
