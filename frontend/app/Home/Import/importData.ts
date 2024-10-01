import { DateTime } from "luxon";
import { ImportProposal } from "../../../../shared/types";
import { ImportTabProps } from "./ImportTab";
import { TableHeaderContent, TableRowCell } from "../Table";

export function importTableData(
  t: (key: string) => string,
  current: ImportTabProps,
  proposal: ImportProposal,
  onDelete: (id: string) => void
) {
  return makeTables(mergedData(current, proposal), onDelete, t);
}

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
  data: ReturnType<typeof mergedData>,
  onDelete: (id: string) => void,
  t: (key: string) => string
): {
  id: string;
  title: string;
  onDelete?: () => void;
  headers: TableHeaderContent[];
  rows: TableRowCell[][];
}[] {
  const investmentsTables = data.investmentAccounts.map((account) => {
    return {
      id: account.id,
      title: account.name + `${account.new ? t("importData.newLabel") : ""}`,
      onDelete: account.new ? () => onDelete(account.id) : undefined,
      headers: [
        { title: t("importData.date") },
        { title: t("importData.invested") },
        { title: t("importData.investmentValue") },
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
      id: account.id,
      title: account.name + `${account.new ? t("importData.newLabel") : ""}`,
      onDelete: account.new ? () => onDelete(account.id) : undefined,
      headers: [
        { title: t("importData.date") },
        { title: t("importData.value") },
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
            value: entry?.value,
          },
        ];
      }),
    };
  });

  return [...investmentsTables, ...accountsTables];
}
