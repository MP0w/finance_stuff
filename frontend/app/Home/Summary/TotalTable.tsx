import React from "react";
import Table, {
  dateHeader,
  differenceHeader,
  percentageHeader,
  profitsHeader,
  TableHeaderContent,
  TableRowCell,
} from "../Table";
import { AccountingEntriesDTO, Accounts } from "../../../../shared/types";
import {
  colorForValue,
  stringForPercentage,
} from "../Investments/InvestmentTable";
import { makeSummaryData, Summary } from "../../../../shared/userStats";
import { DateTime } from "luxon";

export interface TotalTableProps {
  title?: string;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  liveAccountingEntry: AccountingEntriesDTO | undefined;
  onAddEntry: (date: string) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}

function makeHeaders(
  fiatAccounts: Accounts[],
  investmentAccounts: Accounts[]
): TableHeaderContent[] {
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
    investmentAccounts.length ? profitsHeader : undefined,
    investmentAccounts.length ? percentageHeader : undefined,
    fiatAccounts.length
      ? {
          title: "Savings",
          tip: {
            text: "Savings excluding profits or losses of investments from the previous entry. Basically your net worth change if investments stayed flat.",
            id: "total-table-savings",
          },
        }
      : undefined,
    fiatAccounts.length && investmentAccounts.length
      ? {
          title: "Total",
          tip: {
            text: "Your total net worth, the sum of your liquidity and investments values",
            id: "total-net-worth",
            noIcon: true,
          },
        }
      : undefined,
    differenceHeader,
  ];

  return headers.filter((h) => h !== undefined);
}

const TotalTable: React.FC<TotalTableProps> = ({
  title,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  onDeleteAccountingEntry,
  liveAccountingEntry,
}) => {
  const summaryData = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry,
  });

  const getCells = (summary: Summary): TableRowCell[] => {
    const cells: (TableRowCell | undefined)[] = [
      summary.isLive
        ? {
            value: "Live Data",
            color: "bg-red-100",
          }
        : {
            value: DateTime.fromFormat(summary.date, "yyyy-MM-dd").toJSDate(),
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
      headers={makeHeaders(fiatAccounts, investmentAccounts)}
      rows={summaryData.map((entry) => getCells(entry))}
      onAddEntry={undefined}
    />
  );
};

export default TotalTable;
