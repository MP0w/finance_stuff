import type { Knex } from "knex";
import { Table } from "../../shared/types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Accounts, (table) => {
    table.string("currency");
  });

  await knex(Table.Accounts).update({
    currency: knex.raw(
      `(SELECT currency FROM users WHERE users.id = ${Table.Accounts}.user_id)`
    ),
  });

  await knex.schema.alterTable(Table.Accounts, (table) => {
    table.string("currency").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Table.Accounts, (table) => {
    table.dropColumn("currency");
  });
}
