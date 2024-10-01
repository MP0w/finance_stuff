import React, { useState, useEffect } from "react";
import { useGetExpenses } from "../apis/expenses";
import toast from "react-hot-toast";
import Loading from "@/app/components/Loading";

const ExpensesTab: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { data: expenses, execute: getExpenses, loading } = useGetExpenses();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchExpenses = async () => {
      const currentYear = new Date().getFullYear();
      try {
        await getExpenses(currentYear, selectedMonth + 1);
      } catch (error) {
        toast.error("Error fetching expenses");
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [selectedMonth, getExpenses]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Expenses for {new Date().getFullYear()}
      </h2>
      {loading && <Loading />}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          {months.map((month, index) => (
            <button
              key={index}
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                selectedMonth === index
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedMonth(index)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-3">
          {months[selectedMonth]} Expenses
        </h3>
        {expenses && expenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex justify-between items-center p-3 bg-white shadow rounded"
              >
                <span className="text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </span>
                <span className="flex-grow mx-4">{expense.description}</span>
                <span className="font-semibold">
                  ${expense.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses found for this month.</p>
        )}
      </div>
    </div>
  );
};

export default ExpensesTab;
