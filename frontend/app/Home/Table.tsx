import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

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
  value: string | number;
  onValueChange?: (value: number) => Promise<void>;
}

interface TableRowProps {
  cells: TableRowCell[];
}

export const TableRow: React.FC<TableRowProps> = ({ cells }) => {
  const [editingValues, setEditingValues] = useState<string[]>(
    cells.map((cell) => cell.value.toString())
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

  return (
    <tr className="border-t border-gray-200">
      {cells.map((value, index) => (
        <td
          key={index}
          className={`px-4 py-2 text-gray-800 ${
            !value.onValueChange ? "bg-gray-100" : ""
          }`}
        >
          {!value.onValueChange ? (
            value.value
          ) : (
            <input
              type="text"
              value={editingValues[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onBlur={(e) => handleInputBlur(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            />
          )}
        </td>
      ))}
    </tr>
  );
};
