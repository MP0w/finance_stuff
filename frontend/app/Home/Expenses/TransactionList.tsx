import { CategoryMap, Expenses } from "../../../../shared/types";
import { PieChart } from "@mui/x-charts";
import { stringForPercentage } from "../Investments/InvestmentTable";
import { TransactionCell } from "./TransactionCell";
import { TransactionAction } from "./EditTransactionCell";

export const TransactionsList: React.FC<{
  title: string;
  txs: (Expenses & { discarded?: boolean })[] | undefined;
  sum: number;
  categories: Record<string, number> | undefined;
  actions: Set<TransactionAction>;
  multiplier: number;
  onAction: (action: TransactionAction, tx: Expenses) => void;
}> = ({ title, txs, sum, categories, actions, multiplier, onAction }) => {
  return txs && txs.length > 0 ? (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2>{title}</h2>
        <span
          className={`font-semibold ${
            multiplier < 0 ? "bg-red-200" : "bg-green-200"
          } rounded-md border border-gray-400 px-2 py-1`}
        >
          {(sum * multiplier).toFixed(2)}
        </span>
      </div>
      {categories && (
        <div className="mb-8 flex justify-center">
          <PieChart
            series={[
              {
                valueFormatter: (value) => {
                  return `${value.value.toFixed(0)} (${stringForPercentage(
                    value.value / sum
                  )})`;
                },
                data: Object.entries(categories)
                  .map(([category, value]) => ({
                    label:
                      CategoryMap[category as keyof typeof CategoryMap] ??
                      "Unknown",
                    value,
                  }))
                  .sort((a, b) => b.value - a.value),
                highlightScope: { fade: "global", highlight: "item" },
                innerRadius: 10,
                outerRadius: 100,
                paddingAngle: 3,
                cornerRadius: 5,
              },
            ]}
            width={200}
            height={200}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        </div>
      )}
      <ul>
        {txs.map((tx, index) => (
          <TransactionCell
            key={tx.id}
            tx={tx}
            actions={actions}
            position={
              index === 0
                ? "first"
                : index === txs.length - 1
                ? "last"
                : "middle"
            }
            multiplier={multiplier}
            onAction={onAction}
          />
        ))}
      </ul>
    </div>
  ) : (
    <></>
  );
};
