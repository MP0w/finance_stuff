import React from "react";
import {
  AccountingEntriesDTO,
  Accounts,
  AccountType,
} from "../../../../shared/types";
import AddButton from "../../components/AddButton";
import AddToCalendar from "../../components/AddToCalendar";
import OnboardingTips from "../OnboardingTips";
import InvestmentTable from "./InvestmentTable";
import TotalTable from "../Summary/TotalTable";

interface InvestmentsAccountsTabProps {
  expandedAddAccount: boolean;
  setExpandedAddAccount: (expanded: boolean) => void;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  handleCreateAccount: (type: AccountType) => Promise<void>;
  switchTab: (id: string) => void;
  isLoading: boolean;
  fiatAccounts: Accounts[];
  investmentAccounts: Accounts[];
  accountingEntries: AccountingEntriesDTO[];
  handleCellChange: (
    accountingEntryId: string,
    accountId: string,
    cellValue: number,
    invested: boolean
  ) => Promise<void>;
  handleCreateAccountingEntry: (date: Date) => Promise<void>;
  handleDeleteAccount: (accountId: string) => Promise<void>;
  handleDeleteAccountingEntry: (accountingEntryId: string) => Promise<void>;
  liveAccountingEntry?: AccountingEntriesDTO;
}

const InvestmentsAccountsTab: React.FC<InvestmentsAccountsTabProps> = ({
  expandedAddAccount,
  setExpandedAddAccount,
  newAccountName,
  setNewAccountName,
  handleCreateAccount,
  switchTab,
  isLoading,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  handleCellChange,
  handleCreateAccountingEntry,
  handleDeleteAccount,
  handleDeleteAccountingEntry,
  liveAccountingEntry,
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <AddButton
          title="Add Investment Account"
          onClick={() => setExpandedAddAccount(!expandedAddAccount)}
        />
        <AddToCalendar />
      </div>
      {expandedAddAccount && (
        <div>
          <div className="mb-4 mt-4 flex">
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="Crypto, Stocks, Bonds, etc."
              className="border rounded px-2 py-1 mr-2"
            />
            <button
              onClick={() => handleCreateAccount("investment")}
              className="bg-gray-600 text-white px-4 py-1 pixel-corners-small hover:bg-gray-800 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={newAccountName.length === 0}
            >
              Add
            </button>
          </div>
          <p className="mb-8 max-w-prose">
            Unlike Bank accounts, Investments accounts are accounts{" "}
            <b>where you expect value to fluctuate</b> even if you won&apos;t
            add or remove money.
            <br />
            For example: stocks, crypto, bonds. You initially invest an amount,
            might add/remove each month but their value also fluctuates.
          </p>
          <p className="text-sm max-w-lg">
            After creating an account you can connect it to external accounts
            (e.g. banks, crypto exchanges, stock brokers, etc...) to autofill
            the amounts each time you create an entry and see live data.
          </p>
          <button
            className="mt-4 px-4 py-2 text-sm bg-purple-200 hover:bg-purple-300 pixel-corners-small"
            onClick={() => {
              switchTab("connectors");
            }}
          >
            Connect external accounts
          </button>
        </div>
      )}
      {!isLoading && investmentAccounts.length === 0 && (
        <OnboardingTips
          fiatAccounts={fiatAccounts}
          investmentAccounts={investmentAccounts}
          expandedAddAccount={expandedAddAccount}
          isInvestments={true}
        />
      )}
      {investmentAccounts.map((account) => (
        <InvestmentTable
          key={account.id}
          account={account}
          accountingEntries={accountingEntries}
          handleCellChange={handleCellChange}
          onAddEntry={handleCreateAccountingEntry}
          onDeleteAccount={handleDeleteAccount}
          onDeleteAccountingEntry={handleDeleteAccountingEntry}
        />
      ))}
      {investmentAccounts.length > 0 && (
        <TotalTable
          title="Investments Total"
          fiatAccounts={[]}
          investmentAccounts={investmentAccounts}
          accountingEntries={accountingEntries}
          liveAccountingEntry={liveAccountingEntry}
          onAddEntry={handleCreateAccountingEntry}
          onDeleteAccountingEntry={handleDeleteAccountingEntry}
        />
      )}
    </>
  );
};

export default InvestmentsAccountsTab;
