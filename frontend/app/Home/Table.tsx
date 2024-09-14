import React, { useCallback, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

interface TableProps {
  title?: string;
  headers: string[];
  rows: TableRowCell[][];
  onAddEntry: (date: Date) => void;
}

const Table: React.FC<TableProps> = ({ title, headers, rows, onAddEntry }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAddEntry = () => {
    if (onAddEntry) {
      onAddEntry(selectedDate);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto mt-4 relative">
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}

      <table className="w-full shadow-md">
        <TableHeader headers={headers} />
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={index} cells={row} />
          ))}
        </tbody>
      </table>

      <div>
        <div className="flex items-center mt-2 relative group">
          <button
            className="bg-gray-500 text-white rounded-lg w-6 h-6 flex items-center justify-center"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <span className="text-xl">+</span>
          </button>
          <span
            className={`text-gray-500 px-2 py-1 rounded text-sl ml-0 absolute left-8 transition-opacity duration-200 ${
              showDatePicker
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            Add accounting entry
          </span>
        </div>
        {showDatePicker && (
          <div className="mt-4">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              inline
              utcOffset={0}
            />
            <div className="mt-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowDatePicker(false);
                  handleAddEntry();
                }}
              >
                Add Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TableHeaderProps {
  headers: string[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({ headers }) => (
  <thead>
    <tr className="bg-gray-200">
      {headers.map((header, index) => (
        <th key={index} className="px-4 py-2 text-left text-gray-700">
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

export interface TableRowCell {
  color?: string;
  value: string | number;
  onValueChange?: (value: number) => Promise<void>;
}

interface TableRowProps {
  cells: TableRowCell[];
}

export const TableRow: React.FC<TableRowProps> = ({ cells }) => {
  const [editingValues, setEditingValues] = useState<(string | undefined)[]>(
    cells.map(() => undefined)
  );

  const handleInputChange = useCallback((index: number, value: string) => {
    setEditingValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
  }, []);

  const handleInputBlur = useCallback(
    async (index: number, value: string) => {
      const onValueChange = cells[index].onValueChange;
      if (onValueChange) {
        try {
          await onValueChange(parseFloat(value));

          setEditingValues((prev) => {
            const newValues = [...prev];
            newValues[index] = undefined;
            return newValues;
          });
        } catch (error) {
          console.error("Error updating value:", error);
          // Revert the value to the original
          setEditingValues((prev) => {
            const newValues = [...prev];
            newValues[index] = cells[index].value.toString();
            return newValues;
          });
          // Show error toast
          toast.error("Failed to update value. Please try again.", {
            position: "bottom-right",
          });
        }
      }
    },
    [cells, setEditingValues]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  const formattedValue = (value: string | number) => {
    if (typeof value === "number") {
      return `$ ${value}`;
    }
    return value;
  };

  return (
    <tr className="border-t border-gray-200">
      {cells.map((value, index) => (
        <td
          key={index}
          className={`px-4 py-2 text-gray-800 ${
            !value.onValueChange ? value.color ?? `bg-gray-100` : ""
          }`}
        >
          {!value.onValueChange ? (
            <span>{formattedValue(value.value)}</span>
          ) : (
            <span className="flex items-center">
              <span className="mr-1">$</span>
              <input
                type="text"
                value={editingValues[index] ?? value.value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onBlur={(e) => handleInputBlur(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              />
            </span>
          )}
        </td>
      ))}
    </tr>
  );
};

export default Table;
