import { DateTime } from "luxon";
import { SummaryCell } from "./SummaryTab";
import { LineChart } from "@mui/x-charts";
import { getCurrencySymbol } from "@/app/UserState";

export interface ProjectionsTabProps {
  summaryCells: SummaryCell[];
}

export const ProjectionsTab: React.FC<ProjectionsTabProps> = ({
  summaryCells,
}) => {
  const sums = summaryCells.reduce(
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

  const averageSavings = sums.savings / (summaryCells.length - 1);
  const averageTotal = sums.total / summaryCells.length;
  const averageProfits = sums.profits / (summaryCells.length - 1);
  const lastSummary = summaryCells.at(-1);
  const firstDate = DateTime.fromJSDate(summaryCells.at(0)?.date ?? new Date());
  const lastDate = DateTime.fromJSDate(lastSummary?.date ?? new Date());
  const distanceBetweenEntries =
    summaryCells.length > 1 ? lastDate.diff(firstDate, "months").months : 0;
  const totalDiff =
    (lastSummary?.total ?? 0) - (summaryCells.at(0)?.total ?? 0);
  const averageDiff = totalDiff / distanceBetweenEntries;

  const nextYearDates = Array(12)
    .fill(1)
    .map((_, i) => {
      return lastDate.plus({ months: i + 1 }).toJSDate();
    });

  const projectionValues = [
    { date: lastDate.toJSDate(), value: lastSummary?.total ?? 0 },
  ].concat(
    nextYearDates.map((date, index) => {
      const rand = Math.random() / (index + 1);
      const randPercentage = Math.random() > 0.5 ? rand : -rand;
      const diff = averageDiff + averageDiff * randPercentage;
      return {
        date,
        value: (lastSummary?.total ?? 0) + diff * (index + 1),
      };
    })
  );

  return (
    <div>
      {distanceBetweenEntries < 6 && (
        <blockquote className="text-gray-800 border-l-4 border-gray-600 pl-4">
          Your data covers {distanceBetweenEntries} months, statistics and
          projections will be more accurate the more data you will have. You can
          also enter data of previous months.
        </blockquote>
      )}
      <div className="w-full mt-8 flex gap-16 flex-wrap items-center justify-center">
        {isFinite(averageSavings) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Savings</h2>
            <p className="text-md text-gray-500">
              {getCurrencySymbol()} {averageSavings.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Total</h2>
            <p className="text-md text-gray-500">
              {getCurrencySymbol()} {averageTotal.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && averageProfits > 0 && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Monthly Profits</h2>
            <p className="text-md text-gray-500">
              {getCurrencySymbol()} {averageProfits.toFixed(0)}
            </p>
          </div>
        )}
      </div>

      <h2 className="text-xl text-gray-800 mt-16 text-center">Projection</h2>
      {distanceBetweenEntries < 6 ? (
        <blockquote className="text-gray-800 border-l-4 border-gray-600 pl-4">
          We can only do projections if you have at least 6 months of data. You
          currently have {distanceBetweenEntries} months of data.
        </blockquote>
      ) : (
        <div className="flex justify-center items-center">
          <LineChart
            xAxis={[
              {
                data: projectionValues.map((p) => p.date),
                valueFormatter: (d: Date) =>
                  new Date(d).toLocaleDateString(undefined, {
                    day: undefined,
                    month: "short",
                    year: "2-digit",
                  }),
                tickMinStep: 3600 * 1000 * 24 * 30 * 3,
                min: projectionValues[0].date,
                max: projectionValues[projectionValues.length - 1].date,
              },
            ]}
            series={[
              {
                label: "Total net worth",
                data: projectionValues.map((p) => p.value),
                color: "#3852d6",
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
        </div>
      )}
    </div>
  );
};
