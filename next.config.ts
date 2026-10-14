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
            // Next sends `s-maxage=31536000` alone for a static page, which is
            // a CDN directive: a browser sees no expiry it can apply and falls
            // back to guessing a lifetime. It guesses generously, so after a
            // deploy a returning visitor keeps running the previous build's
            // JavaScript — with no visible symptom beyond stale behaviour.
            // `max-age=0, must-revalidate` makes the browser ask every time;
            // the ETag keeps that a 304, so nothing is re-downloaded. The
            // `s-maxage` half is preserved so CDN behaviour is unchanged.
            value: 'public, max-age=0, must-revalidate, s-maxage=31536000'
          }
        ]
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
