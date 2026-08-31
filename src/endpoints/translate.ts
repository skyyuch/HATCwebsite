/**
 * POST /api/translate — one-click machine-translation pre-fill endpoint.
 *
 * Body: {kind: 'collection' | 'global', slug: string, id?: string|number,
 *        targetLocale?: string, overwrite?: boolean}
 *
 * - Gated to full-access administrators only: machine translation writes drafts
 *   across every content locale of a document, so it is restricted to full-access
 *   roles (owner decision, 第三十三輪) rather than anyone who can merely `update`
 *   the resource. Facts are never touched — this only rewrites editorial localized
 *   copy into draft translations for proofreading.
 * - Degrades gracefully: with no `MT_API_KEY` configured it returns 501 so the
 *   button can disable / inform without breaking the panel.
 */
import type {Endpoint} from 'payload';
import {addDataAndFileToRequest} from 'payload';

import type {Locale} from '@/i18n/routing';
import {isMtConfigured} from '@/lib/mt/provider';
import {translateDocument, type TranslateTarget} from '@/lib/mt/translateDocument';
import {hasFullAccess} from '@/payload/access';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'}
  });
}

export const translateEndpoint: Endpoint = {
  path: '/translate',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return json({error: 'Unauthorized'}, 401);

    if (!isMtConfigured()) {
      return json(
        {error: 'not-configured', message: 'Translation service is not configured.'},
        501
      );
    }

    await addDataAndFileToRequest(req);
    const data = (req.data ?? {}) as {
      kind?: string;
      slug?: string;
      id?: string | number;
      targetLocale?: string;
      overwrite?: boolean;
    };

    const {kind, slug} = data;
    if ((kind !== 'collection' && kind !== 'global') || !slug) {
      return json({error: 'Invalid request: kind and slug are required.'}, 400);
    }
    if (kind === 'collection' && (data.id === undefined || data.id === null || data.id === '')) {
      return json({error: 'Save the document before translating.'}, 400);
    }

    // Permission: full-access administrators only (owner decision, 第三十三輪).
    const allowed = await hasFullAccess(req);
    if (!allowed) return json({error: 'Forbidden'}, 403);

    const target: TranslateTarget =
      kind === 'collection'
        ? {kind, slug, id: data.id as string | number}
        : {kind, slug};

    try {
      const result = await translateDocument({
        payload: req.payload,
        target,
        req,
        overwrite: data.overwrite === true,
        targetLocales: data.targetLocale ? [data.targetLocale as Locale] : undefined
      });

      if (!result.ok) {
        if (result.skipped === 'no-provider') {
          return json({error: 'not-configured'}, 501);
        }
        return json({error: result.skipped ?? 'failed'}, 400);
      }
      return json({ok: true, source: result.source, filled: result.filled});
    } catch (err) {
      req.payload.logger?.error?.(
        `translate endpoint failed: ${(err as Error)?.message ?? err}`
      );
      return json({error: 'translation-failed', message: (err as Error)?.message}, 500);
    }
  }
};
