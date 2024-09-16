import React from "react";
import Table, { TableHeaderContent, TableRowCell } from "./Table";
import { AccountingEntriesDTO, Accounts } from "../../../backend/types";

interface AccountsTableProps {
  accounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  handleCellChange: (
    entryId: string,
    accountId: string,
    value: number,
    invested: boolean
  ) => Promise<void>;
  onAddEntry: (date: Date) => void;
  onDeleteAccount: (accountId: string) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}

const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  accountingEntries,
  handleCellChange,
  onAddEntry,
  onDeleteAccount,
  onDeleteAccountingEntry,
}) => {
  const headers: TableHeaderContent[] = [
    "Date",
    ...accounts.map((account) => {
      return {
        title: account.name,
        onDelete: () => {
          onDeleteAccount(account.id);
        },
      };
    }),
    "Total",
  ];

  const getEntryValue = (entry: AccountingEntriesDTO, accountId: string) => {
    const matchingEntry = entry.entries.find((e) => e.account_id === accountId);
    return matchingEntry?.value;
  };

  function getCells(
    entry: AccountingEntriesDTO,
    accounts: Accounts[]
  ): TableRowCell[] {
    const entries = accounts.map((account) => ({
      value: getEntryValue(entry, account.id),
      onValueChange: (value: number) => {
        return handleCellChange(entry.id, account.id, value, false);
      },
    }));

    const sum = entries.reduce((acc, curr) => acc + (curr.value ?? 0), 0);

    return [
      {
        value: new Date(entry.date).toLocaleDateString(),
        onDelete: () => {
          onDeleteAccountingEntry(entry.id);
        },
      },
      ...entries,
      {
        value: sum,
      },
    ];
  }

  return (
    accounts.length > 0 && (
      <Table
        headers={headers}
        rows={accountingEntries.map((entry) => getCells(entry, accounts))}
        onAddEntry={onAddEntry}
      />
    )
  );
};

export default AccountsTable;
