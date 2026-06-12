import axios from "axios";
import { notifyUnauthorized } from "./authEvents";
import { getStoredToken } from "./token";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 토큰을 실은 요청이 401이면 만료·무효 토큰 → 세션 정리(자동 로그아웃).
    if (error.response?.status === 401 && getStoredToken()) {
      notifyUnauthorized();
    }
    const message =
      error.response?.data?.message ||
      "문제가 발생했습니다. 다시 시도해주세요.";
    return Promise.reject({
      ...error,
      message,
    });
  },
);
