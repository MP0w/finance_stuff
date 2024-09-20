import { AccountingEntriesDTO, Accounts } from "./types";

export type PartialSummary = {
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

export type Summary = PartialSummary & {
  previous: PartialSummary | undefined;
  change: number | undefined;
  savings: number | undefined;
};

export function makeCSV(rows: Summary[]) {
  const columns =
    "Date,Liquid,Invested,Investments Value,Profits,Savings,Total,Change";

  const data = rows.map((r) => [
    r.date.toLocaleDateString(),
    r.liquidTotal,
    r.investmentsInvested,
    r.investmentsTotal,
    r.profits,
    r.savings,
    r.total,
    r.change,
  ]);

  const csv = [columns];
  data.forEach((row) => {
    csv.push(row.join(","));
  });

  return csv.join("\n");
}

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
  ): PartialSummary => {
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

  const partialSummaries = accountingEntries.map((entry) => {
    return makeSummary(entry, false);
  });

  if (liveAccountingEntry) {
    partialSummaries.push(makeSummary(liveAccountingEntry, true));
  }

  const result: Summary[] = partialSummaries.map((summary, index) => {
    const previous = index > 0 ? partialSummaries.at(index - 1) : undefined;
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

  return result;
}

export const createCSVContent = (args: {
  accountingEntries: AccountingEntriesDTO[] | undefined;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
}) => {
  const { accountingEntries, fiatAccounts, investmentAccounts } = args;
  if (!accountingEntries) {
    return;
  }

  const summaryData = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry: undefined,
  });

  return makeCSV(summaryData);
};

export function makeStatistics(
  summaries: Summary[],
  distanceBetweenEntries: (startDate: Date, endDate: Date) => number
) {
  const sums = summaries.reduce(
    (acc, curr) => {
      return {
        total: acc.total + curr.total,
        savings: acc.savings + (curr?.savings ?? 0),
        profits:
          acc.profits +
          (curr.previous
            ? curr.investmentsTotal - curr.previous.investmentsTotal
            : 0),
      };
    },
    { total: 0, savings: 0, profits: 0 }
  );

  const averageSavings = sums.savings / (summaries.length - 1);
  const averageTotal = sums.total / summaries.length;
  const averageProfits = sums.profits / (summaries.length - 1);
  const lastSummary = summaries.at(-1);
  const firstDate = summaries.at(0)?.date ?? new Date();
  const lastDate = lastSummary?.date ?? new Date();
  const distance =
    summaries.length > 1 ? distanceBetweenEntries(firstDate, lastDate) : 0;
  const totalDiff = (lastSummary?.total ?? 0) - (summaries.at(0)?.total ?? 0);
  const averageDiff = totalDiff / distance;

  return {
    averageSavings,
    averageTotal,
    averageProfits,
    averageDiff,
    lastDate,
    lastSummary,
    distanceBetweenEntries: distance,
  };
}
