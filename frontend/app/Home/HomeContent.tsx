import React, { useState } from "react";
import { ArcherContainer } from "react-archer";
import Modal from "react-modal";
import TabView from "./TabView";
import FiatAccountsTab from "./Accounts/FiatAccountsTab";
import InvestmentsAccountsTab from "./Investments/InvestmentsAccountsTab";
import SummaryTab from "./Summary/SummaryTab";
import ConnectorsTab from "./Connectors/ConnectorTab";
import ChatTab from "./Chat/ChatTab";
import { createCSVContent } from "../../../shared/userStats";
import {
  AccountingEntriesDTO,
  Accounts,
  AccountType,
} from "../../../shared/types";
import { useUserState } from "../UserState";

interface HomeContentProps {
  uiState: {
    expandedAddAccount: boolean;
    setExpandedAddAccount: (expanded: boolean) => void;
    newAccountName: string;
    setNewAccountName: (name: string) => void;
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: (open: boolean) => void;
    accountToDelete: { id: string; name: string } | null;
    isDeleteEntryModalOpen: boolean;
    setIsDeleteEntryModalOpen: (open: boolean) => void;
  };
  actions: {
    handleCreateAccount: (type: AccountType) => Promise<void>;
    handleCellChange: (
      accountingEntryId: string,
      accountId: string,
      cellValue: number,
      invested: boolean
    ) => Promise<void>;
    handleCreateAccountingEntry: (date: Date) => Promise<void>;
    handleDeleteAccount: (accountId: string) => Promise<void>;
    handleDeleteAccountingEntry: (accountingEntryId: string) => Promise<void>;
    confirmDeleteAccount: () => Promise<void>;
    confirmDeleteAccountingEntry: () => Promise<void>;
  };
  data: {
    accountsLoading: boolean;
    entriesLoading: boolean;
    accounts: Accounts[] | null;
    accountingEntries: AccountingEntriesDTO[] | null;
    liveAccountingEntry?: AccountingEntriesDTO | null;
    accountsError: Error | null;
    entriesError: Error | null;
  };
  apis: {
    fetchAccountingEntries: () => Promise<AccountingEntriesDTO[] | undefined>;
    reloadData: () => void;
    signOut: () => void;
  };
}

