import React, { useCallback, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import AddButton from "../components/AddButton";

interface TableProps {
  title?: string;
  headers: string[];
  rows: TableRowCell[][];
  onAddEntry: (date: Date) => void;
}

const Table: React.FC<TableProps> = ({ title, headers, rows, onAddEntry }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHovering] = useState(true);

  const handleAddEntry = () => {
    if (onAddEntry) {
      onAddEntry(selectedDate);
      setShowDatePicker(false);
    }
  };

  return (
    <div
    //   onMouseEnter={() => setIsHovering(true)}
    //   onMouseLeave={() => {
    //     setIsHovering(false);
    //     setShowDatePicker(false);
    //   }}
    >
      {title && (
        <h2 className="text-lg text-gray-600 font-semibold mb-2 mt-4">
          {title}
        </h2>
      )}
      <div className="overflow-x-auto mt-4 relative shadow-xl rounded-lg border border-gray-200">
        <table className="w-full">
          <TableHeader headers={headers} />
          <tbody>
            {rows.map((row, index) => (
              <TableRow key={index} cells={row} />
            ))}
            {isHovering && (
              <tr className="bg-gray-100 border-t border-gray-300">
                <td colSpan={headers.length}>
                  <div className="ml-4 mt-2 mb-2">
                    {!showDatePicker && (
                      <AddButton
                        title="Add entry"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      />
                    )}
                    {showDatePicker && (
                      <div className="mt-4 mb-4 flex">
                        <div className="flex flex-col items-center">
                          <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                              if (date) {
                                setSelectedDate(date);
                              }
                            }}
                            inline
                          />
                          <div className="mt-4 flex justify-center">
                            <button
                              className="bg-gray-300 text-gray-600 px-4 py-2 rounded"
                              onClick={() => setShowDatePicker(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
                              onClick={() => {
                                setShowDatePicker(false);
                                handleAddEntry();
                              }}
                            >
                              Add Entry
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    <tr className="border-t border-gray-300">
      {cells.map((value, index) => (
        <td
          key={index}
          className={`px-4 py-2 text-gray-600 ${
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
