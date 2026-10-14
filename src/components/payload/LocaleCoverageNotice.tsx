import React from 'react';
import type {Payload, SanitizedCollectionConfig, Field} from 'payload';

import type {Locale} from '@/i18n/routing';

/**
 * Warns, at the top of a collection list view, about documents whose **title is
 * missing in a content locale** (owner decision 2026-10-14, 第七十一輪).
 *
 * Why this exists: a colleague typed ten announcements in Simplified Chinese
 * only. Seven of them then had no 繁體中文 title, and because the readers drop a
 * document with no title in the requested locale (`mapSummary`), those notices
 * disappeared from the Traditional Chinese **and** English sites and never
 * reached `sitemap.xml` — with no sign of it anywhere in the admin, where the
 * list simply showed the locale you happened to be viewing. The owner chose to
 * keep that strictness (no cross-locale fallback on the public site, so a
 * missing translation stays visible as missing) **provided the admin says so**.
 *
 * Scope is deliberately the title only: it is the field whose absence removes
 * the document from the site, and checking it costs one tiny query per locale
 * (`select` + `depth: 0`). Checking every localized leaf would mean pulling full
 * Lexical bodies for all 49 academy articles on every list render.
 *
 * Auto-injected into `beforeListTable` for every collection that has
 * translatable localized text (same detection as the translate button, see
 * `payload.config.ts`); it renders nothing when the title is not localized or
 * when every document is complete.
 */

type AdminLang = 'zh-TW' | 'zh' | 'en';

type Props = {
  payload?: Payload;
  collectionConfig?: SanitizedCollectionConfig;
  i18n?: {language?: string};
};

type Gap = {
  id: string;
  /** Slug and/or any title we found, so the row is recognisable. */
  label: string;
  missing: Locale[];
};

type DocMeta = {slug?: string; title?: string; enabled: boolean};

const COPY: Record<
  AdminLang,
  {
    criticalTitle: (count: number, locale: string) => string;
    criticalBody: (locale: string) => string;
    warnTitle: (count: number) => string;
    warnBody: (locale: string) => string;
    more: (count: number) => string;
    fix: string;
    missing: string;
    untitled: string;
  }
> = {
  'zh-TW': {
    criticalTitle: (n, l) => `有 ${n} 筆項目缺少「${l}」標題，前台三個語系都看不到`,
    criticalBody: (l) =>
      `${l}是正本語系，其他語系在缺內容時會回退到它；它本身沒有回退對象，所以缺標題的項目會從所有語系的列表消失，也不會進 sitemap。`,
    warnTitle: (n) => `有 ${n} 筆項目缺少部分語系的標題`,
    warnBody: (l) => `這些語系的頁面會改顯示${l}內容，不會消失。`,
    more: (n) => `…另有 ${n} 筆`,
    fix: '請點進該項目、用右上「語言地區」切到缺少的語系補上；或按「一鍵機器翻譯」，系統會以現有內容最完整的語系為來源產生草稿，再校對。',
    missing: '缺',
    untitled: '（未命名）'
  },
  zh: {
    criticalTitle: (n, l) => `有 ${n} 笔项目缺少「${l}」标题，前台三个语系都看不到`,
    criticalBody: (l) =>
      `${l}是正本语系，其他语系在缺内容时会回退到它；它本身没有回退对象，所以缺标题的项目会从所有语系的列表消失，也不会进 sitemap。`,
    warnTitle: (n) => `有 ${n} 笔项目缺少部分语系的标题`,
    warnBody: (l) => `这些语系的页面会改显示${l}内容，不会消失。`,
    more: (n) => `…另有 ${n} 笔`,
    fix: '请点进该项目、用右上「语言地区」切到缺少的语系补上；或按「一键机器翻译」，系统会以现有内容最完整的语系为来源产生草稿，再校对。',
    missing: '缺',
    untitled: '（未命名）'
  },
  en: {
    criticalTitle: (n, l) =>
      `${n} item(s) have no ${l} title and are therefore missing from all three locales`,
    criticalBody: (l) =>
      `${l} is the canonical locale that the others fall back to; it has nothing to fall back to itself, so an item without this title drops out of every locale's list and out of sitemap.xml.`,
    warnTitle: (n) => `${n} item(s) are missing a title in some locales`,
    warnBody: (l) => `Those pages show the ${l} copy instead — nothing disappears.`,
    more: (n) => `…and ${n} more`,
    fix: 'Open the item and switch the top-right Locale to fill the missing one in, or press Auto-translate to draft it from whichever locale is most complete, then proofread.',
    missing: 'Missing',
    untitled: '(untitled)'
  }
};

/**
 * Rows listed per block. The local academy collection alone has 44 articles
 * without translated titles, and a 44-row panel would push the actual table off
 * the screen — the count in the heading carries the full number.
 */
const MAX_ROWS = 8;

function resolveLang(raw?: string): AdminLang {
  if (raw === 'en' || raw === 'zh') return raw;
  return 'zh-TW';
}

/** Payload locale labels may be a plain string or per-admin-language. */
function localeLabel(
  payload: Payload,
  code: string,
  lang: AdminLang
): string {
  const entry = payload.config.localization
    ? payload.config.localization.locales.find((l) => l.code === code)
    : undefined;
  const label = entry?.label;
  if (typeof label === 'string') return label;
  if (label && typeof label === 'object') {
    const map = label as Record<string, string>;
    return map[lang] ?? map['zh-TW'] ?? map.en ?? code;
  }
  return code;
}

