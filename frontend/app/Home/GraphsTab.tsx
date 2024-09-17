import { PieChart, PieValueType } from "@mui/x-charts";
import { AccountingEntriesDTO, Accounts } from "../../../backend/types";
import { makeSummaryData } from "./TotalTable";
import { LineChart } from "@mui/x-charts/LineChart";

export interface GraphsTabProps {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
}

export const GraphsTab: React.FC<GraphsTabProps> = ({
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
}) => {
  const summaryCells = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
  });

  const lastEntry = accountingEntries[accountingEntries.length - 1];
  const investmentAccountsByIds = new Map(
    investmentAccounts.map((account) => [account.id, account])
  );

  const investmentEntries = lastEntry.entries.filter((entry) =>
    investmentAccountsByIds.has(entry.account_id)
  );

  const pieData: PieValueType[] = investmentEntries.map((entry) => {
    return {
      id: entry.account_id,
      label: investmentAccountsByIds.get(entry.account_id)?.name ?? "",
      value: entry.value,
    };
  });

  pieData.push({
    id: "Liquid",
    label: "Liquid",
    value: summaryCells[summaryCells.length - 1].liquidTotal,
  });

  return (
    <div className="w-full flex flex-row gap-4 flex-wrap">
      <LineChart
        xAxis={[
          {
            data: summaryCells.map((p) => p.date),
            valueFormatter: (d: Date) => new Date(d).toLocaleDateString(),
          },
        ]}
        series={[
          {
            label: "Total net worth",
            data: summaryCells.map((p) => p.total),
            color: "#3852d6",
          },
          {
            label: "Liquid assets",
            data: summaryCells.map((p) => p.liquidTotal),
            color: "#8ededd",
          },
          {
            label: "Investments",
            data: summaryCells.map((p) => p.investmentsTotal),
            color: "#8e9bde",
          },
        ]}
        width={600}
        height={400}
        slotProps={{ legend: { hidden: true } }}
      />
      <PieChart
        series={[{ data: pieData, type: "pie" }]}
        width={400}
        height={400}
        slotProps={{ legend: { hidden: true } }}
      />
    </div>
  );
};
