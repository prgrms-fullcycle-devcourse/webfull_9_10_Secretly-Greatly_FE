import { Codicon } from "@/shared/ui";

interface KisConnectedBadgeProps {
  /** 있으면 마스킹된 appKey 표시 (상세). */
  maskedAppKey?: string | null;
  /** 있으면 등록일 표시 (상세). */
  registeredAt?: string | null;
}

/**
 * "✓ KIS 연동됨" 표시 카드 — 계정 패널·KIS 연동 패널 공용.
 * 표시 여부(연동됨)는 호출부가 제어하고, appKey·등록일 상세는 prop 으로 옵션 표시한다.
 */
export function KisConnectedBadge({
  maskedAppKey,
  registeredAt,
}: KisConnectedBadgeProps) {
  return (
    <div className="mt-1 rounded-sm border border-vscode-border-input px-3 py-3 text-[13px]">
      <div className="flex items-center gap-1.5 text-(--chart-up)">
        <Codicon icon="codicon-check" size={14} />
        <span>KIS 연동됨</span>
      </div>
      {maskedAppKey && (
        <div className="mt-1.5 text-[12px] text-vscode-fg-desc">
          appKey {maskedAppKey}
        </div>
      )}
      {registeredAt && (
        <div className="text-[11px] text-vscode-fg-desc">
          등록일 {new Date(registeredAt).toLocaleString("ko-KR")}
        </div>
      )}
    </div>
  );
}
