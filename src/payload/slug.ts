import type {
  CollectionSlug,
  FieldHook,
  TextFieldSingleValidation
} from 'payload';

import type {AdminLabel} from '@/payload/adminLabels';

/**
 * URL slugs for owner-created CMS documents.
 *
 * 2026-10-12 (第六十一輪): the owner's first announcement was saved with the slug
 * `" /announcements"` — he read 「網址代稱」as "the URL of the page" — so the card
 * linked to `/announcements/ /announcements` and the detail page 404'd. A slug
 * the editor has to invent, with no normalisation, is a trap for a site whose
 * titles are Chinese (there is nothing sensible to transliterate). The rule
 * here: **never let a typed value reach a route unnormalised, and fill the
 * field in automatically whenever something usable can be derived.**
 */

/** ASCII slug; `''` when the input has no usable characters (e.g. pure Chinese). */
export function slugify(input: unknown): string {
  if (typeof input !== 'string') return '';

  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

/**
 * `YYYY-MM-DD` in Hong Kong time — the fallback slug for a notice whose title
 * is Chinese. Hong Kong rather than UTC so the slug matches the date the site
 * prints next to the notice (the site formats CMS dates for readers in HK).
 */
export function dateSlug(value: unknown): string {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

type SlugCandidates = (
  data: Record<string, unknown> | undefined,
  originalDoc: Record<string, unknown> | undefined
) => unknown[];

/**
 * Field `beforeValidate` hook: normalise whatever was typed, fall back to the
 * given candidates when that leaves nothing, then append `-2`, `-3` … until the
 * slug is free within the collection.
 *
 * Returns `''` only when every candidate is unusable; the field's own `validate`
 * turns that into a message instead of a silently broken URL.
 */
export function autoSlug(
  collection: CollectionSlug,
  from: SlugCandidates
): FieldHook {
  return async ({value, data, originalDoc, req}) => {
    let base = '';
    for (const candidate of [value, ...from(data, originalDoc)]) {
      base = slugify(candidate);
      if (base) break;
    }

    if (!base || !req?.payload) return base;

    const currentId = String(originalDoc?.id ?? data?.id ?? '');
    let slug = base;

    for (let suffix = 2; suffix <= 50; suffix += 1) {
      const {docs} = await req.payload.find({
        collection,
        where: {slug: {equals: slug}},
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req
      });

      if (!docs.some((doc) => String(doc.id) !== currentId)) return slug;
      slug = `${base}-${suffix}`;
    }

    return slug;
  };
}

/**
 * Validation message for the one case `autoSlug` cannot solve: a document with
 * no derivable slug (e.g. a category whose name is Chinese and whose slug was
 * left blank). Payload's own `required` message would just say "required",
 * which is what sent the owner looking for something to paste in.
 */
export function slugRequired(message: AdminLabel): TextFieldSingleValidation {
  return (value, {req}) => {
    if (typeof value === 'string' && value.length > 0) return true;

    const language = req?.i18n?.language;
    if (language === 'zh') return message.zh;
    if (language === 'en') return message.en;
    return message['zh-TW'];
  };
}
