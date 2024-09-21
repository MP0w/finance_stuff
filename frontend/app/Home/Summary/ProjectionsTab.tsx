import { LineChart } from "@mui/x-charts";
import { getUserCurrencySymbol } from "@/app/UserState";
import { makeStatistics, Summary } from "../../../../shared/userStats";
import { DateTime } from "luxon";

export interface ProjectionsTabProps {
  summaryCells: Summary[];
}

export const ProjectionsTab: React.FC<ProjectionsTabProps> = ({
  summaryCells,
}) => {
  const {
    lastDate,
    lastSummary,
    averageDiff,
    distanceBetweenEntries,
    averageProfits,
    averageSavings,
    averageTotal,
  } = makeStatistics(summaryCells, (startDate, endDate) => {
    return DateTime.fromJSDate(endDate).diff(
      DateTime.fromJSDate(startDate),
      "months"
    ).months;
  });

  const nextYearDates = Array(12)
    .fill(1)
    .map((_, i) => {
      return DateTime.fromJSDate(lastDate)
        .plus({ months: i + 1 })
        .toJSDate();
    });

  const projectionValues = [
    { date: lastDate, value: lastSummary?.total ?? 0 },
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
        <blockquote className="border-l-4 border-gray-600 pl-4">
          Your data covers {distanceBetweenEntries} months, statistics and
          projections will be more accurate the more data you will have. You can
          also enter data of previous months.
        </blockquote>
      )}
      <div className="w-full mt-8 flex gap-16 flex-wrap items-center justify-center">
        {isFinite(averageSavings) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold">Average Savings</h2>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageSavings.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold">Average Total</h2>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageTotal.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && averageProfits > 0 && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold">Average Monthly Profits</h2>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageProfits.toFixed(0)}
            </p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-16 text-center">Projection</h2>
      {distanceBetweenEntries < 6 ? (
        <blockquote className="border-l-4 border-gray-600 pl-4">
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
