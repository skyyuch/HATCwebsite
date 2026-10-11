import type {MarketBar} from '@/lib/marketQuoteTypes';
import {SAMPLE_CANDLES} from '../sampleMarketData';

/**
 * Gold candlestick panel (Figma 4:71).
 *
 * Draws real daily bars from the MT5 gateway when they are available. The
 * Figma sample series is only ever drawn while the whole market section is in
 * sample mode: once real prices are on screen, an invented candlestick series
 * next to them would misrepresent the market, so the chart area stays empty
 * and says so instead.
 */

const CHART_W = 300;
const CHART_H = 160;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 148;
const GRID_LINES = [24, 60, 96, 132];
const AXIS_TICKS = 6;
/** Fraction of the per-bar pitch filled by the candle body. */
const BODY_RATIO = 0.6;

const SAMPLE_TIME_AXIS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00'
];

type Candle = {
  x: number;
  width: number;
  bodyY: number;
  bodyH: number;
  wickTop: number;
  wickBottom: number;
  up: boolean;
};

const SAMPLE_SHAPES: Candle[] = SAMPLE_CANDLES.map((candle) => ({
  ...candle,
  width: 20
}));

export default function ServiceChart({
  bars,
  live,
  locale,
  labels
}: {
  bars: MarketBar[] | null;
  /** True when real quotes are on screen elsewhere in the section. */
  live: boolean;
  locale: string;
  labels: {symbol: string; daily: string; sample: string; unavailable: string};
}) {
  const real = bars !== null;
  const candles = real ? buildCandles(bars) : live ? [] : SAMPLE_SHAPES;
  const axis = real
    ? barAxisLabels(bars, locale)
    : live
      ? []
      : SAMPLE_TIME_AXIS;
  const status = real
    ? labels.daily
    : live
      ? labels.unavailable
      : labels.sample;

  return (
    <div className="rounded-lg border border-[var(--fig-border)] bg-[var(--fig-ink)] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">
          {labels.symbol}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--fig-text-dim)]">
          {real ? (
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-[var(--fig-up)]"
            />
          ) : null}
          {status}
        </span>
      </div>

      <svg
        aria-hidden
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        className="mt-4 h-40 w-full"
      >
        {GRID_LINES.map((y) => (
          <line
            key={y}
            x1="0"
            x2={CHART_W}
            y1={y}
            y2={y}
            stroke="var(--fig-border)"
            strokeWidth="1"
          />
        ))}
        {candles.map((candle) => {
          const color = candle.up ? 'var(--fig-up)' : 'var(--fig-down)';
          return (
            <g key={candle.x}>
              <line
                x1={candle.x + candle.width / 2}
                x2={candle.x + candle.width / 2}
                y1={candle.wickTop}
                y2={candle.wickBottom}
                stroke={color}
                strokeWidth="1.5"
              />
              <rect
                x={candle.x}
                y={candle.bodyY}
                width={candle.width}
                height={candle.bodyH}
                rx="1"
                fill={color}
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex h-4 justify-between font-[family-name:var(--font-ticker)] text-[11px] text-[var(--fig-text-dim)]">
        {axis.map((label, index) => (
          <span key={`${index}-${label}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

/** Maps a bar series into the panel's 300x160 viewBox (top-down y). */
function buildCandles(bars: MarketBar[]): Candle[] {
  const highest = Math.max(...bars.map((bar) => bar.high));
  const lowest = Math.min(...bars.map((bar) => bar.low));
  const span = highest - lowest;
  const pitch = CHART_W / bars.length;
  const width = Math.max(pitch * BODY_RATIO, 1);

  // A flat series (one price all session) plots through the middle rather than
  // collapsing onto the top edge.
  const y = (price: number) =>
    span > 0
      ? PLOT_TOP + ((highest - price) / span) * (PLOT_BOTTOM - PLOT_TOP)
      : (PLOT_TOP + PLOT_BOTTOM) / 2;

  return bars.map((bar, index) => {
    const bodyTop = y(Math.max(bar.open, bar.close));
    const bodyBottom = y(Math.min(bar.open, bar.close));

    return {
      x: pitch * (index + 0.5) - width / 2,
      width,
      bodyY: bodyTop,
      // Doji bars still need a visible line.
      bodyH: Math.max(bodyBottom - bodyTop, 1),
      wickTop: y(bar.high),
      wickBottom: y(bar.low),
      up: bar.close >= bar.open
    };
  });
}

/** Evenly spaced date ticks; daily buckets start at Hong Kong midnight. */
function barAxisLabels(bars: MarketBar[], locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Hong_Kong'
  });

  const indices = new Set<number>();
  for (let tick = 0; tick < AXIS_TICKS; tick += 1) {
    indices.add(Math.round((tick * (bars.length - 1)) / (AXIS_TICKS - 1)));
  }

  return [...indices]
    .sort((a, b) => a - b)
    .map((index) => format.format(new Date(bars[index].time)));
}
