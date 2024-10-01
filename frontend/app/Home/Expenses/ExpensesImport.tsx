import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { CategoryMap } from "../../../../shared/types";
import { useUploadPDF } from "../apis/expenses";

export const ExpensesImport: React.FC = () => {
  const { data, execute, loading: isLoading } = useUploadPDF();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles.at(0);
      if (!file) {
        toast.error("Invalid file, select a PDF file");
        return;
      }

      try {
        await execute(file);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        toast.error("Error uploading PDF file");
      }
    },
    [execute]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div>
      {!data && !isLoading && (
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #cccccc",
            borderRadius: "10px",
            padding: "100px",
            textAlign: "center",
          }}
        >
          <input {...getInputProps()} />
          <p>Drag & drop a PDF file here, or click to select one</p>
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {data?.transactions &&
        data.transactions.map((transaction) => (
          <p
            className="text-sm mt-4 rounded-md p-2 bg-gray-200 border border-gray-300"
            key={transaction.id}
          >
            {transaction.date} | {transaction.description} |{" "}
            {transaction.amount} {transaction.currency} |{" "}
            {transaction.type === "e"
              ? "Expense"
              : transaction.type === "i"
              ? "Income"
              : "Movement"}
            |{" "}
            {transaction.category
              ? CategoryMap[transaction.category as keyof typeof CategoryMap]
              : "Unknown"}
          </p>
        ))}
    </div>
  );
};

export default ExpensesImport;
