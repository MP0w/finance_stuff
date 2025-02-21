import { Accounts, AccountType } from "../../../../shared/types"; // Assuming you have a types file
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Fetch all accounts
export const useGetAccounts = () => {
  return useApiCall(() => api.get<Accounts[]>("/accounts"));
};

// Fetch a single account
export const useGetAccount = () => {
  return useApiCall((id: string) => api.get<Accounts>(`/account/${id}`));
};

// Create a new account
export const useCreateAccount = () => {
  return useApiCall((name: string, type: AccountType, currency: string) =>
    api.post<void>("/account", { name, type, currency })
  );
};

// Update an existing account
export const useUpdateAccount = () => {
  return useApiCall(
    (id: string, name: string, type: AccountType, currency: string) =>
      api.put<void>(`/account/${id}`, { name, type, currency })
  );
};

// Delete an account
export const useDeleteAccount = () => {
  return useApiCall((id: string) => api.delete<void>(`/account/${id}`));
};
