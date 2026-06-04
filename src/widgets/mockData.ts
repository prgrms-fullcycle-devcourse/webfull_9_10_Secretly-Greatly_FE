import type { NotificationItem } from "@/shared/ui";
import type { TreeNode } from "@/widgets/sidebar";

/* ─────────────────────────────────────────────────────────
   Editor Group
───────────────────────────────────────────────────────── */
export interface MockTab {
  id: string;
  filename: string;
  path: string[];
  content: string[];
}

/* ─────────────────────────────────────────────────────────
   Explorer Tree
───────────────────────────────────────────────────────── */
export const EXPLORER_TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "app",
        name: "app",
        type: "folder",
        children: [
          {
            id: "app-auth",
            name: "(auth)",
            type: "folder",
            children: [
              {
                id: "app-auth-login",
                name: "login",
                type: "folder",
                children: [
                  { id: "app-auth-login-page", name: "page.tsx", type: "file" },
                ],
              },
              {
                id: "app-auth-register",
                name: "register",
                type: "folder",
                children: [
                  {
                    id: "app-auth-register-page",
                    name: "page.tsx",
                    type: "file",
                  },
                ],
              },
            ],
          },
          { id: "app-layout", name: "layout.tsx", type: "file" },
          { id: "app-page", name: "page.tsx", type: "file" },
          { id: "app-globals", name: "globals.css", type: "file" },
        ],
      },
      { id: "views", name: "views", type: "folder", children: [] },
      {
        id: "widgets",
        name: "widgets",
        type: "folder",
        children: [
          "editor-panel",
          "ide-shell",
          "sidebar",
          "status-bar",
          "terminal-panel",
        ].map((name) => ({
          id: `widget-${name}`,
          name,
          type: "folder" as const,
          children: [],
        })),
      },
      {
        id: "features",
        name: "features",
        type: "folder",
        children: [
          "auth",
          "watchlist",
          "market",
          "alerts",
          "chat",
          "command-palette",
          "positions",
          "news",
          "settings",
          "panic-mode",
        ].map((name) => ({
          id: name,
          name,
          type: "folder" as const,
          children: ["api", "model", "ui"].map((sub) => ({
            id: `${name}-${sub}`,
            name: sub,
            type: "folder" as const,
            children: [],
          })),
        })),
      },
      { id: "entities", name: "entities", type: "folder", children: [] },
      {
        id: "shared",
        name: "shared",
        type: "folder",
        children: [
          "api",
          "config",
          "hooks",
          "lib",
          "styles",
          "testing",
          "types",
          "ui",
        ].map((name) => ({
          id: `shared-${name}`,
          name,
          type: "folder" as const,
          children: [],
        })),
      },
      {
        id: "mocks",
        name: "mocks",
        type: "folder",
        children: [
          { id: "mocks-browser", name: "browser.ts", type: "file" },
          {
            id: "mocks-handlers",
            name: "handlers",
            type: "folder",
            children: [
              { id: "mocks-handlers-health", name: "health.ts", type: "file" },
              { id: "mocks-handlers-index", name: "index.ts", type: "file" },
            ],
          },
          { id: "mocks-provider", name: "mswProvider.tsx", type: "file" },
          { id: "mocks-server", name: "server.ts", type: "file" },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Quick Open
───────────────────────────────────────────────────────── */
export interface QuickAction {
  icon: string;
  label: string;
  suffix?: string;
  shortcut?: string[];
}

export interface RecentFile {
  filename: string;
  iconColor?: string;
  name: string;
  path: string;
  tag?: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { icon: "codicon-file", label: "Go to File", shortcut: ["Ctrl", "P"] },
  {
    icon: "codicon-chevron-right",
    label: "Show and Run Commands",
    shortcut: ["Ctrl", "Shift", "P"],
    suffix: ">",
  },
  { icon: "codicon-search", label: "Search for Text", suffix: "%" },
  {
    icon: "codicon-comment",
    label: "Open Quick Chat",
    shortcut: ["Ctrl", "Shift", "Alt", "L"],
  },
  {
    icon: "codicon-symbol-class",
    label: "Go to Symbol in Editor",
    suffix: "@",
  },
  { icon: "codicon-run", label: "Start Debugging", suffix: "debug" },
  { icon: "codicon-terminal", label: "Run Task", suffix: "task" },
  { icon: "codicon-info", label: "More", suffix: "?" },
];

export const RECENT_FILES: RecentFile[] = [
  {
    filename: "pnpm-lock.yaml",
    iconColor: "#e2c08d",
    name: "pnpm-lock.yaml",
    path: "Secretly_Greatly",
    tag: "recently opened",
  },
  {
    filename: "page.tsx",
    iconColor: "#61afef",
    name: "page.tsx",
    path: "Secretly_Greatly\\src\\app\\(auth)\\login",
  },
  {
    filename: "PRD-vscode-design-system.md",
    name: "PRD-vscode-design-system.md",
    path: "Secretly_Greatly",
  },
  {
    filename: "index.ts",
    name: "index.ts",
    path: "Secretly_Greatly\\src\\shared\\types",
  },
  {
    filename: ".gitignore",
    iconColor: "#e06c75",
    name: ".gitignore",
    path: "Secretly_Greatly\\.husky\\",
  },
  {
    filename: "LICENSE",
    iconColor: "#d4a953",
    name: "LICENSE",
    path: "Secretly_Greatly",
  },
];

/* ─────────────────────────────────────────────────────────
   Notifications (기본 샘플 — 실제 데이터로 교체하세요)
───────────────────────────────────────────────────────── */
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    severity: "error",
    message: "BTC-KRW 변동성 임계치 도달 (-3.42% · 15분).",
    source: "Terminal Alert",
    actions: [{ label: "Open", primary: true, dismissOnClick: true }],
  },
  {
    id: "2",
    message: "삼성전자 어제 대비 (+3.58% · 5분).",
    source: "Market Stock",
    actions: [{ label: "Open", primary: true, dismissOnClick: true }],
  },
];
