import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  useConfirmImport,
  useCreateImport,
  useUpdateImport,
} from "../apis/import";
import {
  AccountingEntries,
  Accounts,
  ImportProposal,
} from "../../../../shared/types";
import Table from "../Table";
import { importTableData } from "./importData";
import Loading from "@/app/components/Loading";
import { logAnalyticsEvent } from "@/app/firebase";

export type ImportTabProps = {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntries[];
  refresh: () => void;
  onComplete?: () => void;
};

export const ImportTab: React.FC<ImportTabProps> = ({
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  refresh,
  onComplete,
}) => {
  const [csv, setCsv] = useState<string | undefined>(undefined);
  const [latestProposal, setLatestProposal] = useState<
    ImportProposal | undefined
  >(undefined);
  const [inputMessage, setInputMessage] = useState<string>("");

  const { loading: createLoading, execute: createImport } = useCreateImport();
  const { loading: updateLoading, execute: updateImport } = useUpdateImport();
  const { loading: confirmLoading, execute: confirmImport } =
    useConfirmImport();
  const [deletedTables, setDeletedTables] = useState<Set<string>>(new Set());

  const isLoading = createLoading || updateLoading || confirmLoading;

  const tables = useMemo(() => {
    if (!latestProposal) {
      return undefined;
    }
    return importTableData(
      { fiatAccounts, investmentAccounts, accountingEntries, refresh },
      latestProposal,
      (id) => {
        setDeletedTables((prev) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      }
    ).filter((table) => !deletedTables.has(table.id));
  }, [
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    latestProposal,
    refresh,
    setDeletedTables,
    deletedTables,
  ]);

  const emptyProposal =
    latestProposal &&
    ((latestProposal.newAccountingEntries.length === 0 &&
      latestProposal.newAccounts.length === 0 &&
      latestProposal.newInvestments.length === 0 &&
      latestProposal.newEntries.length === 0) ||
      (tables && tables.length === 0));

  useEffect(() => {
    if (!csv) {
      return;
    }

    if (csv.length > 5000) {
      toast.error(
        "CSV too large, split your tables in multiple csv and import one at a time"
      );
      console.log("CSV too large", csv.length);
      return;
    }

    async function fetchData(csv: string) {
      try {
        const proposal = await createImport(csv);
        logAnalyticsEvent("create_import_proposal");
        setDeletedTables(new Set());
        setLatestProposal(proposal);
      } catch (error) {
        console.error(error);
        setCsv(undefined);
        toast.error(
          "Failed to create import" +
            ((error as Error).message ? `: ${(error as Error).message}` : "")
        );
      }
    }
    fetchData(csv);
  }, [csv, createImport]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Handle the uploaded files here
    const file = acceptedFiles.at(0);
    if (!file) {
      toast.error("Invalid file, select a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      setCsv(fileContent);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
  });

  const handleConfirmImport = async () => {
    if (!latestProposal) {
      return;
    }

    try {
      await confirmImport(latestProposal.id, Array.from(deletedTables));
      toast.success("Data imported!");
      logAnalyticsEvent("import_success");
      setDeletedTables(new Set());
      setLatestProposal(undefined);
      setCsv(undefined);
      setInputMessage("");
      refresh();
      onComplete?.();
    } catch (error) {
      toast.error(
        "Failed to confirm import" +
          ((error as Error).message ? `: ${(error as Error).message}` : "")
      );
    }
  };

  const handleRequestNewProposal = async () => {
    if (!latestProposal || inputMessage.length < 20) {
      toast.error("Please provide more context to request a new proposal");
      return;
    }

    if (inputMessage.length > 400) {
      toast.error("Message too long");
      return;
    }

    try {
      const newProposal = await updateImport(latestProposal.id, inputMessage);
      logAnalyticsEvent("update_import_proposal");
      setDeletedTables(new Set());
      setLatestProposal(newProposal);
      setInputMessage("");
      toast.success("New proposal requested!");
    } catch (error) {
      toast.error(
        "Failed to request new proposal" +
          ((error as Error).message ? `: ${(error as Error).message}` : "")
      );
    }
  };

  return (
    <div>
      {(createLoading || updateLoading) && (
        <Loading message="Creating an import proposal..." />
      )}
      {confirmLoading && <Loading message="Importing data..." />}
      {!csv && (
        <div>
          <p className="mb-4 font-semibold">
            If you already track your finances using a spreadsheet or any tool
            that can export to CSV, you can import it in finance_stuff
            <br />
            we will create the necessary accounts and entries together with all
            the values you have been tracking in past.
          </p>
          <p className="mb-8">
            Export your data as CSV and upload it here.
            <br />
            For example in Google sheets:
            <br />
            &gt; File &gt; Download &gt; Comma-separated values (CSV)
          </p>
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
            <p>Drag & drop a CSV file here, or click to select one</p>
          </div>
        </div>
      )}
      {emptyProposal && (
        <div>
          <p>
            No proposal was generated, that might mean there is nothing to
            import from your spreadsheet because you already have all data.
            Otherwise try with another CSV.
          </p>
        </div>
      )}
      {tables && !isLoading && !emptyProposal && (
        <div>
          <p>
            Review the proposal and click Import if all looks good otherwise
            prompt which changes you would like to make to try again
          </p>
          {tables.map((table) => (
            <Table
              title={table.title}
              onDelete={table.onDelete}
              alwaysShowDelete={true}
              key={table.title}
              headers={table.headers}
              rows={table.rows}
            />
          ))}
          <div className="mt-16 mb-8">
            <button
              onClick={handleConfirmImport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600  pixel-corners-small"
            >
              Confirm Import
            </button>
            <div className="mt-4">
              <p className="mb-2">
                If you need to make changes to the proposal, explain what is
                wrong and what changes you would like so that our AI can attempt
                a new proposal.
              </p>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Enter message for new proposal"
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <button
                onClick={handleRequestNewProposal}
                disabled={inputMessage.length < 20}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 pixel-corners-small disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request New Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTab;
