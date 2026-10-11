# HATC Website

華安泰昌有限公司（HATC Group Limited）官方網站。

> 開發前請先閱讀 `AGENTS.md` 與 `docs/`（品牌、事實、結構、設計方向）。
> 公司事實一律以 `docs/HATC_FACTS.md` 為唯一來源，不得杜撰。

## 技術架構

- **Next.js 16**（App Router）+ **TypeScript**
- **next-intl** 三語 i18n：`zh-Hant`（預設）／`zh-Hans`／`en`，路由為 `/[locale]/...`
- **CSS Modules** + design tokens（`src/styles/tokens.css`）
- **Payload CMS**（同倉，`/admin`）+ **PostgreSQL**
- SEO 內建：Metadata API、`hreflang`、`sitemap.xml`、`robots.txt`、`Organization` JSON-LD
- 追蹤埋碼位已預留（工具待定，以環境變數注入，不寫死）

## 目錄結構

```
src/
├── app/
│   ├── (frontend)/[locale]/   # 網站前台（三語）
│   │   ├── layout.tsx         # 全域 Header / Footer（只渲染一次）
│   │   ├── page.tsx           # 首頁
│   │   ├── register/          # 註冊入口（即將推出）
│   │   └── account/           # 用戶中心入口（即將推出）
│   ├── (payload)/             # Payload admin 與 API（自動產生慣例檔）
│   ├── sitemap.ts
│   └── robots.ts
├── collections/               # Payload collections（Users, Media）
├── globals/                   # Payload globals（SiteSettings：客服連結）
├── components/                # UI 元件（Header, Footer, LocaleSwitcher…）
├── content/company.ts         # 由 HATC_FACTS.md 衍生的公司事實
├── messages/                  # 三語 JSON 文案
├── i18n/                      # next-intl routing / request / navigation
├── lib/                       # seo、siteSettings
└── payload.config.ts
```

## 快速開始

1. 安裝相依套件：

```bash
npm install
```

2. 建立 `.env`（可複製 `.env.example`），至少設定：

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYLOAD_SECRET=<openssl rand -base64 32>
DATABASE_URI=postgres://user:password@localhost:5432/hatc
```

3. 啟動開發伺服器：

```bash
npm run dev
```

- 前台：`http://localhost:3000` → 會導向 `http://localhost:3000/zh-Hant`
- 後台：`http://localhost:3000/admin`（需設定 `DATABASE_URI`，首次進入建立管理者帳號）

> 未設定 `DATABASE_URI` 時，前台仍可運行；客服連結會回退讀取 `NEXT_PUBLIC_CONTACT_*` 環境變數。

## 常用指令

```bash
npm run dev                # 開發
npm run build              # 生產建置
npm run start              # 啟動生產伺服器
npm run generate:types     # 產生 Payload 型別（src/payload-types.ts）
npm run generate:importmap # 產生 admin importMap
npm run i18n:check         # 三語文案鍵數對齊檢查（CI／pre-commit 用）
npm run migrate            # 對資料庫套用 src/migrations/*（部署用）
npm run migrate:create -- <name>  # 依 config 變更產生新 migration（不需連資料庫）
npm run migrate:status     # 顯示已套用／待套用的 migration
npm run migrate:check      # 檢查 config 是否有未產 migration 的 schema 變更
```

## 資料庫 schema 與 migration

本機開發靠 Payload 的 Drizzle **push**（僅 dev 模式）自動同步資料庫，**不會**留下任何
migration 檔；**生產模式不 push，只會重播 `src/migrations/*`**。因此：

- **改了 `src/collections/*`、`src/globals/*`、`src/payload.config.ts` 或
  `src/payload/permissions/registry.ts`（它的資源清單會生成 `roles` 的勾選欄位）之後，
  務必跑 `npm run migrate:create -- <描述性名稱>` 並把產生的 `.ts` ＋ `.json` ＋ `index.ts`
  一起 commit。**
- `npm run migrate:check` 會把漏掉的 migration 攔下來（CI 與 pre-commit 皆已掛）。
  它比對 config 與 migrations 目錄最新的 snapshot JSON，**不需要資料庫**。
- 部署流程：建立空資料庫 → 設好 `DATABASE_URI`／`PAYLOAD_SECRET` → `npm run migrate`
  → `npm run build` → `npm run start`。首次進入 `/admin` 時 `onInit` 會自動建立
  full-access 的 `Administrator` 角色。
  **完整的伺服器部署交接說明（環境變數、後台必填清單、行情接線、已知陷阱）見
  [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。**
  若部署到無法跑 CLI 步驟的 serverless 平台（如 Vercel），把 `npm run migrate` 併進
  build command，或改用 Payload 的 `postgresAdapter({prodMigrations})`（本倉目前未啟用，
  避免執行期自動改 schema）。
- ⚠ **不要**把 `npm run migrate` 指向既有的、由 push 建出來的本機資料庫——那些表已經存在，
  migration 會在 `CREATE TABLE` 失敗。本機要改用 migration 流程的話，先砍掉重建資料庫
  （本機資料皆為可重跑的種子腳本產物）。

## 慣例（詳見 .cursor/rules/）

- 文案一律走 `src/messages/*.json`，**相同文字重用 key，不開新欄位**；元件內不硬寫文字。
- 客服／營運連結由 Payload `SiteSettings` 配置，**不得寫死**。
- Header／Footer 為全域，於 `layout.tsx` 只渲染一次。
- 每頁需檢查桌機、平板、手機版面。
- 公司事實只引用 `docs/HATC_FACTS.md`。
