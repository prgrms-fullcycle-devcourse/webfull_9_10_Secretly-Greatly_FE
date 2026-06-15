"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Codicon } from "@/shared/ui";
import { getMe } from "../api";
import {
  PASSWORD_MAX,
  useAuthStore,
  validatePassword,
  type MeResult,
} from "../model";
import { AuthField } from "./authField";
import { AuthNotice, type AuthNoticeState } from "./authNotice";

/** 비밀번호 규칙 안내 (BE 정합: 8~16자 · @$!%*#?&). */
const PASSWORD_HINT = "영문·숫자·특수문자(@$!%*#?&) · 8~16자";

const SECONDARY_BUTTON =
  "flex w-full items-center justify-center gap-1.5 rounded-[2px] py-[7px] text-[13px] bg-(--vscode-button-secondaryBackground) text-(--vscode-button-secondaryForeground) hover:bg-(--vscode-button-secondaryHoverBackground)";

/**
 * 비밀번호 변경 폼 — BE `POST /api/auth/passwords` 스펙(현재/새/확인, Bearer)을
 * 화면에 반영한다. 실제 API 연동은 추후 작업.
 */
function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [checkNewPassword, setCheckNewPassword] = useState("");
  const [message, setMessage] = useState<AuthNoticeState | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !checkNewPassword) {
      setMessage({ type: "error", text: "모든 항목을 입력해주세요." });
      return;
    }
    const ruleError = validatePassword(newPassword);
    if (ruleError) {
      setMessage({ type: "error", text: ruleError });
      return;
    }
    if (newPassword !== checkNewPassword) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }
    // TODO: POST /api/auth/passwords (Authorization: Bearer) — BE 연동 예정
    setMessage({
      type: "info",
      text: "입력값 확인됨 · BE 연동은 추후 작업됩니다.",
    });
  };

  return (
    <form className="auth-panel__fields" onSubmit={handleSubmit} noValidate>
      <AuthField
        label="현재 비밀번호"
        name="current-password"
        type="password"
        placeholder="••••••••"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
        maxLength={PASSWORD_MAX}
      />
      <AuthField
        label="새 비밀번호"
        name="new-password"
        type="password"
        placeholder="••••••••"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        maxLength={PASSWORD_MAX}
      />
      <AuthField
        label="새 비밀번호 확인"
        name="confirm-new-password"
        type="password"
        placeholder="••••••••"
        value={checkNewPassword}
        onChange={setCheckNewPassword}
        autoComplete="new-password"
        maxLength={PASSWORD_MAX}
      />

      <p className="pt-1 text-[11px] text-(--vscode-disabledForeground)">
        {PASSWORD_HINT}
      </p>
      {message && <AuthNotice type={message.type} text={message.text} />}

      <div className="auth-panel__actions">
        <button type="submit" className="auth-panel__button">
          비밀번호 변경
        </button>
        <button type="button" className={SECONDARY_BUTTON} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

/** 로그인 상태의 ACCOUNT 패널 — 내 정보 + 비밀번호 변경 / 로그아웃. */
export function AccountPanel() {
  const storeEmail = useAuthStore((s) => s.email);
  const storeNickname = useAuthStore((s) => s.nickname);
  const clear = useAuthStore((s) => s.clear);
  const [changing, setChanging] = useState(false);
  const [profile, setProfile] = useState<MeResult | null>(null);

  // 계정 진입 시 토큰 유효성 검증 겸 서버 프로필 로드.
  // 무효(401)면 apiClient 인터셉터가 자동 로그아웃하고, 그 외(네트워크 등)는 스토어 값으로 표시.
  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => {});
  }, []);

  const nickname = profile?.nickname ?? storeNickname ?? "사용자";
  const email = profile?.email ?? storeEmail;

  return (
    <div className="auth-panel">
      <div className="auth-panel__heading">
        <h2>내 계정</h2>
        <p>
          계정으로 로그인되어 있습니다. 관심 종목·포지션 설정이 동기화됩니다.
        </p>
      </div>

      {/* 프로필 카드 */}
      <div className="mt-2 flex items-center gap-3 rounded-sm border border-vscode-border-input px-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vscode-list-hover text-vscode-fg-icon">
          <Codicon icon="codicon-account" size={22} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-vscode-fg">
            {nickname}
          </div>
          <div className="truncate text-[11px] text-vscode-fg-desc">
            {email ?? "로그인 계정"}
          </div>
        </div>
      </div>

      {changing ? (
        <ChangePasswordForm onCancel={() => setChanging(false)} />
      ) : (
        <div className="auth-panel__actions">
          <button
            type="button"
            className="auth-panel__button"
            onClick={() => setChanging(true)}
          >
            <Codicon icon="codicon-key" size={14} />
            <span>비밀번호 변경</span>
          </button>
          <button type="button" className={SECONDARY_BUTTON} onClick={clear}>
            <Codicon icon="codicon-sign-out" size={14} />
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  );
}
