import type { TreeNode } from "../ui/treeView";

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
        id: "news",
        name: "news",
        type: "folder",
        children: [
          {
            id: "news-feed",
            name: "news.feed",
            type: "file",
          },
        ],
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
