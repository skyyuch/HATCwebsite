import {revalidateTag} from 'next/cache';
import {NextResponse} from 'next/server';

import {CACHE_TAGS} from '@/lib/cacheTags';

// Dev-only helper: bust CMS reader caches after CLI seeds/translations or an
// edit to src/messages/* (the i18n seeds sit behind the same unstable_cache),
// since those happen outside the running dev server. Returns 404 in production
// (there, /admin edits revalidate via afterChange). Not linked anywhere; hit
// GET /api/dev-revalidate.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', {status: 404});
  }
  // `{expire: 0}`, not `'max'` — see src/lib/revalidateContent.ts. `'max'` only
  // marks the entry stale, so the first reload after seeding still showed the
  // old value, which defeats the whole point of this helper.
  const tags = Object.values(CACHE_TAGS);
  for (const t of tags) revalidateTag(t, {expire: 0});
  return NextResponse.json({revalidated: tags});
}
