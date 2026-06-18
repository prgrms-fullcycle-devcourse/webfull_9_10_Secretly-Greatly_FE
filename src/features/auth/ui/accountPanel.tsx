"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Codicon } from "@/shared/ui";
import { changePassword, getMe } from "../api";
import {
  PASSWORD_MAX,
  useAuthStore,
  validatePassword,
  type MeResult,
} from "../model";
import { AuthField } from "./authField";
import { AuthNotice, type AuthNoticeState } from "./authNotice";
import { KisConnectPanel } from "./kisConnectPanel";
import { KisConnectedBadge } from "./kisConnectedBadge";
import { SECONDARY_BUTTON } from "./secondaryButton";
import { useKisStore } from "../model/kisStore";

/** 비밀번호 규칙 안내 (BE 정합: 8~16자 · @$!%*#?&). */
const PASSWORD_HINT = "영문·숫자·특수문자(@$!%*#?&) · 8~16자";

/**
 * 비밀번호 변경 폼 — BE `PATCH /api/auth/passwords`(현재/새/확인, Bearer) 연동.
 */
function ChangePasswordForm({
  onCancel,
  onChanged,
}: {
  onCancel: () => void;
  /** 변경 성공 시 호출 — 로그인 화면 안내 + 로그아웃 처리(호스트). */
  onChanged: (text: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [checkNewPassword, setCheckNewPassword] = useState("");
  const [message, setMessage] = useState<AuthNoticeState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
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

    setSubmitting(true);
    try {
      const message = await changePassword({
        currentPassword,
        newPassword,
        checkNewPassword,
      });
      // 성공 → 호스트가 로그인 화면 안내(BE 메시지) + 로그아웃(언마운트). 폼은 사라지므로 상태 정리 불필요.
      onChanged(message);
    } catch (err) {
      const m = (err as { message?: string | string[] }).message;
      setMessage({
        type: "error",
        text: Array.isArray(m)
          ? (m[0] ?? "비밀번호 변경에 실패했습니다.")
          : (m ?? "비밀번호 변경에 실패했습니다."),
      });
      setSubmitting(false);
    }
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
        <button
          type="submit"
          className="auth-panel__button"
          disabled={submitting}
        >
          {submitting ? "변경 중…" : "비밀번호 변경"}
        </button>
        <button type="button" className={SECONDARY_BUTTON} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

/** 로그인 상태의 ACCOUNT 패널 — 내 정보 + 비밀번호 변경 / 로그아웃. */
export function AccountPanel({
  onPasswordChanged,
}: {
  /** 비밀번호 변경 성공 시 호출 (로그인 화면 안내 + 로그아웃은 호스트가 처리). */
  onPasswordChanged: (text: string) => void;
}) {
  const storeEmail = useAuthStore((s) => s.email);
  const storeNickname = useAuthStore((s) => s.nickname);
  const clear = useAuthStore((s) => s.clear);
  const kisConnected = useKisStore((s) => s.connected);
  const [changing, setChanging] = useState(false);
  const [kisOpen, setKisOpen] = useState(false);
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

      {/* KIS 연동 상태 — 랜딩(기본)에서만. KIS 연동 화면은 자체 상세 뱃지가 있어 중복 방지. */}
      {!changing && !kisOpen && kisConnected && <KisConnectedBadge />}

      {changing ? (
        <ChangePasswordForm
          onCancel={() => setChanging(false)}
          onChanged={onPasswordChanged}
        />
      ) : kisOpen ? (
        <KisConnectPanel onClose={() => setKisOpen(false)} />
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
          <button
            type="button"
            className={SECONDARY_BUTTON}
            onClick={() => setKisOpen(true)}
          >
            <Codicon icon="codicon-plug" size={14} />
            <span>KIS 연동</span>
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
