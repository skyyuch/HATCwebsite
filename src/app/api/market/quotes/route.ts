import {NextResponse} from 'next/server';
import {getLiveQuotes} from '@/lib/marketQuotes';

/**
 * Public read-only quote endpoint for the homepage market widgets.
 *
 * The browser must not talk to the MT5 quote gateway directly (its CORS
 * allow-list excludes this site, and its response-crypt secret is server-only),
 * so this route proxies the data. `getLiveQuotes` caches upstream reads, which
 * keeps the gateway load flat regardless of how many visitors poll.
 *
 * `{ok: false}` is a normal answer, not an error: it tells the client to keep
 * showing the labelled sample data.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const quotes = await getLiveQuotes();

  return NextResponse.json(
    quotes ? {ok: true, ts: Date.now(), quotes} : {ok: false},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
