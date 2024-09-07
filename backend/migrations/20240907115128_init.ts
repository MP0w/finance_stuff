import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("email");
    table.string("username");
    table.string("name");
    table.string("photo");
    table.string("currency").notNullable().defaultTo("USD");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("accounts", (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .index("accounts_user_id");
    table.string("name").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("accounting_entries", (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .index("accounting_entries_user_id");
    table.date("date").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("entries", (table) => {
    table.uuid("id").primary();
    table
      .uuid("accounting_entry_id")
      .notNullable()
      .references("id")
      .inTable("accounting_entries")
      .onDelete("CASCADE")
      .index("entries_accounting_entries_id");
    table.bigInteger("value").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("entries");
  await knex.schema.dropTable("accounting_entries");
  await knex.schema.dropTable("accounts");
  await knex.schema.dropTable("users");
}
