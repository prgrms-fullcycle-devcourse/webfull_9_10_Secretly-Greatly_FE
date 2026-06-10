"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineType,
  createChart,
  type DeepPartial,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type SeriesType,
  type Time,
  type TimeChartOptions,
} from "lightweight-charts";
import type { ChartData } from "../model/chartData";

export type ChartType =
  | "bar"
  | "candles"
  | "line"
  | "stepline"
  | "area"
  | "baseline"
  | "column";

/** 크로스헤어가 가리키는 지점의 값 (캔들=OHLC, 라인류=value). */
export interface ChartHover {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
}

/** 이동평균선 색상 토큰 — 기간별 (tokens.css의 차트 팔레트 변수명). */
export const MA_COLOR_VARS: Record<number, string> = {
  5: "--chart-ma-5",
  20: "--chart-ma-20",
  60: "--chart-ma-60",
  120: "--chart-ma-120",
};

interface PriceChartProps {
  data: ChartData;
  /** true=상승(cyan), false=하락(red) */
  up: boolean;
  /** 차트 종류 (기본 area) */
  type?: ChartType;
  /** full=축·그리드 포함, sparkline=축·그리드 없는 미니 차트 */
  variant?: "full" | "sparkline";
  /** 오버레이할 이동평균선 기간 목록 (예: [5,20,60,120]) */
  movingAverages?: number[];
  /** 하단 거래량 패널 표시 */
  showVolume?: boolean;
  /** 크로스헤어가 가리키는 값 (마우스가 차트 밖이면 null). */
  onHover?: (hover: ChartHover | null) => void;
  className?: string;
}

/** 캔버스는 CSS 변수를 못 읽으므로 런타임에 실제 색상값으로 해석. */
function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** 단순이동평균 — period 미만 구간은 건너뛴다. */
function sma(line: LineData<Time>[], period: number): LineData<Time>[] {
  if (line.length < period) return [];
  const out: LineData<Time>[] = [];
  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    sum += line[i].value;
    if (i >= period) sum -= line[i - period].value;
    if (i >= period - 1) out.push({ time: line[i].time, value: sum / period });
  }
  return out;
}

function chartOptions(
  variant: "full" | "sparkline",
): DeepPartial<TimeChartOptions> {
  const border = cssVar("--vscode-panel-border", "#2a2b2c");
  const base: DeepPartial<TimeChartOptions> = {
    autoSize: true,
    layout: {
      // TradingView 저작자 표시 로고 — 라이선스상 표시 유지.
      attributionLogo: true,
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: cssVar("--vscode-editorLineNumber-foreground", "#858889"),
      fontFamily: cssVar("--font-editor", "monospace"),
      fontSize: 11,
    },
    handleScale: false,
    handleScroll: false,
  };

  if (variant === "sparkline") {
    return {
      ...base,
      // 미니 차트는 너무 작아 로고 생략 (출처 표기는 빅차트가 담당)
      layout: { ...base.layout, attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      leftPriceScale: { visible: false },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: {
        vertLine: { visible: false, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
    };
  }

  return {
    ...base,
    grid: {
      vertLines: { color: border },
      horzLines: { color: border },
    },
    rightPriceScale: { borderColor: border },
    timeScale: { borderColor: border, fixLeftEdge: true, fixRightEdge: true },
    crosshair: { mode: CrosshairMode.Magnet },
  };
}

export function PriceChart({
  data,
  up,
  type = "area",
  variant = "full",
  movingAverages,
  showVolume = false,
  onHover,
  className,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType>[]>([]);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  // 콜백을 ref로 보관 → 구독은 마운트 시 1회만, 항상 최신 콜백 호출
  const onHoverRef = useRef(onHover);
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  // 차트 생성 — variant 변경 시에만 재생성 (autoSize가 ResizeObserver로 반응형 처리)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, chartOptions(variant));
    chartRef.current = chart;

    // 크로스헤어(마우스) 위치의 값을 콜백으로 전달
    const handleMove = (param: MouseEventParams<Time>) => {
      const cb = onHoverRef.current;
      if (!cb) return;
      const main = mainSeriesRef.current;
      const point = param.time && main ? param.seriesData.get(main) : undefined;
      cb(point ? (point as ChartHover) : null);
    };
    chart.subscribeCrosshairMove(handleMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleMove);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = [];
      mainSeriesRef.current = null;
    };
  }, [variant]);

  // 시리즈 (종류·색상·MA·거래량) + 데이터 재구성
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const upColor = cssVar("--chart-up", "#4ec9b0");
    const downColor = cssVar("--chart-down", "#f85149");
    const lineColor = up ? upColor : downColor;

    // 기존 시리즈 제거
    for (const s of seriesRef.current) chart.removeSeries(s);
    seriesRef.current = [];
    const created: ISeriesApi<SeriesType>[] = [];

    // ── 메인 가격 시리즈 ──
    if (type === "candles") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });
      series.setData(data.candles);
      created.push(series);
    } else if (type === "bar") {
      const series = chart.addSeries(BarSeries, {
        upColor,
        downColor,
        thinBars: false,
      });
      series.setData(data.candles);
      created.push(series);
    } else if (type === "baseline") {
      const series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: data.baseValue },
        topLineColor: upColor,
        topFillColor1: `${upColor}40`,
        topFillColor2: `${upColor}00`,
        bottomLineColor: downColor,
        bottomFillColor1: `${downColor}00`,
        bottomFillColor2: `${downColor}40`,
      });
      series.setData(data.line);
      created.push(series);
    } else if (type === "column") {
      const lo = Math.min(...data.line.map((d) => d.value));
      const series = chart.addSeries(HistogramSeries, {
        color: `${lineColor}b3`,
        base: lo * 0.985,
      });
      series.setData(data.line);
      created.push(series);
    } else if (type === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor,
        lineWidth: 2,
        topColor: `${lineColor}59`,
        bottomColor: `${lineColor}00`,
      });
      series.setData(data.line);
      created.push(series);
    } else {
      // line | stepline
      const series = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
        lineType: type === "stepline" ? LineType.WithSteps : LineType.Simple,
      });
      series.setData(data.line);
      created.push(series);
    }

    // ── 이동평균선 오버레이 ──
    if (movingAverages?.length) {
      for (const period of movingAverages) {
        const maData = sma(data.line, period);
        if (!maData.length) continue;
        const ma = chart.addSeries(LineSeries, {
          color: cssVar(
            MA_COLOR_VARS[period] ?? "--vscode-foreground",
            "#888888",
          ),
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        ma.setData(maData);
        created.push(ma);
      }
    }

    // ── 거래량 (별도 하단 패널) ──
    if (showVolume) {
      const volume = chart.addSeries(
        HistogramSeries,
        { priceFormat: { type: "volume" }, priceScaleId: "" },
        1,
      );
      volume.setData(
        data.volume.map((d, i) => {
          const candle = data.candles[i];
          const upDay = !candle || candle.close >= candle.open;
          return { ...d, color: `${upDay ? upColor : downColor}80` };
        }),
      );
      created.push(volume);

      // 메인 패널을 크게, 거래량 패널을 작게
      const panes = chart.panes();
      panes[0]?.setStretchFactor(3);
      panes[1]?.setStretchFactor(1);
    }

    seriesRef.current = created;
    mainSeriesRef.current = created[0] ?? null;
    chart.timeScale().fitContent();
  }, [data, up, type, variant, movingAverages, showVolume]);

  return <div ref={containerRef} className={className} />;
}
