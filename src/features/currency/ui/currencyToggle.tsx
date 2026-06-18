"use client";

import { CapsuleToggle, type CapsuleToggleOption } from "@/shared/ui";
import type { DisplayCurrency } from "@/shared/lib";
import { useCurrencyStore } from "../model/currencyStore";

const CURRENCY_OPTIONS: ReadonlyArray<CapsuleToggleOption<DisplayCurrency>> = [
  { value: "USD", label: "$" },
  { value: "KRW", label: "원" },
];

/** 표시 통화 토글 (원/$) — 공통 CapsuleToggle. 공유 store 로 모든 가격에 반영된다. */
export function CurrencyToggle({ className = "" }: { className?: string }) {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  return (
    <CapsuleToggle
      options={CURRENCY_OPTIONS}
      value={currency}
      onChange={setCurrency}
      className={className}
      buttonClassName="min-w-5"
    />
  );
}
