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
  useGetLiveAccountingEntry,
} from "./apis/accountingEntriesAPIs";
import { useCreateEntry, useUpdateEntry } from "./apis/entriesAPIs";
import { AccountType } from "../../../shared/types";
import { logAnalyticsEvent } from "../firebase";
import HomeContent from "./HomeContent";
import Onboarding, { didCompleteOnboarding } from "../Onboarding/Onboarding";
import { useTranslation } from "react-i18next";

interface HomePageProps {
  signOut: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ signOut }) => {
  const { user } = useUserState();
  const { t } = useTranslation();
  // UI states
  const [expandedAddAccount, setExpandedAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleteEntryModalOpen, setIsDeleteEntryModalOpen] = useState(false);
  const [accountingEntryToDelete, setAccountingEntryToDelete] = useState<
    string | null
  >(null);

  // data
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

  const { data: liveAccountingEntry, execute: fetchLiveAccountingEntry } =
    useGetLiveAccountingEntry();

  const { hasOutdated, outdatedTTL } = liveAccountingEntry ?? {
    hasOutdated: false,
  };

  // APIs
  const { execute: createAccount } = useCreateAccount();
  const { execute: createAccountingEntry } = useCreateAccountingEntry();
  const { execute: createEntry } = useCreateEntry();
  const { execute: updateEntry } = useUpdateEntry();
  const { execute: deleteAccount } = useDeleteAccount();
  const { execute: deleteAccountingEntry } = useDeleteAccountingEntry();

  useEffect(() => {
    if (user && window.location.pathname === "/login") {
      window.history.replaceState(null, "", "/");
    }
  }, [user]);

  const reloadData = useCallback(async () => {
    try {
      await Promise.all([fetchAccounts(), fetchAccountingEntries()]);
    } catch {}
  }, [fetchAccounts, fetchAccountingEntries]);

  useEffect(() => {
    reloadData();
  }, [reloadData, fetchLiveAccountingEntry]);

  useEffect(() => {
    const fetch = async () => {
      if (accountingEntries) {
        try {
          await fetchLiveAccountingEntry();
        } catch {}
      }
    };
    fetch();
  }, [accountingEntries, fetchLiveAccountingEntry]);

  useEffect(() => {
    if (hasOutdated && outdatedTTL) {
      const timer = setTimeout(() => {
        fetchLiveAccountingEntry();
      }, outdatedTTL * 1000);

      return () => clearTimeout(timer);
    }
  }, [hasOutdated, outdatedTTL, fetchLiveAccountingEntry]);

  const handleCreateAccount = useCallback(
    async (name: string, type: AccountType) => {
      if (name.length > 0) {
        try {
          await createAccount(name, type, user?.currency ?? "USD");
          fetchAccounts();
          setNewAccountName("");
          toast.success(t("homePage.accountCreated"));
          setExpandedAddAccount(false);
          logAnalyticsEvent("create_account_success");
        } catch (error) {
          toast.error(t("homePage.accountCreationFailed"));
        }
      }
    },
    [createAccount, fetchAccounts, user, t]
  );

  const handleCreateAccountingEntry = useCallback(
    async (date: string) => {
      try {
        const response = await createAccountingEntry(date);
        fetchAccountingEntries();
        toast.success(t("homePage.newEntryCreated"));
        const failedConnections = response?.failedConnections ?? [];
        if (failedConnections.length > 0) {
          toast.error(
            t("homePage.failedConnections", {
              connectors: failedConnections
                .map((c) => c.connectorId)
                .join(", "),
            }),
            {
              duration: 20000,
            }
          );
        }

        logAnalyticsEvent("create_accounting_entry_success");
      } catch (error) {
        toast.error(
          t("homePage.accountingEntryCreationFailed", {
            error: (error as Error).message,
          })
        );
      }
    },
    [createAccountingEntry, fetchAccountingEntries, t]
  );

  const handleCellChange = useCallback(
    async (
      accountingEntryId: string,
      accountId: string,
      cellValue: number,
      invested: boolean
    ) => {
      if (Number.isNaN(cellValue)) {
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

      try {
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
      } catch {
        toast.error("Failed to update entry. Please try again.");
      }

      try {
        await fetchAccountingEntries();
      } catch {}
    },
    [accountingEntries, updateEntry, createEntry, fetchAccountingEntries]
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      const account = accounts?.find((a) => a.id === accountId);
      if (!account) {
        toast.error(t("homePage.accountNotFound"));
        return;
      }

      setAccountToDelete({ id: accountId, name: account.name });
      setIsDeleteModalOpen(true);
    },
    [accounts, t]
  );

  const handleDeleteAccountingEntry = useCallback(
    async (accountingEntryId: string) => {
      const accountingEntry = accountingEntries?.find(
        (ae) => ae.id === accountingEntryId
      );

      if (!accountingEntry) {
        toast.error(t("homePage.entryNotFound"));
        return;
      }

      setAccountingEntryToDelete(accountingEntryId);
      setIsDeleteEntryModalOpen(true);
    },
    [accountingEntries, t]
  );

  const confirmDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      fetchAccounts();

      toast.success(t("homePage.accountDeletedSuccess"));
    } catch (error) {
      toast.error(t("homePage.accountDeletionFailed"));
    }
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const confirmDeleteAccountingEntry = async () => {
    if (accountingEntryToDelete) {
      try {
        await deleteAccountingEntry(accountingEntryToDelete);
        fetchAccountingEntries();
        toast.success(t("homePage.entryDeletedSuccess"));
      } catch (error) {
        toast.error(t("homePage.entryDeletionFailed"));
      }
    }
    setIsDeleteEntryModalOpen(false);
    setAccountingEntryToDelete(null);
  };

  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  if (
    user &&
    !didCompleteOnboarding(user.onboarding_step) &&
    !onboardingCompleted &&
    accounts &&
    accountingEntries
  ) {
    return (
      <Onboarding
        props={{
          actions: {
            handleCreateAccount,
            handleCellChange,
            handleCreateAccountingEntry,
            confirmDeleteAccount,
          },
          data: { accounts, accountingEntries },
          apis: { reloadData: reloadData },
        }}
        setOnboardingCompleted={setOnboardingCompleted}
      />
    );
  }

  return (
    <HomeContent
      uiState={{
        expandedAddAccount,
        setExpandedAddAccount,
        newAccountName,
        setNewAccountName,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        accountToDelete,
        isDeleteEntryModalOpen,
        setIsDeleteEntryModalOpen,
      }}
      actions={{
        handleCreateAccount,
        handleCellChange,
        handleCreateAccountingEntry,
        handleDeleteAccount,
        handleDeleteAccountingEntry,
        confirmDeleteAccount,
        confirmDeleteAccountingEntry,
      }}
      data={{
        accounts,
        accountingEntries,
        liveAccountingEntry: liveAccountingEntry?.live,
        accountsLoading,
        entriesLoading,
        accountsError,
        entriesError,
      }}
      apis={{ fetchAccountingEntries, reloadData, signOut }}
    />
  );
};

export default HomePage;