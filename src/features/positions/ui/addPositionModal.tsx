"use client";

/**
 * AddPositionModal — 보유종목 추가 모달.
 *
 * 검색·시트·상세의 + 진입점이 `useAddPositionModal.open(target)` 으로 띄운다.
 * 매수가·수량을 입력받아 BE 에 POST(`addPositionForStock`)한다. stockId 가 없으면
 * 내부적으로 종목코드로 조회해 해석한다. ideShell 에 1회 마운트된다.
 */

import { useState } from "react";
import { Codicon } from "@/shared/ui";
import {
  useAddPositionModal,
  type AddPositionTarget,
} from "../model/addPositionModal";
import { addPositionForStock } from "../model/positionsSync";

const inputClass =
  "h-8 w-full rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 text-right font-mono text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focus)";

function toNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function AddPositionForm({ target }: { target: AddPositionTarget }) {
  const close = useAddPositionModal((s) => s.close);

  const defaultPrice =
    typeof target.price === "string"
      ? Number.parseFloat(target.price) || 0
      : (target.price ?? 0);

  const [price, setPrice] = useState(defaultPrice);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (price <= 0 || quantity <= 0) {
      setError("매수가와 수량은 0보다 커야 합니다.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await addPositionForStock({
        stockId: target.stockId,
        code: target.code,
        purchasePrice: price,
        purchaseQuantity: quantity,
      });
      close();
    } catch (err) {
      setError(
        (err as { message?: string })?.message ?? "등록에 실패했습니다.",
      );
      setPending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="보유종목 추가"
      className="w-[340px] rounded-(--radius-md) border border-vscode-border-panel bg-vscode-editor p-5 shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-sans font-medium text-vscode-fg">
            {target.name}
          </span>
          <span className="font-mono text-(length:--font-size-sm) text-vscode-fg-desc">
            {target.code}
          </span>
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={close}
          className="flex h-6 w-6 items-center justify-center rounded-(--radius-xs) text-vscode-fg-icon hover:bg-(--vscode-list-hoverBackground)"
        >
          <Codicon icon="codicon-close" size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-(length:--font-size-sm) text-vscode-fg-desc">
            매수가
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            autoFocus
            value={Number.isFinite(price) ? price : ""}
            onChange={(e) => setPrice(toNumber(e.target.valueAsNumber))}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-(length:--font-size-sm) text-vscode-fg-desc">
            수량
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={Number.isFinite(quantity) ? quantity : ""}
            onChange={(e) => setQuantity(toNumber(e.target.valueAsNumber))}
            className={inputClass}
          />
        </label>

        {error && (
          <p className="text-(length:--font-size-sm) text-(--vscode-errorForeground)">
            {error}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="h-8 rounded-(--radius-xs) bg-(--vscode-button-secondaryBackground) px-3 text-(length:--font-size-md) text-(--vscode-button-secondaryForeground) hover:bg-(--vscode-button-secondaryHoverBackground)"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="h-8 rounded-(--radius-xs) bg-(--vscode-button-background) px-3 text-(length:--font-size-md) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground) disabled:opacity-60"
          >
            {pending ? "등록 중…" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddPositionModal() {
  const target = useAddPositionModal((s) => s.target);
  const close = useAddPositionModal((s) => s.close);

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-overlay) flex items-center justify-center bg-black/50"
      onClick={close}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {/* key=code: 대상이 바뀌면 입력 기본값으로 재마운트 */}
        <AddPositionForm key={target.code} target={target} />
      </div>
    </div>
  );
}
