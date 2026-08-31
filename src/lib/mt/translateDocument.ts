/**
 * translateDocument — machine-translation pre-fill orchestrator (route B).
 *
 * Given a collection document or a global, reads the approved source-locale copy
 * (default `zh-Hant`) and fills EMPTY localized leaves in the other content
 * locales with a machine-translated **draft** for the owner to proofread. It
 * never overwrites values already present in a target locale (unless
 * `overwrite` is explicitly set). It covers:
 * - localized `text` / `textarea` leaves (string granularity), and
 * - localized `richText` (Lexical) fields. Two granularities:
 *   • Empty target body (or `overwrite`) → whole-field: the source body is
 *     translated node by node and written (Phase 2).
 *   • Non-empty target body → per-segment fill (Phase 3): when the target shares
 *     the SAME structure as the source, only the still-empty text nodes are
 *     filled from the matching source segment; the owner's already-filled
 *     segments are left untouched. If the structure has diverged (owner
 *     added / removed / restructured blocks) the field is skipped so a
 *     hand-edited target is never corrupted. See `localizedFields.ts` /
 *     `richText.ts`.
 *
 * Reads use `fallbackLocale: false` so a target locale's *stored* value is
 * distinguishable from the source fallback (localization.fallback is `true`).
 * The full target-locale document is cloned and written back with only the
 * empty leaves filled, preserving array row ids and any already-filled target
 * values.
 *
 * Governance: facts (`docs/HATC_FACTS.md`) and approved trading conditions
 * (`tradingConditions.ts`) are not part of this pipeline; sample tables keep
 * their「示意數據」label regardless. Numbers / symbols / codes are preserved by
 * the provider prompt.
 *
 * NOTE: imported into the Payload config graph (custom endpoint) — must stay
 * resolvable by the Payload CLI, so no `import 'server-only'`.
 */
import type {Payload, PayloadRequest, Field} from 'payload';

import type {Locale} from '@/i18n/routing';
import {
  collectLeaves,
  collectRichTextLeaves,
  getByPath,
  setByPath
} from '@/lib/mt/localizedFields';
import {getTranslationProvider} from '@/lib/mt/provider';
import {
  applyRichTextTexts,
  applyRichTextTextsAtIndices,
  extractRichTextTexts,
  isRichTextEmpty,
  richTextStructure
} from '@/lib/mt/richText';

export type TranslateTarget =
  | {kind: 'collection'; slug: string; id: string | number}
  | {kind: 'global'; slug: string};

export type TranslateDocumentArgs = {
  payload: Payload;
  target: TranslateTarget;
  /** Restrict to these target locales; defaults to all non-source locales. */
  targetLocales?: Locale[];
  /** Overwrite already-filled target values too (default false = fill only). */
  overwrite?: boolean;
  /** Thread the current request (transaction / revalidation context). */
  req?: PayloadRequest;
};

export type TranslateDocumentResult = {
  ok: boolean;
  skipped?: 'no-provider' | 'no-localization' | 'unknown-resource' | 'not-found';
  source?: Locale;
  /** Number of leaves filled, per target locale. */
  filled?: Partial<Record<Locale, number>>;
  message?: string;
};

function getFields(payload: Payload, target: TranslateTarget): Field[] | null {
  if (target.kind === 'collection') {
    return payload.config.collections.find((c) => c.slug === target.slug)?.fields ?? null;
  }
  return payload.config.globals.find((g) => g.slug === target.slug)?.fields ?? null;
}

