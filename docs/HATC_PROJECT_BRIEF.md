# HATC Project Brief

> 狀態：草稿骨架，待與業主討論後填寫。
> 未確認內容一律標記 `【待確認】`，不得憑空填入。

## 1. 專案目標

- 官網主要目的：【待確認】（例：建立機構級品牌形象／說明會員資格／提供聯絡入口）
- 成功指標：【待確認】

## 2. 目標受眾

- 主要受眾：【待確認】
- 次要受眾：【待確認】

## 3. 內容範圍

- 需呈現的核心訊息：【待確認】
- 需要的頁面（詳見 `WEBSITE_STRUCTURE.md`）：【待確認】
- 預留功能入口：註冊、用戶中心（第一階段先做入口按鈕，功能後續實作）

## 3a. SEO 與數據追蹤（建站即內建）

- SEO：Next.js Metadata API、三語 `hreflang`、`sitemap.xml`、`robots.txt`、
  JSON-LD 結構化資料（來源限 `HATC_FACTS.md`）、語意化 HTML。詳見 `.cursor/rules/hatc-seo.mdc`。
- 追蹤：埋碼於建站時完成，追蹤 ID／金鑰以環境變數或 CMS 配置，不寫死。
- 追蹤工具選型：【待確認，日後決定】。骨架先以環境變數／CMS 配置預留埋碼位，不寫死。

## 4. 語言與地區

- 主要語言：繁體中文（預設 locale）
- 第一階段即同時上線：繁體中文、簡體中文、英文
- 架構須以 i18n 為前提設計，三語共用同一份內容結構

## 5. 技術方向

- 前端框架：Next.js（App Router）+ TypeScript
- 樣式方案：CSS Modules + design tokens（色彩／字級／間距集中管理）
- i18n 方案：next-intl（`[locale]` routing、message 檔集中）
- 部署方式：【待確認】（建議 Vercel）
- 內容管理：**Payload CMS**（開源、可自架、原生 TypeScript、i18n 佳、與 Next.js 同倉整合、資料自有）
- 資料庫：PostgreSQL（Payload `@payloadcms/db-postgres`）
- 部署：Payload 與 Next.js 同倉；部署平台【待確認】（建議 Vercel + 託管 Postgres 如 Neon/Supabase）

### CMS 需管理的配置（第一階段）

- 客服 / 聯絡連結（WhatsApp、電話、Email、線上客服等）：**一律於 CMS 配置，不得寫死於程式碼**。
- 其他營運性連結（社群、外部平台）亦同。

## 6. 素材與資產

- 已可用：證書掃描檔（008 行員、參與者證書等）
- 已可用：辦公室／團隊實拍照片
- 已可用：品牌 logo 與字型授權
- 香港城市／地標意象：【待確認】

## 7. 時程與里程碑

- 期望上線時間：【待確認】
- 分階段交付：【待確認】

## 8. 限制與注意事項

- 遵循 `docs/HATC_FACTS.md` 與 `docs/DESIGN_DIRECTION.md`
- 不得呈現未確認的產品、交易條件或績效聲明
