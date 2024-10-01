import { LineChart } from "@mui/x-charts";
import { getUserCurrencySymbol } from "@/app/UserState";
import { makeStatistics, Summary } from "../../../../shared/userStats";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

export interface ProjectionsTabProps {
  summaryCells: Summary[];
}

export const ProjectionsTab: React.FC<ProjectionsTabProps> = ({
  summaryCells,
}) => {
  const { t } = useTranslation();
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
          {t("projectionsTab.dataWarning", {
            months: distanceBetweenEntries.toFixed(0),
          })}
        </blockquote>
      )}
      <div className="w-full mt-8 flex gap-16 flex-wrap items-center justify-center">
        {isFinite(averageSavings) && (
          <div className="flex flex-col items-center justify-center">
            <h3>{t("projectionsTab.averageSavings")}</h3>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageSavings.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && (
          <div className="flex flex-col items-center justify-center">
            <h3>{t("projectionsTab.averageTotal")}</h3>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageTotal.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && averageProfits > 0 && (
          <div className="flex flex-col items-center justify-center">
            <h3>{t("projectionsTab.averageMonthlyProfits")}</h3>
            <p className="text-md">
              {getUserCurrencySymbol()} {averageProfits.toFixed(0)}
            </p>
          </div>
        )}
      </div>

      <h2 className="mt-16 mb-0 text-center">
        {t("projectionsTab.projection")}
      </h2>
      {distanceBetweenEntries < 6 ? (
        <blockquote className="border-l-4 border-gray-600 pl-4">
          {t("projectionsTab.insufficientData", {
            months: distanceBetweenEntries.toFixed(0),
          })}
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
                label: t("projectionsTab.totalNetWorth"),
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
