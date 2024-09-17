import React from "react";
import Table, { TableHeaderContent, TableRowCell } from "./Table";
import { AccountingEntriesDTO, Accounts } from "../../../backend/types";
import { colorForValue, stringForPercentage } from "./InvestmentTable";

export interface TotalTableProps {
  title?: string;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  onAddEntry: (date: Date) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}

type Summary = {
  id: string;
  date: string;
  liquidTotal: number;
  investmentsTotal: number;
  investmentsInvested: number;
  profits: number;
  total: number;
  isMissingValues: boolean;
};

type SummaryCell = {
  id: string;
  date: string;
  liquidTotal: number;
  investmentsTotal: number;
  investmentsInvested: number;
  profits: number;
  total: number;
  previous: Summary | undefined;
  change: number | undefined;
  savings: number | undefined;
  isMissingValues: boolean;
};

const TotalTable: React.FC<TotalTableProps> = ({
  title,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  onDeleteAccountingEntry,
}) => {
  const headers: (TableHeaderContent | undefined)[] = [
    "Date",
    fiatAccounts.length ? "Liquid Total" : undefined,
    investmentAccounts.length ? "Investments Invested" : undefined,
    investmentAccounts.length ? "Investments Total" : undefined,
    investmentAccounts.length ? "Investments Profit" : undefined,
    investmentAccounts.length ? "Investments %" : undefined,
    fiatAccounts.length
      ? {
          title: "Savings",
          tipText:
            "Savings excluding profits or losses of investments from the previous entry. Basically your net worth change if investments stayed flat.",
        }
      : undefined,
    fiatAccounts.length && investmentAccounts.length ? "Total" : undefined,
    "Change",
  ];
  const fiatAccountsIds = new Set(fiatAccounts.map((account) => account.id));
  const investmentAccountsIds = new Set(
    investmentAccounts.map((account) => account.id)
  );

  const summaries: Summary[] = accountingEntries.map((entry) => {
    const fiatEntries = entry.entries.filter((entry) =>
      fiatAccountsIds.has(entry.account_id)
    );
    const investmentEntries = entry.entries.filter((entry) =>
      investmentAccountsIds.has(entry.account_id)
    );

    const isMissingValues =
      fiatEntries.length < fiatAccounts.length ||
      investmentEntries.length < investmentAccounts.length ||
      investmentEntries.some((entry) => entry.invested === null);

    const liquidTotal = fiatEntries.reduce((acc, curr) => acc + curr.value, 0);
    const investmentsTotal = investmentEntries.reduce(
      (acc, curr) => acc + curr.value,
      0
    );
    const investmentsInvested = investmentEntries.reduce(
      (acc, curr) => acc + (curr.invested ?? 0),
      0
    );

    const profits = investmentsTotal - investmentsInvested;
    const total = liquidTotal + investmentsTotal;

    return {
      id: entry.id,
      date: new Date(entry.date).toLocaleDateString(),
      liquidTotal,
      investmentsTotal,
      investmentsInvested,
      profits,
      total,
      isMissingValues,
    };
  });

  const summaryCells: SummaryCell[] = summaries.map((summary, index) => {
    const previous = index > 0 ? summaries.at(index - 1) : undefined;
    const change = previous ? summary.total - previous.total : undefined;
    let savings = undefined;

    if (previous) {
      const previousTotalWithoutGains = previous.total - previous.profits;
      const currentTotalWithoutGains = summary.total - summary.profits;
      savings = currentTotalWithoutGains - previousTotalWithoutGains;
    }

    return {
      ...summary,
      previous,
      change,
      savings,
    };
  });

  const getCells = (summary: SummaryCell): TableRowCell[] => {
    const cells: (TableRowCell | undefined)[] = [
      {
        value: summary.date,
        warningText: summary.isMissingValues
          ? "🚨 You are missing some values in your accounts for this entry, check the glowing red cells in Bank Accounts & Investments for this date"
          : undefined,
        onDelete: () => {
          onDeleteAccountingEntry(summary.id);
        },
      },
      fiatAccounts.length
        ? {
            value: summary.liquidTotal,
            color: "bg-purple-100",
          }
        : undefined,
      investmentAccounts.length
        ? {
            value: summary.investmentsInvested,
            color: "bg-sky-100",
          }
        : undefined,
      investmentAccounts.length
        ? {
            value: summary.investmentsTotal,
            color: "bg-indigo-100",
          }
        : undefined,
      investmentAccounts.length
        ? {
            value: summary.profits,
            color: colorForValue(summary.profits),
          }
        : undefined,
      investmentAccounts.length
        ? {
            value: stringForPercentage(
              summary.profits / summary.investmentsTotal
            ),
            color: colorForValue(summary.profits),
          }
        : undefined,
      fiatAccounts.length
        ? {
            value: summary.savings ?? "",
            color: colorForValue(summary.savings),
          }
        : undefined,
      fiatAccounts.length && investmentAccounts.length
        ? {
            value: summary.total,
            color: "bg-violet-200",
          }
        : undefined,
      {
        value: summary.change ?? "",
        color: colorForValue(summary.change),
      },
    ];

    return cells.filter((cell) => cell !== undefined);
  };

  return (
    <Table
      title={title}
      headers={headers.filter((h) => h !== undefined)}
      rows={summaryCells.map((entry) => getCells(entry))}
      onAddEntry={undefined}
    />
  );
};

export default TotalTable;
