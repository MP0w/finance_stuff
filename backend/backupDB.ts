import knex from "knex";
import fs from "fs";
import path from "path";
import os from "os";
import * as config from "./knexfile";

const db = knex((config as any).default.development);

async function backupDatabase() {
  try {
    const backupPath = path.join(os.homedir(), "finance_stuff_backup.sql");
    const dumpCommand = db.raw("SELECT * FROM pg_catalog.pg_tables");

    const result = await dumpCommand;
    const tables = result.rows
      .filter((row: { schemaname: string }) => row.schemaname === "public")
      .map((row: { tablename: string }) => row.tablename);

    let backupContent = "";

    for (const table of tables) {
      const tableData = await db(table).select("*");
      for (const row of tableData) {
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row)
          .map((value) =>
            typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value
          )
          .join(", ");
        backupContent += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      }
      backupContent += "\n";
    }

    fs.writeFileSync(backupPath, backupContent);
    console.log(`Database backup saved to ${backupPath}`);
  } catch (error) {
    console.error("Error backing up database:", error);
  } finally {
    await db.destroy();
  }
}

backupDatabase();
