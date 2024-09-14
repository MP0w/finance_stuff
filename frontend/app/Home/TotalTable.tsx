import React from "react";
import { TableHeader, TableRow } from "./Table";
import { AccountingEntriesDTO, Accounts } from "../../../backend/types";

interface TotalTableProps {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
}

const TotalTable: React.FC<TotalTableProps> = ({
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
}) => {
  const headers = ["Date", "Liquid Total", "Investments Total", "Total"];
  const fiatAccountsIds = new Set(fiatAccounts.map((account) => account.id));
  const investmentAccountsIds = new Set(
    investmentAccounts.map((account) => account.id)
  );

  const getCells = (entry: AccountingEntriesDTO) => {
    const liquidTotal = entry.entries
      .filter((entry) => fiatAccountsIds.has(entry.account_id))
      .reduce((acc, curr) => acc + curr.value, 0);
    const investmentsTotal = entry.entries
      .filter((entry) => investmentAccountsIds.has(entry.account_id))
      .reduce((acc, curr) => acc + curr.value, 0);

    const total = liquidTotal + investmentsTotal;

    return [
      {
        value: new Date(entry.date).toLocaleDateString(),
      },
      {
        value: liquidTotal,
      },
      {
        value: investmentsTotal,
      },
      {
        value: total,
      },
    ];
  };

  return (
    accountingEntries.length > 0 && (
      <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto mt-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Total</h2>
        <table className="w-full">
          <TableHeader headers={headers} />
          <tbody>
            {accountingEntries.map((entry) => (
              <TableRow key={entry.id} cells={getCells(entry)} />
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};

export default TotalTable;
