import axios, { AxiosError, AxiosResponse } from "axios";
import { useCallback, useState } from "react";

const apiClient = axios.create({
  baseURL: "http://localhost:4000",
});

export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common["Authorization"] = token;
};

// Function to clear the authorization token
export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common["Authorization"];
};

export const useApiCall = <T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<AxiosResponse<T>>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
};

export default apiClient;