const HomeContent: React.FC<HomeContentProps> = ({
  uiState: {
    expandedAddAccount,
    setExpandedAddAccount,
    newAccountName,
    setNewAccountName,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    accountToDelete,
    isDeleteEntryModalOpen,
    setIsDeleteEntryModalOpen,
  },
  actions: {
    handleCreateAccount,
    handleCellChange,
    handleCreateAccountingEntry,
    handleDeleteAccount,
    handleDeleteAccountingEntry,
    confirmDeleteAccount,
    confirmDeleteAccountingEntry,
  },
  data: {
    accounts,
    accountingEntries,
    liveAccountingEntry,
    accountsLoading,
    entriesLoading,
    accountsError,
    entriesError,
  },
  apis: { fetchAccountingEntries, reloadData, signOut },
}) => {
  const fiatAccounts =
    accounts?.filter((account) => account.type === "fiat") ?? [];
  const investmentAccounts =
    accounts?.filter((account) => account.type === "investment") ?? [];
  const isLoading = accountsLoading || (entriesLoading && !accountingEntries);

  const [activeTab, setActiveTab] = useState("fiat");
  const { user } = useUserState();

  const switchTab = (id: string) => {
    setActiveTab(id);
    setNewAccountName("");
    setExpandedAddAccount(false);
  };

  const exportData = () => {
    const csvContent = createCSVContent({
      accountingEntries: accountingEntries ?? undefined,
      fiatAccounts,
      investmentAccounts,
    });

    if (!csvContent) {
      return;
    }

    console.log(csvContent);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance_stuff_export.csv";
    a.click();
  };

  const tabContent = {
    fiat: (
      <FiatAccountsTab
        expandedAddAccount={expandedAddAccount}
        setExpandedAddAccount={setExpandedAddAccount}
        newAccountName={newAccountName}
        setNewAccountName={setNewAccountName}
        handleCreateAccount={handleCreateAccount}
        isLoading={isLoading}
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        handleCellChange={handleCellChange}
        handleCreateAccountingEntry={handleCreateAccountingEntry}
        handleDeleteAccount={handleDeleteAccount}
        handleDeleteAccountingEntry={handleDeleteAccountingEntry}
      />
    ),
    investments: (
      <InvestmentsAccountsTab
        expandedAddAccount={expandedAddAccount}
        setExpandedAddAccount={setExpandedAddAccount}
        newAccountName={newAccountName}
        setNewAccountName={setNewAccountName}
        handleCreateAccount={handleCreateAccount}
        switchTab={switchTab}
        isLoading={isLoading}
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        handleCellChange={handleCellChange}
        handleCreateAccountingEntry={handleCreateAccountingEntry}
        handleDeleteAccount={handleDeleteAccount}
        handleDeleteAccountingEntry={handleDeleteAccountingEntry}
        liveAccountingEntry={liveAccountingEntry ?? undefined}
      />
    ),
    summary: (
      <SummaryTab
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        liveAccountingEntry={liveAccountingEntry ?? undefined}
        onAddEntry={handleCreateAccountingEntry}
        onDeleteAccountingEntry={handleDeleteAccountingEntry}
      />
    ),
    connectors: (
      <ConnectorsTab
        accounts={accounts ?? []}
        onAddConnection={() => {
          fetchAccountingEntries();
        }}
      />
    ),
    chat: <ChatTab />,
  };

  if (!user) {
    return <></>;
  }

  return (
    <div className="min-h-screen" id="home-content">
      <div className="mx-auto">
        <ArcherContainer strokeColor="gray">
          <TabView
            email={user?.email}
            signOut={signOut}
            tabs={[
              { id: "fiat", label: "Bank Accounts" },
              { id: "investments", label: "Investments" },
              { id: "summary", label: "Summary" },
              { id: "connectors", label: "Connectors" },
              { id: "chat", label: "✨AI🔮" },
            ]}
            activeTab={activeTab}
            setActiveTab={switchTab}
            exportData={exportData}
          >
            {accountsError || entriesError ? (
              <div className="flex flex-col items-center">
                <p className="mt-16">Error loading data</p>
                <button
                  onClick={reloadData}
                  className="mt-4 px-8 py-2 bg-blue-500 text-white pixel-corners-small hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Retry
                </button>
              </div>
            ) : (
              tabContent[activeTab as keyof typeof tabContent]
            )}
            {isLoading && <p className="mt-8 mb-8">Loading...</p>}
          </TabView>
        </ArcherContainer>
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={() => setIsDeleteModalOpen(false)}
          className="modal"
          overlayClassName="overlay"
          appElement={document.getElementById("home-content") as HTMLElement}
        >
          <h2>Confirm Deletion</h2>
          <p className="mb-6">
            Are you sure you want to delete the account
            <b> {accountToDelete?.name}</b>? <br />
            This action cannot be undone and all the entries for that account
            will also be deleted.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-200 px-4 py-2 pixel-corners-small mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 pixel-corners-small hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={isDeleteEntryModalOpen}
          onRequestClose={() => setIsDeleteEntryModalOpen(false)}
          className="modal"
          overlayClassName="overlay"
          appElement={document.getElementById("home-content") as HTMLElement}
        >
          <h2>Delete date from all accounts</h2>
          <p className="mb-6">
            All the values for that date on each account will be removed. This
            action cannot be undone and
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeleteEntryModalOpen(false)}
              className="bg-gray-200 px-4 py-2 pixel-corners-small mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAccountingEntry}
              className="bg-red-500 text-white px-4 py-2 pixel-corners-small hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default HomeContent;
