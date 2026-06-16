import type { TreeNode } from "../ui/treeView";

export const EXPLORER_TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "stocks",
        name: "stocks",
        type: "folder",
        children: [
          "ALL.sheet",
          "DOMESTIC.sheet",
          "OVERSEAS.sheet",
          "COIN.sheet",
        ].map((filename) => ({
          id: `stocks-${filename}`,
          name: filename,
          type: "file" as const,
        })),
      },
      {
        id: "my-stock",
        name: "my stock",
        type: "folder",
        children: [
          {
            id: "positions",
            name: "positions.json",
            type: "file",
          },
        ],
      },
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
        // 자식(즐겨찾기 종목)은 favoritesStore 에서 런타임에 주입한다.
        id: "watchlist",
        name: "watchlist",
        type: "folder",
        children: [],
      },
      { id: "views", name: "views", type: "folder", children: [] },
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
