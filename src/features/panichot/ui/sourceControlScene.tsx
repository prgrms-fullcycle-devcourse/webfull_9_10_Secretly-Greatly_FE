"use client";

/**
 * SourceControlScene — 패닉 핫키가 띄우는 Source Control(git) 위장 전체화면.
 *
 * VS Code + Git Graph 확장 레이아웃을 본떴다:
 *  - 좌측 사이드바: SOURCE CONTROL(REPOSITORIES · CHANGES) + 하단 GRAPH 패널
 *  - 에디터: .tsx 파일의 수정 전/후 diff(split)
 * 실제 금융 화면을 즉시 가리되 한창 작업 중인 것처럼 보이게 한다. 전부 더미.
 */

import { type ReactNode } from "react";
import { Codicon } from "@/shared/ui";
import {
  CODE_BREADCRUMB,
  CODE_FILE,
  DIFF_HUNK,
  DIFF_ROWS,
  GRAPH_BRANCH,
  GRAPH_COMMITS,
  LANE_COLORS,
  REPOS,
} from "../model";

/* ── 간단한 TS/TSX 신택스 하이라이트 ───────────────────── */
const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
  "let",
  "var",
  "return",
  "function",
  "interface",
  "type",
  "if",
  "else",
  "new",
  "async",
  "await",
  "for",
  "while",
]);

function renderCode(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|([A-Za-z_$][A-Za-z0-9_$]*)|([^A-Za-z0-9_$]+)/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) {
      nodes.push(
        <span key={key++} className="text-[#6a9955]">
          {m[1]}
        </span>,
      );
    } else if (m[2]) {
      nodes.push(
        <span key={key++} className="text-[#ce9178]">
          {m[2]}
        </span>,
      );
    } else if (m[3]) {
      const w = m[3];
      const cls = KEYWORDS.has(w)
        ? "text-[#569cd6]"
        : /^[A-Z]/.test(w)
          ? "text-[#4ec9b0]"
          : "text-[#9cdcfe]";
      nodes.push(
        <span key={key++} className={cls}>
          {w}
        </span>,
      );
    } else {
      nodes.push(<span key={key++}>{m[0]}</span>);
    }
  }
  return nodes;
}

/* ── 수정 전/후 diff (split) ───────────────────────────── */
function DiffCell({
  cell,
  tone,
}: {
  cell?: { no: number; text: string };
  tone: "del" | "add" | "none";
}) {
  const bg =
    tone === "del"
      ? "bg-[#5a1d1d]/35"
      : tone === "add"
        ? "bg-[#1d3a1d]/45"
        : "";
  const sign = tone === "del" ? "-" : tone === "add" ? "+" : "";
  const signColor =
    tone === "del"
      ? "text-[#f48771]"
      : tone === "add"
        ? "text-[#89d185]"
        : "text-transparent";
  return (
    <div className={`flex min-w-0 flex-1 ${bg}`}>
      <span className="w-10 shrink-0 select-none pr-2 text-right text-[11px] text-vscode-fg-desc/50">
        {cell?.no ?? ""}
      </span>
      <span className={`w-3 shrink-0 select-none text-center ${signColor}`}>
        {sign}
      </span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-3">
        {cell ? (cell.text === "" ? " " : renderCode(cell.text)) : null}
      </span>
    </div>
  );
}

function DiffEditor() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-vscode-editor font-mono text-[13px] leading-[20px]">
      <div className="px-3 py-1 text-[#75beff]">{DIFF_HUNK}</div>
      {DIFF_ROWS.map((row, i) => {
        const leftTone =
          row.type === "del" || row.type === "change" ? "del" : "none";
        const rightTone =
          row.type === "add" || row.type === "change" ? "add" : "none";
        return (
          <div key={i} className="flex">
            <DiffCell cell={row.left} tone={leftTone} />
            <div className="w-px shrink-0 bg-vscode-border-panel/50" />
            <DiffCell cell={row.right} tone={rightTone} />
          </div>
        );
      })}
    </div>
  );
}

