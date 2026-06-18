/** 다음 자동 갱신까지 남은 초 표시 (라이브 ● + N초) — 시세 리스트·차트 공통. */
export function RefreshCountdown({ seconds }: { seconds: number }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[11px] text-vscode-fg-desc tabular-nums">
      <span className="h-1.5 w-1.5 rounded-full bg-(--chart-up)" />
      {seconds}초
    </span>
  );
}
