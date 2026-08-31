import path from 'path';
import {fileURLToPath} from 'url';
import {buildConfig} from 'payload';
import type {CollectionConfig, GlobalConfig} from 'payload';
import {postgresAdapter} from '@payloadcms/db-postgres';
import {lexicalEditor} from '@payloadcms/richtext-lexical';
import {en} from '@payloadcms/translations/languages/en';
import {zh} from '@payloadcms/translations/languages/zh';
import {zhTw} from '@payloadcms/translations/languages/zhTw';
import sharp from 'sharp';

import {Users} from './collections/Users';
import {Roles} from './collections/Roles';
import {Media} from './collections/Media';
import {Faqs} from './collections/Faqs';
import {HomeActivities} from './collections/HomeActivities';
import {AcademyArticles} from './collections/AcademyArticles';
import {Instruments} from './collections/Instruments';
import {AccountTiers} from './collections/AccountTiers';
import {AccountBenefits} from './collections/AccountBenefits';
import {AccountSpreads} from './collections/AccountSpreads';
import {AccountPlatforms} from './collections/AccountPlatforms';
import {FundingMethods} from './collections/FundingMethods';
import {Testimonials} from './collections/Testimonials';
import {SiteSettings} from './globals/SiteSettings';
import {HomePage} from './globals/HomePage';
import {TradingPage} from './globals/TradingPage';
import {AboutPage} from './globals/AboutPage';
import {ProductsPage} from './globals/ProductsPage';
import {FundingPage} from './globals/FundingPage';
import {SampleTradingConditions} from './globals/SampleTradingConditions';
import {translateEndpoint} from './endpoints/translate';
import {configHasLocalizedText} from './lib/mt/localizedFields';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * One-click machine-translation control (route B). Injected into the edit view
 * (`beforeDocumentControls`, next to Save) of every collection / global that has
 * translatable localized text. Detection is automatic so future localized
 * collections get the button without extra wiring. After adding/removing a
 * component reference run `npm run generate:importmap`.
 */
const TRANSLATE_CONTROL = '/components/payload/TranslateDocButton';

/**
 * Collections expose `beforeDocumentControls` under `admin.components.edit`,
 * globals under `admin.components.elements` — hence two small helpers.
 */
function withTranslateControlCollection(config: CollectionConfig): CollectionConfig {
  if (!configHasLocalizedText(config.fields)) return config;
  const admin = config.admin ?? {};
  const components = admin.components ?? {};
  const edit = components.edit ?? {};
  const existing = edit.beforeDocumentControls ?? [];
  return {
    ...config,
    admin: {
      ...admin,
      components: {
        ...components,
        edit: {...edit, beforeDocumentControls: [...existing, TRANSLATE_CONTROL]}
      }
    }
  };
}

function withTranslateControlGlobal(config: GlobalConfig): GlobalConfig {
  if (!configHasLocalizedText(config.fields)) return config;
  const admin = config.admin ?? {};
  const components = admin.components ?? {};
  const elements = components.elements ?? {};
  const existing = elements.beforeDocumentControls ?? [];
  return {
    ...config,
    admin: {
      ...admin,
      components: {
        ...components,
        elements: {...elements, beforeDocumentControls: [...existing, TRANSLATE_CONTROL]}
      }
    }
  };
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {baseDir: path.resolve(dirname)},
    meta: {
      titleSuffix: '— HATC CMS',
      description: '華安泰昌官網內容管理後台'
    },
    // Prefer light institutional look; users can still switch if needed.
    theme: 'light',
    dateFormat: 'yyyy-MM-dd',
    components: {
      graphics: {
        Logo: '/components/payload/AdminLogo',
        Icon: '/components/payload/AdminIcon'
      },
      // UI (shell) language is changed via Account → 語言; content locale uses
      // Payload's built-in Localizer. We deliberately do NOT add a second custom
      // UI-language switcher in the header (avoids two confusing "language" controls).
      // Owner request: logout lives top-right (default sidebar logout hidden via CSS).
      actions: ['/components/payload/AdminHeaderLogout'],
      beforeDashboard: [
        '/components/payload/DashboardHub',
        '/components/payload/DashboardIntro'
      ]
    }
  },
  // Admin UI language (shell strings). Distinct from `localization` below.
  // Key MUST be `zh-TW` (matches Accept-Language / payload-lng cookie), not `zhTw`.
  i18n: {
    supportedLanguages: {en, 'zh-TW': zhTw, zh},
    fallbackLanguage: 'zh-TW',
    // The list "create" button shows the generic `general:createNew` ("建立新項目")
    // on every collection; the entity name only reaches the aria-label. Override it
    // to a cleaner action verb ("新增") — it reads naturally under each collection
    // title (e.g. 角色 → 新增).
    translations: {
      'zh-TW': {general: {createNew: '新增'}},
      zh: {general: {createNew: '新增'}},
      en: {general: {createNew: 'Add new'}}
    }
  },
  collections: [
    Users,
    Roles,
    Media,
    HomeActivities,
    Faqs,
    AcademyArticles,
    Instruments,
    AccountTiers,
    AccountBenefits,
    AccountSpreads,
    AccountPlatforms,
    FundingMethods,
    Testimonials
  ].map(withTranslateControlCollection),
  globals: [
    SiteSettings,
    HomePage,
    TradingPage,
    AboutPage,
    ProductsPage,
    FundingPage,
    SampleTradingConditions
  ].map(withTranslateControlGlobal),
  endpoints: [translateEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {connectionString: process.env.DATABASE_URI || ''}
  }),
  sharp,
  // Ensure a full-access Administrator role exists, and (single-owner convenience)
  // heal a lone user that has no role yet — so a fresh DB / schema migration never
  // locks the owner out of the panel. Runs only when a DB is connected.
  onInit: async (payload) => {
    try {
      const existing = await payload.find({
        collection: 'roles',
        where: {fullAccess: {equals: true}},
        limit: 1,
        depth: 0
      });
      let adminRoleId = existing.docs[0]?.id;
      if (!adminRoleId) {
        const created = await payload.create({
          collection: 'roles',
          data: {name: 'Administrator', fullAccess: true}
        });
        adminRoleId = created.id;
      }
      // If exactly one account exists and it has no role, assign the admin role.
      const users = await payload.find({collection: 'users', limit: 2, depth: 0});
      if (users.totalDocs === 1 && !users.docs[0]?.role) {
        await payload.update({
          collection: 'users',
          id: users.docs[0].id,
          data: {role: adminRoleId}
        });
      }
    } catch (err) {
      payload.logger?.error?.(
        `Roles onInit seeding skipped: ${(err as Error)?.message ?? err}`
      );
    }
  },
  // Content localisation mirrors the front-end locales (see src/i18n/routing.ts).
  localization: {
    locales: [
      {label: '繁體中文', code: 'zh-Hant'},
      {label: '简体中文', code: 'zh-Hans'},
      {label: 'English', code: 'en'}
    ],
    defaultLocale: 'zh-Hant',
    fallback: true
  }
});
