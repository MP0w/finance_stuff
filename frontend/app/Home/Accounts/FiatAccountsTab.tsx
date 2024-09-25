import React from "react";
import AddButton from "../../components/AddButton";
import AddToCalendar from "../../components/AddToCalendar";
import OnboardingTips from "../OnboardingTips";
import AccountsTable from "./AccountsTable";
import {
  AccountType,
  AccountingEntriesDTO,
  Accounts,
} from "../../../../shared/types";

interface FiatAccountsTabProps {
  expandedAddAccount: boolean;
  setExpandedAddAccount: (expanded: boolean) => void;
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  handleCreateAccount: (name: string, type: AccountType) => Promise<void>;
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
  handleCreateAccountingEntry: (date: string) => Promise<void>;
  handleDeleteAccount: (accountId: string) => Promise<void>;
  handleDeleteAccountingEntry: (accountingEntryId: string) => Promise<void>;
}

const FiatAccountsTab: React.FC<FiatAccountsTabProps> = ({
  expandedAddAccount,
  setExpandedAddAccount,
  newAccountName,
  setNewAccountName,
  handleCreateAccount,
  isLoading,
  fiatAccounts,
  investmentAccounts,
  accountingEntries,
  handleCellChange,
  handleCreateAccountingEntry,
  handleDeleteAccount,
  handleDeleteAccountingEntry,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <AddButton
          title="Add Bank Account"
          onClick={() => setExpandedAddAccount(!expandedAddAccount)}
        />
        <AddToCalendar />
      </div>

      {expandedAddAccount && (
        <div className="my-4 flex">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Cash, Bank, etc."
            className="border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={() => handleCreateAccount(newAccountName, "fiat")}
            className="bg-gray-600 text-white px-4 py-1 pixel-corners-small hover:bg-gray-800 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={newAccountName.length === 0}
          >
            Create
          </button>
        </div>
      )}
      {expandedAddAccount && (
        <p className="mb-8 max-w-prose">
          Any account where, unlike investment accounts,{" "}
          <b>you don&apos;t expect the value to fluctuate</b> unless you
          add/spend/remove money from it.
          <br />
          For example: bank accounts, cash, even loans or debt you have with
          someone (using negative values)
        </p>
      )}

      {!isLoading && fiatAccounts.length === 0 && (
        <OnboardingTips
          fiatAccounts={fiatAccounts}
          investmentAccounts={investmentAccounts}
          expandedAddAccount={expandedAddAccount}
          isInvestments={false}
        />
      )}
      <AccountsTable
        accounts={fiatAccounts}
        accountingEntries={accountingEntries}
        handleCellChange={handleCellChange}
        onAddEntry={handleCreateAccountingEntry}
        onDeleteAccount={handleDeleteAccount}
        onDeleteAccountingEntry={handleDeleteAccountingEntry}
      />
    </div>
  );
};

export default FiatAccountsTab;
