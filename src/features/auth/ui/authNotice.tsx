export type AuthNoticeType = "error" | "success" | "info";

export interface AuthNoticeState {
  type: AuthNoticeType;
  text: string;
}

/** 의미별 색: 오류(빨강)·성공(상승색)·안내(설명 회색). */
const NOTICE_COLOR: Record<AuthNoticeType, string> = {
  error: "text-(--vscode-errorForeground)",
  success: "text-(--chart-up)",
  info: "text-vscode-fg-desc",
};

/** auth 패널 공통 상태 메시지 — 로그인/회원가입/비밀번호 변경에서 공유. */
export function AuthNotice({
  type,
  text,
  className = "",
}: AuthNoticeState & { className?: string }) {
  return (
    <p
      className={`text-[12px] ${NOTICE_COLOR[type]}${className ? ` ${className}` : ""}`}
    >
      {text}
    </p>
  );
}
