import { Connector } from "../../../../backend/types";
import apiClient, { useApiCall } from "../../apiClient";

const api = apiClient;

// Fetch connectors settings
export const useGetConnectorsSettings = () => {
  return useApiCall(() => api.get<Connector[]>(`/connectors-settings`));
};
