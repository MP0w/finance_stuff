import knex from "knex";
import { updateTypes } from "knex-types";
import * as config from "./knexfile";

const db = knex((config as any).default.development);

updateTypes(db, { output: "./types.ts" }).catch((err) => {
  process.exit(1);
});
