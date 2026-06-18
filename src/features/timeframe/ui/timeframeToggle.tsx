"use client";

import { CapsuleToggle, type CapsuleToggleOption } from "@/shared/ui";
import {
  TIMEFRAMES,
  useTimeframeStore,
  type Timeframe,
} from "../model/timeframeStore";

const TIMEFRAME_OPTIONS: ReadonlyArray<CapsuleToggleOption<Timeframe>> =
  TIMEFRAMES.map((tf) => ({ value: tf, label: tf }));

/** 분봉(등락률 기간) 토글 — 공통 CapsuleToggle. 공유 store 로 리스트·상세가 같이 반영된다. */
export function TimeframeToggle({ className = "" }: { className?: string }) {
  const timeframe = useTimeframeStore((s) => s.timeframe);
  const setTimeframe = useTimeframeStore((s) => s.setTimeframe);
  return (
    <CapsuleToggle
      options={TIMEFRAME_OPTIONS}
      value={timeframe}
      onChange={setTimeframe}
      className={className}
    />
  );
}
