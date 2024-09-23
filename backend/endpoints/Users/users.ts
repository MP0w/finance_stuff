import { Application } from "express";
import { Table, Users } from "../../types";
import { dbConnection } from "../../dbConnection";
import getUuidByString from "uuid-by-string";
import expressAsyncHandler from "express-async-handler";

 export async function getUser(id: string) {
   return await dbConnection<Users>(Table.Users)
     .select()
     .where({ id })
     .limit(1)
     .first();
 }

 export async function updateUser(
   id: string,
   args: {
     used_ai_total_tokens: number;
     used_ai_prompt_tokens: number;
     available_ai_tokens: number;
   }
 ) {
   await dbConnection<Users>(Table.Users)
     .update({
       ...args,
     })
     .where({ id });
 }

 export function usersRouter(app: Application) {
   app.post(
     "/sign-in",
     expressAsyncHandler(async (req, res) => {
       const currency = req.body.currency;

       const payload = {
         id: getUuidByString(req.user.uid),
         firebase_uid: req.user.uid,
         email: req.user.email,
         photo: null,
         updated_at: new Date(),
         ...(currency ? { currency } : {}),
       };

       const users = await dbConnection<Users>(Table.Users)
         .insert(payload)
         .onConflict("id")
         .merge()
         .returning("*");

       const user = users.at(0);
       if (!user) {
         throw Error("no user");
       }
       res.send(user);
     })
   );

   app.get(
     "/user",
     expressAsyncHandler(async (req, res) => {
       const user = await getUser(req.user.uid);

       if (!user) {
         throw Error("User not found");
       }

       res.send(user);
     })
   );
 }
