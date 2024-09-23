import React from "react";
import { AccountingEntriesDTO, Accounts } from "../../../../shared/types";
import AddToCalendar from "../../components/AddToCalendar";
import TotalTable from "./TotalTable";
import { GraphsTab } from "./GraphsTab";
import { ProjectionsTab } from "./ProjectionsTab";
import { makeSummaryData } from "../../../../shared/userStats";

export const SummaryTab: React.FC<{
  liveAccountingEntry: AccountingEntriesDTO | undefined;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  onAddEntry: (date: string) => void;
  onDeleteAccountingEntry: (entryId: string) => void;
}> = ({
  liveAccountingEntry,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  onAddEntry,
  onDeleteAccountingEntry,
}) => {
  const summaryCells = makeSummaryData({
    fiatAccounts,
    investmentAccounts,
    accountingEntries,
    liveAccountingEntry: undefined,
  });

  return fiatAccounts.length > 0 || investmentAccounts.length > 0 ? (
    <div>
      <div className="flex justify-between items-center">
        <div></div>
        <AddToCalendar />
      </div>
      <TotalTable
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        liveAccountingEntry={liveAccountingEntry}
        onAddEntry={onAddEntry}
        onDeleteAccountingEntry={onDeleteAccountingEntry}
      />
      <GraphsTab
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        summaryCells={summaryCells}
      />
      <ProjectionsTab summaryCells={summaryCells} />
    </div>
  ) : (
    <div>Add your accounts and entries to see the summary</div>
  );
};

export default SummaryTab;
