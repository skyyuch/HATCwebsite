'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {Button, toast, useDocumentInfo, useTranslation} from '@payloadcms/ui';

/**
 * One-click machine-translation pre-fill button (route B).
 *
 * Sits beside Save. Sends the current document to `/api/translate`, which fills
 * the OTHER content locales' empty localized text with a proofreading draft
 * (never overwriting values already entered). After success the editor switches
 * the top-right Locale to review / edit the drafts.
 *
 * The source locale is decided server-side from the content (most complete
 * locale, ties → 繁體中文) rather than being fixed to 繁體中文, so a document
 * typed in Simplified Chinese still gets translated (第七十一輪). The toast
 * names the locale that was used as the original, because that is the one the
 * editor is implicitly declaring canonical.
 *
 * Degrades gracefully: when MT is not configured the button is disabled with a
 * hint; unsaved collection docs disable it until saved.
 */
type Labels = {
  action: string;
  running: string;
  notConfigured: string;
  saveFirst: string;
  /** `{source}` = locale label the draft was translated from. */
  successPrefix: string;
  noEmpty: string;
  failed: string;
  hint: string;
};

/** Content-locale labels, mirroring `payload.config.localization.locales`. */
const LOCALE_LABELS: Record<string, string> = {
  'zh-Hant': '繁體中文',
  'zh-Hans': '简体中文',
  en: 'English'
};

const LABELS: Record<string, Labels> = {
  'zh-TW': {
    action: '一鍵機器翻譯',
    running: '翻譯中…',
    notConfigured: '尚未設定翻譯服務（缺少 API 金鑰）',
    saveFirst: '請先儲存文件再翻譯',
    successPrefix: '已以{source}為來源填入翻譯草稿：',
    noEmpty: '沒有需要翻譯的空欄位（其他語系已有內容，或本文件尚無任何內容）。',
    failed: '翻譯失敗',
    hint: '把內容最完整的語系機器翻譯為其他語系草稿（同樣完整時以繁體中文為正本；僅填空、不覆蓋已填）。完成後於右上「語言地區」切換校對。'
  },
  zh: {
    action: '一键机器翻译',
    running: '翻译中…',
    notConfigured: '尚未设定翻译服务（缺少 API 密钥）',
    saveFirst: '请先保存文档再翻译',
    successPrefix: '已以{source}为来源填入翻译草稿：',
    noEmpty: '没有需要翻译的空字段（其他语系已有内容，或本文档尚无任何内容）。',
    failed: '翻译失败',
    hint: '把内容最完整的语系机器翻译为其他语系草稿（同样完整时以繁体中文为正本；仅填空、不覆盖已填）。完成后于右上「语言地区」切换校对。'
  },
  en: {
    action: 'Auto-translate',
    running: 'Translating…',
    notConfigured: 'Translation service is not configured (missing API key)',
    saveFirst: 'Save the document before translating',
    successPrefix: 'Draft translations filled from {source}: ',
    noEmpty:
      'Nothing to translate — the other locales already have content, or this document is still empty.',
    failed: 'Translation failed',
    hint: 'Machine-translate the most complete locale into draft copy for the others (Traditional Chinese wins a tie; fills empty fields only). Switch the top-right Locale to proofread.'
  }
};

export default function TranslateDocButtonClient({configured}: {configured: boolean}) {
  const {id, collectionSlug, globalSlug} = useDocumentInfo();
  const {i18n} = useTranslation();
  const router = useRouter();
  const [running, setRunning] = React.useState(false);

  const lang = (i18n?.language as string) || 'zh-TW';
  const t = LABELS[lang] ?? LABELS['zh-TW'];

  const isCollection = Boolean(collectionSlug);
  const needsSave = isCollection && (id === undefined || id === null);
  const disabled = !configured || running || needsSave;

  const title = !configured
    ? t.notConfigured
    : needsSave
      ? t.saveFirst
      : t.hint;

  async function handleClick() {
    if (disabled) return;
    setRunning(true);
    try {
      const body = collectionSlug
        ? {kind: 'collection', slug: collectionSlug, id}
        : {kind: 'global', slug: globalSlug};

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        source?: string;
        filled?: Record<string, number>;
      };

      if (res.status === 501 || data.error === 'not-configured') {
        toast.info(t.notConfigured);
        return;
      }
      if (!res.ok) {
        toast.error(`${t.failed}: ${data.message ?? data.error ?? res.status}`);
        return;
      }

      const filled = data.filled ?? {};
      const total = Object.values(filled).reduce((a, b) => a + (b || 0), 0);
      if (total === 0) {
        toast.info(t.noEmpty);
      } else {
        const parts = Object.entries(filled)
          .filter(([, n]) => n > 0)
          .map(([loc, n]) => `${LOCALE_LABELS[loc] ?? loc} ${n}`)
          .join('、');
        const sourceLabel = data.source
          ? (LOCALE_LABELS[data.source] ?? data.source)
          : '';
        toast.success(`${t.successPrefix.replace('{source}', sourceLabel)}${parts}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(`${t.failed}: ${(err as Error)?.message ?? err}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button
      type="button"
      buttonStyle="secondary"
      size="medium"
      disabled={disabled}
      onClick={handleClick}
      aria-label={t.action}
      className="hatc-translate-button"
      tooltip={title}
    >
      {running ? t.running : t.action}
    </Button>
  );
}