/* ── 사이드바: 섹션 헤더 ────────────────────────────────── */
function SectionHeader({
  label,
  badge,
  actions,
}: {
  label: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex h-[24px] items-center gap-1 px-2">
      <Codicon
        icon="codicon-chevron-down"
        size={14}
        className="text-vscode-fg-icon"
      />
      <span className="flex-1 text-(length:--font-size-sm) font-bold uppercase tracking-[0.04em] text-vscode-fg-sidebar">
        {label}
      </span>
      {badge}
      {actions && (
        <span className="flex items-center gap-2 text-vscode-fg-icon">
          {actions}
        </span>
      )}
    </div>
  );
}

/* ── 사이드바: REPOSITORIES + CHANGES + GRAPH ──────────── */
function ScmSidebar() {
  const totalChanges = REPOS.reduce((n, r) => n + r.changes.length, 0);
  return (
    <aside className="flex w-[330px] shrink-0 flex-col overflow-hidden border-r border-vscode-border-sidebar bg-vscode-sidebar text-vscode-fg-sidebar">
      <div className="sidebar-view-title flex h-[35px] items-center justify-between px-3">
        <span className="text-(length:--font-size-sm) font-bold uppercase tracking-[0.04em]">
          Source Control
        </span>
        <Codicon
          icon="codicon-ellipsis"
          size={16}
          className="text-vscode-fg-icon"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* REPOSITORIES */}
        <SectionHeader label="Repositories" />
        {REPOS.map((r) => (
          <div
            key={r.name}
            className="flex h-[26px] items-center gap-2 px-3 text-(length:--font-size-md) hover:bg-(--vscode-list-hoverBackground)"
          >
            <Codicon
              icon="codicon-repo"
              size={14}
              className="text-vscode-fg-icon"
            />
            <span className="flex-1 truncate text-vscode-fg">{r.name}</span>
            <span className="flex items-center gap-1 text-(length:--font-size-sm) text-vscode-fg-desc">
              <Codicon icon="codicon-git-branch" size={12} /> {r.branch}
            </span>
            <Codicon
              icon="codicon-sync"
              size={13}
              className="text-vscode-fg-icon"
            />
          </div>
        ))}

        {/* CHANGES */}
        <div className="mt-1">
          <SectionHeader
            label="Changes"
            badge={
              <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-(--vscode-badge-background) px-1 text-[10px] text-(--vscode-badge-foreground)">
                {totalChanges}
              </span>
            }
          />
          {REPOS.map((r) => (
            <div key={r.name} className="px-2 pb-3">
              <div className="flex h-[24px] items-center gap-2 px-1 text-(length:--font-size-md)">
                <span className="flex-1 truncate font-medium text-vscode-fg">
                  {r.name}
                </span>
                <span className="flex items-center gap-1 text-(length:--font-size-sm) text-vscode-fg-desc">
                  <Codicon icon="codicon-git-branch" size={11} /> {r.branch}
                </span>
                <Codicon
                  icon="codicon-discard"
                  size={13}
                  className="text-vscode-fg-icon"
                />
                <Codicon
                  icon="codicon-refresh"
                  size={13}
                  className="text-vscode-fg-icon"
                />
              </div>

              <input
                readOnly
                placeholder={`Message (⌘Enter to commit on "${r.branch}")`}
                className="mt-1 mb-1.5 h-[30px] w-full rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none placeholder:text-(--vscode-input-placeholderForeground)"
              />

              {/* VS Code 스타일 split commit 버튼 */}
              <div className="flex h-[28px] w-full overflow-hidden rounded-(--radius-xs) bg-(--vscode-button-background) text-(--vscode-button-foreground)">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 text-(length:--font-size-md) hover:bg-black/10"
                >
                  <Codicon icon="codicon-check" size={13} /> Commit
                </button>
                <span className="flex w-7 items-center justify-center border-l border-black/20 hover:bg-black/10">
                  <Codicon icon="codicon-chevron-down" size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* GRAPH — Source Control 아래 */}
        <div className="mt-1 flex min-h-0 flex-1 flex-col border-t border-vscode-border-sidebar">
          <SectionHeader
            label="Graph"
            actions={
              <>
                <span className="flex items-center gap-1 text-(length:--font-size-sm) normal-case">
                  <Codicon icon="codicon-git-branch" size={12} /> {GRAPH_BRANCH}
                </span>
                <Codicon icon="codicon-refresh" size={14} />
                <Codicon icon="codicon-ellipsis" size={14} />
              </>
            }
          />
          <div className="min-h-0 flex-1 overflow-auto">
            <GitGraph />
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Git Graph(사이드바 내부, 컴팩트) ──────────────────── */
const ROW_H = 28;
const LANE_W = 13;
const PAD = 12;

function GitGraph() {
  const maxLane = GRAPH_COMMITS.reduce((m, c) => Math.max(m, c.lane), 0);
  const gutterW = PAD * 2 + maxLane * LANE_W;
  const height = GRAPH_COMMITS.length * ROW_H;
  const laneX = (lane: number) => PAD + lane * LANE_W;
  const rowY = (i: number) => i * ROW_H + ROW_H / 2;

  const lastIdxOfLane = new Map<number, number>();
  GRAPH_COMMITS.forEach((c, i) => lastIdxOfLane.set(c.lane, i));

  return (
    <div className="flex" style={{ minHeight: height }}>
      <svg
        width={gutterW}
        height={height}
        className="shrink-0"
        style={{ minWidth: gutterW }}
      >
        {Array.from({ length: maxLane + 1 }).map((_, l) => {
          const last = lastIdxOfLane.get(l);
          if (last == null) return null;
          return (
            <line
              key={l}
              x1={laneX(l)}
              y1={ROW_H / 2}
              x2={laneX(l)}
              y2={rowY(last)}
              stroke={LANE_COLORS[l % LANE_COLORS.length]}
              strokeWidth={1.6}
              opacity={0.6}
            />
          );
        })}
        {GRAPH_COMMITS.map((c, i) =>
          c.mergeFromLane != null ? (
            <path
              key={`m-${i}`}
              d={`M ${laneX(c.lane)} ${rowY(i)} C ${laneX(c.lane)} ${rowY(i) + ROW_H / 2} ${laneX(
                c.mergeFromLane,
              )} ${rowY(i) + ROW_H / 2} ${laneX(c.mergeFromLane)} ${rowY(i) + ROW_H}`}
              fill="none"
              stroke={LANE_COLORS[c.mergeFromLane % LANE_COLORS.length]}
              strokeWidth={1.6}
              opacity={0.7}
            />
          ) : null,
        )}
        {GRAPH_COMMITS.map((c, i) => (
          <circle
            key={`d-${i}`}
            cx={laneX(c.lane)}
            cy={rowY(i)}
            r={4}
            fill={
              c.merge
                ? "var(--vscode-sideBar-background,#181818)"
                : LANE_COLORS[c.lane % LANE_COLORS.length]
            }
            stroke={LANE_COLORS[c.lane % LANE_COLORS.length]}
            strokeWidth={1.8}
          />
        ))}
      </svg>

      <div className="min-w-0 flex-1">
        {GRAPH_COMMITS.map((c) => (
          <div
            key={c.hash}
            className="flex items-center gap-1.5 pr-2 hover:bg-(--vscode-list-hoverBackground)"
            style={{ height: ROW_H }}
          >
            {c.refs?.map((r) => (
              <span
                key={r.label}
                className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-[1px] text-[10px] ${
                  r.kind === "remote"
                    ? "bg-[#8957e5]/20 text-[#d2a8ff]"
                    : "bg-[#1f6feb]/25 text-[#79c0ff]"
                }`}
              >
                {r.kind === "remote" ? (
                  <Codicon icon="codicon-cloud" size={10} />
                ) : (
                  <Codicon icon="codicon-git-branch" size={10} />
                )}
                {r.label}
              </span>
            ))}
            <span
              className={`min-w-0 flex-1 truncate text-(length:--font-size-md) ${
                c.merge ? "font-semibold text-vscode-fg" : "text-vscode-fg"
              }`}
            >
              {c.message}
            </span>
            <span className="shrink-0 text-(length:--font-size-sm) text-vscode-fg-desc/80">
              {c.author}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 위장 전체화면 ─────────────────────────────────────── */
const ACTIVITY_ICONS = [
  "codicon-files",
  "codicon-search",
  "codicon-source-control",
  "codicon-run",
  "codicon-extensions",
];

export function SourceControlScene() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-vscode-window font-sans text-vscode-fg">
      {/* 타이틀 바 */}
      <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-vscode-border-sidebar bg-vscode-activitybar px-3 text-(length:--font-size-sm) text-vscode-fg-desc">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto">
          {CODE_FILE} (Working Tree) — secretly-greatly — Visual Studio Code
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 활동바 */}
        <aside className="flex w-(--activitybar-width) shrink-0 flex-col items-center border-r border-vscode-border-activity bg-vscode-activitybar py-2">
          {ACTIVITY_ICONS.map((icon) => (
            <div
              key={icon}
              className="activity-bar-btn"
              data-active={icon === "codicon-source-control"}
            >
              <Codicon icon={icon} size={24} />
            </div>
          ))}
        </aside>

        <ScmSidebar />

        {/* 에디터: tsx 수정 전/후 diff */}
        <div className="flex min-w-0 flex-1 flex-col bg-vscode-editor">
          <div className="flex h-[35px] shrink-0 items-end bg-vscode-tab-inactive text-(length:--font-size-md)">
            <span className="flex h-full items-center gap-1.5 border-r border-vscode-border-panel bg-vscode-editor px-3 text-vscode-fg">
              <Codicon
                icon="codicon-git-compare"
                size={13}
                className="text-[#75beff]"
              />
              {CODE_FILE} (Working Tree)
              <Codicon
                icon="codicon-close"
                size={12}
                className="ml-1 text-vscode-fg-icon"
              />
            </span>
          </div>
          <div className="flex h-[26px] shrink-0 items-center gap-1 border-b border-vscode-border-panel px-3 text-(length:--font-size-sm) text-vscode-fg-desc">
            {CODE_BREADCRUMB.map((seg, i) => (
              <span key={seg} className="flex items-center gap-1">
                {i > 0 && <Codicon icon="codicon-chevron-right" size={12} />}
                <span
                  className={
                    i === CODE_BREADCRUMB.length - 1 ? "text-vscode-fg" : ""
                  }
                >
                  {seg}
                </span>
              </span>
            ))}
            <span className="ml-auto flex items-center gap-3 text-vscode-fg-desc">
              <span className="text-[#f48771]">-2</span>
              <span className="text-[#89d185]">+8</span>
            </span>
          </div>
          <DiffEditor />
        </div>
      </div>

      {/* 상태바 */}
      <div className="flex h-[22px] shrink-0 items-center gap-3 border-t border-vscode-border-statusbar bg-vscode-statusbar px-3 text-[11px] text-vscode-fg-statusbar">
        <span className="flex items-center gap-1">
          <Codicon icon="codicon-git-branch" size={12} /> {GRAPH_BRANCH}
        </span>
        <span className="flex items-center gap-1">
          <Codicon icon="codicon-sync" size={12} /> 2↑ 0↓
        </span>
        <span className="flex items-center gap-1">
          <Codicon icon="codicon-error" size={12} /> 0
          <Codicon icon="codicon-warning" size={12} className="ml-1" /> 0
        </span>
        <span className="ml-auto">TypeScript React</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Prettier</span>
      </div>
    </div>
  );
}
