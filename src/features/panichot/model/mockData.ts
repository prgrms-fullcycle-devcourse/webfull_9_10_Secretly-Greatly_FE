/**
 * Source Control 위장 화면용 목데이터.
 *
 * 패닉 핫키가 띄우는 "열심히 작업 중" 위장 씬에서 사용한다. 실제 금융 화면을
 * 가리고 git 작업처럼 보이게 하는 게 목적이라 전부 정적 더미 데이터다.
 * 레이아웃은 VS Code + Git Graph 확장(사이드바 하단 그래프)을 본떴다.
 */

/* ── 리포지토리 / 변경 파일 ─────────────────────────────── */
export type FileStatus = "M" | "A" | "D" | "U" | "R";

export interface ChangedFile {
  name: string;
  dir: string;
  status: FileStatus;
}

export interface Repo {
  name: string;
  branch: string;
  changes: ChangedFile[];
}

export const REPOS: Repo[] = [
  {
    name: "backend",
    branch: "dev",
    changes: [
      { name: "chat.service.ts", dir: "src/modules/chat", status: "M" },
      { name: "chat.gateway.ts", dir: "src/modules/chat", status: "M" },
      { name: "README.md", dir: "backend", status: "M" },
    ],
  },
  {
    name: "frontend",
    branch: "main",
    changes: [
      { name: "statCard.tsx", dir: "src/widgets/statCard/ui", status: "M" },
      { name: "chatPanel.tsx", dir: "src/features/chat/ui", status: "M" },
      { name: "ideShell.tsx", dir: "src/views", status: "M" },
    ],
  },
];

/* ── 커밋 그래프(사이드바 GRAPH 패널) ───────────────────── */
export interface GraphCommit {
  hash: string;
  lane: number;
  mergeFromLane?: number;
  message: string;
  author: string;
  refs?: { label: string; kind: "head" | "branch" | "remote" | "tag" }[];
  /** 머지 커밋 여부(메시지 굵게 + 빈 점) */
  merge?: boolean;
}

/** 레인 색 — 인덱스 = 레인 번호. */
export const LANE_COLORS = ["#4FC1FF", "#E2A03F", "#89D185", "#C586C0"];

export const GRAPH_BRANCH = "backend";

