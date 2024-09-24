import { ImportProposal } from "../../../../shared/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Create a new import
export const useCreateImport = () => {
  return useApiCall((csv: string) =>
    api.post<ImportProposal>("/import", { csv })
  );
};

// Update an existing import with user input
export const useUpdateImport = () => {
  return useApiCall((id: string, input: string) =>
    api.put<ImportProposal>(`/import/${id}`, { input })
  );
};

// Confirm an existing import
export const useConfirmImport = () => {
  return useApiCall((id: string, deletedTables: string[]) =>
    api.post(`/import/${id}/confirm`, { deletedTables })
  );
};