export async function translateDocument(
  args: TranslateDocumentArgs
): Promise<TranslateDocumentResult> {
  const {payload, target, overwrite = false, req} = args;

  const provider = getTranslationProvider();
  if (!provider) return {ok: false, skipped: 'no-provider'};

  const localization = payload.config.localization;
  if (!localization) return {ok: false, skipped: 'no-localization'};

  const source = localization.defaultLocale as Locale;
  const allLocales = localization.locales.map((l) => l.code as Locale);
  const targets = (args.targetLocales ?? allLocales).filter((l) => l !== source);

  const fields = getFields(payload, target);
  if (!fields) return {ok: false, skipped: 'unknown-resource'};

  // Loose handle: dynamic slugs don't narrow the Local API generics. Runtime
  // validation is still performed by Payload against the collection/global config.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = payload as any;

  async function readDoc(locale: Locale): Promise<Record<string, unknown> | null> {
    if (target.kind === 'collection') {
      return (await p.findByID({
        collection: target.slug,
        id: target.id,
        locale,
        fallbackLocale: false,
        depth: 0,
        overrideAccess: true,
        req,
        disableErrors: true
      })) as Record<string, unknown> | null;
    }
    return (await p.findGlobal({
      slug: target.slug,
      locale,
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
      req
    })) as Record<string, unknown> | null;
  }

  const sourceDoc = await readDoc(source);
  if (!sourceDoc) return {ok: false, skipped: 'not-found'};

  const sourceLeaves = collectLeaves(fields, sourceDoc).filter(
    (leaf) => leaf.value.trim().length > 0
  );
  const sourceRichLeaves = collectRichTextLeaves(fields, sourceDoc).filter(
    (leaf) => !isRichTextEmpty(leaf.value)
  );

  const filled: Partial<Record<Locale, number>> = {};

  for (const locale of targets) {
    const targetDoc = await readDoc(locale);
    if (!targetDoc) continue;

    const clone = structuredClone(targetDoc);
    let count = 0;

    // 1) text / textarea leaves — fill empty target values only (string level).
    const pending = sourceLeaves.filter((leaf) => {
      const current = getByPath(targetDoc, leaf.path);
      const hasValue = typeof current === 'string' && current.trim().length > 0;
      return overwrite || !hasValue;
    });

    if (pending.length > 0) {
      const translations = await provider.translateBatch(
        pending.map((leaf) => leaf.value),
        {sourceLocale: source, targetLocale: locale}
      );
      pending.forEach((leaf, i) => {
        const translated = translations[i];
        if (typeof translated === 'string' && translated.trim().length > 0) {
          setByPath(clone, leaf.path, translated);
          count++;
        }
      });
    }

    // 2) richText (Lexical) fields.
    for (const rich of sourceRichLeaves) {
      const currentBody = getByPath(targetDoc, rich.path);

      if (overwrite || isRichTextEmpty(currentBody)) {
        // Whole-field (Phase 2): translate the source body's text nodes and
        // write the reconstructed body, preserving structure / formatting.
        const texts = extractRichTextTexts(rich.value);
        if (texts.length === 0) continue;

        const translations = await provider.translateBatch(texts, {
          sourceLocale: source,
          targetLocale: locale
        });
        const {body: translatedBody, filled: applied} = applyRichTextTexts(
          rich.value,
          translations
        );
        if (applied > 0) {
          setByPath(clone, rich.path, translatedBody);
          count += applied;
        }
        continue;
      }

      // Per-segment fill (Phase 3): the target already has content. Only fill
      // the still-empty text nodes, and only when the target shares the source
      // structure so DFS indices align exactly. A diverged (hand-restructured)
      // target is skipped to avoid corrupting the owner's proofread copy.
      if (richTextStructure(rich.value) !== richTextStructure(currentBody)) continue;

      const sourceTexts = extractRichTextTexts(rich.value);
      const targetTexts = extractRichTextTexts(currentBody);
      const pendingByIndex = new Map<number, string>();
      for (let i = 0; i < sourceTexts.length; i++) {
        const s = sourceTexts[i];
        const t = targetTexts[i];
        // Fill only where the source has copy and the target segment is empty.
        if (s.trim().length > 0 && (t ?? '').trim().length === 0) {
          pendingByIndex.set(i, s);
        }
      }
      if (pendingByIndex.size === 0) continue;

      const indices = [...pendingByIndex.keys()];
      const translations = await provider.translateBatch(
        indices.map((i) => pendingByIndex.get(i) as string),
        {sourceLocale: source, targetLocale: locale}
      );
      const applyMap = new Map<number, string>();
      indices.forEach((idx, k) => {
        const tr = translations[k];
        if (typeof tr === 'string') applyMap.set(idx, tr);
      });
      const {body: mergedBody, filled: applied} = applyRichTextTextsAtIndices(
        currentBody,
        applyMap
      );
      if (applied > 0) {
        setByPath(clone, rich.path, mergedBody);
        count += applied;
      }
    }

    if (count === 0) {
      filled[locale] = 0;
      continue;
    }

    if (target.kind === 'collection') {
      await p.update({
        collection: target.slug,
        id: target.id,
        locale,
        data: clone,
        depth: 0,
        overrideAccess: true,
        req
      });
    } else {
      await p.updateGlobal({
        slug: target.slug,
        locale,
        data: clone,
        depth: 0,
        overrideAccess: true,
        req
      });
    }

    filled[locale] = count;
  }

  return {ok: true, source, filled};
}
