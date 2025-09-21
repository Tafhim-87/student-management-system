import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig } from "axios";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function useApi<T>() {
  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const request = useCallback(
    async (
      method: "get" | "post" | "put" | "patch" | "delete",
      url: string,
      body ?: unknown,
      config?: AxiosRequestConfig
    ): Promise<T | null> => {
      setResponse({ data: null, error: null, loading: true });
      try {
        const res = await axios({
          method,
          url: `${API_BASE_URL}${url}`,
          data: body,
          ...config,
          headers: {
            "Content-Type": "application/json",
            ...config?.headers,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setResponse({ data: res.data, error: null, loading: false });
        return res.data;
      } catch (err) {
        if(err instanceof Error) {
          setResponse({ data: null, error: err.message, loading: false });
        }
        setResponse({
          data: null,
          error: err instanceof Error ? err.message : "Something went wrong",
          loading: false,
        });
        return null;
      }
    },
    []
  );

  return {
  ...response,
  get: useCallback((url: string, config?: AxiosRequestConfig) => request("get", url, null, config), [request]),
  post: useCallback((url: string, body: unknown, config?: AxiosRequestConfig) => request("post", url, body, config), [request]),
  put: useCallback((url: string, body: unknown, config?: AxiosRequestConfig) => request("put", url, body, config), [request]),
  patch: useCallback((url: string, body: unknown, config?: AxiosRequestConfig) => request("patch", url, body, config), [request]),
  del: useCallback((url: string, config?: AxiosRequestConfig) => request("delete", url, null, config), [request]),
};
}
