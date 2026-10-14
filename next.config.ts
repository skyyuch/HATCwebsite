import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {withPayload} from '@payloadcms/next/withPayload';

/**
 * Every path except the build's own fingerprinted assets and the API routes.
 *
 * `/_next/static/*` filenames already contain a content hash and are served
 * `immutable` — re-validating them would throw that away. API routes set their
 * own caching (the quote stream must stay `no-store`).
 */
const DOCUMENT_PATHS = '/((?!_next/static|_next/image|api/).*)';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: DOCUMENT_PATHS,
        headers: [
          {
            key: 'Cache-Control',
            // Next's default for a static page is `s-maxage=31536000` alone,
            // which tells every shared cache to keep the HTML for a year. That
            // assumes a deploy purges the CDN; nothing here does, and the
            // reverse proxy in front of production duly served a pre-deploy
            // copy — of the *compressed* variant only, so `curl` looked fine
            // while every real browser got the old build (2026-10-14).
            //
            // It also breaks the CMS: a page revalidated by `revalidateTag`
            // never reaches visitors while a shared cache holds last year's
            // copy. Both caches must therefore re-ask on every request; the
            // ETag turns that into a 304 with no body, and Next still serves
            // the prerendered HTML from its own cache.
            //
            // 🚩 Do not re-add `s-maxage` without a cache purge on deploy AND
            // on every `revalidateTag` call.
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
