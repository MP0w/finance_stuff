import React, { useState, useEffect, useMemo } from "react";
import { Accounts, Connector } from "../../../backend/types";
import {
  useGetConnectorsSettings,
  useCreateConnection,
} from "./apis/connectionsAPIs";
import Image from "next/image";
import toast from "react-hot-toast";

export const ConnectorsTab: React.FC<{
  accounts: Accounts[];
}> = ({ accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>();
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

  const [availableConnectors, setAvailableConnectors] = useState<Connector[]>(
    connectorsSettings ?? []
  );
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    getConnectorsSettings();
  }, [getConnectorsSettings]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    setSelectedConnector(undefined);
    const selectedAccountType = accounts.find(
      (account) => account.id === accountId
    )?.type;
    if (selectedAccountType) {
      setAvailableConnectors(
        connectorsSettings?.filter(
          (connector) => connector.type === selectedAccountType
        ) || []
      );
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const isFormValid = useMemo(() => {
    if (!selectedAccount || !selectedConnector) return false;

    const selectedConnectorSettings = availableConnectors.find(
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
  }, [selectedAccount, selectedConnector, availableConnectors, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && selectedAccount && selectedConnector) {
      try {
        await createConnection({
          connector_id: selectedConnector,
          account_id: selectedAccount,
          settings: formData,
        });
        setSelectedAccount(undefined);
        setSelectedConnector(undefined);
        setFormData({});
      } catch (error) {
        toast.error("Error creating connection: " + (error as Error).message, {
          id: "create-connection-error",
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Connect Account</h2>
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
              value={selectedAccount}
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
              {availableConnectors.length === 0
                ? "No connectors available for this type of account, select another account"
                : "Select a connector:"}
            </label>

            <div className="grid grid-cols-3 gap-4">
              {availableConnectors.map((connector) => (
                <button
                  key={connector.id}
                  type="button"
                  onClick={() => setSelectedConnector(connector.id)}
                  className={`flex flex-col items-center justify-center p-4 border rounded-md transition-colors ${
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
              {availableConnectors
                .find((c) => c.id === selectedConnector)
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
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid || isCreating}
            className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 pixel-corners-small disabled:opacity-50"
          >
            {isCreating ? "Connecting..." : "Connect"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ConnectorsTab;
