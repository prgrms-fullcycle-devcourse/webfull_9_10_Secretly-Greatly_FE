import { http, HttpResponse } from "msw";

const mockStocks = [
  {
    stockId: 1,
    code: "005930",
    name: "삼성전자",
    price: 74500,
    change: 1.36,
    volume: 12450000,
    market: "DOMESTIC",
  },
  {
    stockId: 2,
    code: "AAPL",
    name: "Apple Inc.",
    price: 182.3,
    change: -0.45,
    volume: 54120000,
    market: "OVERSEAS",
  },
  {
    stockId: 3,
    code: "TSLA",
    name: "Tesla Inc.",
    price: 174.6,
    change: 2.84,
    volume: 81200000,
    market: "OVERSEAS",
  },
  {
    stockId: 4,
    code: "BTC",
    name: "Bitcoin",
    price: 92450000,
    change: -1.25,
    volume: 3800,
    market: "COIN",
  },
  {
    stockId: 5,
    code: "035420",
    name: "NAVER",
    price: 188500,
    change: 0.8,
    volume: 450000,
    market: "DOMESTIC",
  },
];

export const stocksHandlers = [
  // 주식 목록 조회 핸들러
  http.get("*/api/stocks", ({ request }) => {
    const url = new URL(request.url);
    const market = url.searchParams.get("market");
    const keyword = url.searchParams.get("keyword")?.toLowerCase();

    let filtered = [...mockStocks];

    if (market) {
      filtered = filtered.filter((s) => s.market === market);
    }

    if (keyword) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.code.toLowerCase().includes(keyword),
      );
    }

    return HttpResponse.json({
      sortedBy: "change",
      totalCount: filtered.length,
      items: filtered,
    });
  }),
];
