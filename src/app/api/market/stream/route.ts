import {subscribeToQuotes} from '@/lib/marketQuoteHub';
import type {LiveQuote} from '@/lib/marketQuoteTypes';

/**
 * Server-sent quote stream for the market widgets.
 *
 * The browser must not talk to the MT5 quote gateway directly (its CORS
 * allow-list excludes this site, and both the response-crypt secret and the
 * guest context token are server-only), so this route relays the gateway's
 * tick feed. One upstream socket serves every connected visitor.
 *
 * The payload is deliberately identical to `/api/market/quotes`, including the
 * `{ok:false}` contract — "no real data, keep showing the labelled sample
 * data". Clients that cannot hold a stream fall back to polling that endpoint,
 * so the two must not drift apart.
 */
export const dynamic = 'force-dynamic';

/** Coalescing window: several products ticking together send one frame. */
const MIN_FRAME_INTERVAL_MS = 200;
/** Comment frame that keeps proxies and the browser from closing an idle stream. */
const HEARTBEAT_MS = 15_000;

function frame(quotes: LiveQuote[] | null): string {
  const payload = quotes ? {ok: true, ts: Date.now(), quotes} : {ok: false};
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: Request): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let lastSentAt = 0;
      let pending: LiveQuote[] | null = null;
      let pendingTimer: ReturnType<typeof setTimeout> | null = null;

      const send = (text: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // The client vanished between the abort signal and this write.
          close();
        }
      };

      const flush = () => {
        pendingTimer = null;
        lastSentAt = Date.now();
        send(frame(pending));
      };

      const onQuotes = (quotes: LiveQuote[] | null) => {
        pending = quotes;
        if (pendingTimer) return;

        const elapsed = Date.now() - lastSentAt;
        if (elapsed >= MIN_FRAME_INTERVAL_MS) {
          flush();
        } else {
          pendingTimer = setTimeout(flush, MIN_FRAME_INTERVAL_MS - elapsed);
        }
      };

      // Fires synchronously with the current state, so the first frame goes
      // out immediately instead of waiting for the next tick.
      const unsubscribe = subscribeToQuotes(onQuotes);

      const heartbeat = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);

      function close() {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        if (pendingTimer) clearTimeout(pendingTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed by the runtime.
        }
      }

      request.signal.addEventListener('abort', close);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      // `no-transform` and the nginx-specific header below stop reverse
      // proxies from buffering the stream, which would batch every tick into
      // one delayed burst. Buffering is the default in nginx.
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
