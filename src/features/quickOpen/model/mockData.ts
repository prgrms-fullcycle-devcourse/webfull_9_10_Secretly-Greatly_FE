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
    filename: "ALL.sheet",
    name: "ALL.sheet",
    path: "Secretly_Greatly\\src\\stocks",
  },
  {
    filename: "DOMESTIC.sheet",
    name: "DOMESTIC.sheet",
    path: "Secretly_Greatly\\src\\stocks",
  },
  {
    filename: "OVERSEAS.sheet",
    name: "OVERSEAS.sheet",
    path: "Secretly_Greatly\\src\\stocks",
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
