import { SummaryCell } from "./SummaryTab";

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

  return (
    <div>
      {summaryCells.length < 6 && (
        <blockquote className="text-gray-800 border-l-4 border-gray-600 pl-4">
          Statistics and projections will be more accurate the more data you
          will have. You can also enter data of previous months.
        </blockquote>
      )}
      <div className="w-full mt-8 flex gap-16 flex-wrap items-center justify-center">
        {isFinite(averageSavings) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Savings</h2>
            <p className="text-md text-gray-500">
              $ {averageSavings.toFixed(0)}
            </p>
          </div>
        )}
        {isFinite(averageProfits) && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Total</h2>
            <p className="text-md text-gray-500">$ {averageTotal.toFixed(0)}</p>
          </div>
        )}
        {isFinite(averageProfits) && averageProfits > 0 && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl text-gray-800">Average Monthly Profits</h2>
            <p className="text-md text-gray-500">
              $ {averageProfits.toFixed(0)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