export const GRAPH_COMMITS: GraphCommit[] = [
  {
    hash: "f57aa01",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #57 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
    refs: [
      { label: "dev", kind: "branch" },
      { label: "origin/dev", kind: "remote" },
    ],
  },
  {
    hash: "a91c0d2",
    lane: 1,
    message: "refactor: 모듈 의존성 구조 개선 및 임포트 경로 정규화",
    author: "seoyun-lee",
  },
  {
    hash: "b22d1e7",
    lane: 1,
    message: "refactor: 구조 수정",
    author: "seoyun-lee",
  },
  {
    hash: "c03e2f9",
    lane: 1,
    message: "chore: 빌드 환경 설정 수정 및 의존성 보안 업데이트",
    author: "seoyun-lee",
  },
  {
    hash: "d56b110",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #56 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
  {
    hash: "e7790ab",
    lane: 1,
    message: "fix: 마이페이지 모듈 등록",
    author: "seoyun-lee",
  },
  {
    hash: "55ab7c0",
    lane: 0,
    merge: true,
    mergeFromLane: 2,
    message: "Merge pull request #55 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
  { hash: "0a1b2c3", lane: 2, message: ".gitignore", author: "seoyun-lee" },
  {
    hash: "1c2d3e4",
    lane: 2,
    message: "feat: 사용자 닉네임 수정 API 구현 및 Swagger 명세 추가",
    author: "seoyun-lee",
  },
  {
    hash: "2d3e4f5",
    lane: 2,
    message: "refactor: 개인 정보 관리 로직을 전용 mypage 모듈로 분리",
    author: "seoyun-lee",
  },
  {
    hash: "3e4f506",
    lane: 2,
    message: "chore: tsconfig 설정 최적화 및 의존성 보안 업데이트",
    author: "seoyun-lee",
  },
  {
    hash: "53c1aa9",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #53 from prgrms-fullcycle-devcourse",
    author: "minseo",
  },
  {
    hash: "4f50617",
    lane: 1,
    message: "feat: 방 종료 API 엔드포인트 추가 및 Swagger 명세 추가",
    author: "seoyun-lee",
  },
  {
    hash: "5061728",
    lane: 1,
    message: "feat: 방 수동 종료 로직 및 종료 이력 저장 기능 구현",
    author: "seoyun-lee",
  },
  {
    hash: "6172839",
    lane: 1,
    message: "feat: 방 종료 응답을 위한 DTO 정의",
    author: "seoyun-lee",
  },
  {
    hash: "51aa3b0",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #51 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
  {
    hash: "728394a",
    lane: 1,
    message: "feat: 방 목록 조회 API 구현 및 Swagger 명세 추가",
    author: "seoyun-lee",
  },
  {
    hash: "8394ab1",
    lane: 1,
    message: "feat: 내가 생성하거나 참여한 방 목록 조회 로직 구현",
    author: "seoyun-lee",
  },
  {
    hash: "94ab1c2",
    lane: 1,
    message: "feat: 방 목록 조회 응답을 위한 DTO 정의",
    author: "seoyun-lee",
  },
  {
    hash: "49cc1d0",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #49 from prgrms-fullcycle-devcourse",
    author: "jiwon",
  },
  {
    hash: "ab1c2d3",
    lane: 1,
    message: "fix: 방 상세 조회 로직 수정",
    author: "seoyun-lee",
  },
  {
    hash: "48dd2e1",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #48 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
  {
    hash: "bc2d3e4",
    lane: 1,
    message: "fix: 방 상세 조회 로직 수정",
    author: "seoyun-lee",
  },
  {
    hash: "47ee3f2",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #47 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
  {
    hash: "cd3e4f5",
    lane: 1,
    message: "fix: 방 상세 조회 로직 수정",
    author: "seoyun-lee",
  },
  {
    hash: "46ff405",
    lane: 0,
    merge: true,
    mergeFromLane: 1,
    message: "Merge pull request #46 from prgrms-fullcycle-devcourse",
    author: "seoyun-lee",
  },
];

/* ── 에디터에 열리는 파일(임의의 tsx 코드) ───────────────── */
export const CODE_FILE = "statCard.tsx";
export const CODE_BREADCRUMB = [
  "src",
  "widgets",
  "statCard",
  "ui",
  "statCard.tsx",
];

/* ── 수정 전/후 diff (split view) ───────────────────────── */
export type DiffRowType = "context" | "del" | "add" | "change";

export interface DiffRow {
  type: DiffRowType;
  left?: { no: number; text: string };
  right?: { no: number; text: string };
}

export const DIFF_HUNK = "@@ -1,15 +1,21 @@ StatCard";

export const DIFF_ROWS: DiffRow[] = [
  { type: "add", right: { no: 1, text: 'import { useMemo } from "react";' } },
  { type: "context", left: { no: 1, text: "" }, right: { no: 2, text: "" } },
  {
    type: "context",
    left: {
      no: 7,
      text: 'export function StatCard({ label, value, delta = 0, unit = "" }: StatCardProps) {',
    },
    right: {
      no: 8,
      text: 'export function StatCard({ label, value, delta = 0, unit = "" }: StatCardProps) {',
    },
  },
  {
    type: "del",
    left: {
      no: 8,
      text: '  const color = delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#8b949e";',
    },
  },
  {
    type: "del",
    left: { no: 9, text: '  const sign = delta > 0 ? "+" : "";' },
  },
  { type: "add", right: { no: 9, text: "  const trend = useMemo(() => {" } },
  {
    type: "add",
    right: {
      no: 10,
      text: '    if (delta > 0) return { sign: "+", color: "#16a34a" };',
    },
  },
  {
    type: "add",
    right: {
      no: 11,
      text: '    if (delta < 0) return { sign: "", color: "#dc2626" };',
    },
  },
  {
    type: "add",
    right: { no: 12, text: '    return { sign: "", color: "#8b949e" };' },
  },
  { type: "add", right: { no: 13, text: "  }, [delta]);" } },
  { type: "context", left: { no: 10, text: "" }, right: { no: 14, text: "" } },
  {
    type: "change",
    left: { no: 11, text: "  const formatted = value.toLocaleString();" },
    right: {
      no: 15,
      text: '  const formatted = new Intl.NumberFormat("ko-KR").format(value);',
    },
  },
  {
    type: "context",
    left: { no: 12, text: "  return (" },
    right: { no: 16, text: "  return (" },
  },
  {
    type: "change",
    left: { no: 13, text: "      <span style={{ color }}>" },
    right: { no: 17, text: "      <span style={{ color: trend.color }}>" },
  },
  {
    type: "change",
    left: { no: 14, text: "        {sign}" },
    right: { no: 18, text: "        {trend.sign}" },
  },
  {
    type: "context",
    left: { no: 15, text: "        {delta}%" },
    right: { no: 19, text: "        {delta}%" },
  },
];
export const CODE_SRC = `import { useMemo } from "react";

interface StatCardProps {
  label: string;
  value: number;
  delta?: number;
  unit?: string;
}

// 숫자 지표를 보여주는 작은 카드. delta 부호에 따라 색이 바뀐다.
export function StatCard({ label, value, delta = 0, unit = "" }: StatCardProps) {
  const trend = useMemo(() => {
    if (delta > 0) return { sign: "+", color: "#16a34a" };
    if (delta < 0) return { sign: "", color: "#dc2626" };
    return { sign: "", color: "#8b949e" };
  }, [delta]);

  const formatted = new Intl.NumberFormat("ko-KR").format(value);

  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-xs text-gray-500">{label}</span>
      <strong className="text-2xl font-semibold">
        {formatted}
        {unit}
      </strong>
      {delta !== 0 && (
        <span style={{ color: trend.color }} className="text-sm">
          {trend.sign}
          {delta}%
        </span>
      )}
    </div>
  );
}

export default StatCard;
`;
