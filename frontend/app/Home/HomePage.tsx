import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUserState } from "../UserState";
import {
  useGetAccounts,
  useCreateAccount,
  useDeleteAccount,
} from "./apis/accountsAPIs";
import {
  useGetAccountingEntries,
  useCreateAccountingEntry,
  useDeleteAccountingEntry,
} from "./apis/accountingEntriesAPIs";
import { useCreateEntry, useUpdateEntry } from "./apis/entriesAPIs";
import { AccountType } from "../../../backend/types";
import AccountsTable from "./AccountsTable";
import InvestmentTable from "./InvestmentTable";
import TotalTable from "./TotalTable";
import TabView from "./TabView";
import AddButton from "../components/AddButton";
import Modal from "react-modal";
import { ArcherContainer } from "react-archer";
import OnboardingTips from "./OnboardingTips";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { user } = useUserState();
  const [expandedAddAccount, setExpandedAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [activeTab, setActiveTab] = useState("fiat");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteEntryModalOpen, setIsDeleteEntryModalOpen] = useState(false);
  const [accountingEntryToDelete, setAccountingEntryToDelete] = useState<
    string | null
  >(null);

  const {
    data: accounts,
    loading: accountsLoading,
    error: accountsError,
    execute: fetchAccounts,
  } = useGetAccounts();
  const {
    data: accountingEntries,
    loading: entriesLoading,
    error: entriesError,
    execute: fetchAccountingEntries,
  } = useGetAccountingEntries();
  const { execute: createAccount } = useCreateAccount();
  const { execute: createAccountingEntry } = useCreateAccountingEntry();
  const { execute: createEntry } = useCreateEntry();
  const { execute: updateEntry } = useUpdateEntry();
  const { execute: deleteAccount } = useDeleteAccount();
  const { execute: deleteAccountingEntry } = useDeleteAccountingEntry();

  const fiatAccounts =
    accounts?.filter((account) => account.type === "fiat") ?? [];
  const investmentAccounts =
    accounts?.filter((account) => account.type === "investment") ?? [];
  const isLoading = accountsLoading || (entriesLoading && !accountingEntries);

  useEffect(() => {
    fetchAccounts();
    fetchAccountingEntries();
  }, [fetchAccounts, fetchAccountingEntries]);

  const handleCreateAccount = useCallback(
    async (type: AccountType) => {
      if (newAccountName.length > 0) {
        try {
          await createAccount(newAccountName, type);
          fetchAccounts();
          setNewAccountName("");
          toast.success("Account created", { position: "bottom-right" });
        } catch (error) {
          console.error("Error creating account:", error);
          toast.error("Failed to create account. Please try again.", {
            position: "bottom-right",
          });
        }
      }
    },
    [newAccountName, createAccount, fetchAccounts]
  );

  const handleCreateAccountingEntry = useCallback(
    async (date: Date) => {
      try {
        await createAccountingEntry(date);
        fetchAccountingEntries();
        toast.success("new entry created", { position: "bottom-right" });
      } catch (error) {
        console.error("Error creating accounting entry:", error);
        toast.error(
          "Failed to create accounting entry. Make sure to pick a new date.",
          {
            position: "bottom-right",
          }
        );
      }
    },
    [createAccountingEntry, fetchAccountingEntries]
  );

  const handleCellChange = useCallback(
    async (
      accountingEntryId: string,
      accountId: string,
      cellValue: number,
      invested: boolean
    ) => {
      if (Number.isNaN(cellValue)) {
        toast.error("Invalid value", {
          position: "bottom-right",
        });
        return;
      }

      const existingEntry = accountingEntries
        ?.find((ae) => ae.id === accountingEntryId)
        ?.entries.find((e) => e.account_id === accountId);

      const isUpToDate = invested
        ? existingEntry?.invested === cellValue
        : existingEntry?.value === cellValue;

      if (existingEntry && isUpToDate) {
        return;
      }

      if (existingEntry) {
        const investmentValue = invested ? cellValue : existingEntry.invested;
        const value = invested ? existingEntry.value : cellValue;

        await updateEntry(
          existingEntry.id,
          accountId,
          accountingEntryId,
          value,
          investmentValue ?? undefined
        );
      } else {
        await createEntry(
          accountId,
          accountingEntryId,
          invested ? 0 : cellValue,
          invested ? cellValue : undefined
        );
      }
      await fetchAccountingEntries();
    },
    [accountingEntries, updateEntry, createEntry, fetchAccountingEntries]
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      const account = accounts?.find((a) => a.id === accountId);
      if (!account) {
        toast.error("Account not found. Retry", {
          position: "bottom-right",
        });
        return;
      }

      setAccountToDelete({ id: accountId, name: account.name });
      setIsDeleteModalOpen(true);
    },
    [accounts]
  );

  const handleDeleteAccountingEntry = useCallback(
    async (accountingEntryId: string) => {
      const accountingEntry = accountingEntries?.find(
        (ae) => ae.id === accountingEntryId
      );

      if (!accountingEntry) {
        toast.error("Entry not found. Retry", {
          position: "bottom-right",
        });
        return;
      }

      setAccountingEntryToDelete(accountingEntryId);
      setIsDeleteEntryModalOpen(true);
    },
    [accountingEntries]
  );

  const confirmDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        fetchAccounts();
        toast.success("Account deleted successfully", {
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account. Please try again.", {
          position: "bottom-right",
        });
      }
    }
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const confirmDeleteAccountingEntry = async () => {
    if (accountingEntryToDelete) {
      try {
        await deleteAccountingEntry(accountingEntryToDelete);
        fetchAccountingEntries();
        toast.success("Entry deleted successfully", {
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Error deleting accountingentry:", error);
        toast.error("Failed to delete entry. Please try again.", {
          position: "bottom-right",
        });
      }
    }
    setIsDeleteEntryModalOpen(false);
    setAccountingEntryToDelete(null);
  };

  const tabContent = {
    fiat: (
      <div>
        <AddButton
          title="Add account"
          onClick={() => setExpandedAddAccount(!expandedAddAccount)}
        />

        {expandedAddAccount && (
          <div className="mt-4 mb-4 flex">
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="Cash, Bank, etc."
              className="border rounded px-2 py-1 mr-2"
            />
            <button
              onClick={() => handleCreateAccount("fiat")}
              className="bg-gray-600 text-white px-4 py-1 pixel-corners-small hover:bg-gray-800 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={newAccountName.length === 0}
            >
              Create
            </button>
          </div>
        )}

        {!isLoading && fiatAccounts.length === 0 && (
          <OnboardingTips
            fiatAccounts={fiatAccounts}
            investmentAccounts={investmentAccounts}
            expandedAddAccount={expandedAddAccount}
          />
        )}
        <AccountsTable
          accounts={fiatAccounts}
          accountingEntries={accountingEntries ?? []}
          handleCellChange={handleCellChange}
          onAddEntry={handleCreateAccountingEntry}
          onDeleteAccount={handleDeleteAccount}
          onDeleteAccountingEntry={handleDeleteAccountingEntry}
        />
      </div>
    ),
    investments: (
      <>
        <AddButton
          title="Add account"
          onClick={() => setExpandedAddAccount(!expandedAddAccount)}
        />
        {expandedAddAccount && (
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
        )}
        {!isLoading && investmentAccounts.length === 0 && (
          <OnboardingTips
            fiatAccounts={fiatAccounts}
            investmentAccounts={investmentAccounts}
            expandedAddAccount={expandedAddAccount}
          />
        )}
        {investmentAccounts.map((account) => (
          <InvestmentTable
            key={account.id}
            account={account}
            accountingEntries={accountingEntries ?? []}
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
            accountingEntries={accountingEntries ?? []}
            onAddEntry={handleCreateAccountingEntry}
            onDeleteAccountingEntry={handleDeleteAccountingEntry}
          />
        )}
      </>
    ),
    summary:
      fiatAccounts.length > 0 || investmentAccounts.length > 0 ? (
        <TotalTable
          fiatAccounts={fiatAccounts}
          investmentAccounts={investmentAccounts}
          accountingEntries={accountingEntries ?? []}
          onAddEntry={handleCreateAccountingEntry}
          onDeleteAccountingEntry={handleDeleteAccountingEntry}
        />
      ) : (
        <div>Add yours accounts and entries to see the summary</div>
      ),
    projections: <div>Coming soon</div>,
    graphs: <div>Coming soon</div>,
  };

  if (!user) {
    return <></>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-8 pr-8 pt-4 pb-8">
      <div className="mx-auto">
        <ArcherContainer strokeColor="gray">
          <TabView
            email={user?.email}
            signOut={signOut}
            tabs={[
              { id: "fiat", label: "Bank Accounts" },
              { id: "investments", label: "Investments" },
              { id: "summary", label: "Summary" },
              { id: "graphs", label: "Graphs" },
              { id: "projections", label: "Projections" },
            ]}
            activeTab={activeTab}
            setActiveTab={(tabId) => {
              setActiveTab(tabId);
              setNewAccountName("");
              setExpandedAddAccount(false);
            }}
          >
            {accountsError || entriesError ? (
              <p>Error loading data, retry</p>
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
        >
          <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
          <p className="mb-6">
            Are you sure you want to delete the account
            <b> {accountToDelete?.name}</b>? <br />
            This action cannot be undone and all the entries for that account
            will also be deleted.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 pixel-corners-small mr-2 hover:bg-gray-400"
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
        >
          <h2 className="text-xl font-semibold mb-4">Confirm Entry Deletion</h2>
          <p className="mb-6">
            Are you sure you want to delete the entry? <br />
            This action cannot be undone and all the values for that date on
            each account will be removed.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeleteEntryModalOpen(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 pixel-corners-small mr-2 hover:bg-gray-400"
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

export default HomePage;
