import knex from "knex";
import * as config from "./knexfile";
import { v4 as uuidv4 } from "uuid";

export const dbConnection = knex((config as any).default.development);

export function generateUUID() {
  return uuidv4();
}
