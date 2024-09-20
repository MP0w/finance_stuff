import { Entries } from "../../../../shared/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Fetch entries for a specific account
export const useGetEntriesForAccount = () => {
  return useApiCall((accountId: string) =>
    api.get<Entries[]>(`/entries/${accountId}`)
  );
};

// Fetch a single entry
export const useGetEntry = () => {
  return useApiCall((id: string) => api.get<Entries>(`/entry/${id}`));
};

// Create a new entry
export const useCreateEntry = () => {
  return useApiCall(
    (
      accountId: string,
      accountingEntryId: string,
      value: number,
      invested?: number
    ) =>
      api.post<void>("/entry", {
        account_id: accountId,
        accounting_entry_id: accountingEntryId,
        value,
        invested,
      })
  );
};

// Update an existing entry
export const useUpdateEntry = () => {
  return useApiCall(
    (
      id: string,
      accountId: string,
      accountingEntryId: string,
      value: number,
      invested?: number
    ) =>
      api.put<void>(`/entry/${id}`, {
        account_id: accountId,
        accounting_entry_id: accountingEntryId,
        value,
        invested,
      })
  );
};

// Delete an entry
export const useDeleteEntry = () => {
  return useApiCall((id: string) => api.delete<void>(`/entry/${id}`));
};
