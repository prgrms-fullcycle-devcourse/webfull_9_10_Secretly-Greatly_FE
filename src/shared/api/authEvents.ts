/**
 * 401(만료·무효 토큰) 응답 시 실행할 핸들러 레지스트리.
 * shared 는 features 를 의존할 수 없으므로, auth 스토어가 핸들러(세션 clear)를
 * 등록하고 apiClient 인터셉터가 401 에서 이를 호출한다.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

/**
 * 인증 세션 변경(로그인/로그아웃) 알림.
 *
 * 세션은 zustand 스토어 + localStorage 에 저장되는데, localStorage 를 한 번만
 * 읽는 소비자(예: 채팅/뉴스 훅)는 새로고침 전까지 변화를 모른다. 스토어가
 * 세션을 바꿀 때 이 이벤트를 쏘면 그런 소비자들이 즉시 세션을 다시 읽는다.
 */
const AUTH_CHANGE_EVENT = "auth-session-changed";

export function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/** 인증 변경 구독. 반환된 함수로 해제한다. */
export function onAuthChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, handler);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
}
