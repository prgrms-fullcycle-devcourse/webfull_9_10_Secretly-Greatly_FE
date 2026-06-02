import { apiClient } from "./apiClient";
import type { AxiosRequestConfig, AxiosError } from "axios";

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return apiClient({
    ...config,
    ...options,
  });
};

export type ErrorType<Error> = AxiosError<Error>;
