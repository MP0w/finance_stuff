import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useCreateExpense,
  useDeleteExpense,
  useGetExpenses,
  useUpdateExpense,
} from "../apis/expenses";
import toast from "react-hot-toast";
import Loading from "@/app/components/Loading";
import { CategoryMap, Expenses } from "../../../../shared/types";
import AddButton from "@/app/components/AddButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";
import { useUserState } from "@/app/UserState";
import { useTranslation } from "react-i18next";
import { TransactionsList } from "./TransactionList";
import { TransactionAction } from "./EditTransactionCell";

const ExpensesTab: React.FC<{ openImport: () => void }> = ({ openImport }) => {
  const { user } = useUserState();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { data, execute: getExpenses, loading } = useGetExpenses();
  const { execute: createExpense, loading: createExpenseLoading } =
    useCreateExpense();
  const { execute: deleteExpense } = useDeleteExpense();
  const { execute: updateExpense } = useUpdateExpense();

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

  const actions = useMemo(
    () =>
      new Set<TransactionAction>([
        "edit",
        "move_to_income",
        "move_to_expense",
        "delete",
      ]),
    []
  );

  const handleAction = async (action: TransactionAction, tx: Expenses) => {
    try {
      if (action === "edit") {
        await updateExpense(tx.id, {
          ...tx,
        });
      } else if (action === "move_to_income") {
        await updateExpense(tx.id, {
          ...tx,
          type: "income",
        });
      } else if (action === "move_to_expense") {
        await updateExpense(tx.id, {
          ...tx,
          type: "expense",
        });
      } else if (action === "delete") {
        await deleteExpense(tx.id);
      }
      refreshExpenses();
    } catch (error) {
      toast.error(t("expensesTab.errorPerformingAction"));
      console.error("Error performing action:", error);
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
              onClick={openImport}
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
            <TransactionsList
              title={t("expensesTab.income")}
              txs={income}
              sum={incomeSum}
              categories={undefined}
              multiplier={1}
              actions={actions}
              onAction={handleAction}
            />
            <TransactionsList
              title={t("expensesTab.expenses")}
              txs={expenses}
              sum={expensesSum}
              categories={expenseSumByCategory}
              multiplier={-1}
              actions={actions}
              onAction={handleAction}
            />
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
