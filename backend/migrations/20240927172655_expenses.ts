import type { Knex } from "knex";
import { Table } from "../types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Table.Expenses, (table) => {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable(Table.Users)
      .onDelete("CASCADE")
      .index("expenses_user_id");
    table.string("description").notNullable();
    table.string("date").notNullable().index("expenses_date_index");
    table.double("amount").notNullable();
    table.string("currency").notNullable();
    table.string("category").nullable();
    table.enum("type", ["expense", "income"]).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(Table.Expenses);
}
