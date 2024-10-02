import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Expenses, ExpenseType } from "../../../../shared/types";
import { useCreateBulkExpenses, useUploadPDF } from "../apis/expenses";
import Loading from "@/app/components/Loading";
import { TransactionsList } from "./TransactionList";
import { DateTime } from "luxon";
import { TransactionAction } from "./EditTransactionCell";

export const ExpensesImport: React.FC<{ close: () => void }> = ({ close }) => {
  const { data, execute, loading: isLoading } = useUploadPDF();
  const [diff, setDiff] = useState<
    Record<string, Expenses & { discarded?: boolean }>
  >({});

  const {
    income,
    expenses,
    discarded,
    incomeSum,
    expensesSum,
    discardedSum,
    all,
  } = useMemo(() => {
    const all = data?.transactions
      .filter((tx) => DateTime.fromFormat(tx.date, "yyyy-MM-dd").isValid)
      .map((tx) => {
        const diffExpense = diff[tx.id];

        if (diffExpense) {
          return diffExpense;
        }

        const expense: Expenses & { discarded?: boolean } = {
          ...tx,
          user_id: "self",
          type: (tx.type === "e" ? "expense" : "income") as ExpenseType,
          discarded: tx.type === "m",
          created_at: new Date(),
          updated_at: new Date(),
        };

        return expense;
      });
    const income = all?.filter((tx) => tx.type === "income" && !tx.discarded);
    const expenses = all?.filter(
      (tx) => tx.type === "expense" && !tx.discarded
    );
    const discarded = all?.filter((tx) => tx.discarded);
    const incomeSum = income?.reduce((acc, tx) => acc + tx.amount, 0) ?? 0;
    const expensesSum = expenses?.reduce((acc, tx) => acc + tx.amount, 0) ?? 0;
    const discardedSum =
      discarded?.reduce((acc, tx) => acc + tx.amount, 0) ?? 0;

    return {
      income,
      expenses,
      discarded,
      incomeSum,
      expensesSum,
      discardedSum,
      all,
    };
  }, [data, diff]);

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

  const { execute: createBulkExpenses, loading: isCreatingBulkExpenses } =
    useCreateBulkExpenses();

  const importTransactions = async () => {
    if (!all || all.length === 0) {
      toast.error("No transactions to import");
      return;
    }

    const expesnesToImport = all.filter((tx) => tx.discarded !== true);
    try {
      await createBulkExpenses(expesnesToImport);
      close();
    } catch (error) {
      console.error("Error creating expenses: ", error);
      toast.error("Error creating expenses");
    }
  };

  const handleAction = (action: TransactionAction, tx: Expenses) => {
    if (action === "edit") {
      setDiff((prev) => ({
        ...prev,
        [tx.id]: tx,
      }));
    } else if (action === "move_to_income") {
      setDiff((prev) => ({
        ...prev,
        [tx.id]: {
          ...tx,
          type: "income" as ExpenseType,
        },
      }));
    } else if (action === "move_to_expense") {
      setDiff((prev) => ({
        ...prev,
        [tx.id]: {
          ...tx,
          type: "expense" as ExpenseType,
        },
      }));
    } else if (action === "include") {
      setDiff((prev) => ({
        ...prev,
        [tx.id]: {
          ...tx,
          discarded: false,
        },
      }));
    } else if (action === "exclude") {
      setDiff((prev) => ({
        ...prev,
        [tx.id]: {
          ...tx,
          discarded: true,
        },
      }));
    }
  };

  return (
    <div>
      {!data && !isLoading && (
        <div>
          <h3>Import transactions from your bank statement</h3>

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
        </div>
      )}
      {isLoading && <Loading />}
      {data && data.transactions.length === 0 && (
        <div>No transactions found</div>
      )}
      {data && data.transactions.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold max-w-prose">
            Here there are all the transactions we found, you can edit them,
            exclude or include some and then import
            {discarded && discarded.length > 0 && (
              <div>
                We excluded {discarded.length} transactions as they might be
                internal movements, you can still include them as expenses or
                income if we were wrong
              </div>
            )}
          </p>
          <TransactionsList
            title="Income"
            txs={income}
            sum={incomeSum}
            categories={undefined}
            multiplier={1}
            actions={
              new Set<TransactionAction>(["edit", "move_to_expense", "exclude"])
            }
            onAction={handleAction}
          />
          <TransactionsList
            title="Expenses"
            txs={expenses}
            sum={expensesSum}
            categories={undefined}
            multiplier={-1}
            actions={
              new Set<TransactionAction>(["edit", "move_to_income", "exclude"])
            }
            onAction={handleAction}
          />
          <TransactionsList
            title="Excluded"
            txs={discarded}
            sum={discardedSum}
            categories={undefined}
            multiplier={1}
            actions={new Set<TransactionAction>(["include"])}
            onAction={handleAction}
          />
          <button
            onClick={importTransactions}
            disabled={isCreatingBulkExpenses}
            className="bg-blue-500 text-white px-4 py-2 pixel-corners-small"
          >
            Import transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpensesImport;