/**
 * Top-level named field lookup. Only top level is needed: `useAsTitle`,
 * `slug` and `enabled` are flat fields by convention in this repo.
 */
function findField(
  fields: Field[],
  name: string
): {localized?: boolean | null} | undefined {
  return fields.find((f) => 'name' in f && f.name === name) as
    | {localized?: boolean | null}
    | undefined;
}

export default async function LocaleCoverageNotice({
  payload,
  collectionConfig,
  i18n
}: Props) {
  if (!payload || !collectionConfig) return null;

  const localization = payload.config.localization;
  if (!localization) return null;

  const titleField = collectionConfig.admin?.useAsTitle;
  if (!titleField || titleField === 'id') return null;

  const fields = collectionConfig.fields;
  const title = findField(fields, titleField);
  // Only a localized title can be missing per locale; `filename`-style titles
  // (Media) and non-localized names are not this component's business.
  if (!title || title.localized !== true) return null;

  const defaultLocale = localization.defaultLocale as Locale;
  const locales = localization.locales.map((l) => l.code as Locale);

  const hasEnabled = Boolean(findField(fields, 'enabled'));
  const slugField = findField(fields, 'slug');
  const hasSlug = Boolean(slugField && slugField.localized !== true);

  const select: Record<string, boolean> = {[titleField]: true};
  if (hasSlug) select.slug = true;
  if (hasEnabled) select.enabled = true;

  // One cheap query per locale. `fallbackLocale: false` is what makes a stored
  // value distinguishable from the default-locale fallback, exactly as in
  // `translateDocument`.
  const titles = new Map<Locale, Map<string, string>>();
  const meta = new Map<string, DocMeta>();

  try {
    for (const locale of locales) {
      const res = await payload.find({
        collection: collectionConfig.slug,
        locale,
        fallbackLocale: false,
        depth: 0,
        limit: 500,
        overrideAccess: true,
        select
      });

      const byId = new Map<string, string>();
      for (const doc of res.docs as unknown as Record<string, unknown>[]) {
        const id = String(doc.id);
        const value = typeof doc[titleField] === 'string' ? (doc[titleField] as string) : '';
        byId.set(id, value.trim());

        const current = meta.get(id);
        const enabled = hasEnabled ? doc.enabled !== false : true;
        const slug = hasSlug && typeof doc.slug === 'string' ? doc.slug : undefined;
        meta.set(id, {
          slug: current?.slug || slug,
          // Any locale's title will do: the list column shows「<無 標題>」for the
          // locale being viewed, so the point of this label is to identify the
          // row by whatever copy does exist.
          title: current?.title || value.trim() || undefined,
          enabled: current ? current.enabled && enabled : enabled
        });
      }
      titles.set(locale, byId);
    }
  } catch {
    // A list view must never fail because of this advisory panel.
    return null;
  }

  const lang = resolveLang(i18n?.language);
  const t = COPY[lang];

  const critical: Gap[] = [];
  const warnings: Gap[] = [];

  for (const [id, info] of meta) {
    if (!info.enabled) continue;

    const missing = locales.filter((locale) => !titles.get(locale)?.get(id));
    if (missing.length === 0) continue;
    // Everything missing = a brand-new empty draft, not a translation gap.
    if (missing.length === locales.length) continue;

    const label = [info.slug, info.title].filter(Boolean).join(' · ') || t.untitled;
    const gap: Gap = {id, label, missing};
    if (missing.includes(defaultLocale)) critical.push(gap);
    else warnings.push(gap);
  }

  if (critical.length === 0 && warnings.length === 0) return null;

  const adminRoute = payload.config.routes?.admin ?? '/admin';
  const defaultLabel = localeLabel(payload, defaultLocale, lang);

  const renderList = (items: Gap[]) => (
    <ul className="hatc-locale-gap__list">
      {items.slice(0, MAX_ROWS).map((item) => (
        <li key={item.id}>
          <a
            href={`${adminRoute}/collections/${collectionConfig.slug}/${item.id}?locale=${item.missing[0]}`}
          >
            {item.label}
          </a>
          <span className="hatc-locale-gap__missing">
            {t.missing}：
            {item.missing.map((code) => localeLabel(payload, code, lang)).join('、')}
          </span>
        </li>
      ))}
      {items.length > MAX_ROWS && (
        <li className="hatc-locale-gap__missing">{t.more(items.length - MAX_ROWS)}</li>
      )}
    </ul>
  );

  return (
    <div className="hatc-locale-gap">
      {critical.length > 0 && (
        <section className="hatc-locale-gap__block hatc-locale-gap__block--critical">
          <h3>{t.criticalTitle(critical.length, defaultLabel)}</h3>
          <p>{t.criticalBody(defaultLabel)}</p>
          {renderList(critical)}
        </section>
      )}
      {warnings.length > 0 && (
        <section className="hatc-locale-gap__block">
          <h3>{t.warnTitle(warnings.length)}</h3>
          <p>{t.warnBody(defaultLabel)}</p>
          {renderList(warnings)}
        </section>
      )}
      <p className="hatc-locale-gap__fix">{t.fix}</p>
    </div>
  );
}
