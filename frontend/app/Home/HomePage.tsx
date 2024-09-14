import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUserState } from "../UserState";
import SettingsIcon from "./SettingsIcon";
import { useGetAccounts, useCreateAccount } from "./accountsAPIs";
import {
  useGetAccountingEntries,
  useCreateAccountingEntry,
} from "./accountingEntriesAPIs";
import { useCreateEntry, useUpdateEntry } from "./entriesAPIs";
import { AccountType } from "../../../backend/types";
import AccountsTable from "./AccountsTable";
import InvestmentTable from "./InvestmentTable";
import TotalTable from "./TotalTable";
import TabView from "./TabView";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { userId, email } = useUserState();
  const [showSettings, setShowSettings] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [activeTab, setActiveTab] = useState("fiat");

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

  const fiatAccounts =
    accounts?.filter((account) => account.type === "fiat") ?? [];
  const investmentAccounts =
    accounts?.filter((account) => account.type === "investment") ?? [];

  useEffect(() => {
    fetchAccounts();
    fetchAccountingEntries();
  }, [fetchAccounts, fetchAccountingEntries]);

  if (!userId) {
    throw Error("invalid state");
  }

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

  const tabContent = {
    fiat: (
      <div>
        <div className="mb-4 flex">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Fiat account name"
            className="border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={() => handleCreateAccount("fiat")}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={newAccountName.length === 0}
          >
            Add Account
          </button>
        </div>
        <AccountsTable
          accounts={fiatAccounts}
          accountingEntries={accountingEntries ?? []}
          handleCellChange={handleCellChange}
          onAddEntry={handleCreateAccountingEntry}
        />
      </div>
    ),
    investments: (
      <>
        <div className="mb-4 flex">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="Investment account name"
            className="border rounded px-2 py-1 mr-2"
          />
          <button
            onClick={() => handleCreateAccount("investment")}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={newAccountName.length === 0}
          >
            Add Account
          </button>
        </div>
        {investmentAccounts.map((account) => (
          <InvestmentTable
            key={account.id}
            account={account}
            accountingEntries={accountingEntries ?? []}
            handleCellChange={handleCellChange}
            onAddEntry={handleCreateAccountingEntry}
          />
        ))}
        <TotalTable
          title="Investments Total"
          fiatAccounts={[]}
          investmentAccounts={investmentAccounts}
          accountingEntries={accountingEntries ?? []}
          onAddEntry={handleCreateAccountingEntry}
        />
      </>
    ),
    summary: (
      <TotalTable
        fiatAccounts={fiatAccounts}
        investmentAccounts={investmentAccounts}
        accountingEntries={accountingEntries ?? []}
        onAddEntry={handleCreateAccountingEntry}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-600">SimpleFi</h1>
          <div
            className="relative"
            onMouseEnter={() => setShowSettings(true)}
            onClick={() => setShowSettings(!showSettings)}
          >
            <button className="px-3 py-2 text-gray-600 hover:text-gray-600 transition duration-200">
              <SettingsIcon />
            </button>
            {showSettings && (
              <div
                className="absolute right-0  mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                onMouseLeave={() => setShowSettings(false)}
                onClick={() => setShowSettings(false)}
              >
                <p className="px-4 py-2 text-sm text-gray-700">{email}</p>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                  onClick={signOut}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        {(accountsLoading || (entriesLoading && !accountingEntries)) && (
          <p>Loading...</p>
        )}
        {(accountsError || entriesError) && <p>Error loading data</p>}
        <TabView
          tabs={[
            { id: "fiat", label: "Fiat Accounts" },
            { id: "investments", label: "Investments" },
            { id: "summary", label: "Summary" },
            { id: "graphs", label: "Graphs" },
            { id: "projections", label: "Projections" },
          ]}
          activeTab={activeTab}
          setActiveTab={(tabId) => {
            setActiveTab(tabId);
            setNewAccountName("");
          }}
        >
          {tabContent[activeTab as keyof typeof tabContent]}
        </TabView>
      </div>
    </div>
  );
};

export default HomePage;