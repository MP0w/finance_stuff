import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex(Table.Connections)
    .where({ connector_id: "debank" })
    .update({ connector_id: "zapper" });
}

export async function down(knex: Knex): Promise<void> {
  await knex(Table.Connections)
    .where({ connector_id: "zapper" })
    .update({ connector_id: "debank" });
}
