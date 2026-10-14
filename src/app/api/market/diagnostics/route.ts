import {NextResponse} from 'next/server';
import {createLocalReq} from 'payload';
import type {TypedUser} from 'payload';

import {getStreamDiagnostics} from '@/lib/marketQuoteHub';
import {runGatewayDiagnostics} from '@/lib/marketQuotes';
import {getPayloadClient, hasDb} from '@/lib/payload';
import {hasFullAccess} from '@/payload/access';

/**
 * GET /api/market/diagnostics — why the live feed is (or is not) working.
 *
 * `/api/market/quotes` answers `{ok:false}` for every degraded state by
 * contract, so a deployed site gives no clue which one it is. This route is
 * that clue, and it is gated to full-access administrators: the answer names
 * the gateway this server talks to, whether its secret is configured and what
 * the guest trade group allows — operational detail that must not reach an
 * anonymous visitor. Sign in to `/admin` first, then open this URL.
 *
 * The public endpoints' response shape is untouched; this is a separate route.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Without a database nobody can be authenticated, so there is no safe way to
  // answer — stay silent rather than leak the gateway state.
  if (!hasDb()) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let user: TypedUser | null = null;
  let fullAccess = false;
  try {
    const payload = await getPayloadClient();
    ({user} = await payload.auth({headers: request.headers}));
    if (user) {
      // Reuse the CMS role matrix rather than re-implementing it here.
      fullAccess = await hasFullAccess(await createLocalReq({user}, payload));
    }
  } catch {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  if (!fullAccess) return NextResponse.json({error: 'Forbidden'}, {status: 403});

  return NextResponse.json(
    {...(await runGatewayDiagnostics()), stream: getStreamDiagnostics()},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
