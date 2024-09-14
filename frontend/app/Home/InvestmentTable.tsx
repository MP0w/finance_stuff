import React from "react";
import Table, { TableRowCell } from "./Table";
import { AccountingEntriesDTO, Accounts } from "../../../backend/types";

interface InvestmentTableProps {
  account: Accounts;
  accountingEntries: AccountingEntriesDTO[];
  handleCellChange: (
    entryId: string,
    accountId: string,
    value: number,
    invested: boolean
  ) => Promise<void>;
  onAddEntry: (date: Date) => void;
}

export function colorForValue(value: number | undefined): string | undefined {
  if (!value || value === 0) {
    return undefined;
  }

  return value > 0 ? "bg-green-100" : "bg-red-100";
}

export function stringForPercentage(profit: number): string {
  if (isNaN(profit)) {
    return "";
  }

  return `${(profit * 100).toFixed(1)}%`;
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({
  account,
  accountingEntries,
  handleCellChange,
  onAddEntry,
}) => {
  const headers = [
    "Date",
    `Initial investment`,
    `Investment Value`,
    "Profit",
    "%",
  ];

  function getCells(
    accountingEntry: AccountingEntriesDTO,
    account: Accounts
  ): TableRowCell[] {
    const entry = accountingEntry.entries.find(
      (e) => e.account_id === account.id
    );

    const value = entry?.value ?? 0;
    const invested = entry?.invested ?? 0;
    const profits = value - invested;

    return [
      {
        value: new Date(accountingEntry.date).toLocaleDateString(),
      },
      {
        value: invested,
        onValueChange: (value: number) => {
          return handleCellChange(accountingEntry.id, account.id, value, true);
        },
      },
      {
        value,
        onValueChange: (value: number) => {
          return handleCellChange(accountingEntry.id, account.id, value, false);
        },
      },
      {
        value: profits,
        color: colorForValue(profits),
      },
      {
        value: stringForPercentage(profits / value),
        color: colorForValue(profits),
      },
    ];
  }

  return (
    <Table
      title={account.name}
      headers={headers}
      rows={accountingEntries.map((entry) => getCells(entry, account))}
      onAddEntry={onAddEntry}
    />
  );
};

export default InvestmentTable;
