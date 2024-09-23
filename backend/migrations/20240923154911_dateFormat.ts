import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.AccountingEntries, (table) => {
    table.string("date").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.AccountingEntries, (table) => {
    table.date("date").notNullable().alter();
  });
}
