import { updateTypes } from "knex-types";
import { dbConnection } from "./dbConnection";
import { Transform, Writable } from "stream";
import { createWriteStream } from "fs";

let isFirst = true;
let isAccountType = false;

const customTypes = `
export type AccountingEntriesDTO = AccountingEntries & { entries: Entries[] };

export type AccountType = "fiat" | "investment";

export type ConnectionsDTO = Omit<
  Connections,
  "settings" | "created_at" | "updated_at" | "user_id"
>;

export type Connector = {
  id: string;
  name: string;
  type?: AccountType;
  icon: string | undefined;
  settings: {
    key: string;
    hint: string;
    optional?: boolean;
    extraInstructions?: string;
    type: "string" | "number" | "boolean";
  }[];
};

export type ImportProposal = {
  id: string;
  newAccountingEntries: {
    id: string;
    date: string;
  }[];
  newAccounts: { id: string; name: string }[];
  newInvestments: { id: string; name: string }[];
  newEntries: {
    accountId: string;
    accountingEntryId: string;
    value: number;
    invested?: number;
  }[];
};

export const CategoryMap = {
  atm: "ATM",
  inc: "Income",
  inv: "Investments",
  rnt: "Rent",
  utl: "Utilities",
  bar: "Bars & Restaurants",
  fod: "Food & Groceries",
  trn: "Transportation",
  ins: "Insurance",
  ent: "Entertainment",
  trv: "Travel",
  hlt: "Health",
  edu: "Education",
  sub: "Subscriptions",
  shp: "Shopping",
  dbt: "Debt Repayment",
  tax: "Taxes",
  sav: "Savings",
  fam: "Friends & Family",
  oth: "Other",
} as const;

export type Category = (typeof CategoryMap)[keyof typeof CategoryMap];
`;

const transformer = new Transform({
  transform(chunk, _, callback) {
    if (isFirst) {
      this.push("// This file is auto-generated. Do not edit it manually.\n\n");
      this.push(customTypes);
      isFirst = false;
    }

    const data = chunk.toString();

    if (data.startsWith("export type Accounts = {")) {
      isAccountType = true;
    } else if (isAccountType && data.startsWith("};")) {
      isAccountType = false;
    }

    if (data.includes("//")) {
      this.push("\n");
    } else if (isAccountType && data === "  type: string;\n") {
      this.push("  type: AccountType;\n");
    } else {
      this.push(data);
    }
    callback();
  },
});

const output = createWriteStream("../shared/types.ts");

const combinedStream = new Writable({
  write(chunk, encoding, callback) {
    transformer.write(chunk, encoding, () => {
      output.write(transformer.read(), callback);
    });
  },
});

updateTypes(dbConnection, {
  output: combinedStream,
  exclude: ["knex_migrations", "knex_migrations_lock"],
}).catch((error) => {
  console.error("Error generating types:", error);
  process.exit(1);
});

// Ensure streams are properly closed when done
combinedStream.on("finish", () => {
  transformer.end();
  output.end();
});
