"use client";

import { useState } from "react";
import { Codicon } from "@/shared/ui";

type AuthMode = "login" | "signup" | "reset";

const MODE_COPY: Record<
  AuthMode,
  {
    title: string;
    description: string;
    submit: string;
  }
> = {
  login: {
    title: "로그인",
    description:
      "계정 연결 시 기존 관심 종목과 포지션 설정을 이어서 사용할 수 있습니다.",
    submit: "로그인",
  },
  signup: {
    title: "회원가입",
    description: "관심 종목, 알림 조건, 포지션 설정을 계정에 저장합니다.",
    submit: "회원가입",
  },
  reset: {
    title: "비밀번호 재설정",
    description: "가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.",
    submit: "재설정 링크 보내기",
  },
};

function AuthField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: "email" | "password" | "text";
}) {
  return (
    <label className="auth-panel__field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}

interface AuthPanelProps {
  initialMode?: AuthMode;
}

export function AuthPanel({ initialMode = "login" }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const copy = MODE_COPY[mode];

  return (
    <form className="auth-panel">
      <div className="auth-panel__heading">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="auth-panel__fields">
        <AuthField label="이메일" placeholder="you@example.com" type="email" />
        {mode !== "reset" && (
          <AuthField label="비밀번호" placeholder="••••••••" type="password" />
        )}
        {mode === "signup" && (
          <AuthField
            label="비밀번호 확인"
            placeholder="••••••••"
            type="password"
          />
        )}
      </div>

      <div className="auth-panel__actions">
        <button type="submit" className="auth-panel__button">
          {copy.submit}
        </button>
        {mode !== "reset" && (
          <button
            type="button"
            className="auth-panel__button auth-panel__button--github"
          >
            <Codicon icon="codicon-github" size={14} />
            <span>GitHub로 계속</span>
          </button>
        )}
      </div>

      <div className="auth-panel__links">
        {mode === "login" && (
          <>
            <button type="button" onClick={() => setMode("reset")}>
              비밀번호를 잊으셨나요?
            </button>
            <button type="button" onClick={() => setMode("signup")}>
              회원가입
            </button>
          </>
        )}
        {mode === "signup" && (
          <div className="auth-panel__links-single">
            <button type="button" onClick={() => setMode("login")}>
              이미 계정이 있으신가요?
            </button>
          </div>
        )}
        {mode === "reset" && (
          <>
            <button type="button" onClick={() => setMode("login")}>
              로그인으로 돌아가기
            </button>
            <button type="button" onClick={() => setMode("signup")}>
              회원가입
            </button>
          </>
        )}
      </div>
    </form>
  );
}
