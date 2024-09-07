// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  AccountingEntries = "accounting_entries",
  Accounts = "accounts",
  Entries = "entries",
  KnexMigrations = "knex_migrations",
  KnexMigrationsLock = "knex_migrations_lock",
  Users = "users",
}

export type Tables = {
  "accounting_entries": AccountingEntries,
  "accounts": Accounts,
  "entries": Entries,
  "knex_migrations": KnexMigrations,
  "knex_migrations_lock": KnexMigrationsLock,
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
  type: string;
  created_at: Date;
  updated_at: Date;
};

export type Entries = {
  id: string;
  user_id: string;
  account_id: string;
  accounting_entry_id: string;
  value: string;
  invested: string | null;
  created_at: Date;
  updated_at: Date;
};

export type KnexMigrations = {
  id: number;
  name: string | null;
  batch: number | null;
  migration_time: Date | null;
};

export type KnexMigrationsLock = {
  index: number;
  is_locked: number | null;
};

export type Users = {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  photo: string | null;
  currency: string;
  created_at: Date;
  updated_at: Date;
};

