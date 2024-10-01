import { PieChart, PieValueType } from "@mui/x-charts";
import { AccountingEntriesDTO, Accounts } from "../../../../shared/types";
import { LineChart } from "@mui/x-charts/LineChart";
import { stringForPercentage } from "../Investments/InvestmentTable";
import { Summary } from "../../../../shared/userStats";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

export interface GraphsTabProps {
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  summaryCells: Summary[];
}

export const GraphsTab: React.FC<GraphsTabProps> = ({
  investmentAccounts,
  accountingEntries,
  summaryCells,
}) => {
  const { t } = useTranslation();

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
    label: t("graphsTab.liquid"),
    value: summaryCells[summaryCells.length - 1].liquidTotal,
  });

  const pieTotal = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full flex flex-row gap-4 flex-wrap">
      <LineChart
        xAxis={[
          {
            data: summaryCells.map((p) =>
              DateTime.fromFormat(p.date, "yyyy-MM-dd").toJSDate()
            ),
            valueFormatter: (d: Date) =>
              new Date(d).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "2-digit",
              }),
            tickMinStep: 3600 * 1000 * 24 * 30 * (summaryCells.length / 3),
            min: DateTime.fromFormat(
              summaryCells[0].date,
              "yyyy-MM-dd"
            ).toJSDate(),
            max: DateTime.fromFormat(
              summaryCells[summaryCells.length - 1].date,
              "yyyy-MM-dd"
            ).toJSDate(),
          },
        ]}
        series={[
          {
            label: t("graphsTab.totalNetWorth"),
            data: summaryCells.map((p) => p.total),
            color: "#3852d6",
          },
          {
            label: t("graphsTab.liquidAssets"),
            data: summaryCells.map((p) => p.liquidTotal),
            color: "#8ededd",
          },
          {
            label: t("graphsTab.investments"),
            data: summaryCells.map((p) => p.investmentsTotal),
            color: "#8e9bde",
          },
        ]}
        width={600}
        height={400}
        slotProps={{ legend: { hidden: true } }}
        leftAxis={{
          disableTicks: true,
        }}
        bottomAxis={{
          disableTicks: true,
        }}
      />
      <PieChart
        series={[
          {
            valueFormatter: (value) => {
              return `${value.value.toFixed(0)} (${stringForPercentage(
                value.value / pieTotal
              )})`;
            },
            data: pieData.sort((a, b) => a.value - b.value),
            highlightScope: { fade: "global", highlight: "item" },
            innerRadius: 10,
            outerRadius: 100,
            paddingAngle: 3,
            cornerRadius: 5,
          },
        ]}
        width={400}
        height={400}
        slotProps={{
          legend: {
            itemMarkHeight: 8,
            itemMarkWidth: 8,
            markGap: 5,
            itemGap: 10,
            labelStyle: {
              fontSize: 10,
              maxWidth: 20,
            },
          },
        }}
      />
    </div>
  );
};
