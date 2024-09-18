import axios, { AxiosError, AxiosResponse } from "axios";
import { useCallback, useState, useRef } from "react";
import { useUserState } from "./UserState";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
  const { user } = useUserState();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use useRef to store the apiFunction
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const execute = useCallback(
    async (...args: P) => {
      if (!user) {
        return;
      }

      setLoading(true);
      setError(null);
      setAuthToken(await user.idToken());

      try {
        const response = await apiFunctionRef.current(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError;
        let errorMessage = axiosError.message;
        if (
          axiosError.response?.data &&
          typeof axiosError.response.data === "object" &&
          "error" in axiosError.response.data
        ) {
          errorMessage = axiosError.response.data.error as string;
        }

        const error = new Error(errorMessage);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { data, loading, error, execute };
};

export default apiClient;
