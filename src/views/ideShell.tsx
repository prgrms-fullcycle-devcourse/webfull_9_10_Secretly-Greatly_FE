"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { NotificationCenter, type NotificationItem } from "@/shared/ui";
import { getStoredSession, onAuthChange } from "@/shared/api";
import {
  EditorGroup,
  NEWS_FEED_TAB,
  POSITIONS_TAB,
  type MockTab,
} from "@/widgets/editorPanel";
import { PositionsPanel } from "@/features/positions";
import { PanicMode } from "@/features/panichot";
import { registerAuthUnauthorizedHandler } from "@/features/auth";
import { ChatProvider } from "@/features/chat";
import { useFavoritesStore } from "@/features/favorites";
import { useWatchlistStore } from "@/features/watchlist";
import { useKisStore } from "@/features/auth/model/kisStore";
import { getStocks } from "@/features/stocks/api";
import { useCurrencyStore, useFxStore } from "@/features/currency";
import { usePositionsStore } from "@/entities/position";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    severity: "error",
    message: "NVDA 변동성 임계치 도달 (-3.42% · 15분).",
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
import { SettingsPanel } from "@/widgets/settingsPanel";

const SIDEBAR_DEFAULT_WIDTH = 250;
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 560;
/** 왼쪽 사이드바를 이 폭보다 더 좁히면(거의 0) VSCode 처럼 닫힌다. */
const SIDEBAR_COLLAPSE_WIDTH = 90;
const PANEL_MIN_HEIGHT = 120;
const PANEL_MAX_HEIGHT_OFFSET = 180;
/** 주식 상세 패널 가로폭 — 최소는 지표/차트가 깨지지 않는 선, 최대는 과하지 않게. */
const DETAIL_MIN_WIDTH = 300;
const DETAIL_MAX_WIDTH = 640;

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
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [detailWidth, setDetailWidth] = useState(340);
  const [panelHeight, setPanelHeight] = useState(220);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  // 사이트 진입 시 에이전트(채팅) 패널을 기본으로 열어둔다.
  const [isSecondarySidebarVisible, setIsSecondarySidebarVisible] =
    useState(true);
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(360);
  const [selectedStock, setSelectedStock] = useState<StockSummary | null>(null);
  const [isAgentFullscreen, setIsAgentFullscreen] = useState(false);
  const [stockChartTabs, setStockChartTabs] = useState<
    Record<string, StockSummary>
  >({});

  // 앱 진입 시 1회: 401 자동 로그아웃 핸들러 등록 + 통화 설정 복원.
  // 즐겨찾기는 로그인 사용자 데이터 → 로그인 시 복원, 비로그인/로그아웃 시 비움(localStorage 는 보존).
  useEffect(() => {
    registerAuthUnauthorizedHandler();
    useCurrencyStore.getState().hydrate();
    // 실시간 환율(USD/KRW) — Yahoo 프록시에서 1회 받아 가격 환산에 반영 (KIS·로그인 무관).
    useFxStore.getState().hydrate();
    // 보유목록(물타기)은 로그인 무관 개인 계산기 → localStorage 복원 (비회원도 유지).
    usePositionsStore.getState().hydrate();
    // 시세 리스트(관심목록)도 로그인 무관 localStorage → 복원 (첫 방문이면 기본 15종목 시드).
    useWatchlistStore.getState().hydrate();
    // 즐겨찾기·KIS 연동상태는 로그인 사용자 데이터 → 로그인 시 복원, 로그아웃 시 비움.
    // KIS 회원이면 시세 리스트 기본 종목의 stockId(BE 캔들용)를 BE /stocks 로 채운다.
    // (검색으로 담은 종목은 이미 stockId 보유 → missing 만 1회 조회.)
    const enrichWatchlistStockIds = async () => {
      const missing = useWatchlistStore
        .getState()
        .items.filter((i) => i.stockId == null);
      if (missing.length === 0) return;
      const resolved = await Promise.all(
        missing.map(async (i) => {
          try {
            const hit = (await getStocks({ keyword: i.code })).find(
              (s) => s.code === i.code,
            );
            return hit ? ([i.code, hit.stockId] as const) : null;
          } catch {
            return null;
          }
        }),
      );
      const map: Record<string, number> = {};
      for (const r of resolved) if (r) map[r[0]] = r[1];
      if (Object.keys(map).length > 0) {
        useWatchlistStore.getState().applyStockIds(map);
      }
    };
    const syncUserData = () => {
      const fav = useFavoritesStore.getState();
      if (getStoredSession()) {
        fav.hydrate();
        void useKisStore
          .getState()
          .hydrate()
          .then(() => {
            if (useKisStore.getState().connected)
              void enrichWatchlistStockIds();
          });
      } else {
        fav.reset();
        useKisStore.getState().reset();
      }
    };
    syncUserData();
    return onAuthChange(syncUserData);
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
      window.dispatchEvent(new CustomEvent("open-settings"));
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

    let collapsed = false;
    const handlePointerMove = (moveEvent: PointerEvent) => {
      // 접힌 뒤엔 더 이상 폭을 갱신하지 않는다 (stray pointermove 가 폭을 망가뜨리던 버그 방지).
      if (collapsed) return;
      const nextWidth = startWidth + moveEvent.clientX - startX;
      // VSCode 처럼 최소폭보다 더 좁히면(거의 0) 사이드바를 닫는다 (왼쪽만).
      if (nextWidth < SIDEBAR_COLLAPSE_WIDTH) {
        collapsed = true;
        setActiveView(null);
        // 재오픈 시 기본 폭으로 (망가진/맥스 폭으로 열리지 않게).
        setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
        return;
      }
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

  const startDetailResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = detailWidth;
    document.body.dataset.resizing = "sidebar";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // 상세는 오른쪽에 있으므로 왼쪽으로 끌수록 넓어진다.
      const nextWidth = startWidth - (moveEvent.clientX - startX);
      setDetailWidth(clamp(nextWidth, DETAIL_MIN_WIDTH, DETAIL_MAX_WIDTH));
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
    <ChatProvider>
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
          <ActivityBar
            activeView={activeView}
            onViewChange={handleViewChange}
          />
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
                  <>
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Resize stock detail"
                      className="resize-handle resize-handle-vertical"
                      tabIndex={0}
                      onPointerDown={startDetailResize}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          setDetailWidth((value) =>
                            clamp(
                              value + 10,
                              DETAIL_MIN_WIDTH,
                              DETAIL_MAX_WIDTH,
                            ),
                          );
                        }
                        if (event.key === "ArrowRight") {
                          event.preventDefault();
                          setDetailWidth((value) =>
                            clamp(
                              value - 10,
                              DETAIL_MIN_WIDTH,
                              DETAIL_MAX_WIDTH,
                            ),
                          );
                        }
                      }}
                    />
                    <aside
                      aria-label={`${selectedStock.name} 상세`}
                      className="shrink-0 overflow-hidden"
                      style={{ width: detailWidth }}
                    >
                      <StockDetailPanel
                        stock={selectedStock}
                        onClose={() => setSelectedStock(null)}
                        onOpenBigChart={handleOpenBigChart}
                      />
                    </aside>
                  </>
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
                style={
                  isAgentFullscreen ? {} : { width: secondarySidebarWidth }
                }
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

        {/* 설정 패널 — 액티비티바 기어로 열림 */}
        <SettingsPanel />

        {/* 패닉 핫키 — ESC 두 번이면 Source Control 위장화면 */}
        <PanicMode />
      </div>
    </ChatProvider>
  );
}
