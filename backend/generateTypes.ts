import { updateTypes } from "knex-types";
import { dbConnection } from "./dbConnection";

updateTypes(dbConnection, { output: "./types.ts" }).catch(() => {
  process.exit(1);
});
