import React from "react";

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

interface TableRowProps {
  item: { [key: string]: string | number };
}

export const TableRow: React.FC<TableRowProps> = ({ item }) => (
  <tr className="border-t border-gray-200">
    {Object.values(item).map((value, index) => (
      <td key={index} className="px-4 py-2 text-gray-800">
        {value}
      </td>
    ))}
  </tr>
);
