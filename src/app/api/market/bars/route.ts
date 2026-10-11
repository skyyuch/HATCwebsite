import {NextResponse} from 'next/server';
import {getDailyBars} from '@/lib/marketQuotes';

/**
 * Public read-only daily-candle endpoint for the homepage gold chart.
 *
 * Same reasoning as the quotes route: the browser cannot reach the MT5 gateway
 * (CORS allow-list, server-only response-crypt secret and context token), so
 * this route proxies it and `getDailyBars` caches the upstream read.
 *
 * `{ok: false}` is a normal answer — it covers "no gateway configured",
 * "feed down", and "symbol is not one of the homepage products". The client
 * then draws no chart at all rather than a sample series.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol') ?? '';
  const bars = await getDailyBars(symbol);

  return NextResponse.json(
    bars ? {ok: true, symbol, bars} : {ok: false},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
