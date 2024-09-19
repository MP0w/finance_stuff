import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Table.Users, (table) => {
    table.uuid("id").primary();
    table.string("firebase_uid").notNullable();
    table.string("email");
    table.string("username");
    table.string("name");
    table.string("photo");
    table.string("currency").notNullable().defaultTo("USD");
    table.timestamps(true, true);
  });

  await knex.schema.createTable(Table.Accounts, (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(Table.Users)
      .onDelete("CASCADE")
      .index("accounts_user_id");
    table.string("name").notNullable();
    table.enum("type", ["fiat", "investment"]).notNullable();
    table.timestamps(true, true);
    table.unique(["user_id", "name"]);
  });

  await knex.schema.createTable(Table.AccountingEntries, (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(Table.Users)
      .onDelete("CASCADE")
      .index("accounting_entries_user_id");
    table.date("date").notNullable();
    table.timestamps(true, true);
    table.unique(["user_id", "date"]);
  });

  await knex.schema.createTable(Table.Entries, (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(Table.Users)
      .onDelete("CASCADE");
    table
      .uuid("account_id")
      .notNullable()
      .references("id")
      .inTable(Table.Accounts)
      .onDelete("CASCADE")
      .index("entries_account_id");
    table
      .uuid("accounting_entry_id")
      .notNullable()
      .references("id")
      .inTable(Table.AccountingEntries)
      .onDelete("CASCADE")
      .index("entries_accounting_entries_id");
    table.double("value").notNullable();
    table.double("invested");
    table.timestamps(true, true);
    table.unique(["accounting_entry_id", "account_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Table.Entries);
  await knex.schema.dropTable(Table.AccountingEntries);
  await knex.schema.dropTable(Table.Accounts);
  await knex.schema.dropTable(Table.Users);
}
