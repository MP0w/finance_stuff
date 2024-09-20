import React, { useState, useEffect, useMemo } from "react";
import { Accounts, ConnectionsDTO } from "../../../shared/types";
import {
  useGetConnectorsSettings,
  useCreateConnection,
  useGetConnections,
  useDeleteConnection,
} from "./apis/connectionsAPIs";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import Modal from "react-modal";
import DeleteIcon from "../components/DeleteIcon";

export const ConnectorsTab: React.FC<{
  accounts: Accounts[];
  onAddConnection: () => void;
}> = ({ accounts, onAddConnection }) => {
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

  useEffect(() => {
    getConnectorsSettings();
    fetchConnections();
  }, [getConnectorsSettings, fetchConnections]);

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
      } catch (error) {
        toast.error("Error creating connection: " + (error as Error).message, {
          id: "create-connection-error",
          position: "bottom-right",
        });
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
        await fetchConnections();
        toast.success("Connection deleted successfully", {
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Error deleting connection:", error);
        toast.error("Failed to delete connection. Please try again.", {
          position: "bottom-right",
        });
      }
    }
    setIsDeleteModalOpen(false);
    setConnectionToDelete(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Connections</h2>

      {connectionsLoading && <p>Loading connections...</p>}
      {connectionsError && (
        <p>Error loading connections: {connectionsError.message}</p>
      )}

      {!connectionsLoading && !connectionsError && (
        <>
          {connections.length === 0 ? (
            <p>No connections found. Add a new connector to get started.</p>
          ) : (
            <ul className="mb-6 space-y-4">
              {connections.map((connection) => (
                <li
                  key={connection.id}
                  className="flex items-center justify-between bg-white p-4 rounded-md shadow"
                >
                  <div>
                    <p className="font-semibold">{connection.connector_id}</p>
                    <p className="text-sm text-gray-600">
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

      {
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Add New Connector</h3>
          {isLoading && <p>Loading connectors settings...</p>}
          {error && <p>Error loading connectors settings: {error.message}</p>}
          {!isLoading && !error && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select an account:
                </label>
                <select
                  id="account"
                  value={selectedAccount?.id}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Choose an account</option>
                  {accounts.map((account, index) => (
                    <option key={index} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {connectorsSettings && "Select a connector:"}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Connector Settings
                  </h3>
                  {connectorsSettings
                    ?.find((c) => c.id === selectedConnector)
                    ?.settings.map((setting) => (
                      <div key={setting.key} className="mb-4">
                        <label
                          htmlFor={setting.key}
                          className="block text-md font-bold text-gray-800 mb-1"
                        >
                          {setting.hint}
                          <p className="text-gray-600 text-sm font-normal">
                            {setting.extraInstructions}
                          </p>
                        </label>
                        <input
                          type={setting.type === "number" ? "number" : "text"}
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
                    All connectors settings are encrypted and stored securely.
                  </p>
                  <button
                    type="submit"
                    disabled={!isFormValid || isCreating}
                    className="w-full mt-8 flex justify-center py-2 px-4 border border-transparent shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 pixel-corners-small disabled:opacity-50"
                  >
                    {isCreating ? "Connecting..." : "Connect"}
                  </button>
                </div>
              )}
              {!selectedConnector && selectedAccount && (
                <div className="text-gray-600 text-sm font-normal">
                  <p className="mb-8">
                    If you don&apos;t see your favorite provider in the list,
                    you can send a feedback or email to us and we will consider
                    adding it!
                  </p>
                  <Link href="https://github.com/MP0w/finance_stuff_connectors">
                    You can also contribute, it&apos;s easy!
                    <p className="break-all">
                      https://github.com/MP0w/finance_stuff_connectors
                    </p>
                  </Link>
                </div>
              )}
            </form>
          )}
        </div>
      }

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-6">
          Are you sure you want to delete the connection to
          <b> {connectionToDelete?.connector_id}</b> for account
          <b> {accountName(connectionToDelete?.account_id ?? "")}</b>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteConnection}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ConnectorsTab;
