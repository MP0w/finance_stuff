import { dbConnection } from "../dbConnection";
import { getAccoutingEntries } from "../endpoints/AccountingEntries/accountingEntries";
import { Accounts, Table, Users } from "../types";
import { makeCSV, makeStatistics, makeSummaryData } from "../userStats";

export type AIChatContext = {
  currency: string;
  csv: string;
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

  const stats = makeStatistics(summaryData);

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
    csv: makeCSV(summaryData),
    stats: {
      ...stats,
      monthlyIncome: undefined,
    },
    currentPortfolio: currentPortfolio(),
  };
}
