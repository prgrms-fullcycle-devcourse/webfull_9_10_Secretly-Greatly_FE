import type {
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  UTCTimestamp,
} from "lightweight-charts";

export const CHART_RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export interface ChartData {
  /** 라인·영역·스텝·베이스라인·컬럼용 종가 시계열. */
  line: LineData<Time>[];
  /** 캔들·바용 OHLC 시계열. */
  candles: CandlestickData<Time>[];
  /** 거래량 시계열 (색상은 봉별 상승/하락에 맞춰 차트 쪽에서 입힘). */
  volume: HistogramData<Time>[];
  /** 베이스라인 기준값 = 첫 종가. */
  baseValue: number;
}

export interface OhlcvCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** 기간별 데이터 포인트 수 — 범위가 넓을수록 더 많은 봉. */
const RANGE_POINTS: Record<ChartRange, number> = {
  "1D": 80,
  "1W": 110,
  "1M": 150,
  "3M": 190,
  "1Y": 240,
};

const DAY = 86_400;

/** seed 기반 결정적 난수 (LCG) — 캔들 꼬리 길이 등에 사용. */
function makeRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * 코드 해시 + 추세로 만든 결정적(seed) 시계열.
 * 현재가(price) 주변 밴드로 스케일하고, 마지막 종가를 현재가에 정확히 맞춘다.
 * 연속 종가에서 OHLC를 파생해 캔들/바도 같은 흐름으로 그린다.
 */
export function buildChartData(
  code: string,
  price: number,
  up: boolean,
  range: ChartRange,
): ChartData {
  let seed = 0;
  for (const ch of code) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = makeRand(seed + 7);

  const n = RANGE_POINTS[range];
  const base = price > 0 ? price : 100;

  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const wave =
      Math.sin(i * 0.34 + (seed % 17)) * 0.18 +
      Math.sin(i * 0.91 + (seed % 7)) * 0.08;
    const trend = (up ? 1 : -1) * (t - 0.5) * 0.6;
    raw.push(trend + wave);
  }

  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const span = max - min || 1;
  const closes = raw.map((v) => base * (0.9 + ((v - min) / span) * 0.16));
  const offset = base - closes[closes.length - 1];

  for (let i = 0; i < n; i++) closes[i] = Math.max(0, closes[i] + offset);

  const today = Math.floor(Date.now() / 1000 / DAY) * DAY;
  const at = (i: number) => (today - (n - 1 - i) * DAY) as UTCTimestamp;

  const line: LineData<Time>[] = closes.map((value, i) => ({
    time: at(i),
    value,
  }));

  const candles: CandlestickData<Time>[] = closes.map((close, i) => {
    const open = i === 0 ? close * (1 - (rand() - 0.5) * 0.01) : closes[i - 1];
    const high = Math.max(open, close) * (1 + rand() * 0.006);
    const low = Math.min(open, close) * (1 - rand() * 0.006);

    return {
      time: at(i),
      open: Math.max(0, open),
      high: Math.max(0, high),
      low: Math.max(0, low),
      close,
    };
  });

  const volume: HistogramData<Time>[] = closes.map((_, i) => {
    const spike = rand() > 0.88 ? 1.8 + rand() : 1;
    return { time: at(i), value: (0.4 + rand()) * 6e8 * spike };
  });

  return { line, candles, volume, baseValue: closes[0] };
}

/** Yahoo/BE 캔들(OHLCV) → Lightweight Charts ChartData */
export function candlesToChartData(candles: OhlcvCandle[]): ChartData {
  const sortedCandles = [...candles].sort((a, b) => a.time - b.time);

  return {
    line: sortedCandles.map((candle) => ({
      time: candle.time as UTCTimestamp,
      value: candle.close,
    })),
    candles: sortedCandles.map((candle) => ({
      time: candle.time as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })),
    volume: sortedCandles.map((candle) => ({
      time: candle.time as UTCTimestamp,
      value: candle.volume,
    })),
    baseValue: sortedCandles[0]?.close ?? 0,
  };
}

export const convertCandlesToChartData = candlesToChartData;
