"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { NotificationCenter, type NotificationItem } from "@/shared/ui";
import {
  EditorGroup,
  NEWS_FEED_TAB,
  POSITIONS_TAB,
  type MockTab,
} from "@/widgets/editorPanel";
import { PositionsPanel } from "@/features/positions";
import { PanicMode } from "@/features/panichot";
import { registerAuthUnauthorizedHandler } from "@/features/auth";
import { useFavoritesStore } from "@/features/favorites";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
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
import { NewsFeedPanel } from "@/widgets/newsFeed";
import { Sidebar, type TreeFileOpenPayload } from "@/widgets/sidePannel";
import { PanelArea } from "@/widgets/terminalPanel";
import { ActivityBar } from "@/widgets/activityBar";
import { StatusBar } from "@/widgets/statusBar";
import { TitleBar } from "@/widgets/titleBar";
import { StocksSheetPanel } from "@/widgets/stocksSheet";
import {
  StockBigChartPanel,
  StockDetailPanel,
  type StockSummary,
} from "@/widgets/stockDetail";
import { AgentPanel } from "@/widgets/agentPanel";

const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 560;
const PANEL_MIN_HEIGHT = 120;
const PANEL_MAX_HEIGHT_OFFSET = 180;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPanelMaxHeight() {
  return Math.max(
    PANEL_MIN_HEIGHT,
    window.innerHeight - PANEL_MAX_HEIGHT_OFFSET,
  );
}

function isStocksSheet(file: TreeFileOpenPayload) {
  return file.path.at(-1) === "stocks" && file.name.endsWith(".sheet");
}

function createEditorTab(file: TreeFileOpenPayload): MockTab {
  if (file.id === NEWS_FEED_TAB.id) {
    return { ...NEWS_FEED_TAB };
  }

  if (file.id === POSITIONS_TAB.id) {
    return { ...POSITIONS_TAB };
  }

  if (isStocksSheet(file)) {
    return {
      id: file.id,
      filename: file.name,
      path: file.path,
      content: [],
      view: "stocksSheet",
    };
  }

  return {
    id: file.id,
    filename: file.name,
    path: file.path,
    content: [
      `// ${[...file.path, file.name].join("/")}`,
      "",
      "파일 미리보기 내용이 아직 준비되지 않았습니다.",
    ],
  };
}

interface IdeShellProps {
  /** 표시할 알림 목록 (기본: 샘플). 실제 데이터로 교체. */
  notifications?: NotificationItem[];
  /** 알림 센터 초기 열림 상태 (기본 false) */
  defaultNotificationsOpen?: boolean;
}

