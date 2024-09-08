import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUserState } from "../UserState";
import { TableHeader, TableRow, TableRowCell } from "./Table";
import SettingsIcon from "./SettingsIcon";
import { useGetAccounts, useCreateAccount } from "./accountsAPIs";
import {
  useGetAccountingEntries,
  useCreateAccountingEntry,
} from "./accountingEntriesAPIs";
import { useCreateEntry, useUpdateEntry } from "./entriesAPIs";
import {
  AccountingEntriesDTO,
  Accounts,
  AccountType,
} from "../../../backend/types";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { userId, email } = useUserState();
  const [showSettings, setShowSettings] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<AccountType>("fiat");

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

  useEffect(() => {
    fetchAccounts();
    fetchAccountingEntries();
  }, [fetchAccounts, fetchAccountingEntries]);

  if (!userId) {
    throw Error("invalid state");
  }

  const handleCreateAccount = useCallback(async () => {
    if (newAccountName) {
      try {
        await createAccount(newAccountName, newAccountType);
        fetchAccounts();
        setNewAccountName("");
        setNewAccountType("fiat");
        toast.success("Account created successfully");
      } catch (error) {
        console.error("Error creating account:", error);
        toast.error("Failed to create account. Please try again.", {
          position: "bottom-right",
        });
      }
    }
  }, [newAccountName, newAccountType, createAccount, fetchAccounts]);

  const handleCreateAccountingEntry = useCallback(async () => {
    try {
      await createAccountingEntry(new Date());
      fetchAccountingEntries();
      toast.success("Accounting entry created successfully");
    } catch (error) {
      console.error("Error creating accounting entry:", error);
      toast.error("Failed to create accounting entry. Please try again.", {
        position: "bottom-right",
      });
    }
  }, [createAccountingEntry, fetchAccountingEntries]);

  const handleCellChange = useCallback(
    async (accountingEntryId: string, accountId: string, value: string) => {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const existingEntry = accountingEntries
          ?.find((ae) => ae.id === accountingEntryId)
          ?.entries.find((e) => e.account_id === accountId);

        if (existingEntry && existingEntry.value === numericValue.toString()) {
          return;
        }

        if (existingEntry) {
          await updateEntry(
            existingEntry.id,
            accountId,
            accountingEntryId,
            numericValue
          );
        } else {
          await createEntry(accountId, accountingEntryId, numericValue);
        }
        fetchAccountingEntries();
      }
    },
    [accountingEntries, updateEntry, createEntry, fetchAccountingEntries]
  );

  const headers = accounts
    ? ["Date", ...accounts.map((account) => account.name), "Total"]
    : ["Date"];

  const getEntryValue = (entry: AccountingEntriesDTO, accountId: string) => {
    const matchingEntry = entry.entries.find((e) => e.account_id === accountId);
    return matchingEntry ? matchingEntry.value : "0";
  };

  function getCells(
    entry: AccountingEntriesDTO,
    accounts: Accounts[]
  ): TableRowCell[] {
    const entries = accounts.map((account) => ({
      value: getEntryValue(entry, account.id),
      onValueChange: (value: string) => {
        return handleCellChange(entry.id, account.id, value);
      },
    }));

    const sum = entries.reduce((acc, curr) => acc + parseFloat(curr.value), 0);

    return [
      {
        value: new Date(entry.date).toLocaleDateString(),
      },
      ...entries,
      {
        value: sum.toString(),
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">SimpleFi</h1>
          <div
            className="relative"
            onMouseEnter={() => setShowSettings(true)}
            onClick={() => setShowSettings(!showSettings)}
          >
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition duration-200">
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

        {accounts && accounts.length === 0 && (
          <p>No accounts found. Create your first account.</p>
        )}

        <div className="mb-4 flex">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="New account name"
            className="border rounded px-2 py-1 mr-2"
          />
          <select
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value as AccountType)}
            className="border rounded px-2 py-1 mr-2 text-gray-700"
          >
            <option value="fiat">Fiat</option>
            <option value="investment">Investment</option>
          </select>
          <button
            onClick={handleCreateAccount}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mr-2"
          >
            Add Account
          </button>
          <button
            onClick={handleCreateAccountingEntry}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Add Accounting Entry
          </button>
        </div>

        {accounts && accounts.length > 0 && accountingEntries && (
          <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
            <table className="w-full">
              <TableHeader headers={headers} />
              <tbody>
                {accountingEntries.map((entry) => (
                  <TableRow key={entry.id} cells={getCells(entry, accounts)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;