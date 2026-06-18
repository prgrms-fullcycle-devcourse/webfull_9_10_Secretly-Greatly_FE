"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Codicon } from "@/shared/ui";
import { KisConnectedBadge } from "./kisConnectedBadge";
import { useKisStore } from "../model/kisStore";
import {
  getKisCredentialStatus,
  registerKisCredential,
  type KisCredentialStatus,
} from "../api";
import { AuthField } from "./authField";
import { AuthNotice, type AuthNoticeState } from "./authNotice";
import { SECONDARY_BUTTON } from "./secondaryButton";

/** BE DTO 길이 제약 (appKey 36자 · appSecret 180자). */
const APP_KEY_LEN = 36;
const APP_SECRET_LEN = 180;

/**
 * KIS(한국투자증권) OpenAPI 키 연동 폼 — 계정 패널 하위(비밀번호 변경과 형제).
 * appKey/appSecret 입력 → BE(`POST /api/auth/kis-credential`)에 등록 →
 * BE가 암호화 저장 + 키 유효성 검증 후, 장중에 관심 종목 시세를 자동 수집한다.
 */
export function KisConnectPanel({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<KisCredentialStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState(false);
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthNoticeState | null>(null);

  const mountedRef = useRef(true);

  // 등록 상태 조회 — 진입 시 + "다시 시도"에서 재사용.
  // (401은 인터셉터가 자동 로그아웃 처리. 500·네트워크는 statusError로 구분)
  const loadStatus = useCallback(() => {
    getKisCredentialStatus()
      .then((s) => {
        if (mountedRef.current) setStatus(s);
      })
      .catch(() => {
        if (mountedRef.current) setStatusError(true);
      })
      .finally(() => {
        if (mountedRef.current) setLoadingStatus(false);
      });
  }, []);

  useEffect(() => {
    loadStatus();
    return () => {
      mountedRef.current = false;
    };
  }, [loadStatus]);

  const retry = () => {
    setStatusError(false);
    setLoadingStatus(true);
    loadStatus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const key = appKey.trim();
    const secret = appSecret.trim();
    if (key.length !== APP_KEY_LEN) {
      setMessage({
        type: "error",
        text: `appKey는 ${APP_KEY_LEN}자여야 합니다. (현재 ${key.length}자)`,
      });
      return;
    }
    if (secret.length !== APP_SECRET_LEN) {
      setMessage({
        type: "error",
        text: `appSecret은 ${APP_SECRET_LEN}자여야 합니다. (현재 ${secret.length}자)`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const result = await registerKisCredential({
        appKey: key,
        appSecret: secret,
      });
      setStatus(result);
      // 전역 KIS 연동상태 갱신 — 계정 앞부분 뱃지·차트 분기가 연동 직후 바로 반영되도록.
      void useKisStore.getState().hydrate();
      setAppKey("");
      setAppSecret("");
    } catch (err) {
      const m = (err as { message?: string | string[] }).message;
      setMessage({
        type: "error",
        text: Array.isArray(m)
          ? (m[0] ?? "KIS 키 등록에 실패했습니다.")
          : (m ?? "KIS 키 등록에 실패했습니다."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 상태 조회 전에는 폼/등록뷰 대신 로딩 표시 (등록 유저에게 폼이 깜빡이는 것 방지).
  if (loadingStatus) {
    return (
      <p className="px-0.5 py-2 text-[12px] text-vscode-fg-desc">
        불러오는 중…
      </p>
    );
  }

  // 상태 조회 실패(500·네트워크) — 미등록과 구분해 안내.
  if (statusError) {
    return (
      <div className="auth-panel__fields">
        <AuthNotice
          type="error"
          text="KIS 연동 상태를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        />
        <div className="auth-panel__actions">
          <button type="button" className="auth-panel__button" onClick={retry}>
            <Codicon icon="codicon-refresh" size={14} />
            <span>다시 시도</span>
          </button>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  // 이미 등록된 경우 — 상태만 표시 (BE에 변경/삭제 엔드포인트 없음).
  if (status?.registered) {
    return (
      <div className="auth-panel__fields">
        <KisConnectedBadge
          maskedAppKey={status.maskedAppKey}
          registeredAt={status.registeredAt}
        />
        <p className="text-[11px] text-vscode-fg-desc">
          장중(평일 09~15시)에 관심 종목 시세가 자동 수집됩니다.
        </p>
        <p className="text-[11px] text-vscode-fg-desc">
          키 변경·삭제는 아직 지원되지 않습니다.
        </p>
        <div className="auth-panel__actions">
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-panel__fields" onSubmit={handleSubmit} noValidate>
      <p className="text-[12px] text-vscode-fg-desc">
        한국투자증권 OpenAPI 키를 등록하면 관심 종목 시세를 실시간으로
        받아옵니다. 키는 서버에 암호화되어 저장됩니다.
      </p>

      <AuthField
        label={`appKey (${APP_KEY_LEN}자)`}
        name="kis-app-key"
        type="text"
        placeholder="한국투자증권 appKey"
        value={appKey}
        onChange={setAppKey}
        autoComplete="off"
      />
      <AuthField
        label={`appSecret (${APP_SECRET_LEN}자)`}
        name="kis-app-secret"
        type="password"
        placeholder="한국투자증권 appSecret"
        value={appSecret}
        onChange={setAppSecret}
        autoComplete="off"
      />

      {message && <AuthNotice type={message.type} text={message.text} />}

      <div className="auth-panel__actions">
        <button
          type="submit"
          className="auth-panel__button"
          disabled={submitting}
        >
          <Codicon icon="codicon-plug" size={14} />
          <span>{submitting ? "등록 중…" : "KIS 연동"}</span>
        </button>
        <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
          취소
        </button>
      </div>
    </form>
  );
}
