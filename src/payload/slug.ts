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
 * Four-digit year in Hong Kong time, or `''` for an unusable date. Hong Kong
 * rather than UTC so the serial matches the date the site prints next to the
 * notice (the site formats CMS dates for readers in HK) — a notice published
 * late on 31 December would otherwise be numbered into the wrong year.
 */
function hongKongYear(value: unknown): string {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric'
  }).format(date);
}

type SlugCandidates = (
  data: Record<string, unknown> | undefined,
  originalDoc: Record<string, unknown> | undefined
) => unknown[];

type SlugHookArgs = Parameters<FieldHook>[0];

/** `-2`, `-3` … until the slug is free within the collection. */
async function ensureUnique(
  collection: CollectionSlug,
  base: string,
  {originalDoc, data, req}: SlugHookArgs
): Promise<string> {
  if (!req?.payload) return base;

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
}

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
  return async (args) => {
    let base = '';
    for (const candidate of [args.value, ...from(args.data, args.originalDoc)]) {
      base = slugify(candidate);
      if (base) break;
    }

    if (!base) return base;

    return ensureUnique(collection, base, args);
  };
}

/**
 * Field `beforeValidate` hook for documents numbered like official notices:
 * `2026-001`, `2026-002`, … (owner decision 2026-10-14). Anything typed in the
 * field still wins (normalised), so a custom URL stays possible; blank means a
 * serial is issued for the year of `dateFrom`.
 *
 * 🚩 Why not derive the slug from the title, which is what this used to do
 * (第六十一輪)? Three ways it went wrong, all seen on the live site:
 *
 * 1. **The titles are Chinese**, so `slugify` returned `''` and everything fell
 *    through to the publication date — until two notices shared a date, when
 *    the second became `2026-09-05-2`, which identifies nothing and depends on
 *    the order they happened to be created in (owner raised this).
 * 2. **A title containing digits produced garbage**: 「2025美国实施冬令时间通告」
 *    slugified to `2025`, so that notice squatted `/announcements/2025` — a URL
 *    that neither describes it nor leaves the obvious slug free for later use.
 * 3. **`title` is localized but `slug` is not**, so the URL depended on which
 *    locale the owner happened to save first — an English title would give an
 *    English slug, a Chinese one the date. Not deterministic.
 *
 * A serial is immune to all three: it is locale-independent, unique by
 * construction, short enough for App deep links, and matches how financial
 * institutions reference notices. Numbers are never reused — a new notice takes
 * `max + 1` for its year even if an earlier one was deleted.
 */
export function autoSerialSlug(
  collection: CollectionSlug,
  dateFrom: SlugCandidates
): FieldHook {
  return async (args) => {
    const typed = slugify(args.value);
    if (typed) return ensureUnique(collection, typed, args);

    const {data, originalDoc, req} = args;
    if (!req?.payload) return '';

    let year = '';
    for (const candidate of dateFrom(data, originalDoc)) {
      year = hongKongYear(candidate);
      if (year) break;
    }
    // Never leave the slug empty: a notice without one is dropped by the reader
    // (`mapSummary`), so an unparseable date would make it silently vanish from
    // the list rather than show up under a slightly wrong number.
    if (!year) year = hongKongYear(new Date());

    // One query for the year, then count up locally: `like` is a substring
    // match in Payload's Mongo adapter, so `2026-` collects every serial for
    // that year (and nothing from another year).
    const {docs} = await req.payload.find({
      collection,
      where: {slug: {like: `${year}-`}},
      limit: 1000,
      depth: 0,
      overrideAccess: true,
      req
    });

    const pattern = new RegExp(`^${year}-(\\d{3})$`);
    const taken = new Set<number>();
    for (const doc of docs) {
      const match = pattern.exec(String((doc as {slug?: unknown}).slug ?? ''));
      if (match) taken.add(Number(match[1]));
    }

    let next = taken.size > 0 ? Math.max(...taken) + 1 : 1;
    while (taken.has(next)) next += 1;

    return `${year}-${String(next).padStart(3, '0')}`;
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
