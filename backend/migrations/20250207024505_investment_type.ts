import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Accounts, (table) => {
    table.string("tag").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Accounts, (table) => {
    table.dropColumn("tag");
  });
}
