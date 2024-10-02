import { HiOutlineDotsVertical } from "react-icons/hi";
import { CategoryMap, Expenses } from "../../../../shared/types";
import { EditTransactionCell, TransactionAction } from "./EditTransactionCell";
import { DateTime } from "luxon";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export const TransactionDate = ({ date }: { date: Date }) => {
  return (
    <div className="text-sm text-gray-600 border border-gray-200 px-2 rounded-md flex flex-col items-center">
      {date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: undefined,
        year: undefined,
      })}
      <div className="text-xs">
        {date.toLocaleDateString(undefined, {
          day: undefined,
          month: "short",
          year: undefined,
        })}
      </div>
    </div>
  );
};

export const TransactionCell = ({
  tx,
  position,
  actions,
  multiplier,
  onAction,
}: {
  tx: Expenses & { discarded?: boolean };
  position: "first" | "last" | "middle";
  actions: Set<TransactionAction>;
  multiplier: number;
  onAction: (action: TransactionAction, tx: Expenses) => void;
}) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: TransactionAction) => {
    setShowMenu(false);

    if (action === "edit") {
      setEditMode(!editMode);
      return;
    }

    onAction(action, tx);
  };

  return (
    <div>
      {editMode && (
        <EditTransactionCell
          tx={tx}
          position={position}
          multiplier={multiplier}
          onEditTransaction={(state) => {
            onAction("edit", state);
            setEditMode(false);
          }}
          cancelEditing={() => setEditMode(false)}
        />
      )}
      {!editMode && (
        <li
          key={tx.id}
          className={`flex justify-between items-center p-3 bg-white shadow ${
            position === "first" ? "rounded-t-md" : ""
          } ${position === "last" ? "rounded-b-md" : ""} ${
            tx.discarded && !showMenu ? "bg-gray-100 opacity-50" : ""
          }`}
        >
          <TransactionDate
            date={DateTime.fromFormat(tx.date, "yyyy-MM-dd").toJSDate()}
          />
          <div className="flex-grow mx-4 truncate">
            <div className="truncate">{tx.description}</div>
            <div className="text-sm font-semibold text-gray-500">
              {tx.category
                ? CategoryMap[tx.category as keyof typeof CategoryMap]
                : "Unknown"}
            </div>
          </div>
          <span className="font-semibold">
            {(tx.amount * multiplier).toFixed(2)}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              className="ml-2 shrink-0 flex items-center"
              onClick={() => setShowMenu(!showMenu)}
            >
              <HiOutlineDotsVertical />
            </button>
            {showMenu && (
              <div className="absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  {Array.from(actions).map((action) => (
                    <button
                      key={action}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={() => handleActionClick(action)}
                    >
                      {t(`transactionAction.${action}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </li>
      )}
    </div>
  );
};
