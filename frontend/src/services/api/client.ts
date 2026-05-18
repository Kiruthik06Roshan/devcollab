import axios, { AxiosError } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export type ApiErrorPayload = {
  message?: string;
  issues?: unknown;
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    return axiosError.response?.data?.message ?? axiosError.message ?? 'Request failed';
  }

  return error instanceof Error ? error.message : 'Request failed';
}