import { useEffect, useRef, useState } from "react";

/**
 * 자동 갱신 카운트다운 + 폴링 공통 훅 (시세 리스트·차트가 함께 사용).
 * 1초마다 카운트다운을 깎고, 0이 되면 onRefresh 를 호출한 뒤 다시 채운다.
 * restartKey 가 바뀌면 즉시 1회 호출 + 타이머 재시작 (종목/시장 전환 등).
 *
 * onRefresh 는 `(isActive) => void` — 비동기 응답을 반영하기 전에 `isActive()` 로
 * 언마운트/재시작 여부를 확인해 stale 한 setState 를 막는다.
 *
 * @returns 다음 갱신까지 남은 초
 */
export function useRefreshCountdown(
  onRefresh: (isActive: () => boolean) => void,
  restartKey: string,
  refreshSec = 5,
): number {
  const [secondsLeft, setSecondsLeft] = useState(refreshSec);
  const onRefreshRef = useRef(onRefresh);

  // 항상 최신 onRefresh 참조 (타이머 effect 를 재실행하지 않고 갱신).
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useEffect(() => {
    let active = true;
    const isActive = () => active;
    let left = refreshSec;
    onRefreshRef.current(isActive);
    const timer = window.setInterval(() => {
      if (!active) return;
      left = left <= 1 ? refreshSec : left - 1;
      if (left === refreshSec) onRefreshRef.current(isActive);
      setSecondsLeft(left);
    }, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [restartKey, refreshSec]);

  return secondsLeft;
}
