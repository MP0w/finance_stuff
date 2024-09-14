import React from "react";
import { TableHeader, TableRow, TableRowCell } from "./Table";
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
}

const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  accountingEntries,
  handleCellChange,
}) => {
  const headers = ["Date", ...accounts.map((account) => account.name), "Total"];

  const getEntryValue = (entry: AccountingEntriesDTO, accountId: string) => {
    const matchingEntry = entry.entries.find((e) => e.account_id === accountId);
    return matchingEntry ? matchingEntry.value : 0;
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

    const sum = entries.reduce((acc, curr) => acc + curr.value, 0);

    return [
      {
        value: new Date(entry.date).toLocaleDateString(),
      },
      ...entries,
      {
        value: sum,
      },
    ];
  }

  return (
    accounts.length > 0 &&
    accountingEntries.length > 0 && (
      <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto mt-4">
        <table className="w-full">
          <TableHeader headers={headers} />
          <tbody>
            {accountingEntries.map((entry) => (
              <TableRow key={entry.id} cells={getCells(entry, accounts)} />
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};

export default AccountsTable;
