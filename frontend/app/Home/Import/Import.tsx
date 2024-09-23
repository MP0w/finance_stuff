import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useCreateImport } from "../apis/import";
import {
  AccountingEntries,
  Accounts,
  ImportProposal,
} from "../../../../shared/types";
import Table, { TableHeaderContent, TableRowCell } from "../Table";
import { DateTime } from "luxon";

type ImportTabProps = {
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntries[];
};

function mergedData(current: ImportTabProps, proposal: ImportProposal) {
  const existingAccountsIds = new Set(
    current.fiatAccounts
      .map((a) => a.id)
      .concat(current.investmentAccounts.map((a) => a.id))
  );

  const existingAccountingEntriesIds = new Set(
    current.accountingEntries.map((e) => e.id)
  );

  const affectedExistingAccounts = new Set(
    proposal.newEntries.map((e) => e.accountId)
  ).intersection(existingAccountsIds);

  const affectedExistingAccountingEntries = new Set(
    proposal.newEntries.map((e) => e.accountingEntryId)
  ).intersection(existingAccountingEntriesIds);

  const fiatAccounts: (ImportProposal["newAccounts"][0] & { new?: boolean })[] =
    current.fiatAccounts.filter((a) => affectedExistingAccounts.has(a.id));
  const investmentAccounts: (ImportProposal["newInvestments"][0] & {
    new?: boolean;
  })[] = current.investmentAccounts.filter((a) =>
    affectedExistingAccounts.has(a.id)
  );
  const accountingEntries: (ImportProposal["newAccountingEntries"][0] & {
    new?: boolean;
  })[] = current.accountingEntries
    .filter((a) => affectedExistingAccountingEntries.has(a.id))
    .map((a) => ({
      id: a.id,
      date: a.date,
    }));

  fiatAccounts.push(...proposal.newAccounts.map((a) => ({ ...a, new: true })));
  investmentAccounts.push(
    ...proposal.newInvestments.map((a) => ({ ...a, new: true }))
  );
  accountingEntries.push(
    ...proposal.newAccountingEntries.map((a) => ({
      ...a,
      date: DateTime.fromFormat(a.date, "yyyy-MM-dd").toFormat("yyyy-MM-dd"),
      new: true,
    }))
  );

  const entryMapByAccountingEntryId: Map<
    string,
    Map<string, ImportProposal["newEntries"][0]>
  > = new Map();

  proposal.newEntries.forEach((entry) => {
    const map =
      entryMapByAccountingEntryId.get(entry.accountingEntryId) ?? new Map();
    map.set(entry.accountId, entry);
    entryMapByAccountingEntryId.set(entry.accountingEntryId, map);
  });

  return {
    fiatAccounts: fiatAccounts.sort((a, b) => (a.new ? -1 : b.new ? 1 : 0)),
    investmentAccounts: investmentAccounts.sort((a, b) =>
      a.new ? -1 : b.new ? 1 : 0
    ),
    accountingEntries: accountingEntries
      .map((a) => ({
        ...a,
        date: new Date(a.date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
    entryMapByAccountingEntryId,
  };
}

function makeTables(
  data: ReturnType<typeof mergedData>
): { title: string; headers: TableHeaderContent[]; rows: TableRowCell[][] }[] {
  const investmentsTables = data.investmentAccounts.map((account) => {
    return {
      title: account.name + `${account.new ? " (new)" : ""}`,
      headers: [
        { title: "Date" },
        { title: "Invested" },
        { title: "Investment Value" },
      ],
      rows: data.accountingEntries.map((aEntry) => {
        const entry = data.entryMapByAccountingEntryId
          .get(aEntry.id)
          ?.get(account.id);
        return [
          {
            color: aEntry.new ? "bg-green-200" : undefined,
            value: aEntry.date,
          },
          {
            color: "bg-green-100",
            value: entry?.invested,
          },
          {
            color: "bg-green-100",
            value: entry?.value,
          },
        ];
      }),
    };
  });

  const accountsTables = data.fiatAccounts.map((account) => {
    return {
      title: account.name + `${account.new ? " (new)" : ""}`,
      headers: [{ title: "Date" }, { title: "Value" }],
      rows: data.accountingEntries.map((aEntry) => {
        const entry = data.entryMapByAccountingEntryId
          .get(aEntry.id)
          ?.get(account.id);
        return [
          {
            color: aEntry.new ? "bg-green-200" : undefined,
            value: aEntry.date,
          },
          {
            color: "bg-green-100",
            value: entry?.value,
          },
        ];
      }),
    };
  });

  return [...investmentsTables, ...accountsTables];
}

export const ImportTab: React.FC<ImportTabProps> = ({
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
}) => {
  const [csv, setCsv] = useState<string | undefined>(undefined);
  const [latestProposal, setLatestProposal] = useState<
    ImportProposal | undefined
  >(undefined);

  const { loading, execute: createImport } = useCreateImport();
  //   const { execute: updateImport } = useUpdateImport();

  const tables = useMemo(() => {
    if (!latestProposal) {
      return undefined;
    }
    return makeTables(
      mergedData(
        { fiatAccounts, investmentAccounts, accountingEntries },
        latestProposal
      )
    );
  }, [fiatAccounts, investmentAccounts, accountingEntries, latestProposal]);

  useEffect(() => {
    if (!csv) {
      return;
    }

    console.log("csv", csv);

    async function fetchData(csv: string) {
      try {
        const proposal = await createImport(csv);
        setLatestProposal(proposal);
      } catch (error) {
        console.error(error);
        setCsv(undefined);
        toast.error("Failed to create import, retry");
      }
    }
    fetchData(csv);
  }, [csv, createImport]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Handle the uploaded files here
    console.log(acceptedFiles);
    const file = acceptedFiles[0];
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

  return (
    <div>
      {loading && <p>Creating an import proposal...</p>}
      {!csv && (
        <div>
          <p className="mb-8">
            You can export your spreadsheet as CSV to upload it here.
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
      {tables && (
        <div>
          <p>
            Review the proposal and click Import if all looks good otherwise
            prompt which changes you would like to make to try again
          </p>
          {tables.map((table) => (
            <Table
              title={table.title}
              key={table.title}
              headers={table.headers}
              rows={table.rows}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportTab;
