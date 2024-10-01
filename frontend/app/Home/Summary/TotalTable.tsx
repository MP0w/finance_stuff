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
import { useTranslation } from "react-i18next";
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
  t: (key: string) => string,
  fiatAccounts: Accounts[],
  investmentAccounts: Accounts[]
): TableHeaderContent[] {
  const headers: (TableHeaderContent | undefined)[] = [
    dateHeader(t),
    fiatAccounts.length
      ? {
          title: t("totalTable.liquid"),
          tip: { text: t("totalTable.liquidTip"), id: "total-table-liquid" },
        }
      : undefined,
    investmentAccounts.length
      ? {
          title: t("totalTable.invested"),
          tip: {
            text: t("totalTable.investedTip"),
            id: "total-table-invested",
          },
        }
      : undefined,
    investmentAccounts.length
      ? {
          title: t("totalTable.investmentsValue"),
          tip: {
            text: t("totalTable.investmentsValueTip"),
            id: "total-table-value",
          },
        }
      : undefined,
    investmentAccounts.length ? profitsHeader(t) : undefined,
    investmentAccounts.length ? percentageHeader(t) : undefined,
    fiatAccounts.length
      ? {
          title: t("totalTable.savings"),
          tip: {
            text: t("totalTable.savingsTip"),
            id: "total-table-savings",
          },
        }
      : undefined,
    fiatAccounts.length && investmentAccounts.length
      ? {
          title: t("totalTable.total"),
          tip: {
            text: t("totalTable.totalTip"),
            id: "total-net-worth",
            noIcon: true,
          },
        }
      : undefined,
    differenceHeader(t),
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

  const { t } = useTranslation();

  const getCells = (summary: Summary): TableRowCell[] => {
    const cells: (TableRowCell | undefined)[] = [
      summary.isLive
        ? {
            value: t("totalTable.liveData"),
            color: "bg-red-100",
          }
        : {
            value: DateTime.fromFormat(summary.date, "yyyy-MM-dd").toJSDate(),
            warningText: summary.isMissingValues
              ? t("totalTable.missingValuesWarning")
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
      headers={makeHeaders(t, fiatAccounts, investmentAccounts)}
      rows={summaryData.map((entry) => getCells(entry))}
      onAddEntry={undefined}
    />
  );
};

export default TotalTable;
