import { DateTime } from "luxon";
import { CategoryMap, Expenses } from "../../../../shared/types";
import { TransactionDate } from "./TransactionCell";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

export type TransactionAction =
  | "include"
  | "exclude"
  | "edit"
  | "move_to_income"
  | "move_to_expense"
  | "delete";

export const EditTransactionCell = ({
  tx,
  position,
  multiplier,
  onEditTransaction,
  cancelEditing,
}: {
  tx: Expenses & { discarded?: boolean };
  position: "first" | "last" | "middle";
  multiplier: number;
  onEditTransaction: (tx: Expenses) => void;
  cancelEditing: () => void;
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState(tx);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState<string | undefined>(
    undefined
  );

  const finishEditing = () => {
    onEditTransaction(state);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setState({
        ...state,
        date: DateTime.fromJSDate(date).toFormat("yyyy-MM-dd"),
      });
    }
    setIsDatePickerOpen(false);
  };

  const saveAmount = () => {
    if (!editedAmount) {
      setEditedAmount(undefined);
      return;
    }
    const newAmount = parseFloat(editedAmount);
    setEditedAmount(undefined);
    if (!isNaN(newAmount)) {
      setState({ ...state, amount: Math.abs(newAmount) });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, description: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      category: e.target.value as keyof typeof CategoryMap,
    });
  };

  return (
    <div>
      <li
        key={state.id}
        className={`flex flex-col p-3 bg-white shadow ${
          position === "first" ? "rounded-t-md" : ""
        } ${position === "last" ? "rounded-b-md" : ""} ${
          state.discarded ? "bg-gray-100 opacity-50" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div onClick={() => setIsDatePickerOpen(true)}>
            <TransactionDate
              date={DateTime.fromFormat(state.date, "yyyy-MM-dd").toJSDate()}
            />
          </div>
          <div className="flex-grow mx-4 truncate">
            {isDescriptionEditing ? (
              <input
                value={state.description}
                onChange={handleDescriptionChange}
                onBlur={() => setIsDescriptionEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsDescriptionEditing(false);
                  }
                }}
                autoFocus
                className="w-full border-0 border-transparent rounded-md px-2 py-1"
              />
            ) : (
              <div
                className="truncate"
                onClick={() => setIsDescriptionEditing(true)}
              >
                {state.description || "No description"}
              </div>
            )}
            <div className="text-sm font-semibold text-gray-500">
              <select
                value={state.category ?? "Unknown"}
                onChange={handleCategoryChange}
                className="border border-transparent rounded-md py-1"
              >
                {Object.entries(CategoryMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="font-semibold">
            {editedAmount !== undefined ? (
              <input
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                onBlur={() => saveAmount()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveAmount();
                  }
                }}
                autoFocus
                className="w-20 text-right border-0 border-transparent px-2 py-1"
              />
            ) : (
              <span onClick={() => setEditedAmount(state.amount.toString())}>
                {(state.amount * multiplier).toFixed(2)}
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={cancelEditing}
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={finishEditing}
            className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600"
          >
            {t("common.done")}
          </button>
        </div>
      </li>
      {isDatePickerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <DatePicker
              selected={DateTime.fromFormat(
                state.date,
                "yyyy-MM-dd"
              ).toJSDate()}
              onChange={handleDateChange}
              onClickOutside={() => setIsDatePickerOpen(false)}
              inline
            />
          </div>
        </div>
      )}
    </div>
  );
};
