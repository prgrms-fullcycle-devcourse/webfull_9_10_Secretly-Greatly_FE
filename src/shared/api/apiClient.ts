import axios from "axios";
import { notifyUnauthorized } from "./authEvents";
import { getStoredToken } from "./token";

// 요청별로 401 자동 로그아웃을 끄는 플래그.
// 예: 비밀번호 변경 — 401은 토큰 만료가 아니라 "현재 비밀번호 불일치"라 로그아웃 대신 인라인 에러로 처리한다.
declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

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
    // 단 skipAuthRedirect 요청(비밀번호 변경 등)은 제외 — 401을 호출부가 직접 처리한다.
    if (
      error.response?.status === 401 &&
      getStoredToken() &&
      !error.config?.skipAuthRedirect
    ) {
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
