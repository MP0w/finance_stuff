import React from "react";
import { AccountingEntriesDTO, Accounts } from "../../../../backend/types";
import AddToCalendar from "../../components/AddToCalendar";
import TotalTable from "./TotalTable";
import { GraphsTab } from "./GraphsTab";
import { ProjectionsTab } from "./ProjectionsTab";

type Summary = {
  id: string;
  date: Date;
  liquidTotal: number;
  investmentsTotal: number;
  investmentsInvested: number;
  profits: number;
  total: number;
  isMissingValues: boolean;
  isLive: boolean;
};

export type SummaryCell = {
  id: string;
  date: Date;
  liquidTotal: number;
  investmentsTotal: number;
  investmentsInvested: number;
  profits: number;
  total: number;
  previous: Summary | undefined;
  change: number | undefined;
  savings: number | undefined;
  isMissingValues: boolean;
  isLive: boolean;
};

export function makeSummaryData(args: {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  liveAccountingEntry: AccountingEntriesDTO | undefined;
}) {
  const {
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry,
  } = args;
  const fiatAccountsIds = new Set(fiatAccounts.map((account) => account.id));
  const investmentAccountsIds = new Set(
    investmentAccounts.map((account) => account.id)
  );

  const makeSummary = (
    entry: AccountingEntriesDTO,
    isLive: boolean
  ): Summary => {
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
      date: new Date(entry.date),
      liquidTotal,
      investmentsTotal,
      investmentsInvested,
      profits,
      total,
      isMissingValues,
      isLive,
    };
  };

  const summaries: Summary[] = accountingEntries.map((entry) => {
    return makeSummary(entry, false);
  });

  if (liveAccountingEntry) {
    summaries.push(makeSummary(liveAccountingEntry, true));
  }

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

  return summaryCells;
}

export const SummaryTab: React.FC<{
  liveAccountingEntry: AccountingEntriesDTO | undefined;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  onAddEntry: (date: Date) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}> = ({
  liveAccountingEntry,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  onAddEntry,
  onDeleteAccountingEntry,
}) => {
  const summaryCells = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry: undefined,
  });

  return fiatAccounts.length > 0 || investmentAccounts.length > 0 ? (
    <div>
      <div className="flex justify-between items-center">
        <div></div>
        <AddToCalendar />
      </div>
      <TotalTable
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        liveAccountingEntry={liveAccountingEntry}
        onAddEntry={onAddEntry}
        onDeleteAccountingEntry={onDeleteAccountingEntry}
      />
      <GraphsTab
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        summaryCells={summaryCells}
      />
      <ProjectionsTab summaryCells={summaryCells} />
    </div>
  ) : (
    <div>Add your accounts and entries to see the summary</div>
  );
};

export default SummaryTab;
