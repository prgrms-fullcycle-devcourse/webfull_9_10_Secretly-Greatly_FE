"use client";

import { useEffect, useState, type FormEvent } from "react";
import { login, signup } from "../api";
import {
  hasErrors,
  PASSWORD_MAX,
  useAuthStore,
  validateLogin,
  validateSignup,
  type LoginResult,
  type SignupErrors,
} from "../model";
import { AccountPanel } from "./accountPanel";
import { AuthField } from "./authField";
import { AuthNotice, type AuthNoticeState } from "./authNotice";

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

interface AuthPanelProps {
  initialMode?: AuthMode;
  /** 로그인 성공 시 호스트에 알림 (패널 닫기 등). */
  onSuccess?: (result: LoginResult) => void;
}

export function AuthPanel({
  initialMode = "login",
  onSuccess,
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [fixedNickname, setFixedNickname] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [notice, setNotice] = useState<AuthNoticeState | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  // 마운트 후 저장된 세션 복원 — 초기 렌더는 항상 비로그인이라 하이드레이션이 일치한다.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 로그인 상태면 로그인 폼 대신 내 계정(프로필) 화면.
  if (isAuthenticated) return <AccountPanel />;

  const copy = MODE_COPY[mode];

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setNotice(null);
  };

  const errorMessage = (err: unknown, fallback: string) => {
    const message = (err as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    return message ?? fallback;
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors = validateLogin({ email: normalizedEmail, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      const result = await login({ email: normalizedEmail, password });
      setSession(result, normalizedEmail);
      onSuccess?.(result);
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err, "로그인에 실패했습니다. 다시 시도해주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedNickname = fixedNickname.trim();
    const nextErrors = validateSignup({
      email: normalizedEmail,
      fixedNickname: trimmedNickname,
      password,
      checkPassword,
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    try {
      await signup({
        email: normalizedEmail,
        fixedNickname: trimmedNickname,
        password,
        checkPassword,
      });
      setPassword("");
      setCheckPassword("");
      switchMode("login");
      setNotice({
        type: "success",
        text: "회원가입이 완료되었습니다. 로그인해주세요.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err, "회원가입에 실패했습니다. 다시 시도해주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return; // Enter 연타 등 중복 제출 방어
    setNotice(null);
    if (mode === "login") await handleLogin();
    else if (mode === "signup") await handleSignup();
    // reset 모드는 BE 엔드포인트 미구현 — 연결 시 확장.
  };

  return (
    <form className="auth-panel" onSubmit={handleSubmit} noValidate>
      <div className="auth-panel__heading">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="auth-panel__fields">
        <AuthField
          label="이메일"
          name="email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
        />
        {mode === "signup" && (
          <AuthField
            label="고정닉"
            name="nickname"
            placeholder="사용할 닉네임"
            value={fixedNickname}
            onChange={setFixedNickname}
            error={errors.fixedNickname}
            autoComplete="nickname"
          />
        )}
        {mode !== "reset" && (
          <AuthField
            label="비밀번호"
            name="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            maxLength={mode === "signup" ? PASSWORD_MAX : undefined}
          />
        )}
        {mode === "signup" && (
          <AuthField
            label="비밀번호 확인"
            name="checkPassword"
            placeholder="••••••••"
            type="password"
            value={checkPassword}
            onChange={setCheckPassword}
            error={errors.checkPassword}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
          />
        )}
      </div>

      {notice && <AuthNotice type={notice.type} text={notice.text} />}

      <div className="auth-panel__actions">
        <button type="submit" className="auth-panel__button" disabled={loading}>
          {loading ? "처리 중…" : copy.submit}
        </button>
      </div>

      <div className="auth-panel__links">
        {mode === "login" && (
          <>
            <button type="button" onClick={() => switchMode("reset")}>
              비밀번호를 잊으셨나요?
            </button>
            <button type="button" onClick={() => switchMode("signup")}>
              회원가입
            </button>
          </>
        )}
        {mode === "signup" && (
          <div className="auth-panel__links-single">
            <button type="button" onClick={() => switchMode("login")}>
              이미 계정이 있으신가요?
            </button>
          </div>
        )}
        {mode === "reset" && (
          <>
            <button type="button" onClick={() => switchMode("login")}>
              로그인으로 돌아가기
            </button>
            <button type="button" onClick={() => switchMode("signup")}>
              회원가입
            </button>
          </>
        )}
      </div>
    </form>
  );
}
