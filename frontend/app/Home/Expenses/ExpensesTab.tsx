import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCreateExpense, useGetExpenses } from "../apis/expenses";
import toast from "react-hot-toast";
import Loading from "@/app/components/Loading";
import { CategoryMap, Expenses } from "../../../../shared/types";
import { PieChart } from "@mui/x-charts";
import { stringForPercentage } from "../Investments/InvestmentTable";
import AddButton from "@/app/components/AddButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";
import { useUserState } from "@/app/UserState";
import { useTranslation } from "react-i18next";

const ExpensesTab: React.FC = () => {
  const { user } = useUserState();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { data, execute: getExpenses, loading } = useGetExpenses();
  const { execute: createExpense, loading: createExpenseLoading } =
    useCreateExpense();

  const months = useMemo(() => {
    const today = new Date();
    const months = [];
    for (let i = 0; i <= today.getMonth(); i++) {
      months.push(
        new Date(today.getFullYear(), i, 1).toLocaleString(navigator.language, {
          month: "short",
        })
      );
    }
    return months;
  }, []);

  const { income, incomeSum, expenses, expensesSum, expenseSumByCategory } =
    useMemo(() => {
      const income = data?.filter((expense) => expense.type === "income");
      const expenses = data?.filter((expense) => expense.type === "expense");
      const incomeSum =
        income?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;
      const expensesSum =
        expenses?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;

      const expenseSumByCategory = expenses?.reduce((sums, expense) => {
        const category = expense.category ?? "Unknown";
        if (!sums[category]) {
          sums[category] = 0;
        }
        sums[category] += expense.amount;
        return sums;
      }, {} as Record<string, number>);

      return { income, expenses, incomeSum, expensesSum, expenseSumByCategory };
    }, [data]);

  const refreshExpenses = useCallback(() => {
    const fetchExpenses = async () => {
      const currentYear = new Date().getFullYear();
      try {
        await getExpenses(currentYear, selectedMonth + 1);
      } catch (error) {
        toast.error(t("expensesTab.errorFetchingExpenses"));
        console.error("Error fetching expenses", error);
      }
    };

    fetchExpenses();
  }, [getExpenses, selectedMonth, t]);

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  const transactionsList = (
    title: string,
    txs: Expenses[] | undefined,
    sum: number,
    categories: Record<string, number> | undefined,
    multiplier: number = 1
  ) => {
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
            <li
              key={tx.id}
              className={`flex justify-between items-center p-3 bg-white shadow ${
                index === 0 ? "rounded-t-md" : ""
              } ${index === txs.length - 1 ? "rounded-b-md" : ""}`}
            >
              <span className="text-sm text-gray-600">
                {new Date(tx.date).toLocaleDateString()}
              </span>
              <div className="flex-grow mx-4">
                <div>{tx.description}</div>
                <div className="text-sm font-semibold text-gray-500">
                  {tx.category
                    ? CategoryMap[tx.category as keyof typeof CategoryMap]
                    : "Unknown"}
                </div>
              </div>
              <span className="font-semibold">
                {(tx.amount * multiplier).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <></>
    );
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: "expense",
    date: new Date(),
    category: "",
    description: "",
    amount: 0,
  });

  const handleAddEntry = async () => {
    try {
      if (
        !isFinite(newEntry.amount) ||
        newEntry.amount === 0 ||
        !newEntry.category.length ||
        !newEntry.description.length
      ) {
        toast.error(t("expensesTab.fillAllFields"));
        return;
      }

      await createExpense({
        date: DateTime.fromJSDate(newEntry.date).toFormat("yyyy-MM-dd"),
        type: newEntry.type === "income" ? "income" : "expense",
        category: newEntry.category,
        description: newEntry.description,
        amount: newEntry.amount,
        currency: user?.currency ?? "USD",
      });

      toast.success(t("expensesTab.transactionAddedSuccess"));
      setShowAddModal(false);
      refreshExpenses();
    } catch (error) {
      toast.error(t("expensesTab.errorAddingTransaction"));
      console.error("Error adding Transaction:", error);
    }
  };

  return (
    <div>
      {!showAddModal && (
        <div>
          <div className="mb-8">
            <div className="flex border-b border-gray-200 flex-wrap">
              {months.map((month, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                    selectedMonth === index
                      ? "border-b border-gray-500 font-semibold"
                      : "hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedMonth(index)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 max-w-3xl mx-auto mb-8">
            <AddButton
              title={t("expensesTab.automagicImport")}
              onClick={() => {
                toast.success(t("common.comingSoon"));
              }}
            />
            <AddButton
              title={t("expensesTab.addTransactionManually")}
              onClick={() => setShowAddModal(true)}
            />
          </div>
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {loading && <Loading />}
            {!data ||
              (data.length === 0 && (
                <div>
                  {t("expensesTab.noExpensesIncome")}
                  <br />
                  {t("expensesTab.addNewOrImport")}
                </div>
              ))}
            {transactionsList(
              t("expensesTab.income"),
              income,
              incomeSum,
              undefined
            )}
            {transactionsList(
              t("expensesTab.expenses"),
              expenses,
              expensesSum,
              expenseSumByCategory,
              -1
            )}
          </div>
        </div>
      )}
      {createExpenseLoading && <Loading />}
      {showAddModal && !createExpenseLoading && (
        <div className="space-y-4">
          <h2>{t("expensesTab.addTransaction")}</h2>
          <div>
            <label className="block mb-1">{t("expensesTab.type")}</label>
            <select
              value={newEntry.type}
              onChange={(e) =>
                setNewEntry({ ...newEntry, type: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="expense">{t("expensesTab.expense")}</option>
              <option value="income">{t("expensesTab.income")}</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">{t("expensesTab.date")}</label>
            <DatePicker
              selected={newEntry.date}
              onChange={(date: Date | null) =>
                setNewEntry({ ...newEntry, date: date ?? new Date() })
              }
              className="w-full p-2 border rounded"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block mb-1">{t("expensesTab.category")}</label>
            <select
              value={newEntry.category}
              onChange={(e) =>
                setNewEntry({ ...newEntry, category: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">{t("expensesTab.selectCategory")}</option>
              {Object.entries(CategoryMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">{t("expensesTab.description")}</label>
            <input
              type="text"
              value={newEntry.description}
              onChange={(e) =>
                setNewEntry({ ...newEntry, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder={t("expensesTab.descriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block mb-1">{t("expensesTab.amount")}</label>
            <input
              type="number"
              value={newEntry.amount}
              onChange={(e) =>
                setNewEntry({
                  ...newEntry,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full p-2 border rounded"
              placeholder={t("expensesTab.amountPlaceholder")}
            />
          </div>
          <button
            onClick={handleAddEntry}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {t("expensesTab.addTransaction")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;