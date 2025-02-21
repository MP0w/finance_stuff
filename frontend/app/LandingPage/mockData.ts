import { AccountingEntriesDTO, Accounts } from "../../../shared/types";

export const mockFiatAccounts: Accounts[] = [
  {
    id: "1",
    name: "Cash",
    user_id: "string",
    type: "fiat",
    created_at: new Date(),
    updated_at: new Date(),
    currency: "USD",
    tag: null,
  },
  {
    id: "2",
    name: "Bank of America",
    user_id: "string",
    type: "fiat",
    created_at: new Date(),
    updated_at: new Date(),
    currency: "USD",
    tag: null,
  },
];

export const mockInvestmentsAccounts: Accounts[] = [
  {
    id: "3",
    name: "Crypto",
    user_id: "string",
    type: "investment",
    created_at: new Date(),
    updated_at: new Date(),
    currency: "USD",
    tag: null,
  },
  {
    id: "4",
    name: "Stocks",
    user_id: "string",
    type: "investment",
    created_at: new Date(),
    updated_at: new Date(),
    currency: "USD",
    tag: null,
  },
];

export const mockAccountingEntries: AccountingEntriesDTO[] = [
  {
    id: "1",
    user_id: "string",
    date: "2024-01-01",
    created_at: new Date(),
    updated_at: new Date(),
    entries: [
      {
        id: "1",
        user_id: "string",
        account_id: "1",
        accounting_entry_id: "1",
        value: 1500,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "1",
        value: 13540,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3",
        user_id: "string",
        account_id: "3",
        accounting_entry_id: "1",
        value: 5450,
        invested: 3500,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4",
        user_id: "string",
        account_id: "4",
        accounting_entry_id: "1",
        value: 10470,
        invested: 7000,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  },
  {
    id: "2",
    user_id: "string",
    date: "2024-02-01",
    created_at: new Date(),
    updated_at: new Date(),
    entries: [
      {
        id: "1",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "2",
        value: 1200,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "2",
        value: 15670,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3",
        user_id: "string",
        account_id: "3",
        accounting_entry_id: "2",
        value: 5700,
        invested: 3700,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4",
        user_id: "string",
        account_id: "4",
        accounting_entry_id: "2",
        value: 10575,
        invested: 7200,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  },
  {
    id: "3",
    user_id: "string",
    date: "2024-03-01",
    created_at: new Date(),
    updated_at: new Date(),
    entries: [
      {
        id: "1",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "3",
        value: 1400,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "3",
        value: 17670,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3",
        user_id: "string",
        account_id: "3",
        accounting_entry_id: "3",
        value: 5700,
        invested: 3700,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4",
        user_id: "string",
        account_id: "4",
        accounting_entry_id: "3",
        value: 10870,
        invested: 7720,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  },
  {
    id: "4",
    user_id: "string",
    date: "2024-04-01",
    created_at: new Date(),
    updated_at: new Date(),
    entries: [
      {
        id: "1",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "4",
        value: 1550,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        user_id: "string",
        account_id: "2",
        accounting_entry_id: "4",
        value: 15670,
        invested: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3",
        user_id: "string",
        account_id: "3",
        accounting_entry_id: "4",
        value: 5500,
        invested: 3700,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4",
        user_id: "string",
        account_id: "4",
        accounting_entry_id: "4",
        value: 10520,
        invested: 7720,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  },
];
