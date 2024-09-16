import React, { useCallback, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import AddButton from "../components/AddButton";
import DeleteIcon from "../components/DeleteIcon";

export type TableHeaderContent =
  | string
  | { title: string; onDelete: () => void };

interface TableProps {
  title?: string;
  headers: TableHeaderContent[];
  rows: TableRowCell[][];
  onAddEntry?: (date: Date) => void;
  onDelete?: () => void;
}

const Table: React.FC<TableProps> = ({
  title,
  headers,
  rows,
  onAddEntry,
  onDelete,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  const handleAddEntry = () => {
    if (onAddEntry) {
      onAddEntry(selectedDate);
      setShowDatePicker(false);
    }
  };

  return (
    <div>
      {title && (
        <div
          className="flex items-center"
          onMouseEnter={() => setIsHoveringHeader(!isHoveringHeader)}
          onMouseLeave={() => setIsHoveringHeader(false)}
        >
          <h2 className="text-lg text-gray-600 font-semibold mt-4">{title}</h2>
          {onDelete && isHoveringHeader && (
            <DeleteIcon className="mt-4 ml-2" onClick={onDelete} />
          )}
        </div>
      )}
      <div className="overflow-x-auto mt-4 relative shadow-xl rounded-lg border border-gray-200">
        <table className="w-full">
          <TableHeader headers={headers} />
          <tbody>
            {rows.map((row, index) => (
              <TableRow key={index} cells={row} />
            ))}
            {onAddEntry && (
              <tr className="bg-gray-100 border-t border-gray-300">
                <td colSpan={headers.length}>
                  <div className="ml-4 mt-2 mb-2">
                    {!showDatePicker && (
                      <AddButton
                        title={
                          rows.length === 0
                            ? "Add your first entry. You can also add some for past months and later on new ones each month/week/etc..."
                            : "Add entry"
                        }
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
                            dayClassName={() => "pixel-corners-small"}
                          />
                          <div className="mt-4 flex justify-center">
                            <button
                              className="bg-gray-300 text-gray-600 px-4 py-2 pixel-corners-small"
                              onClick={() => setShowDatePicker(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-blue-500 text-white px-4 py-2 pixel-corners-small ml-4"
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
  headers: TableHeaderContent[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({ headers }) => {
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const getHeaderTitle = (header: TableHeaderContent) => {
    if (typeof header === "string") {
      return header;
    }
    return header.title;
  };

  const getOnDelete = (header: TableHeaderContent) => {
    if (typeof header === "string") {
      return undefined;
    }
    return header.onDelete;
  };

  return (
    <thead
      onMouseEnter={() => setIsHoveringHeader(!isHoveringHeader)}
      onMouseLeave={() => setIsHoveringHeader(false)}
    >
      <tr className="bg-gray-200">
        {headers.map((header, index) => (
          <th key={index} className="px-4 py-2 text-left text-gray-700">
            <div className="flex items-center">
              {getHeaderTitle(header)}
              {isHoveringHeader && getOnDelete(header) && (
                <DeleteIcon className="ml-2" onClick={getOnDelete(header)} />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export interface TableRowCell {
  color?: string;
  value: string | number | undefined;
  onValueChange?: (value: number) => Promise<void>;
  onDelete?: () => void;
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
            newValues[index] = cells[index].value?.toString();
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

  const formattedValue = (value: string | number | undefined) => {
    if (!value) {
      return "";
    }
    if (typeof value === "number") {
      return `$ ${value}`;
    }
    return value;
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <tr className="border-t border-gray-300">
      {cells.map((value, index) => (
        <td
          key={index}
          className={`text-gray-600 ${
            !value.onValueChange ? value.color ?? `bg-gray-100` : ""
          }${
            value.value === undefined && editingValues[index] === undefined
              ? "border-b-2 border-b-red-100 bg-red-50 animate-pulse"
              : ""
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center w-full">
            {!value.onValueChange ? (
              <span className="px-4 py-2">{formattedValue(value.value)}</span>
            ) : (
              <div className="px-2 flex items-center flex-grow">
                {(value.value !== undefined ||
                  editingValues[index] !== undefined) && (
                  <span className="mr-1 flex-shrink-0">$</span>
                )}
                <input
                  type="text"
                  value={editingValues[index] ?? value.value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onBlur={(e) => handleInputBlur(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e)}
                  className="py-2 w-full bg-transparent border-none focus:outline-none rounded"
                />
              </div>
            )}
            <div className="w-6 flex-shrink-0">
              {value.onDelete && (
                <DeleteIcon
                  className={`ml-2 transition-opacity duration-200 ${
                    isHovering ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={value.onDelete}
                />
              )}
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
};

export default Table;
