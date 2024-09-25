import React, { useCallback, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import AddButton from "../components/AddButton";
import DeleteIcon from "../components/DeleteIcon";
import { FiAlertCircle } from "react-icons/fi";
import { createPortal } from "react-dom";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { getUserCurrencySymbol } from "../UserState";
import { DateTime } from "luxon";

export type TableHeaderContent = {
  title: string;
  tip?: {
    text: string;
    id: string;
    noIcon?: boolean;
  };
  onDelete?: () => void;
};

export const dateHeader = {
  title: "Date",
  tip: {
    text: "The date of the accounting entry, we suggest to do it monthly, for example at the end of each month, but you can do it weekly or as you like. When you are ready to add a new entry, click the Add entry button and choose the date.",
    id: "date-header-tip",
    noIcon: true,
  },
};

export const profitsHeader = {
  title: "Profits",
  tip: {
    text: "Profits or losses of investments based on the amount invested",
    id: "profits-header-tip",
    noIcon: true,
  },
};

export const percentageHeader = {
  title: "%",
  tip: {
    text: "The percentage of your investments profits against the amount invested",
    id: "percentage-header-tip",
    noIcon: true,
  },
};

export const differenceHeader = {
  title: "Difference",
  tip: {
    text: "The difference compared to the previous entry",
    id: "diff-header-tip",
    noIcon: true,
  },
};

interface TableProps {
  title?: string;
  headers: TableHeaderContent[];
  rows: TableRowCell[][];
  onAddEntry?: (date: string) => void;
  onDelete?: () => void;
  alwaysShowDelete?: boolean;
}

const Table: React.FC<TableProps> = ({
  title,
  headers,
  rows,
  onAddEntry,
  onDelete,
  alwaysShowDelete,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  const handleAddEntry = () => {
    if (onAddEntry) {
      onAddEntry(DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd"));
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
          <h3 className="mt-8 mb-0">{title}</h3>
          {onDelete && (isHoveringHeader || alwaysShowDelete) && (
            <DeleteIcon className="mt-7 ml-2" onClick={onDelete} />
          )}
        </div>
      )}
      <div className="overflow-x-auto mt-4 relative shadow-xl rounded-lg border border-gray-200">
        <table className="w-full">
          <TableHeader
            headers={headers.map((h) => {
              if (typeof h === "string") {
                return h;
              }
              return {
                title: h.title,
                tip: h.tip
                  ? {
                      ...h.tip,
                      noIcon:
                        h.tip.noIcon === undefined
                          ? !!localStorage.getItem(h.tip.id)
                          : h.tip.noIcon,
                    }
                  : undefined,
                onDelete: h.onDelete,
              };
            })}
          />
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
                        title={"Add entry"}
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
                              className="bg-gray-300 px-4 py-2 pixel-corners-small"
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
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const shouldShowTipIcon = (
    tip: { id: string; noIcon?: boolean } | undefined
  ) => {
    if (!tip || tip.noIcon) {
      return false;
    }
    return true;
  };

  const handleTipMouseEnter = (
    event: React.MouseEvent,
    tip: { text: string; id: string } | undefined
  ) => {
    if (tooltipContent || !tip) {
      handleTipMouseLeave();
      return;
    }
    localStorage.setItem(tip.id, "shown");
    setTooltipContent(tip.text);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + 10,
      left: rect.left + rect.width,
    });
  };

  const handleTipMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <>
      <thead
        onMouseEnter={() => setIsHoveringHeader(!isHoveringHeader)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <tr className="bg-gray-200">
          {headers.map((header, index) => (
            <th
              key={index}
              className="first:px-4 px-2 py-2 text-left font-semibold text-sm border-r border-gray-300"
            >
              <div
                className="flex items-center"
                onMouseEnter={(e) => handleTipMouseEnter(e, header.tip)}
                onMouseLeave={handleTipMouseLeave}
              >
                {header.title}
                {header.tip && shouldShowTipIcon(header.tip) && (
                  <HiOutlineQuestionMarkCircle className="ml-2" />
                )}
                {header.onDelete && (
                  <DeleteIcon
                    className={`ml-2 ${
                      isHoveringHeader ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={isHoveringHeader ? header.onDelete : undefined}
                  />
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      {tooltipContent &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 p-2 bg-gray-600 text-gray-50 text-sm rounded shadow-lg pointer-events-none max-w-xs break-words"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translate(-50%, 0)",
            }}
          >
            {tooltipContent}
          </div>,
          document.body
        )}
    </>
  );
};

export interface TableRowCell {
  color?: string;
  value: string | number | Date | undefined;
  warningText?: string;
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

  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  const formattedValue = (
    value: string | number | Date | undefined,
    currency: boolean = true
  ) => {
    if (!value) {
      return "";
    }
    if (typeof value === "number") {
      return `${currency ? getUserCurrencySymbol() + " " : ""}${value.toFixed(
        0
      )}`;
    }

    if (value instanceof Date) {
      return value.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "2-digit",
      });
    }

    return value;
  };

  const [isHovering, setIsHovering] = useState(false);

  const handleWarningMouseEnter = (
    event: React.MouseEvent,
    warningText: string
  ) => {
    setTooltipContent(warningText);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
  };

  const handleWarningMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <>
      <tr className="border-t border-gray-300 last:border-gray-400">
        {cells.map((value, index) => (
          <td
            key={index}
            className={`border-r border-gray-300 ${
              !value.onValueChange ? value.color ?? `bg-gray-100` : ""
            }${
              value.value === undefined && editingValues[index] === undefined
                ? "border-b-2 border-b-red-100 bg-red-100 animate-pulse"
                : ""
            }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-center w-full">
              {!value.onValueChange ? (
                <span className="px-4 py-2 whitespace-nowrap">
                  {formattedValue(value.value)}
                </span>
              ) : (
                <div className="px-2 flex items-center flex-grow">
                  {(value.value !== undefined ||
                    editingValues[index] !== undefined) && (
                    <span className="mr-1 flex-shrink-0">
                      {getUserCurrencySymbol()}
                    </span>
                  )}
                  <input
                    type="text"
                    value={formattedValue(
                      editingValues[index] !== undefined
                        ? editingValues[index]
                        : value.value ?? "",
                      false
                    )}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onBlur={(e) => handleInputBlur(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    className="py-2 w-full min-w-16 bg-transparent border-none focus:outline-none rounded"
                  />
                </div>
              )}
              {value.warningText && (
                <div
                  className="relative"
                  onMouseEnter={(e) => {
                    tooltipContent
                      ? handleWarningMouseLeave()
                      : handleWarningMouseEnter(e, value.warningText!);
                  }}
                  onMouseLeave={handleWarningMouseLeave}
                >
                  <FiAlertCircle className="text-red-500" />
                </div>
              )}
              <div className="w-6 mr-2">
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
      {tooltipContent &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 p-2 bg-gray-600 text-gray-50 text-sm rounded shadow-lg pointer-events-none max-w-xs break-words"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltipContent}
          </div>,
          document.body
        )}
    </>
  );
};

export default Table;
