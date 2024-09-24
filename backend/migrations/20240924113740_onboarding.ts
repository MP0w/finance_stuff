import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Users, (table) => {
    table.string("onboarding_step").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Users, (table) => {
    table.dropColumn("onboarding_step");
  });
}
