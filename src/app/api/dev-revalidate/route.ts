import {revalidateTag} from 'next/cache';
import {NextResponse} from 'next/server';

// Dev-only helper: bust CMS reader caches after CLI seeds/translations, since
// scripts run in a separate process and can't invalidate the running dev
// server's unstable_cache. Returns 404 in production (there, /admin edits
// revalidate via afterChange). Not linked anywhere; hit GET /api/dev-revalidate.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', {status: 404});
  }
  const tags = [
    'academy-articles',
    'faqs',
    'instruments',
    'account-tiers',
    'account-benefits',
    'account-spreads',
    'account-platforms',
    'trading-platforms',
    'funding-methods',
    'testimonials'
  ];
  for (const t of tags) revalidateTag(t);
  return NextResponse.json({revalidated: tags});
}
