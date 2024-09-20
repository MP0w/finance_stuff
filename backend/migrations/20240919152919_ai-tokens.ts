import type { Knex } from "knex";
import { Table } from "../../shared/types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Users, (table) => {
    table.integer("used_ai_total_tokens").notNullable().defaultTo(0);
    table.integer("used_ai_prompt_tokens").notNullable().defaultTo(0);
    table.integer("available_ai_tokens").notNullable().defaultTo(15000);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Users, (table) => {
    table.dropColumn("used_ai_total_tokens");
    table.dropColumn("used_ai_prompt_tokens");
    table.dropColumn("available_ai_tokens");
  });
}
