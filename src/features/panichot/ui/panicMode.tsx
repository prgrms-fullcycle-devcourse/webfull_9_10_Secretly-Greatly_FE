"use client";

/**
 * PanicMode — 패닉 핫키(ESC 두 번)로 거래 화면을 가리는 위장 오버레이.
 *
 * - ESC 를 짧은 간격으로 두 번 누르면 Source Control(git) 로 한창 작업 중인
 *   것처럼 보이는 풀스크린 위장 화면(SourceControlScene)이 떠서 실제 금융
 *   화면을 즉시 가린다.
 * - 위장 화면이 떠 있을 때 ESC 를 다시 누르면 닫힌다.
 * - 위장 목적이라 화면에는 금융 용어/요소를 전혀 노출하지 않는다.
 *
 * (설정 화면은 더 이상 패닉이 아니며 widgets/settingsPanel 로 분리되었다.)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { SourceControlScene } from "./sourceControlScene";

/** ESC 두 번을 '더블 프레스'로 인정하는 최대 간격(ms). */
const DOUBLE_PRESS_MS = 500;

export function PanicMode() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const lastEscRef = useRef(0);

  const setPanic = useCallback((next: boolean) => {
    openRef.current = next;
    setOpen(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      // 위장 화면이 떠 있으면 ESC 한 번으로 닫는다.
      if (openRef.current) {
        lastEscRef.current = 0;
        setPanic(false);
        return;
      }

      // 닫힌 상태: 짧은 간격의 두 번째 ESC 면 연다.
      const now = Date.now();
      if (now - lastEscRef.current <= DOUBLE_PRESS_MS) {
        lastEscRef.current = 0;
        setPanic(true);
      } else {
        lastEscRef.current = now;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPanic]);

  if (!open) return null;
  return <SourceControlScene />;
}