export function IdeShell({
  notifications = MOCK_NOTIFICATIONS,
  defaultNotificationsOpen = false,
}: IdeShellProps = {}) {
  const [notificationsOpen, setNotificationsOpen] = useState(
    defaultNotificationsOpen,
  );
  const [activeView, setActiveView] = useState<string | null>("explorer");
  const [editorTabs, setEditorTabs] = useState<MockTab[]>([]);
  const [activeEditorTabKey, setActiveEditorTabKey] = useState<string | null>(
    null,
  );
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [panelHeight, setPanelHeight] = useState(220);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isSecondarySidebarVisible, setIsSecondarySidebarVisible] =
    useState(false);
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(360);
  const [selectedStock, setSelectedStock] = useState<StockSummary | null>(null);
  const [isAgentFullscreen, setIsAgentFullscreen] = useState(false);
  const [stockChartTabs, setStockChartTabs] = useState<
    Record<string, StockSummary>
  >({});

  // 앱 진입 시 1회: 401 자동 로그아웃 핸들러 등록 + 즐겨찾기 localStorage 복원.
  useEffect(() => {
    registerAuthUnauthorizedHandler();
    useFavoritesStore.getState().hydrate();
  }, []);

  const panelRegistry: Record<string, (tab: MockTab) => ReactNode> = {
    newsFeed: () => <NewsFeedPanel />,
    positions: () => <PositionsPanel />,
    stocksSheet: (tab) => (
      // key={tab.id}: 시트 탭 전환 시 패널 remount → activeMarket 이 파일명 기준으로 재초기화.
      // (effect 내 setState 동기화는 프로젝트 lint 금지라 key 방식으로 처리)
      <StocksSheetPanel
        key={tab.id}
        filename={tab.filename}
        onSelectStock={setSelectedStock}
        selectedCode={selectedStock?.code ?? null}
      />
    ),
    stockBigChart: (tab) => {
      const stock = stockChartTabs[tab.id];
      return stock ? <StockBigChartPanel stock={stock} /> : null;
    },
  };

  const handleViewChange = (id: string) => {
    if (id === "settings") {
      window.dispatchEvent(new CustomEvent("open-panic-settings"));
      return;
    }
    setActiveView((prev) => (prev === id ? null : id));
  };

  const handleFileOpen = (file: TreeFileOpenPayload) => {
    setEditorTabs((prev) => {
      if (prev.some((tab) => tab.id === file.id)) return prev;
      return [...prev, createEditorTab(file)];
    });
    setActiveEditorTabKey(file.id);
  };

  const handleCloseEditorTab = (id: string) => {
    const closedIndex = editorTabs.findIndex((tab) => tab.id === id);
    const nextTabs = editorTabs.filter((tab) => tab.id !== id);

    setEditorTabs(nextTabs);
    setStockChartTabs((prev) => {
      if (!prev[id]) return prev;
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });

    if (nextTabs.length === 0) {
      setActiveEditorTabKey(null);
      return;
    }

    if (activeEditorTabKey === id) {
      setActiveEditorTabKey(nextTabs[Math.max(0, closedIndex - 1)].id);
    }
  };

  const handleOpenBigChart = (stock: StockSummary) => {
    const tabKey = `stock-big-chart-${stock.code}`;
    setStockChartTabs((prev) => ({ ...prev, [tabKey]: stock }));
    setEditorTabs((prev) => {
      if (prev.some((tab) => tab.id === tabKey)) return prev;
      return [
        ...prev,
        {
          id: tabKey,
          filename: `${stock.code}.bigchart`,
          path: ["src", "market"],
          content: [],
          view: "stockBigChart",
        },
      ];
    });
    setActiveEditorTabKey(tabKey);
  };

  const handleToggleAgentFullscreen = () => {
    setIsAgentFullscreen((prev) => {
      const next = !prev;
      if (next) {
        setActiveView(null);
        setIsPanelVisible(false);
      }
      return next;
    });
  };

  const startSidebarResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    document.body.dataset.resizing = "sidebar";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH));
    };

    const stopResize = () => {
      document.body.removeAttribute("data-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const startSecondarySidebarResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = secondarySidebarWidth;
    document.body.dataset.resizing = "sidebar";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = startWidth - (moveEvent.clientX - startX);
      setSecondarySidebarWidth(
        clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
      );
    };

    const stopResize = () => {
      document.body.removeAttribute("data-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const startPanelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = panelHeight;
    document.body.dataset.resizing = "panel";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextHeight = startHeight - (moveEvent.clientY - startY);
      setPanelHeight(clamp(nextHeight, PANEL_MIN_HEIGHT, getPanelMaxHeight()));
    };

    const stopResize = () => {
      document.body.removeAttribute("data-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const resizePanelWithKeyboard = (delta: number) => {
    setPanelHeight((value) =>
      clamp(value + delta, PANEL_MIN_HEIGHT, getPanelMaxHeight()),
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-vscode-window">
      <TitleBar
        onToggleSidebar={() =>
          setActiveView((prev) => (prev ? null : "explorer"))
        }
        onTogglePanel={() => setIsPanelVisible((prev) => !prev)}
        onToggleSecondarySidebar={() =>
          setIsSecondarySidebarVisible((prev) => !prev)
        }
      />

      {/* workbench */}
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeView={activeView} onViewChange={handleViewChange} />
        {activeView && (
          <>
            <Sidebar
              view={activeView}
              width={sidebarWidth}
              onFileOpen={handleFileOpen}
              onAuthSuccess={() => setActiveView("explorer")}
            />
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize side bar"
              className="resize-handle resize-handle-vertical"
              tabIndex={0}
              onPointerDown={startSidebarResize}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  setSidebarWidth((value) =>
                    clamp(value - 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                  );
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  setSidebarWidth((value) =>
                    clamp(value + 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                  );
                }
              }}
            />
          </>
        )}

        {/* main-area: editor + panel vertical split */}
        {!isAgentFullscreen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              <EditorGroup
                tabs={editorTabs}
                activeTabKey={activeEditorTabKey}
                onActiveTabChange={setActiveEditorTabKey}
                onCloseTab={handleCloseEditorTab}
                panelRegistry={panelRegistry}
              />

              {selectedStock && (
                <aside
                  aria-label={`${selectedStock.name} 상세`}
                  className="w-[340px] shrink-0 overflow-hidden"
                >
                  <StockDetailPanel
                    stock={selectedStock}
                    onClose={() => setSelectedStock(null)}
                    onOpenBigChart={handleOpenBigChart}
                  />
                </aside>
              )}
            </div>
            {isPanelVisible && (
              <>
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize panel"
                  className="resize-handle resize-handle-horizontal"
                  tabIndex={0}
                  onPointerDown={startPanelResize}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      resizePanelWithKeyboard(10);
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      resizePanelWithKeyboard(-10);
                    }
                  }}
                />
                <PanelArea height={panelHeight} />
              </>
            )}
          </div>
        )}

        {isSecondarySidebarVisible && (
          <>
            {!isAgentFullscreen && (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize secondary side bar"
                className="resize-handle resize-handle-vertical"
                tabIndex={0}
                onPointerDown={startSecondarySidebarResize}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    setSecondarySidebarWidth((value) =>
                      clamp(value + 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                    );
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    setSecondarySidebarWidth((value) =>
                      clamp(value - 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                    );
                  }
                }}
              />
            )}
            <aside
              aria-label="Secondary Sidebar"
              className={`shrink-0 flex flex-col bg-vscode-sidebar text-vscode-fg-sidebar z-(--z-sidebar) ${
                isAgentFullscreen
                  ? "flex-1 border-none"
                  : "border-l border-vscode-border-sidebar"
              }`}
              style={isAgentFullscreen ? {} : { width: secondarySidebarWidth }}
            >
              <div className="flex-1 flex flex-col min-h-0 relative">
                <AgentPanel
                  onClose={() => setIsSecondarySidebarVisible(false)}
                  onExpand={handleToggleAgentFullscreen}
                  isExpanded={isAgentFullscreen}
                />
              </div>
            </aside>
          </>
        )}
      </div>

      <StatusBar
        notificationsActive={notificationsOpen}
        onBellClick={() => setNotificationsOpen((prev) => !prev)}
      />

      {/* 전역 알림 센터 — 종/▼ 로 토글 */}
      <NotificationCenter
        items={notifications}
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

      {/* 패닉 핫키 — ESC 두 번이면 위장 설정화면 */}
      <PanicMode />
    </div>
  );
}
