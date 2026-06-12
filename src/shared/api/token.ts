/** 인증 세션 로컬 저장 — apiClient 인터셉터와 auth 스토어가 공유. */
export const AUTH_SESSION_KEY = "screet.authSession";

export interface StoredSession {
  userId: string;
  nickname: string;
  /** 로그인 아이디(이메일) — BE 응답엔 없어서 로그인 폼 입력값을 보관. */
  email: string;
  accessToken: string;
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_SESSION_KEY);
}

/** apiClient 인터셉터용 — 저장된 세션에서 액세스 토큰만 추출. */
export function getStoredToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}
