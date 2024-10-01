import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Accounts, ConnectionsDTO } from "../../../../shared/types";
import {
  useGetConnectorsSettings,
  useCreateConnection,
  useGetConnections,
  useDeleteConnection,
} from "../apis/connectionsAPIs";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import Modal from "react-modal";
import DeleteIcon from "../../components/DeleteIcon";
import Linkify from "react-linkify";
import Loading from "@/app/components/Loading";
import { logAnalyticsEvent } from "@/app/firebase";
import { useTranslation } from "react-i18next";

export const ConnectorsTab: React.FC<{
  accounts: Accounts[];
  onAddConnection: () => void;
  isOnboarding?: boolean;
}> = ({ accounts, onAddConnection, isOnboarding = false }) => {
  const [selectedAccount, setSelectedAccount] = useState<
    Accounts | undefined
  >();
  const [selectedConnector, setSelectedConnector] = useState<
    string | undefined
  >();

  const {
    data: connectorsSettings,
    loading: isLoading,
    error,
    execute: getConnectorsSettings,
  } = useGetConnectorsSettings();

  const { execute: createConnection, loading: isCreating } =
    useCreateConnection();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [connections, setConnections] = useState<ConnectionsDTO[]>([]);
  const [connectionToDelete, setConnectionToDelete] =
    useState<ConnectionsDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: connectionsData,
    loading: connectionsLoading,
    error: connectionsError,
    execute: fetchConnections,
  } = useGetConnections();

  const { execute: deleteConnection, loading: isDeleting } =
    useDeleteConnection();

  const reloadData = useCallback(async () => {
    try {
      await Promise.all([getConnectorsSettings(), fetchConnections()]);
    } catch {}
  }, [getConnectorsSettings, fetchConnections]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    if (connectionsData) {
      setConnections(connectionsData);
    }
  }, [connectionsData]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accounts.find((account) => account.id === accountId));
    setSelectedConnector(undefined);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const accountName = (id: string) => {
    return accounts.find((account) => account.id === id)?.name;
  };

  const isFormValid = useMemo(() => {
    if (!selectedAccount || !selectedConnector) return false;

    const selectedConnectorSettings = connectorsSettings?.find(
      (c) => c.id === selectedConnector
    )?.settings;

    if (!selectedConnectorSettings) return false;

    return selectedConnectorSettings.every((setting) => {
      const value = formData[setting.key];
      if (setting.optional) {
        return true;
      }
      return value !== undefined && value.trim() !== "";
    });
  }, [selectedAccount, selectedConnector, formData, connectorsSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && selectedAccount && selectedConnector) {
      try {
        await createConnection({
          connector_id: selectedConnector,
          account_id: selectedAccount.id,
          settings: formData,
        });
        setSelectedAccount(undefined);
        setSelectedConnector(undefined);
        setFormData({});
        onAddConnection();
        fetchConnections();
        logAnalyticsEvent("create_connection_success");
        toast.success("Connection created successfully");
      } catch (error) {
        toast.error("Error creating connection: " + (error as Error).message);
      }
    }
  };

  const handleDeleteConnection = (connection: ConnectionsDTO) => {
    setConnectionToDelete(connection);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConnection = async () => {
    if (connectionToDelete) {
      try {
        await deleteConnection(connectionToDelete.id);
        fetchConnections();
        toast.success("Connection deleted successfully");
      } catch (error) {
        toast.error("Failed to delete connection: " + (error as Error).message);
      }
    }
    setIsDeleteModalOpen(false);
    setConnectionToDelete(null);
  };

  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto">
      {!isOnboarding && <h2>{t("connectorsTab.connections")}</h2>}

      {(isLoading || connectionsLoading) && <Loading />}
      {connectionsError && (
        <div>
          <p>
            {t("connectorsTab.errorLoadingConnections", {
              error: connectionsError.message,
            })}
          </p>
          <button
            onClick={reloadData}
            className="px-8 py-2 bg-blue-500 text-white pixel-corners-small hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {!connectionsLoading && !connectionsError && (
        <>
          {connections.length === 0 ? (
            isOnboarding ? (
              <p>{t("connectorsTab.onboardingMessage")}</p>
            ) : (
              <p>{t("connectorsTab.noConnections")}</p>
            )
          ) : (
            <ul className="mb-6 space-y-4">
              {connections.map((connection) => (
                <li
                  key={connection.id}
                  className="flex items-center justify-between bg-white p-4 rounded-md shadow"
                >
                  <div>
                    <p className="font-semibold">
                      {connectorsSettings?.find(
                        (c) => c.id === connection.connector_id
                      )?.name ?? connection.connector_id}
                    </p>
                    <p className="text-sm">
                      ↪ {accountName(connection.account_id)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteConnection(connection)}
                    className="bg-transparent text-white px-3 py-1 rounded-md hover:bg-red-100"
                  >
                    <DeleteIcon className="text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!isLoading && (
        <div className="mt-8">
          <h3>{t("connectorsTab.addNewConnector")}</h3>
          {error && (
            <p>
              {t("connectorsTab.errorLoadingConnectorsSettings", {
                error: error.message,
              })}
            </p>
          )}
          {!isLoading && !error && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="account"
                  className="block text-sm font-semibold mb-2"
                >
                  {t("connectorsTab.selectAccount")}
                </label>
                <select
                  id="account"
                  value={selectedAccount?.id}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">{t("connectorsTab.chooseAccount")}</option>
                  {accounts.map((account, index) => (
                    <option key={index} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {!selectedAccount && (
                  <p className="text-sm mt-4">
                    {t("connectorsTab.accountInstructions")}
                  </p>
                )}
              </div>
              {selectedAccount && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {connectorsSettings && t("connectorsTab.selectConnector")}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {connectorsSettings?.map((connector) => (
                        <button
                          key={connector.id}
                          type="button"
                          disabled={
                            !selectedAccount ||
                            (selectedAccount.type !== connector.type &&
                              connector.type !== undefined)
                          }
                          onClick={() => setSelectedConnector(connector.id)}
                          className={`flex flex-col items-center justify-center p-4 border rounded-md transition-colors disabled:opacity-50 ${
                            selectedConnector === connector.id
                              ? "bg-indigo-100 border-indigo-300"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {connector.icon && (
                            <div className="m-2 rounded-xl border border-gray-300 overflow-hidden">
                              <Image
                                src={connector.icon}
                                alt={connector.name}
                                width={60}
                                height={60}
                                className="rounded-md"
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {connector.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedConnector && (
                    <div className="mt-6">
                      <h3>{t("connectorsTab.connectorSettings")}</h3>
                      {connectorsSettings
                        ?.find((c) => c.id === selectedConnector)
                        ?.settings.map((setting) => (
                          <div key={setting.key} className="mb-4">
                            <label
                              htmlFor={setting.key}
                              className="block text-md font-semibold mb-1"
                            >
                              {setting.hint}
                              <Linkify
                                componentDecorator={(
                                  decoratedHref,
                                  decoratedText,
                                  key
                                ) => (
                                  <a
                                    href={decoratedHref}
                                    key={key}
                                    className="text-blue-600"
                                  >
                                    {decoratedText}
                                  </a>
                                )}
                              >
                                <p className="text-sm font-normal">
                                  {setting.extraInstructions}
                                </p>
                              </Linkify>
                            </label>
                            <input
                              type={
                                setting.type === "number" ? "number" : "text"
                              }
                              id={setting.key}
                              value={formData[setting.key] || ""}
                              onChange={(e) =>
                                handleInputChange(setting.key, e.target.value)
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              required={setting.optional ? false : true}
                            />
                          </div>
                        ))}
                      <p className="text-sm">
                        {t("connectorsTab.securityNote")}
                      </p>
                      <button
                        type="submit"
                        disabled={!isFormValid || isCreating}
                        className="w-full mt-8 flex justify-center py-2 px-4 border border-transparent shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 pixel-corners-small disabled:opacity-50"
                      >
                        {isCreating ? <Loading /> : t("connectorsTab.connect")}
                      </button>
                    </div>
                  )}
                  {!selectedConnector && selectedAccount && (
                    <div className="text-sm font-normal">
                      <p className="mb-8">
                        {t("connectorsTab.missingProviderMessage")}
                      </p>
                      {t("connectorsTab.contributeMessage")}
                      <Link
                        className="text-blue-600"
                        href="https://github.com/MP0w/finance_stuff_connectors"
                      >
                        <p className="break-all">
                          https://github.com/MP0w/finance_stuff_connectors
                        </p>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </form>
          )}
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
        appElement={document.getElementById("home-content") as HTMLElement}
      >
        <h2>{t("connectorsTab.confirmDeletion")}</h2>
        <p className="mb-6">
          {t("connectorsTab.deleteConfirmationMessage", {
            connectorId: connectionToDelete?.connector_id,
            accountName: accountName(connectionToDelete?.account_id ?? ""),
          })}
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-200 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={confirmDeleteConnection}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? t("connectorsTab.deleting") : t("common.delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ConnectorsTab;