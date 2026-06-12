// 공개 API — 외부가 쓰는 AuthPanel(sidebar) 과 401 핸들러 등록(앱 진입점) 만 노출.
// useAuthStore·타입 등은 auth 내부에서만 쓰므로 "../model" 내부 경로로 사용한다.
export { AuthPanel } from "./ui";
export { registerAuthUnauthorizedHandler } from "./model";
