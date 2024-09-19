// This file is auto-generated. Do not edit it manually.


export type AccountingEntriesDTO = AccountingEntries & { entries: Entries[] };

export type AccountType = "fiat" | "investment";

export type AIChatContext = {
  currency: string;
  csv: string;
  stats: {
    averageSavings: number;
    averageTotalNetWorth: number;
    averageProfits: number;
    monthlyIncome: number;
  };
  currentPortfolio: {
    accountName: string;
    balance: number;
  }[];
};

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

export enum Table {
  AccountingEntries = "accounting_entries",
  Accounts = "accounts",
  Connections = "connections",
  Entries = "entries",
  Users = "users",
}

export type Tables = {
  "accounting_entries": AccountingEntries,
  "accounts": Accounts,
  "connections": Connections,
  "entries": Entries,
  "users": Users,
};

export type AccountingEntries = {
  id: string;
  user_id: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

export type Accounts = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  created_at: Date;
  updated_at: Date;
  currency: string;
};

export type Connections = {
  id: string;
  user_id: string;
  account_id: string;
  settings: string;
  connector_id: string;
  created_at: Date;
  updated_at: Date;
};

export type Entries = {
  id: string;
  user_id: string;
  account_id: string;
  accounting_entry_id: string;
  value: number;
  invested: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Users = {
  id: string;
  firebase_uid: string;
  email: string | null;
  username: string | null;
  name: string | null;
  photo: string | null;
  currency: string;
  created_at: Date;
  updated_at: Date;
  used_ai_totoal_tokens: string;
  used_ai_prompt_tokens: string;
  available_ai_tokens: string;
};

