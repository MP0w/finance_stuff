import { Application } from "express";
import { Table, Users } from "../../types";
import { dbConnection } from "../../dbConnection";
import getUuidByString from "uuid-by-string";

export function usersRouter(app: Application) {
  app.post("/sign-in", async (req, res) => {
    const users = await dbConnection<Users>(Table.Users)
      .insert({
        id: getUuidByString(req.user.uid),
        firebase_uid: req.user.uid,
        email: req.user.email,
        photo: req.user.picture,
        updated_at: new Date(),
      })
      .onConflict("id")
      .merge()
      .returning("*");

    const user = users.at(0);
    if (!user) {
      throw Error("no user");
    }
    res.send(user);
  });

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
}
