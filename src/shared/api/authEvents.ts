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
