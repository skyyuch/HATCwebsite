import React from 'react';

/**
 * Branded content hub shown at the top of the admin dashboard (beforeDashboard).
 * Gives the owner a designed entry point to the most-edited content instead of
 * the bare Payload card grid. Localised via the admin UI language (i18n.language:
 * `zh-TW` | `zh` | `en`); default `zh-TW`. Styles live in `adminBrand.css`
 * (loaded globally from the Payload layout).
 */

type AdminLang = 'zh-TW' | 'zh' | 'en';

type HubProps = {
  i18n?: {language?: string};
};

type Entry = {
  href: string;
  labels: Record<AdminLang, {title: string; desc: string}>;
  icon: React.ReactNode;
};

const heading: Record<AdminLang, {kicker: string; title: string; sub: string}> = {
  'zh-TW': {
    kicker: '內容管理',
    title: '管理 HATC 網站內容',
    sub: '從下方快速前往常用的內容區塊。事實與核可交易條件請依既定流程，勿在此改寫。'
  },
  zh: {
    kicker: '内容管理',
    title: '管理 HATC 网站内容',
    sub: '从下方快速前往常用的内容区块。事实与核可交易条件请依既定流程，勿在此改写。'
  },
  en: {
    kicker: 'Content',
    title: 'Manage HATC website content',
    sub: 'Jump to the sections you edit most. Facts and approved trading conditions follow the governed flow — do not rewrite them here.'
  }
};

const icon = (path: React.ReactNode): React.ReactNode => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const ENTRIES: Entry[] = [
  {
    href: '/admin/collections/home-activities',
    labels: {
      'zh-TW': {title: '最新消息 / 活動', desc: '發布活動與公告'},
      zh: {title: '最新消息 / 活动', desc: '发布活动与公告'},
      en: {title: 'News / Activities', desc: 'Publish updates & events'}
    },
    icon: icon(
      <>
        <path d="M4 6h13v12H4z" />
        <path d="M17 9h3v7a2 2 0 0 1-2 2h-1" />
        <path d="M7 9h6M7 12h6M7 15h4" />
      </>
    )
  },
  {
    href: '/admin/collections/faqs',
    labels: {
      'zh-TW': {title: '常見問題', desc: '維護 FAQ 問答'},
      zh: {title: '常见问题', desc: '维护 FAQ 问答'},
      en: {title: 'FAQ', desc: 'Maintain Q&A entries'}
    },
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
        <path d="M12 17h.01" />
      </>
    )
  },
  {
    href: '/admin/collections/academy-articles',
    labels: {
      'zh-TW': {title: '黃金學堂', desc: '撰寫教育文章'},
      zh: {title: '黄金学堂', desc: '撰写教育文章'},
      en: {title: 'Academy', desc: 'Write education articles'}
    },
    icon: icon(
      <>
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1 2.5 2 6 2s6-1 6-2v-5" />
      </>
    )
  },
  {
    href: '/admin/globals/home-page',
    labels: {
      'zh-TW': {title: '頁面文案', desc: '首頁／交易／關於／產品'},
      zh: {title: '页面文案', desc: '首页／交易／关于／产品'},
      en: {title: 'Page copy', desc: 'Home / Trading / About / Products'}
    },
    icon: icon(
      <>
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M14 3v6h6" />
        <path d="M9 13h7M9 16h7" />
      </>
    )
  },
  {
    href: '/admin/globals/site-settings',
    labels: {
      'zh-TW': {title: '網站營運設定', desc: '聯絡／客服等連結'},
      zh: {title: '网站运营设置', desc: '联络／客服等链接'},
      en: {title: 'Site settings', desc: 'Contact & support links'}
    },
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    )
  },
  {
    href: '/admin/globals/sample-trading-conditions',
    labels: {
      'zh-TW': {title: '示意交易條件表', desc: '版面示意數字（非事實）'},
      zh: {title: '示意交易条件表', desc: '版面示意数字（非事实）'},
      en: {title: 'Sample conditions', desc: 'Layout sample figures (not facts)'}
    },
    icon: icon(
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l3-3 3 2 4-5" />
      </>
    )
  }
];

function resolveLang(raw?: string): AdminLang {
  if (raw === 'en' || raw === 'zh') return raw;
  return 'zh-TW';
}

export default function DashboardHub({i18n}: HubProps) {
  const lang = resolveLang(i18n?.language);
  const h = heading[lang];

  return (
    <section className="hatc-hub" aria-label={h.title}>
      <header className="hatc-hub__head">
        <p className="hatc-hub__kicker">{h.kicker}</p>
        <h2 className="hatc-hub__title">{h.title}</h2>
        <p className="hatc-hub__sub">{h.sub}</p>
      </header>
      <div className="hatc-hub__grid">
        {ENTRIES.map((entry) => {
          const l = entry.labels[lang];
          return (
            <a key={entry.href} className="hatc-hub__card" href={entry.href}>
              <span className="hatc-hub__icon">{entry.icon}</span>
              <span className="hatc-hub__card-text">
                <span className="hatc-hub__card-title">{l.title}</span>
                <span className="hatc-hub__card-desc">{l.desc}</span>
              </span>
              <span className="hatc-hub__arrow" aria-hidden="true">
                →
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
