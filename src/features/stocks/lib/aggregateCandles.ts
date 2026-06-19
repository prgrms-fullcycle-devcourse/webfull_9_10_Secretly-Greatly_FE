/** OHLCV 한 봉 (time = unix seconds). StockCandle·Candle 과 호환. */
export interface OhlcvCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 1분봉을 N분봉으로 묶는다 (KIS 1분봉 → 5/15/30/60분 집계용).
 * 시각 버킷 = floor(time / (N*60)) * (N*60). 국장(KST)·미장(EST) 모두 장 시작이
 * 15·30·60분 경계와 정렬돼 추가 타임존 보정 없이 맞는다. (장 갱·휴장은 빈 버킷으로 자연 처리)
 * 집계: open=첫봉, high=max, low=min, close=마지막봉, volume=합, time=버킷 시작.
 */
export function aggregateMinuteCandles(
  candles: OhlcvCandle[],
  bucketMinutes: number,
): OhlcvCandle[] {
  if (bucketMinutes <= 1 || candles.length === 0) return candles;
  const bucketSec = bucketMinutes * 60;
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const buckets = new Map<number, OhlcvCandle>();

  for (const c of sorted) {
    const start = Math.floor(c.time / bucketSec) * bucketSec;
    const bucket = buckets.get(start);
    if (!bucket) {
      buckets.set(start, {
        time: start,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      });
    } else {
      bucket.high = Math.max(bucket.high, c.high);
      bucket.low = Math.min(bucket.low, c.low);
      bucket.close = c.close;
      bucket.volume += c.volume;
    }
  }

  return [...buckets.values()].sort((a, b) => a.time - b.time);
}
