import type { Knex } from "knex";
import { Table } from "../../shared/types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Table.Connections, (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(Table.Users)
      .onDelete("CASCADE")
      .index("connections_user_id");

    table
      .uuid("account_id")
      .notNullable()
      .references("id")
      .inTable(Table.Accounts)
      .onDelete("CASCADE")
      .index("connections_account_id");

    table.text("settings").notNullable();
    table.string("connector_id").notNullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Table.Connections);
}
