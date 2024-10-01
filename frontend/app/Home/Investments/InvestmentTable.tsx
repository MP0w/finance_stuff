import React from "react";
import { useTranslation } from "react-i18next";
import Table, {
  dateHeader,
  differenceHeader,
  percentageHeader,
  profitsHeader,
  TableHeaderContent,
  TableRowCell,
} from "../Table";
import { AccountingEntriesDTO, Accounts } from "../../../../shared/types";
import { DateTime } from "luxon";

interface InvestmentTableProps {
  account: Accounts;
  accountingEntries: AccountingEntriesDTO[];
  handleCellChange: (
    entryId: string,
    accountId: string,
    value: number,
    invested: boolean
  ) => Promise<void>;
  onAddEntry?: (date: string) => void;
  onDeleteAccount?: (accountId: string) => void;
  onDeleteAccountingEntry?: (entryId: string) => void;
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

  if (!isFinite(profit)) {
    return stringForPercentage(profit < 0 ? -1 : 1);
  }

  return `${(profit * 100).toFixed(1)}%`;
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({
  account,
  accountingEntries,
  handleCellChange,
  onAddEntry,
  onDeleteAccount,
  onDeleteAccountingEntry,
}) => {
  const { t } = useTranslation();

  const headers: TableHeaderContent[] = [
    dateHeader(t),
    {
      title: t("investmentTable.initialInvestment"),
      tip: {
        text: t("investmentTable.initialInvestmentTip"),
        id: "investment-table-initial",
      },
    },
    {
      title: t("investmentTable.investmentValue"),
      tip: {
        text: t("investmentTable.investmentValueTip"),
        id: "investment-table-value",
      },
    },
    profitsHeader(t),
    differenceHeader(t),
    percentageHeader(t),
  ];

  function getLinkedEntries(accountingEntries: AccountingEntriesDTO[]) {
    return accountingEntries.map((entry, index) => {
      const previous = index > 0 ? accountingEntries.at(index - 1) : undefined;
      return {
        ...entry,
        previous,
      };
    });
  }

  function getCells(
    accountingEntry: AccountingEntriesDTO & {
      previous: AccountingEntriesDTO | undefined;
    },
    account: Accounts
  ): TableRowCell[] {
    const entry = accountingEntry.entries.find(
      (e) => e.account_id === account.id
    );

    const previousEntry = accountingEntry.previous?.entries.find(
      (e) => e.account_id === account.id
    );

    const value = entry?.value;
    const invested = entry?.invested ?? undefined;
    const profits = (value ?? 0) - (invested ?? 0);
    const previousProfits =
      (previousEntry?.value ?? 0) - (previousEntry?.invested ?? 0);

    return [
      {
        value: DateTime.fromFormat(
          accountingEntry.date,
          "yyyy-MM-dd"
        ).toJSDate(),
        onDelete: onDeleteAccountingEntry
          ? () => {
              onDeleteAccountingEntry(accountingEntry.id);
            }
          : undefined,
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
        value: profits - previousProfits,
        color: colorForValue(profits - previousProfits),
      },
      {
        value: stringForPercentage(profits / (invested ?? 0)),
        color: colorForValue(profits / (invested ?? 0)),
      },
    ];
  }

  return (
    <Table
      title={account.name}
      headers={headers}
      rows={getLinkedEntries(accountingEntries).map((entry) =>
        getCells(entry, account)
      )}
      onAddEntry={onAddEntry}
      onDelete={onDeleteAccount ? () => onDeleteAccount(account.id) : undefined}
    />
  );
};

export default InvestmentTable;
