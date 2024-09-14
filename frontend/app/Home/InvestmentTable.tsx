import React from "react";
import { TableHeader, TableRow, TableRowCell } from "./Table";
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
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({
  account,
  accountingEntries,
  handleCellChange,
}) => {
  const headers = [
    "Date",
    `${account.name} Invested`,
    `${account.name} Value`,
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
        value: value - invested,
      },
      {
        value: `${(((value - invested) / value) * 100).toFixed(1)}%`,
      },
    ];
  }

  return (
    accountingEntries.length > 0 && (
      <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto mt-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {account.name}
        </h2>
        <table className="w-full">
          <TableHeader headers={headers} />
          <tbody>
            {accountingEntries.map((entry) => (
              <TableRow key={entry.id} cells={getCells(entry, account)} />
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};

export default InvestmentTable;
