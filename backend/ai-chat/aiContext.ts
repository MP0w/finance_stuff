import { dbConnection } from "../dbConnection";
import { getAccoutingEntries } from "../endpoints/AccountingEntries/accountingEntries";
import { Accounts, Table, Users } from "../types";
import { makeCSV, makeStatistics, makeSummaryData } from "../userStats";
import { DateTime } from "luxon";

export type AIChatContext = {
  currency: string;
  csv: string;
  lastEntryDate: string | undefined;
  stats: {
    averageSavings: number;
    averageTotal: number;
    averageProfits: number;
    averageDiff: number;
    monthlyIncome: number | undefined;
  };
  currentPortfolio: {
    accountName: string;
    balance: number;
  }[];
};

export async function makeAIContext(user: Users): Promise<AIChatContext> {
  const accountingEntries = await getAccoutingEntries(user.id);
  const accounts = await dbConnection<Accounts>(Table.Accounts)
    .select()
    .where({ user_id: user.id })
    .limit(1000);

  const fiatAccounts = accounts.filter((a) => a.type === "fiat");
  const investmentAccounts = accounts.filter((a) => a.type === "investment");

  const summaryData = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry: undefined,
  });

  const stats = makeStatistics(summaryData, (startDate, endDate) => {
    return DateTime.fromJSDate(endDate).diff(
      DateTime.fromJSDate(startDate),
      "months"
    ).months;
  });

  const currentPortfolio = () => {
    if (accountingEntries.length === 0 || accounts.length === 0) {
      return [];
    }
    const lastEntry = accountingEntries[accountingEntries.length - 1];
    const accountsById = new Map(
      accounts.map((account) => [account.id, account])
    );

    const entries = lastEntry.entries.filter((entry) =>
      accountsById.has(entry.account_id)
    );

    return entries.map((entry) => {
      return {
        accountName: accountsById.get(entry.account_id)?.name ?? "",
        balance: entry.value,
      };
    });
  };

  return {
    currency: user.currency,
    lastEntryDate:
      accountingEntries.length > 0
        ? accountingEntries.at(accountingEntries.length - 1)?.date
        : undefined,
    csv: makeCSV(summaryData),
    stats: {
      ...stats,
      monthlyIncome: undefined,
    },
    currentPortfolio: currentPortfolio(),
  };
}
