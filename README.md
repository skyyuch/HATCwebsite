# HATC Website

華安泰昌有限公司（HATC Group Limited）官方網站。

> 開發前請先閱讀 `AGENTS.md` 與 `docs/`（品牌、事實、結構、設計方向）。
> 公司事實一律以 `docs/HATC_FACTS.md` 為唯一來源，不得杜撰。

## 技術架構

- **Next.js 16**（App Router）+ **TypeScript**
- **next-intl** 三語 i18n：`zh-Hant`（預設）／`zh-Hans`／`en`，路由為 `/[locale]/...`
- **CSS Modules** + design tokens（`src/styles/tokens.css`）
- **Payload CMS**（同倉，`/admin`）+ **MongoDB**（庫名 `hatc-cms`）
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
DATABASE_URI=mongodb://user:password@localhost:27017/hatc-cms?authSource=admin
```

> 本機可用 Docker 起一個：
> `docker run -d --name hatc-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=hatc -e MONGO_INITDB_ROOT_PASSWORD=hatc_dev -v hatc-mongo-data:/data/db mongo:7`
> 庫名含連字號，`mongosh` 指定時要加引號：`mongosh ... "hatc-cms"`。

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
```

## 資料庫 schema

CMS 跑在 **MongoDB**（業主 2026-10-12 由 PostgreSQL 改用；Payload 3 沒有 MySQL adapter）。
Mongo 是 schemaless 的，Payload 連線時會自行建立 collection 與索引，**所以沒有 migration
機制，也不需要任何建表步驟**：

- 新增／修改 collection、global 或欄位之後，**只要跑 `npm run generate:types`** 並
  commit `src/payload-types.ts`。（原本的 `migrate:*` 指令與 `src/migrations/` 已隨
  PostgreSQL 一起退役。）
- 部署流程：準備好 MongoDB → 設 `DATABASE_URI`／`PAYLOAD_SECRET` → `npm run build`
  → `npm run start`。首次進入 `/admin` 時 `onInit` 會自動建立 full-access 的
  `Administrator` 角色。
  **完整的伺服器部署交接說明（環境變數、後台必填清單、行情接線、已知陷阱）見
  [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。**
- 退役欄位要清掉舊資料時，直接對該 collection 下 `$unset`（Mongo 不會因為多出欄位而報錯；
  Payload 預設會略過 schema 以外的鍵）。
- 若日後需要**資料**搬遷（不是 schema），Payload 的 Mongo adapter 仍支援
  `npx payload migrate:create <name>` 產生空白的 up/down 腳本，再用 `npx payload migrate`
  執行。目前倉內沒有任何 migration，也不需要。

## 慣例（詳見 .cursor/rules/）

- 文案一律走 `src/messages/*.json`，**相同文字重用 key，不開新欄位**；元件內不硬寫文字。
- 客服／營運連結由 Payload `SiteSettings` 配置，**不得寫死**。
- Header／Footer 為全域，於 `layout.tsx` 只渲染一次。
- 每頁需檢查桌機、平板、手機版面。
- 公司事實只引用 `docs/HATC_FACTS.md`。
