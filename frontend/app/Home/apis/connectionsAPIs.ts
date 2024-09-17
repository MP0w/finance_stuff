import { Connector, ConnectionsDTO } from "../../../../backend/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Fetch connectors settings
export const useGetConnectorsSettings = () => {
  return useApiCall(() => api.get<Connector[]>(`/connectors-settings`));
};

// Fetch all connections
export const useGetConnections = () => {
  return useApiCall(() => api.get<ConnectionsDTO[]>(`/connections`));
};

// Fetch a single connection
export const useGetConnection = (id: string) => {
  return useApiCall(() => api.get<ConnectionsDTO>(`/connections/${id}`));
};

// Create a new connection
export const useCreateConnection = () => {
  return useApiCall((data: Omit<ConnectionsDTO, "id">) =>
    api.post(`/connections`, data)
  );
};

// Update an existing connection
export const useUpdateConnection = () => {
  return useApiCall((id: string, data: Partial<ConnectionsDTO>) =>
    api.put(`/connections/${id}`, data)
  );
};

// Delete a connection
export const useDeleteConnection = () => {
  return useApiCall((id: string) => api.delete(`/connections/${id}`));
};
