import { AccountingEntriesDTO } from "../../../../backend/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Fetch all accounting entries
export const useGetAccountingEntries = () => {
  return useApiCall(() =>
    api.get<AccountingEntriesDTO[]>("/accounting_entries")
  );
};

// get live entry
export const useGetLiveAccountingEntry = () => {
  return useApiCall(() =>
    api.get<{ live?: AccountingEntriesDTO }>("/live_accounting_entry")
  );
};

// Fetch a single accounting entry
export const useGetAccountingEntry = () => {
  return useApiCall((id: string) =>
    api.get<AccountingEntriesDTO>(`/accounting_entry/${id}`)
  );
};

// Create a new accounting entry
export const useCreateAccountingEntry = () => {
  return useApiCall((date: Date) =>
    api.post<{ failedConnections: { connectorId: string }[] }>(
      "/accounting_entry",
      {
        date: date.toLocaleDateString("en-US"),
      }
    )
  );
};

// Update an existing accounting entry
export const useUpdateAccountingEntry = () => {
  return useApiCall((id: string, date: Date) =>
    api.put<void>(`/accounting_entry/${id}`, { date })
  );
};

// Delete an accounting entry
export const useDeleteAccountingEntry = () => {
  return useApiCall((id: string) =>
    api.delete<void>(`/accounting_entry/${id}`)
  );
};
