import React from "react";
import Table, { dateHeader, TableHeaderContent, TableRowCell } from "../Table";
import { AccountingEntriesDTO, Accounts } from "../../../../backend/types";
import { colorForValue, stringForPercentage } from "../InvestmentTable";
import { makeSummaryData, SummaryCell } from "./SummaryTab";

export interface TotalTableProps {
  title?: string;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  summaryCells?: SummaryCell[];
  onAddEntry: (date: Date) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}

const TotalTable: React.FC<TotalTableProps> = ({
  title,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  summaryCells,
  onDeleteAccountingEntry,
}) => {
  const headers: (TableHeaderContent | undefined)[] = [
    dateHeader,
    fiatAccounts.length
      ? {
          title: "Liquid",
          tip: { text: "Total of all bank accounts", id: "total-table-liquid" },
        }
      : undefined,
    investmentAccounts.length
      ? {
          title: "Invested",
          tip: {
            text: "Total of all your investments excluding profits or losses",
            id: "total-table-invested",
          },
        }
      : undefined,
    investmentAccounts.length
      ? {
          title: "Investments Value",
          tip: {
            text: "Total value of your investments including profits or losses",
            id: "total-table-value",
          },
        }
      : undefined,
    investmentAccounts.length ? "Profits" : undefined,
    investmentAccounts.length ? "%" : undefined,
    fiatAccounts.length
      ? {
          title: "Savings",
          tip: {
            text: "Savings excluding profits or losses of investments from the previous entry. Basically your net worth change if investments stayed flat.",
            id: "total-table-savings",
          },
        }
      : undefined,
    fiatAccounts.length && investmentAccounts.length ? "Total" : undefined,
    "Change",
  ];

  const summaryData =
    summaryCells ??
    makeSummaryData({
      fiatAccounts,
      investmentAccounts,
      accountingEntries,
    });

  const getCells = (summary: SummaryCell): TableRowCell[] => {
    const cells: (TableRowCell | undefined)[] = [
      {
        value: summary.date.toLocaleDateString(),
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
      rows={summaryData.map((entry) => getCells(entry))}
      onAddEntry={undefined}
    />
  );
};

export default TotalTable;
