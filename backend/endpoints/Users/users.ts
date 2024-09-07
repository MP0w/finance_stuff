import { Application } from "express";
import { Table, Users } from "../../types";
import { dbConnection } from "../../dbConnection";

export function usersRouter(app: Application) {
  app.get("/user", async (req, res) => {
    const users = await dbConnection<Users>(Table.Users)
      .select()
      .where({ id: req.userId })
      .limit(1);

    const user = users.at(0);
    if (!user) {
      throw Error("User not found");
    }

    res.send(user);
  });

  app.post("/sign-in", (req, res) => {
    // todo auth
    res.send(req.body["token"]);
  });
}
