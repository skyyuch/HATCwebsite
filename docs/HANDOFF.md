# HATC 交棒摘要 (Handoff)

> 最後更新：2026-08-31
> 新對話請先閱讀 `AGENTS.md` 與 `docs/`（BRIEF / FACTS / STRUCTURE / DESIGN_DIRECTION），
> `.cursor/rules/*` 會自動載入。本檔記錄「目前進度與下一步」，決策細節以各文件為準。

## ▶ 下一步（下一位 agent）

> CMS Phase 0–4 **已完成**。第二十四輪：Payload **admin 介面多語**業主已確認「可以了」。
> 第二十五輪：首頁鉑金文案已對齊 FACTS（僅金銀）。
> **第二十六輪：`/academy/[slug]` 詳情頁已上線**（Lexical body）。
> **第二十七輪：Payload admin UI/UX 重做**（A 主題化＋B 品牌儀表板入口卡）已完成。
> **第二十八輪：角色與權限（Roles & Permissions）已完成**（Payload 原生 access control；
> admin/editor 兩層；live-DB 多帳號驗證 ALL PASS）。見下方第二十八輪全段。
> **第三十輪（2026-08-20）：`/products/all` 所有交易產品表格頁 + `instruments` CMS 集合已上線**
> （仿 Vantage；header「交易」mega 收成「概覽＋所有交易產品」）。見下方「🟢 第三十輪」全段。
> **第三十一輪（2026-08-20）：`/accounts` 交易帳戶頁已上線**（照 Figma `62:4` 忠實還原版型，
> 藍→金、產品收斂金銀、四帳戶/點差全標「示意數據」、軟化不實文案）。見下方「🟢 第三十一輪」全段。
> **第三十二輪（2026-08-20）：CMS 一鍵機器翻譯 pre-fill（路線 B、可規模化多語系）已上線**
> （Save 旁「一鍵機器翻譯」按鈕＋`/api/translate` endpoint＋批次腳本；引擎預設 LLM、可換 DeepL；
> 只填空不覆蓋、數字/代號原樣保留；無金鑰時 graceful disable）。見下方「🟢 第三十二輪」全段。
> **第三十三輪（2026-08-20）：MT 深化——權限收緊為僅 full-access、glossary 擴充、Phase 2
> Lexical richText 翻譯、i18n messages 批次腳本已上線**（項目 1 端到端實測仍待業主金鑰）。
> 見下方「🟢 第三十三輪」全段。
> **第三十四輪（2026-08-20）：Phase 3 — richText 逐段跨語補譯已上線**（target 非空時，結構
> 簽名相同才只填缺漏 text 節點、業主已校對段落不動；結構分歧安全跳過）。純邏輯 12 項斷言驗證通過，
> lint／build（三語 SSG）／generate:types 全綠。**端到端實測仍待業主金鑰。** 見下方「🟢 第三十四輪」。
> **第三十五輪（2026-08-20）：MT 開放項 2＋3（業主「做 A、B」）已完成**——`translate-messages.ts`
> 加 `--check`（i18n 三語鍵守門，缺漏 exit 1）、npm scripts `i18n:check`／`i18n:translate`、
> GitHub Actions `ci.yml`、`.githooks/pre-commit`（＋`prepare` 自動掛勾）；glossary 擴充 FACTS 已核可術語。
> lint／i18n:check 綠。**端到端實測（項目 1）仍待業主金鑰。** 見下方「🟢 第三十五輪」。
> **第三十六輪（2026-08-31）：`/funding` 入金與出金頁已上線**（Figma `75:189`，Vantage 範本→HATC 化：
> 橘→金、全域 Header/Footer、獎項宣稱移除、出金渠道表全標「示意數據」、**假客戶見證不種→CMS 且空則隱藏**、
> CTA 軟化）。CMS：新集合 `funding-methods`＋`testimonials`＋global `funding-page`（皆 DB→i18n fallback）；
> 種子腳本已灌 6 列出金渠道；三語 `/funding` 200、lint／i18n:check 綠。見下方「🟢 第三十六輪」全段。
> **第三十八輪（2026-08-31）：`/platforms` 交易平台頁上線（Figma `89:4`）＋ menu「MT5平台」改
> 「交易平台」。** Vantage 範本→HATC 化：橘→金、全域 Header/Footer、平台清單收斂為業主確認的
> **MT5＋HATC App＋HATC 網頁交易端**（移除星啟/子功能）、賣點/FAQ 收斂黃金/白銀（移除外匯/原油/指數/
> 1000+/跟單）、平台視覺＝Figma 範本裝置圖佔位（業主「圖先用 Figma 的」，標「示意」）。CMS：新集合 `trading-platforms`＋faqs `platforms`
> 分類（DB→i18n fallback）；種子腳本 `scripts/seed-platforms.ts`。header `nav.platforms` → `/platforms`。
> `lint`（0 err）／`i18n:check`（712 鍵）／`generate:types` 綠；三語 200、桌機/手機截圖過。見「🟢 第三十八輪」。
> **第三十八輪追加（同輪，2026-08-31）：平台圖 CMS 可替換（業主選項 2）。** `trading-platforms` 加
> `visual`（每平台截圖 upload）＋新 global `platforms-page.heroImage`（reader `platformsMarketing.ts`）；有上傳＝
> 用真實圖＋去「示意」標，空＝Figma 範本圖 fallback。已 commit `a2f91c9` 並 push origin/main。
>
> **第三十九輪（2026-08-31）：黃金學院 `/academy` 列表頁改版已上線**（Figma `98:4`，Vantage 範本→HATC 化：
> 橘→金/navy、**依紅線移除浮動 3D 金幣/發光金條/bokeh/glow**、全域 Header/Footer、範本外匯/CFD 佔位標題不採用、
> 電子報移除外匯/超級宣稱＋無後端誠實佔位）。新增**分類篩選 sidebar（多選＋套用/重設）＋排序＋分頁**，全在
> client 對 server 傳入的完整清單做，維持 SSG。`nav.goldAcademy`「黃金學堂」→**「黃金學院」**且 `/#academy`→
> **`/academy`**；Footer 學院欄改指 `/academy`。reader 加 `readMinutes`（Lexical 文字估算）；seed 三筆 tag 對齊
> 固定 6 類 `academy.categories`。**未動 CMS schema 欄位**（僅改 `category` 欄說明），免 migration。三語 200、
> `lint`／`i18n:check`（741 鍵）綠。見下方「🟢 第三十九輪」與「📋 kickoff（下一棒）」。
>
> **⏭️ 下一步：業主補**（本輪只做 UI/UX，內容後補）：(a) 真實學院文章（標題/Lexical 內文/封面/`publishedAt`/
> `category` 用固定 6 類）；(b) 電子報要接的 email 服務（現誠實佔位）；(c) `category` 是否改受控 `select`
> （需 schema migration）；(d) `/academy/[slug]` 詳情頁未在此 Figma 範圍，如需配合改版另議。
> **第三十七輪（2026-08-31）：整合入金頁（Figma 誤拆兩頁）**——業主指 Figma frame `75:5`（入金）與
> `75:189`（出金）為同一頁誤拆，已**整合成單一 `/funding`**：一個 hero → 入金說明＋入金渠道表 → 出金說明＋
> 出金渠道表 → 共用 支援主題／見證／CTA。`funding-methods` 加 **`type`（deposit/withdrawal）** 欄一表兩用；
> i18n `funding.*` 重構為 `deposit`/`withdraw` 兩組＋共用 `methods` 欄位標籤；global `funding-page` 擴為
> 入/出金各一組 chrome＋`heroImage/depositImage/withdrawImage/ctaImage`。種子已補 8 列入金渠道（出金 6 列沿用）。
> 三語 `/funding` 200、lint／i18n:check／generate:types 綠。見下方「🟢 第三十七輪」。

**建議優先序**
1. ✅ **角色權限模型 v2（路線 B／欄位級／admin 全權）已實作**（第二十九輪，lint/build/types 綠）。
   ⚠ **正式/本機 DB 遷移未做**：`Users.role` 由 select 改為 relationship→`roles`，接新 schema 後
   既有帳號 role 會變 null。見「🟢 第二十九輪」→「DB 遷移」。接 DB 後請業主/下一棒實測多帳號。
2. **第十八輪 `/trading` 暫緩 UI／驗收項**（多數需業主拍板）：淺色系是否推廣、帳戶分級真偽、
   hero／夥伴佔位素材、`--trd-gold` vs `#d4af37` 是否統一。
3. 其他前台 polish：Figma 佔位圖替換、Footer／mega `#` 連結填實、demo 帳戶流程等（待業主素材）。

## 🟢 第三十九輪（2026-08-31）：黃金學院 `/academy` 列表頁改版（Figma 98:4）

**背景**：業主給 Figma frame `98:4`（`gold-academy-page`），指示「先完成 UI/UX，文章後面再處理」。
frame 又是 **Vantage 範本**：橘漸層 hero＋**浮動 3D 金幣/金條/bokeh/glow** 裝飾、範本 nav/footer、
佔位文章標題含**外匯/CFD/指數**、電子報宣稱「每週…最權威…貴金屬與外匯分析」。

**業主先例級決策（沿用 `/accounts`/`/funding`/`/platforms` 紅線，未再逐項問，方向與先例一致）**：
1. **橘 `#e8571e`/`#f59e0b` → HATC 金 `#d4af37`／primary navy `#1a3366`**，沿用既有**淺色 `--fig-*`**
   系統（與現有 academy 列表/詳情一致，白底 hero band 為 navy→gold 漸層）。
2. **hero 依設計避免清單移除**浮動 3D 金幣/發光金條/bokeh/glow，改克制漸層＋金色細線＋極淡對角紋。
3. **全域白 Header＋深色 Footer**，丟掉 Figma 範本 nav/footer。
4. **範本文章佔位標題（外匯/CFD/指數）不採用**；資料走 CMS `academy-articles`（無 DB／空→i18n 種子 a1–a3，全金/白銀）。
5. **電子報**：橘→navy、移除「外匯」與「最權威」超級宣稱、去掉「每週」頻率承諾；**無 email 後端＝誠實佔位**
   （送出僅前端 email 格式驗證＋顯示「訂閱功能即將開放」，不假造成功、不送資料）。

**IA / 導覽**
- `nav.goldAcademy`「黃金學堂」→**「黃金學院」**，href `/#academy`→ **`/academy`**（`Header.tsx` NAV）。
- **Footer 學院欄 4 連結全改指 `/academy`**（原 `/#academy`）＋欄標題改「黃金學院」。
- 頁面標題/breadcrumb/`metadata.academy.title` 統一為**黃金學院**（zh-Hant/zh-Hans；英文維持 Gold Academy）。
  麵包屑＝首頁 › 黃金學院。

**元件**（`src/components/academy/*`）
- `AcademyHero.tsx`（server）：麵包屑 bar（白）＋navy/gold hero band（badge＋title＋subtitle，副標無獲利承諾）。
- `AcademyExplorer.tsx`（**client**）：左**分類篩選 sidebar**（`全部`＋固定 6 類 checkbox 多選、`套用篩選`/
  `重設篩選`；draft→applied 兩段狀態）＋右主欄（結果標題「📚 學院文章」＋金色 count badge＋排序 `<select>`
  〔最新/最早發佈〕＋文章格 1/2/3 欄 responsive＋**分頁** PAGE_SIZE=9，含省略號）。**全在 client 對 server
  傳入的完整清單做 filter/sort/paginate → 維持 SSG**。卡片＝封面（`next/image` `fill`＋fallback 漸層）／金色
  分類 pill／readMinutes／2 行標題／2 行摘要／日期＋「閱讀全文 →」。
- `AcademyNewsletter.tsx`（client）：誠實佔位訂閱表單。
- `AcademyList.tsx`（server，重寫）：`getAcademyArticles(locale)`＋`t.raw('academy.categories')` → 組合三區塊。
- 頁面 `academy/page.tsx` 不變（已渲染 `<AcademyList/>`＋`generateMetadata` 讀 `metadata.academy`）。

**受控分類 taxonomy（無 schema migration）**
- 篩選選項＝i18n **`academy.categories`** 固定 6 類：黃金基礎／交易策略／技術分析／市場動態／風險管理／投資組合（三語）。
- **seed 三筆 tag 已對齊**（`home.goldAcademy.articles`：a1→黃金基礎、a2→技術分析、a3→市場動態，三語同步；
  homepage 深色卡同步一致）→ seed 資料下篩選即可運作。
- `category` 欄**仍為自由文字**（未改 schema）；僅在 `src/collections/AcademyArticles.ts` 欄位 `description`
  加註「請用固定 6 類之一，未列者不會出現在篩選選項」。⚠ **follow-up**：要嚴格保證可改 `select`（受控 enum）＝
  需 schema migration，待業主定案。

**reader**（`src/lib/academyArticles.ts`）
- `AcademyArticle` 加 `readMinutes: number`；新增 `lexicalToPlainText()`（走訪 body text 節點）＋
  `estimateReadMinutes()`（~350 字/分，min 1；空→0）。list 映射從 body 算，seed 無 body 用 excerpt。
  ＝**內容長度衍生的 UI 估算，非捏造事實**；卡片有值才顯示。日期用 `publishedAt`（seed 無 → 不顯示）。

**治理紅線**：中性教育內容；**不列外匯/原油/指數/股票為 HATC 產品**；示意/衍生值標清楚；電子報無後端不假造；不入 FACTS。

**seed 腳本（同輪追加）**：`scripts/seed-academy.ts`——把 i18n 種子 a1–a3 **遷入 `academy-articles` 集合**
（slug a1/a2/a3、封面用既有 Figma placeholder thumb 匯入 media、body＝excerpt 生成的最小 Lexical、category＝
已對齊的固定分類、三語齊），讓這 3 篇成為**後台可編輯/刪除的真實 DB 列**（原本是不可刪的 i18n fallback）。
冪等（集合非空即跳過）。執行 `npm run payload -- run scripts/seed-academy.ts`（需 DATABASE_URI）。本機已灌 3 列。
⚠ **拒絕爬競品（Vantage）文章灌站**＝著作權/IP＋競品外匯/CFD 題材違反「只做黃金/白銀」紅線；若要量，改**原創**
中性黃金/白銀教育草稿（不抄競品、不捏造數據）。

**原創文章第一批（同輪追加；後又改寫為長文）**：`scripts/seed-academy-batch.ts`——寫入 **10 篇原創、中性黃金/
白銀教育**文章到 `academy-articles`（**已發佈 enabled=true**、含封面）。**業主回饋「文章太短像罐頭，要像 Vantage
的深入長文」→ 已整篇改寫**：每篇 6+ 章節（多個 `h2`／`h3`）＋要點清單（bullet/number）＋假設性舉例＋「重點整理」＋
免責聲明，Lexical 建構器已擴充支援 heading/list（前台 `AcademyArticleView` 的 `@payloadcms/richtext-lexical/react`
`RichText` ＋ Tailwind `[&_h2]/[&_ul]/[&_ol]/[&_li]` 樣式已能正確渲染）。腳本改為 **upsert**（slug 已存在→更新
zh-Hant body＋編輯欄位、**保留既有封面**；否則建立＋匯入封面）＝**可重跑更新內文**。`readMinutes` 由 reader 依
body 長度自動估算，改長文後列表卡的「N 分鐘 閱讀」會自動變長。

**原創文章第二批（`scripts/seed-academy-batch2.ts`；共 23 篇）**：業主要求「像 Vantage 那樣有量、有深度」，並提出
「可否抄競品、改寫到不完全一樣」。**已向業主說明並拒絕逐字抄／洗稿（article spinning）＝仍屬著作權侵權＋品牌風險
＋競品外匯/CFD 題材違反黃金/白銀紅線**；業主同意改走合規路線＝**只把競品當「選題地圖」（概念/事實不受著作權保護），
內容 100% 原創**。據此新增 **10 篇原創長文**（order 13–22、publishedAt 2026-08-11～20＝排在第一批之後），主題與第一批
不重複、跨 6 類：實體 vs 紙黃金、黃金簡史、順勢 vs 逆勢、交易計畫、K 線入門、量價關係、供需基本面、經濟數據、槓桿與
保證金、定期定額。結構與第一批一致（h2/h3＋清單＋假設性舉例＋重點整理＋免責），upsert、封面重用 `raw_*.png` 佔位。
**同樣中性教育、不列外匯/原油/指數為 HATC 產品、不捏造數據、不入 FACTS。** 驗證：`lint` 0 error、三語 `/academy` 200、
`23 篇精選`、分頁 1/2/3、詳情長文（含清單）渲染正常。分佈＝黃金基礎 ×2／交易策略 ×2／技術分析 ×2／市場動態 ×2
（含 1 篇白銀：金銀比/工業需求）／風險管理 ×1／投資組合 ×1，slug 皆 ASCII、`publishedAt` 2026-08-21～30 交錯。
**標題/摘要三語齊**、**內文先繁中**（其餘語系暫 fallback，之後可用後台一鍵機翻＋校對）；`category` 取自
`academy.categories` 固定 6 類（篩選即可運作）。封面＝重用 `public/figma/raw/raw_*.png` 匯入 media（**佔位圖，
業主日後於後台替換**）。**逐 slug 冪等**（slug 已存在即跳過），與 `seed-academy.ts`（a1–a3）共存＝共 13 列。
執行 `npm run payload -- run scripts/seed-academy-batch.ts`（需 DATABASE_URI）。本機已灌，`/academy` 三語 200，
桌機分頁 1/2（每頁 9）、每卡有封面/分類/閱讀時間/日期，詳情頁 Lexical（多段 h2）正常。**內容＝中性教育、
非事實、不入 FACTS**（頁面已有免責聲明；文中亦附「不構成投資建議」句）。

⚠ **dev 快取失效雷（重要）**：CLI 種子腳本在**獨立進程**執行，**無法**通知運行中的 `next dev` 讓 `unstable_cache`
（tag `academy-articles`）失效；且**清 `.next/cache`＋重啟仍可能沿用舊快取**（dev 冷啟動若第一個請求在 DB 尚空/
未 warm 時算過，會把 fallback〔a1–a3〕快取住）。**正式站不受影響**：後台 `/admin` 編輯任一文章的 `afterChange`
→`revalidateTag` 會在**進程內**正確失效（本輪已用臨時 `revalidateTag('academy-articles')` route 驗證：快取路徑
即刷新為 13 篇）。**dev 種子後要看到新資料**：在 `/admin` 存一次任一文章（或臨時打一支呼叫
`revalidateTag(CACHE_TAGS.academyArticles)` 的 route），不要只靠重啟。

**驗證**：`lint` 0 error（唯 `seed-accounts.ts` 1 pre-existing warning）／`i18n:check` 741 鍵三語齊；
三語 `/academy` 200，桌機（1440）/手機（390）截圖比對 Figma 通過（reader 於無 DB 時 fallback 到 i18n 種子）。
**未動任何 CMS schema 欄位**（僅改 `category` 欄說明字串）→ 免 migration、`generate:types` 無變更。
⚠ 本機 DB dev 於 schema pull 有既有 drizzle 互動式 push 卡點（**非本輪造成**，本輪未動欄位），驗證改走無 DB
（`DATABASE_URI="" npm run dev`）i18n fallback 路徑；正式站/接 DB dev 沿用既往重啟＋push 慣例。

**待業主**：(a) 真實學院文章（標題/Lexical 內文/封面/`publishedAt`/`category` 用固定 6 類）；(b) 電子報要接
的 email 服務（現誠實佔位）；(c) `category` 是否改受控 `select`（需 migration）；(d) `/academy/[slug]` 詳情頁
不在此 Figma 範圍，維持現狀（淺色 Lexical），如需配合改版另議；(e) 首頁深色 3 卡（`home/Academy`，Figma
`4:213`）維持深色，本輪未動。

## 📋 kickoff（下一棒，可直接複製貼給下一個 agent）

```
任務：接續 HATC 官網。可能方向：(1) 業主提供真實黃金學院文章 → 於 Payload `academy-articles` 建立
（title/slug/excerpt/body〔Lexical〕/cover/publishedAt/category〔用固定 6 類：黃金基礎/交易策略/技術分析/
市場動態/風險管理/投資組合〕/order/enabled），前台 `/academy` 會自動出卡＋分類篩選/排序/分頁生效；
(2) 電子報接真實 email 服務（現為誠實佔位，見 `AcademyNewsletter.tsx`）；(3) 其他頁面/Figma。

必讀（動工前）：AGENTS.md、docs/HATC_PROJECT_BRIEF.md、docs/HATC_FACTS.md、docs/WEBSITE_STRUCTURE.md、
docs/DESIGN_DIRECTION.md、docs/HANDOFF.md（本檔，尤其「🟢 第三十九輪」）、.cursor/rules/hatc-website.mdc。

業主已定案（紅線）：
- 事實只來自 HATC_FACTS.md；示意/衍生值一律標示、集中易改、不入 FACTS。
- HATC 產品僅黃金/白銀；勿列外匯/原油/指數/股票；勿寫虛構客戶數/獎項/見證/未確認宣稱。
- 學院＝中性教育；電子報無後端不得假造成功；operational 連結走 CMS（不硬編）。
- 淺色頁沿用 `--fig-*`（白/navy #1a3366/gold #d4af37）；hero 禁浮動 3D 金幣/發光金條。

現況：`/academy` 列表已按 Figma 98:4 改版（AcademyHero/AcademyExplorer/AcademyNewsletter；client 端
filter/sort/paginate 維持 SSG）；分類＝i18n `academy.categories` 固定 6 類；seed a1–a3 tag 已對齊；
reader 有 readMinutes（Lexical 估算）。Header/Footer 學院連結指 `/academy`。三語 200、lint／i18n:check 綠。

注意：本機 DB dev 有既有 drizzle 互動式 push 卡點；純前台驗證可用 `DATABASE_URI="" npm run dev` 走 i18n
fallback。改集合欄位務必 `generate:types`（＋若動 admin 元件 `generate:importmap`）；新集合＝新表需 push/migration。
每次交棒更新 docs/HANDOFF.md 並輸出可貼 kickoff。
```

## 🟢 第三十八輪（2026-08-31）：`/platforms` 交易平台頁（Figma 89:4）＋ menu 改名

> 業主：「開始處理平台的內頁，menu『MT5平台』改成『交易平台』。」Figma frame `89:4`
> `trading-platforms-page` 又是 **Vantage 範本**（橘、範本 nav/footer、4 平台〔HATC App／Web Trading／
> MT5／星啟智能交易軟件〕＋子功能〔跟單/模擬/黃金特別版/智能量化〕、「黃金/外匯/原油/指數上千種 CFD」
> 「1000+ 全球市場」「毫秒級」等未確認宣稱）。**先讀齊參數就方向級紅線問業主**。

**owner 拍板（動工前 AskQuestion）**
- 平台清單：**MT5＋HATC 自有 App／網頁版**（業主確認真實存在，名稱/截圖稍後提供）→ 收斂三分頁
  HATC App／HATC 網頁交易端／MetaTrader 5，**移除**未確認的「星啟智能交易軟件」與子功能列。
- 賣點/FAQ：**收斂黃金/白銀**，移除外匯/原油/指數/1000+/跟單等未確認宣稱（保留「資金隔離/託管」＝
  FACTS「Client fund custody」核可事實）。
- 路由：**`/platforms`**。
- 其餘依既有先例（無需再問）：橘→金 `#d4af37`、全域白 Header＋深色 Footer（丟範本 nav/footer）、
  demo CTA→`/accounts`、開戶→CMS `primaryContactHref`（fallback `/register`）、平台視覺＝漸層佔位不放假截圖。

**IA / menu 改名**
- `Header.tsx` NAV 第三項：`nav.mt5`「MT5平台」→ **重命名鍵 `nav.platforms`「交易平台」**（3 語），
  href `/#mt5` → **`/platforms`**。`sitemap.ts` 已加 `/platforms`。
- ⚠ Footer 另有獨立「MT5平台」欄（`home.footerV2` 平台欄，非 menu），本輪**未動**（待業主定是否一併改）。

**元件**（`src/components/platforms/*`，全讀 i18n）
- `PlatformsHero`（深，breadcrumb＋badge＋標題〔MT5 金色 accent〕＋副標＋雙 CTA〔了解更多錨點
  `#platform-types`／申請模擬賬戶→`/accounts`〕＋右側**裝置圖**面板）／`PlatformTypes`（白，server 包
  client `PlatformTabsClient`：分頁切換 3 平台，左**裝置圖**面板〔「示意」標註；App tab→手機圖、其餘→
  多裝置圖〕＋右 tagline/desc＋共用 5 條 bullets〔`platforms.detail.bullets`〕＋開戶 CTA）／`PlatformFaq`
  （淺色 native `<details>`，讀 faqs `platforms`）／`PlatformDisclaimer`（深色風險條）。
- **平台視覺（2026-08-31 業主「圖先用 Figma 的」）**：hero＋詳情面板改用 Figma 範本裝置 mockup 作開發佔位
  （`public/figma/platforms/{hero-devices,detail-phone}.png`，`next/image`），前台恆標「示意」。⚠ 通用圖表
  render 非真實 HATC 截圖；`detail-phone.png` 含美股代號（AAPL/GOOGL/TSLA），與金/銀定位略衝突，**建議業主
  優先以真實 HATC App/MT5 截圖替換**。
- 頁面 `platforms/page.tsx` 順序＝Hero→Types→FAQ→Disclaimer（**忠於 Figma：無獨立收尾 CTA band**）；
  `generateMetadata` 讀 `metadata.platforms`。重用 `home/SectionTitle`、`ui/button`、`siteSettings`。

**CMS（DB→i18n fallback）**
- 新集合 **`trading-platforms`**（`src/collections/TradingPlatforms.ts`：name/panelLabel/tagline/desc/
  **`visual`(upload→media，每平台截圖)**／order/enabled）＋reader `src/lib/tradingPlatforms.ts`（`depth:1`
  帶 `visual` URL；種子 `platforms.types.items`）。
- **faqs 加 `category='platforms'`**（`FAQ_CATEGORIES`／`Faqs.ts` options／`faqs.ts` fallback 讀
  `platforms.faq.items`）。
- **平台圖 CMS 可替換（2026-08-31 業主選項 2）**：① 每平台截圖＝`trading-platforms.visual`；② hero 圖＝新
  global **`platforms-page.heroImage`**（`src/globals/PlatformsPage.ts`＋reader `src/lib/platformsMarketing.ts`
  `getPlatformsMarketing()`）。**有上傳＝用真實圖＋去「示意」標**（元件 `isSample` 判斷；`next/image` 用 `fill`）；
  空＝Figma 範本圖 fallback＋「示意」標。
- 註冊：`payload.config`（collections＋globals 加 `PlatformsPage`）／`permissions/registry`（`trading-platforms`
  ＋publishField；global `platforms-page`）／`cacheTags`（`tradingPlatforms`／新 `platformsMarketing:'platforms-page'`）／
  `revalidateContent`（`revalidateTradingPlatforms`→`/platforms`；新 `revalidatePlatformsMarketing`→`/platforms`；
  `revalidateFaqs` 加 `/platforms`）。
- **種子** `scripts/seed-platforms.ts`（讀 `platforms.*`，seed-once／冪等，灌 trading-platforms＋
  faqs(platforms)；**不種圖**）：`npm run payload -- run scripts/seed-platforms.ts`（需 DATABASE_URI）。⚠ 新集合
  ＝新表 `trading_platforms`＋新 global 表 `platforms_page`＋`trading_platforms.visual` 欄：本機 dev 重啟已
  drizzle push（非互動）／正式站 migration；未推表前 reader try/catch→fallback（前台照常）。⚠ 若媒體改走外部
  （S3）來源，`next/image` 需在 `next.config` 配 `remotePatterns`。

**i18n**：`metadata.platforms`＋`platforms.*`（3 語）；`nav.mt5`→`nav.platforms`。示意/共用陣列以 `t.raw`
或 reader 讀；示意 badge 沿用慣例。

**驗證**：`generate:types` 綠；`lint` **0 error**（唯 `seed-accounts.ts` 1 pre-existing warning；**順手修掉
`seed-funding.ts` 一個 pre-existing `any` error**）；`i18n:check` **712 鍵三語齊**；三語 `/platforms` HTTP 200；
桌機 1440／手機 390 Chrome headless 截圖比對 Figma 通過（金色、深/白/淺交錯、分頁、FAQ、風險條、Footer）。

**待業主**
- (a) HATC App／網頁交易端**真實名稱、功能與截圖素材**（現用 Figma 範本裝置圖 fallback＋示意文案；`detail-phone.png`
  含美股代號，建議優先替換）→ **後台已可上傳替換**：「交易平台」集合每筆 `平台截圖`＋「交易平台頁」global `Hero 裝置圖`；
- (b) 是否新增更多平台（MT4／TradingView，站上 `/accounts` 曾列示意）；
- (c) demo 流程（現 demo→`/accounts`）；(d) Footer「MT5平台」欄是否一併更名/改指 `/platforms`；
- (e) ⚠ 正式站 migration：新表 `trading_platforms`＋`platforms_page`＋`trading_platforms.visual` 欄（本機 dev push；未推前走 fallback）。

---

## 🟢 第三十七輪（2026-08-31）：整合入金／出金為單一 `/funding`（Figma 75:5 ＋ 75:189）

> 業主：「figma 誤將出入金分了兩頁（`75:5` 入金、`75:189` 出金），請整合。」讀 `75:5` 後確認它與出金頁完全
> 鏡像（hero／如何入金＋3 步驟／入金渠道表 8 列／支援主題／見證／CTA），改成**單頁出入金**。

**整合後版面（`funding/page.tsx`）**：`FundingHero`（統一）→ `FundingIntro variant="deposit"` → `FundingMethods
variant="deposit"` → `FundingIntro variant="withdraw"` → `FundingMethods variant="withdraw"` → `SupportTopics`
→ `Testimonials`（空則隱藏）→ `FundingCta`。bg 節奏：dark→light→white→light→white→light→white→dark（把 intro
改 `--fig-light`、methods 改 white 以維持交錯）。入金 intro 圖在右、出金在左（`imageFirst` 交錯）。

**一表兩用（CMS）**：`funding-methods` 集合新增 **`type` select（deposit/withdrawal，required，`index`，
defaultValue `withdrawal`）**；reader `getFundingMethods(locale, type)` 依 `type` 過濾＋enabled；元件
`FundingMethods({variant})` / `FundingIntro({variant})` 以 variant 取對應資料。既有 6 列出金列在加欄後由
column default 自動標成 `withdrawal`。

**i18n 重構（`funding.*`，三語）**：hero 統一（`titleLead/Accent/Tail`＋subtitle 改為出入金通用）；新增
`funding.deposit` 與 `funding.withdraw` 兩組，各含 `kicker/heading/note`＋`intro{heading,body,cta}`＋`steps[]`
＋`methodsSample[]`（入金 8 列、出金 6 列，皆示意）；共用欄位標籤收斂到 `funding.methods{colMethod,colTime,
colFee,colCurrencies,scrollHint}`。（原 `funding.intro`/`funding.methods.{kicker,heading,note}`/`funding.methodsSample`
已移除。）

**marketing global／reader 擴充**：`FundingPage` global 由「出金 intro＋出金 methods」擴為「入金 intro／入金
methods／出金 intro／出金 methods」四段 collapsible＋背景圖 `heroImage/depositImage/withdrawImage/ctaImage`
（原 `introImage` 汰換）；`fundingMarketing.ts` 型別改 `{hero, deposit, withdraw, topics, testimonials, cta,
images{hero,deposit,withdraw,cta}}`，fallback 讀 `funding.{deposit,withdraw}.*`。

**佔位圖**：`public/figma/funding/` 保留 `hero.png`／`cta.png`；`intro.png` 更名 `withdraw.png`；新下載入金視覺
`deposit.png`（金色錢包＋POS，Figma 範本 AI 抽象視覺，**開發佔位**，CMS 可上傳替換）。

**種子**：`scripts/seed-funding.ts` 改為 `seedFundingMethods(type, sampleKey)` **依 type 各自冪等**
（deposit←`funding.deposit.methodsSample`、withdrawal←`funding.withdraw.methodsSample`），本機已灌 8 列入金、
出金 6 列沿用（skip）。

**追加（2026-08-31，業主要求）：`funding-page` global 文案也種入 CMS。** 原設計「global 留空＝i18n
fallback」導致後台文案欄位全空、業主看不到現有文字。應業主要求，`seed-funding.ts` 新增
`seedFundingMarketing()`：把 `funding.{hero,deposit,withdraw,topics,testimonials,cta}` 三語文案
（僅區塊 chrome，**不含任何事實/示意數字**）灌進 `funding-page` global，讓後台一打開即見現有文案、
可直接編輯。**冪等**：`findGlobal(fallbackLocale:false)` 若 `heroTitleLead` 已有值即跳過（不覆蓋業主
編輯）；背景圖欄位不種（留空＝佔位圖）。本機已種入三語、重跑驗證 skip。⚠ 副作用：global 一旦有 DB
值，前台改以 DB 覆蓋值為準，code 端 i18n 預設更新不再自動反映（與渠道表一致，業主需自行維護）。
`testimonials` 仍依紅線**不種**。

**再追加（2026-08-31，業主要求「CMS 要有現時圖片的預覽」）：4 張背景佔位圖也匯入 Media＋連到 global。**
`seed-funding.ts` 新增 `seedFundingImages()`：用 Local API 帶 `filePath` 把 `public/figma/funding/
{hero,deposit,withdraw,cta}.png` 匯入 `media` 集合（三語 alt），再 `updateGlobal` 連到 `funding-page` 的
`heroImage/depositImage/withdrawImage/ctaImage`，使後台「背景圖片（可選）」顯示與前台一致的預覽。**冪等**：
global 已有 `heroImage` 即整段跳過（避免重跑產生重複 Media）。本機已匯入 media id 1–4、global 已連、重跑
驗證 skip。⚠ 這些仍是**開發佔位圖**（deposit/withdraw 帶青綠格線建議優先換），業主於後台上傳真圖即取代。

**驗證**：`generate:types` 綠；`lint`（0 error，唯 `seed-accounts.ts` 既有 warning）；`i18n:check`（657 鍵三語齊）；
三語 `/funding` HTTP 200，HTML 同時含入金表「支援的入金渠道與時間表」＋Apple Pay、出金表「支援的出金渠道與
時間表」＋原路返回、8×「示意數據」。

> ⚠ **DB 遷移雷（本輪踩過，記錄供正式站）**：`funding_page` global 因欄位改名（`introImage`→`deposit/withdrawImage`、
> intro/methods→deposit/withdraw）觸發 **drizzle push 互動式「rename vs create」提問**，會**卡住** dev push 與
> 頁面。因該 global 尚無業主資料（純 i18n fallback），本機以 `pg` 直接 `DROP TABLE funding_page,
> funding_page_locales` 後由 push 重建（該一次性腳本已刪）。正式站若已有 funding_page 資料，改走正規 migration
> 逐欄回答/命名。`funding_methods` 只是**新增 `type` 欄**（非改名）→ push 無提問。另：改 schema／刪元件後
> **dev 需整包清 `.next` 重啟**，否則 `unstable_cache`／舊編譯會回舊資料形狀（本輪 `marketing.deposit` undefined 即此）。

## 🟢 第三十六輪（2026-08-31）：`/funding` 入金與出金頁上線（Figma 75:189）

> 業主指示：處理出入金頁（Figma `GGCUJwo9drmEUibcs9mLtq` frame `75:189`），檢查清楚所有參數，做完 UI
> 後這頁要能在 CMS 修改、且把現時頁面資料放進 CMS。Figma 為 **Vantage 範本**（橘 `#e65f2b`、VANTAGE
> logo/nav/footer、虛構客戶見證＋人名、"多項全球交易大獎"、具體出金渠道/時限/手續費、"$100,000 虛擬資金"）。

**owner 級紅線決策（依既有治理＋第三十一輪 `/accounts` 先例落地）**
- 主色橘→ **HATC 金 `#d4af37`**，沿用首頁 **dark/gold `--fig-*`** 共用系統；用**全域白 Header＋深色 Footer**，
  丟掉 Figma 自帶 nav/footer。
- hero「多項全球交易大獎」**獎項宣稱移除**；徽章只保留**核可事實**（資金隔離＝FACTS「Client fund custody」）。
- **出金渠道表＝示意數據**（前台恆標「示意數據」，集中易改、**不寫入 FACTS**）；具體渠道/時限/手續費為業主
  supplied，未確認前皆示意。
- **客戶見證＝紅線**：**不種任何假見證**；改 CMS `testimonials` 集合，**無資料時整區隱藏**（比照 news/activities
  「不造假、空則中性隱藏」）。
- CTA 軟化：移除 "$100,000 虛擬資金" 等不實承諾；demo→`/accounts`，開戶→CMS `primaryContactHref`（fallback `/register`）。

**路由 / IA**
- 新頁 **`/funding`**（`src/app/(frontend)/[locale]/funding/page.tsx`），對應 header「交易」mega
  `nav.mega.items.funding`＝入金與出金（lucide `Wallet` icon 已備）。
- `Header.tsx` `MEGA_HREF.funding` 由 `'#'` → **`'/funding'`**；`sitemap.ts` 已加 `/funding`（三語 hreflang）。

**元件**（`src/components/funding/*`）
- `FundingHero`（深，徽章＋標題＋副標＋開戶 CTA，navy 漸層底，不放假截圖）／`WithdrawalIntro`（白，出金說明＋
  三步驟＋CTA＋右側漸層佔位卡）／`FundingMethods`（淺色，示意出金渠道表，`free` → 綠色手續費，含捲動提示＋
  「示意數據」pill）／`SupportTopics`（`--fig-light`，6 卡 lucide icon）／`Testimonials`（白，空則 `return null`）／
  `FundingCta`（深，軟化 CTA）。

**CMS（DB→i18n fallback，強制模板）**
- 集合 **`funding-methods`**（`src/collections/FundingMethods.ts`：method/time/fee/`free`(checkbox)/currencies/
  order/enabled，localized 皆示意）；集合 **`testimonials`**（quote/authorName/authorTitle/order/enabled；
  **無 i18n 種子**）；global **`funding-page`**（`src/globals/FundingPage.ts`：hero/intro/methods/topics/
  testimonials/cta 區塊 chrome，`optionalText/Textarea`，留空＝i18n）。
- Readers＝`src/lib/{fundingMethods,testimonials,fundingMarketing}.ts`（`unstable_cache`＋tag，`hasDb()`
  gate）。testimonials fallback＝空陣列（紅線）。
- 註冊：`payload.config`（collections＋globals，`.map(withTranslateControl*)` 自動掛翻譯按鈕）／`cacheTags`
  （`fundingMethods`/`testimonials`/`fundingMarketing`）／`revalidateContent`（各 `revalidate*→/${locale}/funding`）／
  `permissions/registry`（`funding-methods`、`testimonials`＋`publishField`；global `funding-page`）。

**i18n**：`metadata.funding`＋`funding.*`（3 語）；示意表種子＝`funding.methodsSample`（陣列，reader/seed 共用）；
intro `steps`／topics `items` 以 `t.raw` 讀（結構字串）；示意 badge 重用 `productsAll.table.sampleLabel`。

**種子腳本**：`scripts/seed-funding.ts`（讀 `messages/*.funding.methodsSample`，seed-once／冪等，**只灌
funding-methods**；testimonials 依紅線不灌；global 免種）。`npm run payload -- run scripts/seed-funding.ts`。

**驗證（本機，DB 已接）**：`generate:types` OK、`generate:importmap`（No new imports）、`lint` 0 errors（唯
`seed-accounts.ts` 1 pre-existing warning）、`i18n:check` 616 鍵三語齊。重啟 dev server push 新表後種入 6 列，
三語 `/funding` 皆 200、`/admin` 200；`funding-methods` totalDocs=6、`testimonials` totalDocs=0（區塊隱藏）。

**待業主**
- (a) 出金渠道/時限/手續費真實值（現全示意；業主替換後仍標示意，若要轉為正式須另議並確認可對外承諾）；
- (b) 提供真實、經審核的客戶見證，於後台 `Testimonials` 發佈後前台該區才顯示；
- (c) 見證頭像目前為金色首字佔位，真實頭像素材待業主（可日後加 media upload 欄位）；
- (d) hero/intro/CTA 背景圖＝Figma 範本 AI 抽象視覺**開發佔位**（`public/figma/funding/{hero,intro,cta}.png`），
  業主可於 CMS `funding-page`→「背景圖片」上傳 `heroImage/introImage/ctaImage`（upload→media，空則用佔位圖）替換；
  ⚠ `intro.png`（金庫金幣＋青綠格線）與金色主題略衝突且「浮動金幣」在最終避免清單上，建議優先替換；
- (e) ⚠ 新集合／global 新欄位＝新表/新欄：正式站需跑 migration（本機 dev 已 push：新表＋`funding_page`
  的 `hero_image_id`/`intro_image_id`/`cta_image_id`）。

---

## 🟢 第三十五輪（2026-08-20）：MT 開放項 2＋3 — i18n CI/pre-commit 守門 ＋ glossary 擴充

> 業主指示「做 A、B」＝承接第三十四輪的**開放項 2（`translate-messages.ts` 納入 CI／pre-commit）**與
> **開放項 3（glossary 擴充）**。`lint`（0 errors；`seed-accounts.ts` 1 pre-existing warning）／
> **`i18n:check`**（三語各 540 鍵齊、exit 0；缺鍵 exit 1 已實測）綠。**未動 collection/欄位／admin 元件**
> → 免 `generate:types`／`generate:importmap`。本輪**未執行 DB 指令**、未新增依賴；`MT_API_KEY` 仍未設 →
> **項目 1（活的金鑰端到端實測）仍待業主**。

**A — i18n 守門（開放項 2）**
- **`scripts/translate-messages.ts` 新增 `--check` 模式**（不需金鑰、不寫檔）：以 `zh-Hant`（defaultLocale）
  為源，比對每個**非空鍵**在各 target（`zh-Hans`／`en`）是否**存在且非空**；缺漏→列出前 50 筆並
  **`process.exit(1)`**。⚠ **Payload runner 會重置 `process.exitCode`**，故失敗必須 `process.exit`（已實測
  管線 exit code 正確、輸出不截斷）。另**警告**（不擋）target 有而 source 沒有的殘留鍵（可能是舊鍵）。
  支援 `--only <namespace>` 縮範圍。check 邏輯與填譯共用 `collectLeaves`／`getByPath`（DRY）。
- **npm scripts**（`package.json`）：**`i18n:check`**＝`payload run scripts/translate-messages.ts -- --check`
  （CI／hook 用）；**`i18n:translate`**＝`payload run scripts/translate-messages.ts --`（把 `--` 前置好，
  讓 `npm run i18n:translate -- --to en` 正確轉給腳本；需 `MT_API_KEY`）。原 `npm run payload -- run …` 仍可用。
- **CI**：`.github/workflows/ci.yml`（push main／PR）＝node 22 → `npm ci` → `lint` → `i18n:check` → `build`
  （job env：`DATABASE_URI=''`〔`hasDb()` false → SSG fallback〕、`PAYLOAD_SECRET=ci-placeholder…`、
  `MT_API_KEY=''`〔翻譯停用、金鑰不進 CI〕）。
- **pre-commit**：`.githooks/pre-commit`（**僅在 staged 含 `src/messages/*.json` 時**跑 `i18n:check`，其餘
  commit 不受影響，快）；`package.json` `prepare`＝`git config core.hooksPath .githooks || true`（`npm install`
  自動掛勾、無 husky 依賴、無 node_modules churn）。**⚠ 本倉目前尚未 `git init`**（`git rev-parse` 回 128），
  故 `prepare` 現為 no-op；**git 初始化後**（或手動 `git config core.hooksPath .githooks`）hook 即生效。
  緊急略過＝`git commit --no-verify`（不建議）。

**B — glossary 擴充（開放項 3）** [`src/lib/mt/glossary.ts`](src/lib/mt/glossary.ts)
- 補 FACTS 已核可但先前缺漏的術語（**en／zh-Hans 對稱、長詞在前以利替換安全**）：參與者(Participant)／
  行員證書(Member Certificate)、香港海關 **A 類註冊人(Category A registrant)／A 類註冊(Category A registration)**
  ＋《打擊洗錢及恐怖分子資金籌集條例》(Anti-Money Laundering and Counter-Terrorist Financing Ordinance)、
  現貨黃金(Spot Gold)／現貨白銀(Spot Silver)、董事會 **主席(Chairman)／副主席(Vice Chairman)**（人名不譯——
  無核可羅馬拼音）、**客戶資金／資金隔離／信託賬戶／託管**（＝「Client fund custody」核可聲明用詞），並補齊
  zh-Hans 先前缺的 `99 金／999.9 金`。**只釘用詞、不造事實**（示意數字/符號/代號仍由 provider prompt 原樣保留）。

**🔴 治理紅線（不變）**：facts 不進翻譯管線；示意表恆標「示意數據」；核可金 27／銀 30／1:100 只在
`products/tradingConditions.ts`；金鑰 server-only 永不 `NEXT_PUBLIC_`（CI 亦不注入）。`provider.ts`／
`translateDocument.ts`／`localizedFields.ts`／`richText.ts` 仍不可加 `import 'server-only'`。

**待業主／開放項（本輪後）**
- **項目 1（端到端實測）**：業主設 `MT_API_KEY` 後於全權帳號實測（FAQ/帳戶/頁面文案按鈕、學堂 body
  整欄＋逐段、批次腳本）——見第三十四輪「待業主／開放項」。
- （可選）CI 是否加 `generate:types` 漂移檢查、或把 `i18n:check` 也擋 PR required check（需 `git init`＋GitHub repo）。

## 🟢 第三十四輪（2026-08-20）：MT Phase 3 — richText 逐段跨語補譯

> 業主本輪拍板推進**開放項 2（Phase 3）**：承第三十三輪 richText 的**整欄粒度**（target 空才填、
> 非空整欄跳過），本輪讓 **target 已有部分內文時也能逐段補譯缺漏語系**，且**絕不覆蓋業主已校對的
> 段落**。`lint`（0 errors；`seed-accounts.ts` 1 pre-existing warning）／`build`（三語 SSG fallback，
> 空 `DATABASE_URI`／無金鑰）／`generate:types`（無 schema 變更）全綠；**未動 admin 元件與 collection/
> 欄位** → 免 `generate:importmap`／無型別 diff。本輪**未執行任何 DB 指令**；`MT_API_KEY` 仍未設 →
> 端到端活的 LLM/DeepL 實測仍待業主金鑰。

**設計（安全第一：不破壞業主手改稿）**
- **richText 兩種粒度**（`translateDocument.ts` 第 2 段 richText 分支）：
  - **① 整欄（Phase 2 不變）**：target body 空（或 `overwrite`）→ 譯 source 全部 text 節點、以
    source 結構重建 body 寫入。
  - **② 逐段（Phase 3 新增）**：target body 非空 → 先算 **`richTextStructure` 結構簽名**（DFS 節點型別、
    text 節點收斂為 `t` slot）；**source 與 target 簽名相同**才進行逐段補譯——只填「source 有內容且
    target 該 text 節點為空」的位置，其餘（業主已校對段落）原封不動；**簽名不同**（業主增刪／重排 block）
    ＝結構分歧 → **整欄跳過**，避免打亂手改稿。空譯不回填（不會清空既有節點）。
- **新 pure helpers**（`src/lib/mt/richText.ts`，仍純邏輯無 server-only）：
  - `richTextStructure(body)`：結構簽名；traversal 與 `forEachTextNode` **完全同形**（text 節點提早
    return、遞迴 `root` 再 `children`），確保簽名與 extract/apply 的 text 節點 DFS 序**鎖步一致** →
    簽名相同即保證同索引 text 節點一一對應。
  - `applyRichTextTextsAtIndices(body, Map<idx,text>)`：深拷貝 target、只改指定 DFS 索引的 text 節點
    （空白譯文跳過），回傳 `{body, filled}`。
- `sourceRichLeaves`／`collectRichTextLeaves` 走訪器與 Phase 2 共用，無需改動。

**驗證**
- 以合成 Lexical doc（heading＋兩段）跑 **12 項斷言全過**（暫時腳本，驗完刪除）：結構簽名相等、
  DFS text 序正確、pending 只含空缺索引、逐段回填後業主段落不變且缺漏被補、結構分歧簽名不等（→跳過）、
  空文件偵測、空白譯文不覆蓋既有節點。
- **無金鑰路徑不變**：按鈕 disabled／endpoint 501／站台 SSG fallback 照常。

**🔴 治理紅線（不變）**：facts 不進翻譯管線；示意表恆標「示意數據」；核可金 27／銀 30／1:100 只在
`products/tradingConditions.ts`；金鑰 server-only 永不 `NEXT_PUBLIC_`。`richText.ts`／`translateDocument.ts`
／`localizedFields.ts`／`provider.ts` **仍不可加 `import 'server-only'`**（config graph 內，Payload CLI/tsx 會掛）。

**待業主／開放項（本輪後）**
- **項目 1（端到端實測）**：業主設 `MT_API_KEY`（＋可選 `MT_PROVIDER`/`MT_MODEL`）後於 `/admin` 全權帳號實測：
  ① FAQ/帳戶/頁面文案按鈕；② **學堂文章 body（richText）**——先在空語系按鈕（整欄）、再把某段清空後重按
  （驗逐段只補該段、其餘不動）；③ 批次 `translate-content.ts`（CMS）／`translate-messages.ts`（i18n）。
- **項目 3**：`translate-messages.ts` 是否納入 CI／預提交（未做）。
- **項目 4**：glossary 是否再擴充術語（未做）。

## 🟢 第三十三輪（2026-08-20）：MT 深化（權限收緊／glossary／Phase 2 richText／messages 腳本）

> 業主指示「除了項目 1（端到端實測需金鑰），其他都做」。承第三十二輪五個開放項，本輪完成
> 項目 2／3／4／5。`lint`（0 errors）／`build`（三語 SSG 全綠）／`generate:importmap`（No new
> imports）／`generate:types`（無 schema 變更）**全綠**。本輪**未執行任何 DB 指令**；仍無
> `MT_API_KEY` → 項目 1（活的 LLM/DeepL 端到端）仍待業主提供金鑰。

**項目 2 — 翻譯權限收緊為僅 full-access（業主本輪拍板）**
- [`src/payload/access.ts`](src/payload/access.ts) 新增布林 helper `hasFullAccess(req)`（對應 `isFullAccess`
  Access）。[`src/endpoints/translate.ts`](src/endpoints/translate.ts) 閘門由 `hasResourcePermission(req,slug,
  'update')` 改為 `hasFullAccess(req)`——**非全權角色 POST `/api/translate` 一律 403**。
- 按鈕同步收緊（避免非全權者按了才 403）：[`TranslateDocButton.tsx`](src/components/payload/TranslateDocButton.tsx)
  改為 **async server 元件**，用 `beforeDocumentControls` server props 的 `payload`+`user` 判斷角色
  （`user.role` 可能是 id 或 populated 物件；是 id 就 `findByID('roles')` 讀 `fullAccess`），**非全權
  → 回 `null` 不渲染按鈕**。`configured`（`isMtConfigured()`）仍照舊控制無金鑰時 disable。金鑰不進瀏覽器。

**項目 5 — glossary 擴充** [`src/lib/mt/glossary.ts`](src/lib/mt/glossary.ts)
- 補上 FACTS 已核可術語：公司舊名（恒遠環球有限公司→Eternity Global Limited）、香港海關／貴金屬及寶石
  交易商（DPMS）、證書載明產品英文名（倫敦金/銀 100/5000 安士、港元/人民幣公斤金條、香港白銀、99/999.9
  金）；並**補齊 zh-Hans 先前缺漏**（貴金屬/黃金/白銀/AA 類行員/行員等簡繁對應）。**只釘用詞、不造事實**。

**項目 3 — Phase 2：Lexical richText 翻譯**（只 `academy-articles.body` 用到）
- [`localizedFields.ts`](src/lib/mt/localizedFields.ts) 重構出通用 `walkFields` 走訪器（DRY，取代原本
  重複的容器 switch）；`collectLeaves` 沿用；**新增 `collectRichTextLeaves`**（收集 localized richText
  欄位路徑＋原始 Lexical 值）；`configHasLocalizedText` 加入 **richText 偵測**（未來只有 richText 的集合
  也會長出按鈕）。**仍純邏輯、無 server-only**（config graph 內）。
- **新檔** [`src/lib/mt/richText.ts`](src/lib/mt/richText.ts)：Lexical 文字節點 DFS helpers——
  `extractRichTextTexts`（DFS 收 `type:'text'` 節點字串，含空字串保序）／`isRichTextEmpty`／
  `applyRichTextTexts`（深拷貝 source body、依同一 DFS 序把譯文回填 `text`，空譯略過→保結構/格式；
  回傳 `{body, filled}`）。**只改 `text` 字串**，heading/list/link/upload 等結構節點原樣保留；純邏輯無 server-only。
- [`translateDocument.ts`](src/lib/mt/translateDocument.ts) per-locale 迴圈加入 richText 分支：
  **整欄粒度**——target body 空（或 `overwrite`）才填；譯 source body 全部文字節點、重建 body、
  `setByPath` 進同一份 clone，**與 text/textarea 合併單次 write**。`filled` 計數含 richText 非空節點數。
  （text/textarea 仍維持字串葉粒度「只填空」。）
- ⚠ **richText 是整欄粒度**（非逐節點跨語對齊）：因 target 常為空或結構不同，逐節點 path 對齊不可靠；
  故「target 空才填、非空不動（除非 overwrite）」。若 target 已有部分內文，不會逐段補譯。

**項目 4 — i18n messages 批次腳本** [`scripts/translate-messages.ts`](scripts/translate-messages.ts)
- 以 `zh-Hant`（defaultLocale）為源、遍歷 `src/messages/*.json` 的**字串葉節點**（巢狀 object/array，
  略過 boolean/number）；**預設只填缺漏/空字串**（目標檔目前齊全→預設不動；適用「源加新鍵、其他語系
  未補」情境）、`--overwrite` 全譯；分批 50 呼叫 provider；寫回目標 JSON（2 空格＋結尾換行）。
- 旗標同 `translate-content.ts`：`--to <locale>`（可重複）／`--only <namespace>`（限頂層命名空間，如
  `accounts`）／`--overwrite`。執行 `npm run payload -- run scripts/translate-messages.ts -- --to en`
  （需 `MT_API_KEY`；不需 DB）。無金鑰＝乾淨退出、不動檔。**{placeholder}/數字/符號由 provider prompt 保留**。

**🔴 治理紅線（不變）**：facts 不進翻譯管線；示意表恆標「示意數據」；核可金 27／銀 30／1:100 只在
`products/tradingConditions.ts`；金鑰 server-only 永不 `NEXT_PUBLIC_`。**provider.ts／translateDocument.ts／
localizedFields.ts／richText.ts 皆不可加 `import 'server-only'`**（在 config graph 內，Payload CLI/tsx 會掛）。

**待業主／開放項（本輪後）**
- 項目 1 未動：業主提供 `MT_API_KEY`（＋可選 `MT_PROVIDER`/`MT_MODEL`）後做端到端實測：
  ① 帳戶/FAQ/頁面文案按鈕 → 右上切 zh-Hans/en 校對（確認數字/代號不變、已填不覆蓋）；
  ② **學堂文章 body（richText）**按鈕 → target 空的語系整篇被機翻草稿、結構/格式保留；
  ③ 批次：`translate-content.ts`（CMS）／`translate-messages.ts`（i18n）。
- Phase 3 可續：richText 逐段跨語對齊補譯（目前整欄粒度）；`translate-messages.ts` 是否納入 CI/預提交。

## 🟢 第三十二輪（2026-08-20）：CMS 一鍵機器翻譯 pre-fill（路線 B／可規模化多語系）

> 業主拍板：**路線 B**——Save 旁「一鍵機器翻譯」按鈕，把繁中（`zh-Hant`，defaultLocale）內容
> 機器翻譯成其他語系的**草稿**供業主校對；目標語系「數量未定、會很多」→ 做成**通用、無寫死語系
> 清單**（跟著 `payload.config.localization.locales` 走）。引擎**預設 LLM（OpenAI 相容，Node 內建
> `fetch`，零新依賴）**、介面抽象化**可換 DeepL**（`MT_PROVIDER=deepl`）。金鑰 **server-only**
> （`MT_API_KEY`，永不 `NEXT_PUBLIC_`、不進前端 bundle）。`lint`／`generate:importmap`／
> `generate:types`（無 schema 變更、零 diff）／`build`＋三語 SSG **全綠**。

**新增檔案**
- **Provider 抽象** [`src/lib/mt/provider.ts`](src/lib/mt/provider.ts)：`TranslationProvider`
  介面＋`LlmProvider`（`/chat/completions`，`response_format:json_object`，temperature 0，批次翻譯，
  prompt 要求**原樣保留數字/價格/比率(1:500)/符號(XAU/USD,$,¥)/代號/URL/{placeholder}**、機構語氣、
  不虛構）＋`DeeplProvider`（`/v2/translate`，`tag_handling=html`）。`isMtConfigured()`／
  `getTranslationProvider()`（無 `MT_API_KEY`→`null`）。**⚠ 不可加 `import 'server-only'`**：此檔在
  `payload.config` graph 內（endpoint 引入），加了會讓 Payload CLI（tsx）解析失敗。
- **詞彙表** [`src/lib/mt/glossary.ts`](src/lib/mt/glossary.ts)：只釘**已核可事實術語**的固定譯法
  （華安泰昌／香港黃金交易所／AA 類行員／倫敦金／人民幣公斤條／CFD…），en／zh-Hans 兩組；只釘用詞、
  **不造新事實**。以 prompt 形式交給 LLM。
- **走訪器** [`src/lib/mt/localizedFields.ts`](src/lib/mt/localizedFields.ts)：`collectLeaves(fields,data)`
  遞迴收集**所有 localized text/textarea 葉節點**（含 `group`(具名/不具名)／`row`／`collapsible`／
  具名或不具名 `tabs`／`array`／`blocks`；如 `SampleTradingConditions.accountRows[].standard.value`）。
  **不譯**：非 localized、`select`／`checkbox`／`number`／`date`／`relationship`／`upload`、`richText`
  （Lexical＝Phase 2）、標 `admin.custom.mtSkip:true` 者。附 `getByPath`／`setByPath`／
  `configHasLocalizedText`（給 config 判斷是否掛按鈕）。**pure 邏輯、無 server-only**（config graph 用）。
- **Orchestrator** [`src/lib/mt/translateDocument.ts`](src/lib/mt/translateDocument.ts)：讀 source
  （defaultLocale）與各 target（**`fallbackLocale:false`** 以區分「target 真的空」vs「fallback 回退
  繁中」，因 `localization.fallback:true`）；**只填 target 空葉節點**（`overwrite:false` 預設不覆蓋已填）；
  clone target doc→`setByPath` 填入→`update/updateGlobal({locale:target})`（保留 array row id 與已填值）。
  回傳每語系 `filled` 計數。dynamic-slug 用 `payload as any` 繞型別窄化（執行期仍由 Payload 驗證）。
- **Endpoint** [`src/endpoints/translate.ts`](src/endpoints/translate.ts)（註冊於 `payload.config.endpoints`
  → **`POST /api/translate`**）：body `{kind:'collection'|'global', slug, id?, targetLocale?, overwrite?}`。
  **access 閘門**＝`hasResourcePermission(req,slug,'update')`（access.ts 新增；等同 `opAccess(slug,'update')`
  ——全權角色過、其餘要矩陣勾選）。未登入→401；無金鑰→**501**（graceful）；無權→403。
- **按鈕** [`TranslateDocButton.tsx`](src/components/payload/TranslateDocButton.tsx)（**server** 元件，讀
  `isMtConfigured()` 把 `configured` 傳下、**金鑰不進瀏覽器**）＋
  [`TranslateDocButtonClient.tsx`](src/components/payload/TranslateDocButtonClient.tsx)（`'use client'`，
  `useDocumentInfo`/`useTranslation`/`toast`/`useRouter`；POST `/api/translate`；三語 label＝依
  `i18n.language` zh-TW/zh/en；成功後 `router.refresh()`＋toast 提示右上切「語言地區」校對；
  **無金鑰或未儲存（新建 collection doc）→ disabled＋tooltip**）。掛在 **Save 旁 `beforeDocumentControls`**。
- **批次腳本** [`scripts/translate-content.ts`](scripts/translate-content.ts)：`--to <locale>`（可重複／預設
  全部非 source）／`--only <slug>`／`--overwrite`。跑遍所有具 localized text 的 collections＋globals。
  執行：`npm run payload -- run scripts/translate-content.ts -- --to en`（需 `DATABASE_URI`＋`MT_API_KEY`）。
- **env** [`.env.example`](.env.example) 新增 `MT_PROVIDER`／`MT_API_KEY`／`MT_BASE_URL`／`MT_MODEL`／
  `MT_DEEPL_URL`（全 server-only；`MT_API_KEY` 空＝停用）。

**接線／自動掛按鈕（DRY、免逐檔改）**
- [`payload.config.ts`](src/payload.config.ts)：`endpoints:[translateEndpoint]`；`collections`／`globals`
  各經 `withTranslateControlCollection`／`withTranslateControlGlobal` map——**用 `configHasLocalizedText`
  自動偵測**有無可譯 localized text 決定是否注入 `beforeDocumentControls`（collection 在
  `admin.components.edit`、global 在 `admin.components.elements`）。**未來新 localized 集合自動長出按鈕**，
  免額外接線；只有加 collection/global/欄位改動才需再 `generate:types`，改 admin 元件字串才需
  `generate:importmap`（本輪已跑，importMap 已含 TranslateDocButton）。

**🔴 治理紅線（本輪）**
- **facts 只在程式碼、不進翻譯管線**：管線只改「編輯型 localized 文案」，不碰 FACTS／
  `products/tradingConditions.ts`（核可金27/銀30/1:100）。示意數字/符號/代號經 prompt **原樣保留**；
  示意表前台**恆標「示意數據」不變**。
- **MT 產出＝校對草稿**（非事實、非最終）；只填空、不覆蓋業主已填。
- **MT 金鑰 server-only**，永不進前端 bundle（按鈕靠 server 元件讀 config，client 只拿 boolean）。

**驗收現況**
- **無金鑰**：按鈕 disabled（tooltip 提示）、endpoint 回 501、站台照常（SSG／i18n fallback 不受影響）。
  `lint`／`build`＋三語 SSG 全綠、`payload-types.ts` 零 diff。**已驗**。
- **有金鑰（端到端）＝待業主提供金鑰後實測**：帳戶卡按鈕→zh-Hans/en 空欄被填、數字/代號不變、已填不覆蓋。
  本輪**未有 `MT_API_KEY`**，無法在本機跑活的 LLM 呼叫；程式路徑已型檢＋build 驗證。接金鑰後：
  1) `.env` 設 `MT_API_KEY`（＋可選 `MT_PROVIDER`/`MT_MODEL`）；2) `/admin` 開任一帳戶/FAQ/頁面文案 →
  按「一鍵機器翻譯」→ 右上切 zh-Hans/en 校對；或跑 `scripts/translate-content.ts` 批次。

**待業主／開放項**
- (a) 提供**哪家 LLM/DeepL 與 API key**（server-only）。(b) 翻譯權限是否**收緊為僅 full-access**
  （目前＝可 `update` 該資源者即可翻譯，與編輯權一致）。(c) 是否要一併做 **Phase 2（richText/Lexical
  body 翻譯）** 與 **`translate-messages.ts`（i18n messages 批次）**。(d) glossary 是否再擴充術語。

## 🟢 第三十一輪（2026-08-20）：`/accounts` 交易帳戶頁（Figma 62:4）

> 業主給新 Figma frame **`62:4 trading-accounts-page`**（一份 Vantage 範本），要求「照此做、我要求一樣」。
> 該稿本質是 Vantage 範本（logo 寫 `HATCFX`、footer `© VANTAGEFX Group`、主色藍 `#1a56db`、含
> 外匯/原油/指數、1:500/1:1000、佣金、四帳戶分級、「數十萬活躍交易者/1,000+商品/即時到賬免手續費/
> 30天模擬」等未確認內容）。**先讀齊所有參數後**，就四條方向級紅線問業主，業主拍板：
> ① **主色改 HATC 金 `#d4af37`**（沿用首頁深色/金色共用系統，不用藍）；
> ② **產品收斂成黃金/白銀**（貼合 FACTS，不列外匯/原油/指數）；
> ③ **四帳戶（標準STP/RAW ECN/VIP/美分）照 Figma 做，但全標「示意數據」、集中易改、不入 FACTS**；
> ④ **路由 `/accounts`**，並把 header「交易」mega 的「交易帳戶」指過去。
> 其餘依既有治理慣例：軟化/移除不實文案（客戶數、1,000+商品、即時到賬免手續費、30天模擬、3分鐘等）、
> 用真實 HATC 全域 Header/Footer（**不做** Figma 自帶 nav/footer）、demo CTA 暫指 `/register`。
> `lint`／`build`／三語 SSG 全綠；三語 `/accounts` 皆 200，HTML 無任何紅線字串。

**設計系統對映（藍→金，沿用 `--fig-*`）**
- 主色 `#1a56db` → `text-gold`/`bg-gold`/`border-gold`（`--fig-gold #d4af37`）。
- 深色 `#070a14`→`--fig-ink`、卡 `#0e1322`→`--fig-surface`、淺 `#f8f9fc`→`--fig-light`、
  文字 `#0c111d`→`--fig-heading-dark`／`#475467`→`--fig-text-muted`／`#8e99b0`→`--fig-text-dim`。
- 字體：Sora＝`font-sans`（標題）；數字/代號＝`font-[family-name:var(--font-ticker)]`（Inter）。
- 按鈕沿用 shadcn `buttonVariants`（`gold`/`onDark` variant、`fig` size，6px）；卡 8/12px、徽章 pill。
- **無真實圖片**（`public/` 幾乎沒有點陣圖）→ hero/平台卡改用 CSS 漸層佔位（不放假截圖，守紅線）。

**新增檔案**
- 頁面 [`src/app/(frontend)/[locale]/accounts/page.tsx`](src/app/(frontend)/[locale]/accounts/page.tsx)
  （三語 SSG + `generateMetadata` 讀 `metadata.accounts`）。
- 區塊 `src/components/accounts/*`：`AccountsHero`（深色 hero＋金徽章＋雙 CTA＋breadcrumb）／
  `AccountTiers`（淺色，4 卡，`popular` 卡金框，6 列規格，示意 badge＋note）／`AccountBenefits`
  （白，4 卡 lucide percent/zap/credit-card/monitor）／`AccountSpreads`（淺色表，**只金/銀**，深色表頭，
  示意 badge＋note）／`AccountPlatforms`（白，3 卡 MT4/MT5/TradingView，漸層佔位面板）／`AccountSteps`
  （深色，3 步驟卡＋右上金 CTA）／`AccountFaq`（白，native `<details>`，5 題軟化）／`AccountsCta`
  （深色收尾，單金 CTA）。重用 `home/SectionTitle`、`ui/button`、`getSiteSettings/primaryContactHref`。

**i18n（三語同步）**
- `metadata.accounts`（title/description）＋ `accounts.*` 命名空間。**示意資料採 `productsAll.sample.rows`
  慣例**：`accounts.tiersSample`（4 帳戶物件陣列，含 `popular` bool）與 `accounts.spreadsSample`
  （金/銀兩列），前台以 **`t.raw('tiersSample')` / `t.raw('spreadsSample')`** 讀（localized、集中易改）。
  區塊清單（benefits/platforms/steps/faq）亦以 `t.raw('items')` 讀陣列。示意 badge 文字**重用**
  `productsAll.table.sampleLabel`；開戶按鈕重用 `nav.openAccount`。

**接線**
- [`Header.tsx`](src/components/Header/Header.tsx) `MEGA_HREF.account` `#`→`/accounts`（並更新註解）。
- [`sitemap.ts`](src/app/sitemap.ts) 加 `/accounts`（可索引）。

**帳戶類型 CMS 化（同輪追加，業主要求可後台編輯）**
- 新集合 [`src/collections/AccountTiers.ts`](src/collections/AccountTiers.ts)（slug `account-tiers`，
  admin group Operations「營運與示意」）＝每筆一張帳戶卡。欄位：`name`(localized)／`code`／
  `badge`(localized)／`popular`(checkbox 金框)／`desc`(localized textarea)／`minDeposit`／`spread`／
  `commission`／`leverage`／`execution`／`platform`（以上示意值皆 localized）／`order`／`enabled`
  (fieldUpdateAccess)。已註冊 `payload.config`（collections）／`permissions/registry`（create/update/
  delete＋publishField）／`cacheTags`（`accountTiers:'account-tiers'`）／`revalidateContent`
  （`revalidateAccountTiers`→tag＋`/accounts`）；`generate:types` 已跑（`AccountTier` 型別已生）。
- Reader [`src/lib/accountTiers.ts`](src/lib/accountTiers.ts)＝標準 **DB→i18n fallback**
  （種子 `accounts.tiersSample`，`unstable_cache`＋tag）。`AccountTiers.tsx` 改讀 `getAccountTiers(locale)`
  取代原 `t.raw('tiersSample')`；其餘區塊（spreads/benefits/platforms/steps/faq）仍用 `t.raw`。
- **治理不變**：CMS 內的帳戶數字仍是**示意**（前台恆標「示意數據」、不入 FACTS），業主編輯≠變事實。
- **⚠ DB**：新增集合＝新表 `account_tiers`（＋localized 表）。**本輪未推 DB schema**；本機 dev 需**重啟
  dev server**讓 Payload push 出新表，正式站需 migration。未推表前 reader 走 try/catch fallback（前台
  照常顯示 i18n 示意，`/accounts` 三語 200 已驗）。`build` 綠、SSG。

**🔴 治理紅線（本輪）**
- 四帳戶分級、最低入金、點差、佣金、**1:500/1:1000**、執行方式、示意點差表＝**示意數據**，前台恆標，
  **不入 FACTS**；核可的**金 27／銀 30／1:100** 仍只在 `products/tradingConditions.ts`（`/products`）。
- 頁面**不得**出現外匯/原油/指數為 HATC 產品；不得寫客戶數/商品數等虛構統計；不得承諾具體到賬時限/
  出入金渠道/模擬帳戶天數。demo「免費模擬體驗」暫指 `/register`（流程待業主）。

**待業主（第三十一輪 follow-ups）**
- (a) 四帳戶分級（標準STP/RAW ECN/VIP/美分）是否為 HATC 真實產品、其**真實**條件（現全示意）。
- (b) 平台區列 MT4/MT5/TradingView——站上其他頁一致用 **MT5**；MT4/TradingView 支援與否待業主確認。
- (c) 平台卡目前為 CSS 漸層佔位，待真實截圖素材。
- (d) demo 帳戶流程／`primaryContactHref` 未設時 CTA fallback `/register`。

### 🟢 第三十一輪追加（2026-08-20）：`/accounts` 其餘區塊全面 CMS 化 ＋ 種子灌入

> 業主反饋「為什麼 CMS 沒有內容，你先補」＋「順手把點差表、優勢、FAQ、平台也一起 CMS 化（同一套模式）」。
> 原因：`account-tiers` 集合已建但**本機 DB 是空的**（後台顯示「沒有結果」，前台走 i18n fallback 才有畫面）。
> 本輪：① 把 tiers 以外的區塊也接上同一套 **DB→i18n fallback**；② 寫一支種子腳本把三語示意內容灌入 DB。
> `generate:types`／`build`／三語 SSG 全綠；種子已成功灌入本機 DB（tiers 4／benefits 4／spreads 2／
> platforms 3／accounts FAQ 5）。

**新增集合（同 `account-tiers` 模式，admin group Operations）**
- [`AccountBenefits`](src/collections/AccountBenefits.ts)（`account-benefits`）：`title`(localized)／
  `desc`(localized)／`icon`(select: percent/zap/creditCard/monitor，前台固定圖示集)／`order`／`enabled`。
- [`AccountSpreads`](src/collections/AccountSpreads.ts)（`account-spreads`）：`pair`(localized)／`bid`／
  `ask`／`spread`(localized)／`order`／`enabled`。**bid/ask/spread 皆示意**（admin description 已標）。
- [`AccountPlatforms`](src/collections/AccountPlatforms.ts)（`account-platforms`）：`name`(localized)／
  `desc`(localized)／`panelLabel`(非 localized，畫在漸層佔位卡上的短標如 MT5)／`order`／`enabled`。
- **FAQ 不新建集合**：改**複用既有 `faqs` 集合**，`category` 新增選項 **`accounts`**（`Faqs.ts`）；
  `AccountFaq` 讀 `getFaqs(locale,'accounts')`。`revalidateFaqs` 已加 `/accounts` 路徑。

**Readers（DB→i18n fallback，`unstable_cache`＋tag）**
- [`accountBenefits.ts`](src/lib/accountBenefits.ts)（種子 `accounts.benefits.items`，icon 依序）／
  [`accountSpreads.ts`](src/lib/accountSpreads.ts)（種子 `accounts.spreadsSample`）／
  [`accountPlatforms.ts`](src/lib/accountPlatforms.ts)（種子 `accounts.platforms.items`，panelLabel 依序）。
- [`faqs.ts`](src/lib/faqs.ts)：`FAQ_CATEGORIES` 加 `accounts`；fallback 支援**陣列型** `accounts.faq.items`
  （原 trading 是 q1..q6 物件；本輪泛化）。

**接線 / 元件**
- `AccountBenefits`／`AccountSpreads`／`AccountPlatforms`／`AccountFaq` 皆改讀 reader（`getLocale()`＋
  對應 `get*`），移除 `t.raw('items')`；kicker/heading 等 chrome 仍讀 i18n。
- infra：`cacheTags`（accountBenefits/accountSpreads/accountPlatforms）、`revalidateContent`
  （`revalidateAccountBenefits/Spreads/Platforms`→tag＋`/accounts`；`revalidateFaqs` 加 `/accounts`）、
  `permissions/registry`（3 集合 create/update/delete＋publishField）、`payload.config`（註冊 3 集合）。

**種子腳本**
- [`scripts/seed-accounts.ts`](scripts/seed-accounts.ts)：直接讀 `src/messages/{zh-Hant,zh-Hans,en}.json`
  的 `accounts.*` 灌入 **tiers/benefits/spreads/platforms/faqs(accounts)**，三語 localized、**seed-once**
  （集合非空即跳過，冪等）。執行 `npm run payload -- run scripts/seed-accounts.ts`（需 `DATABASE_URI`）。
  ⚠ 種子用泛型 dynamic-slug 呼叫 → Local API 以 `payload as any`（`p`）繞過型別窄化（執行期仍由
  Payload 依集合設定驗證）。

**⚠ dev server 需重啟**：本機 dev 進程是在新增這 3 個集合**之前**啟動的，Payload client 有 memoize；
**重啟 dev server** 後後台側欄才會出現「帳戶優勢／帳戶點差表／帳戶平台」且顯示已種入的資料（種子已在 DB）。

**治理不變**：tiers/spreads 的數字、四帳戶、點差＝**示意數據**，前台恆標、不入 FACTS；核可 **金27/銀30/
1:100** 仍只在 `products/tradingConditions.ts`。benefits/platforms/FAQ 為行銷/說明文案（業主可編輯）。

## 🟢 第三十輪（2026-08-20）：`/products/all` 所有交易產品表格頁 + `instruments` CMS 集合

> 業主指示：header「交易」mega-menu 不再逐一列個別產品（倫敦金／人民幣公斤條），改成
> **仿 Vantage 的「所有交易產品」**單一入口，點進去是**表格內頁**，且**表格內容由 CMS 配置**。
> 業主拍板（本輪問答）：① 新建獨立頁 **`/products/all`**（`/products` 維持「交易條件」細節頁）；
> ② mega「黃金產品交易」欄 = **概覽 ＋ 所有交易產品**；③ 表格欄位仿 Vantage =
> **產品／代號、合約規模、點差、槓桿、交易時段**。`lint`／`build`／`generate:types` 全綠，SSG。

**新增／變更檔案**
- **CMS 集合** [`src/collections/Instruments.ts`](src/collections/Instruments.ts)（slug `instruments`，
  admin group = Operations「營運與示意」）。每筆＝一列。欄位：`name`(localized)／`symbol`／
  `category`(select: metals/forex/indices/energy/other，預設 metals)／`contractSize`／`spread`／
  `leverage`／`tradingHours`(localized)／`order`／`enabled`(fieldUpdateAccess)。
  已註冊到 `payload.config.ts`、`permissions/registry.ts`（create/update/delete＋publishField）、
  `cacheTags.ts`（`instruments`）、`revalidateContent.ts`（`revalidateInstruments`→tag＋`/products/all`）。
- **Reader** [`src/lib/instruments.ts`](src/lib/instruments.ts)：標準 **DB→i18n fallback**
  （`getInstruments(locale)`＋`groupInstruments`）；無 DB／後台留空 → 回退 i18n 示意種子
  `productsAll.sample.rows`。
- **前台** `src/components/products/AllInstruments/{AllInstrumentsHero,AllInstrumentsTable}.tsx`
  ＋頁面 `src/app/(frontend)/[locale]/products/all/page.tsx`（沿用 `/products` dark/gold 系統：
  深色 hero＋淺色表格區＋**重用 `ProductsCta`** 結束帶；手機 `overflow-x-auto`＋捲動提示）。
  `sitemap.ts` 已加 `/products/all`；`metadata.productsAll`（3 語）。
- **Header 選單** [`Header.tsx`](src/components/Header/Header.tsx)：`MEGA_HREF` 移除 londonGold／
  kilobar、新增 `allProducts:'/products/all'`；products 欄＝`[overview, allProducts]`。
  [`HeaderNav.tsx`](src/components/Header/HeaderNav.tsx)：icon union 改 `allProducts`(LayoutGrid)。
  3 語系 `nav.mega.items` 移除 londonGold／kilobar、新增 allProducts。

**治理紅線（重要）**
- 表格的**合約規模／點差／槓桿／時段＝示意數據**（前台恆標「示意數據」badge＋說明），
  **非核可事實、不得寫入 FACTS**。已核可的**金 27／銀 30／1:100** 事實來源仍是
  `src/components/products/tradingConditions.ts`（呈現在 `/products`）。業主可在後台自由改示意值。
- `contractSize`／`spread`／`leverage` 目前為**非 localized**（單值）；`name`／`tradingHours` 為 localized。
  若要合約規模中英各異（如「100 盎司」vs「100 oz」）需改為 localized＋跑遷移（本輪未做）。

**種子腳本（把示意兩筆寫進 DB，讓後台可編輯）**
- [`scripts/seed-instruments.ts`](scripts/seed-instruments.ts)：用 **Payload Local API** 建
  倫敦金(XAU/USD, 27)／倫敦銀(XAG/USD, 30) 兩筆，三語系 name／tradingHours 都填。
  **冪等**（依 `symbol` 判斷，已存在則跳過）。
- **執行方式**（需先設好 `DATABASE_URI`）：

  ```bash
  npm run payload -- run scripts/seed-instruments.ts
  # 或
  npx payload run scripts/seed-instruments.ts
  ```

- **本機已執行**（Docker `hatc-postgres:5433`）：建立 id=2 XAU/USD、id=3 XAG/USD，三語系齊，
  `/api/instruments` 與 `/admin` 皆可見。正式環境接 DB 後，同指令跑一次即可種入（或業主自行在後台新增）。

**順帶修的既有隱患（revalidate 在非請求情境會中止寫入）**
- `afterChange` 的 `revalidateTag`/`revalidatePath` 在 **CLI 腳本／`onInit`／任何非 Next 請求情境**
  會丟 `Invariant: static generation store missing` 而**中止該次 collection 寫入**（這就是種子第一次
  沒寫進去的原因，也是舊 HANDOFF 記的「afterChange 在 request 外丟 invariant」老問題）。
- 修正：[`src/lib/revalidateContent.ts`](src/lib/revalidateContent.ts) 全部改走
  `safeRevalidateTag`／`safeRevalidatePath`（try/catch 包裝，請求情境外靜默略過）。
  正常後台編輯（在 request 內）仍照常 revalidate；腳本／遷移寫入不再被打斷。**建議保留此模式。**

**待業主／後續**
- (a) `/products/all` 目前沿用 `/products` 深色系；若要更接近 Vantage 純白表格頁，可改用 `/trading`
  的淺色 navy/gold 系統（待業主定）。
- (b) 若未來要加外匯／指數／能源等分類，`category` 已預留選項，表格會自動分組（空分類不顯示）。
- (c) `contractSize` 等是否改 localized（見上「治理紅線」）。

## 🟢 第二十八輪（2026-08-10）：角色與權限（Roles & Permissions）— 業主指定

> Payload **原生 access control，不自建**。`generate:types`／`lint`／`build` 全綠；
> 本機 Docker Postgres 以 Local API 模擬 admin／editor 多帳號驗證 **ALL PASS**
> （見下「驗證」）。前台公開讀取（`read: () => true`）維持不變 → SSG／無 DB fallback 不受影響。

**兩層角色（業主可日後加細；預設 admin/editor）**
- **admin（管理員）**＝全權：管理 Users／Media 全 CRUD、所有內容＋globals、可改他人角色。
- **editor（編輯）**＝內容維護：可增刪改編輯型內容（FAQ／最新消息／學堂）＋改頁面文案／營運
  globals；**不能**管理 Users、**不能**改任何人的角色、**不能**更新／刪除 Media 既有資產。

**已完成（檔案）**
- 新增 [`src/payload/access.ts`](src/payload/access.ts)＝共用 access helper：
  `roleOf`／`publicRead`／`isAuthenticated`／`isAdmin`／`isEditorOrAdmin`／`canAccessAdmin`
  （collection `admin` 需回 boolean，不可回 `Where`）／`adminsOrSelf`／`adminFieldAccess`。
- [`Users`](src/collections/Users.ts)：新增 `role`（select `admin`／`editor`，三語 label，
  `required`、`defaultValue:'editor'`、`saveToJWT:true`）；`role` 欄位 **`access.update =
  adminFieldAccess`**（防 editor 自升權）。Collection access：`admin=canAccessAdmin`（admin＋
  editor 可進後台）、`read/update=adminsOrSelf`（admin 全體、editor 僅自己）、
  `create/delete=isAdmin`。**首位帳號 bootstrap 為 admin**：`hooks.beforeChange`（`operation
  ==='create'` 且 `users` count===0 → `data.role='admin'`），其餘新帳號預設 editor、僅 admin 可升。
- 內容集合 [`Faqs`](src/collections/Faqs.ts)／[`HomeActivities`](src/collections/HomeActivities.ts)／
  [`AcademyArticles`](src/collections/AcademyArticles.ts)：`read=publicRead`、
  `create/update/delete=isEditorOrAdmin`。
- [`Media`](src/collections/Media.ts)：`read=publicRead`、**`create=isEditorOrAdmin`**、
  `update/delete=isAdmin`（見「本輪自主決策」）。
- 6 個 globals（[`SiteSettings`](src/globals/SiteSettings.ts)／`HomePage`／`TradingPage`／
  `AboutPage`／`ProductsPage`／`SampleTradingConditions`）：`read=publicRead`、
  `update=isEditorOrAdmin`（globals 無 create/delete）。
- `payload-types.ts` 已 `generate:types`（`User.role: 'admin' | 'editor'`）。

**本輪自主決策（可回退，已標注）**
- **Media**：spec 原寫「Users／Media 僅 admin」，但 editor 的核心工作（最新消息／學堂）需要為
  自己的內容上傳封面/banner 圖，若 Media 全 admin-only 會**卡死 editor 工作流**。故折衷：
  **editor 可 create（上傳）＋read**、**update/delete（管理／刪除共用資產）限 admin**。若業主要
  上傳也僅限 admin，把 `Media.access.create` 改回 `isAdmin` 即可（一行）。← **列為待確認 #1**。
- **SiteSettings（營運連結）** 也開放 editor 更新（與其他 globals 一致；低風險、屬編輯性維護）。
  若業主要營運連結僅 admin，改 `SiteSettings.access.update = isAdmin`。

**驗證（本機 Docker `hatc-postgres:5433`）**
- 以 Payload Local API（`overrideAccess:false` + 模擬 user）驗證：editor 帳號 role 正確、
  admin role 正確、**editor 不能自升 admin**（欄位級擋下）、**editor 不能刪 Users**、
  **editor 可建 FAQ**、**editor 可改 home-page global**（寫入成功；afterChange 的 `revalidateTag`
  在 Next request 外會丟 invariant，屬預期，非 access 問題）。**ALL PASS**；測試帳號已清除。

**⚠ 既有 DB 遷移注意（已處理本機，正式環境要做）**
- 新增 `role` 為 `required` 且 `defaultValue:'editor'` → Payload push 後，**既有使用者會被設為
  editor**。因 `role` 欄位僅 admin 可改，若唯一帳號被降為 editor 會**無人能升權**。
- 本機已 `UPDATE users SET role='admin' WHERE id=1;`（業主帳號 `skyyuch@gmail.com`）修正。
- **正式環境接新 schema 後**：務必手動把既有管理者帳號 `UPDATE ... SET role='admin'`（或直接在
  空 DB 建首位帳號 → 由 bootstrap hook 自動 admin）。

**待業主確認 → 業主已回覆（2026-08-10）**
1. ✅ **editor 可上傳 Media**：業主確認**維持現況**（editor 可 create、僅 admin 可 update/delete）。
   無 code 變更。
2. 🟠 **角色 → 業主要「角色可以選權限、不一定寫死」**：**推翻**目前 admin/editor 兩層硬編做法，
   改為**可設定式權限**（每個角色可勾選它能做什麼）。屬架構級變更，**待下方「角色權限模型」
   規格拍板後實作**（見新段落）。目前 code 仍是兩層硬編（`access.ts`），未動。
3. ✅ **SiteSettings（營運連結）editor 可改**：業主確認**維持現況**（editor 可更新）。無 code 變更。
4. （語系細分權）業主未特別要求；暫不做，待日後需要再議。

## 🟢 第二十九輪（2026-08-10）：角色權限模型 v2（路線 B／欄位級／admin 全權）— 已實作

> 業主 2026-08-10 拍板：**路線 B**（後台可自建角色、可視化勾權限）＋**欄位級**顆粒度＋
> **初始角色＝admin 全權**（其餘由 admin 自建）。**取代**第二十八輪的 admin/editor 兩層硬編。
> Payload 原生 access control，不自建。`generate:types`／`lint`／`build`（SSG fallback）**全綠**。
> ⚠ 尚未對 DB 做 schema 遷移（見下「DB 遷移」）；接 DB 後需實測多帳號。

**資料模型**
- **新 `Roles` 集合** [`src/collections/Roles.ts`](src/collections/Roles.ts)：`name`（unique）＋
  `fullAccess`（全權＝管理員，勾了忽略細項）＋由**資源登錄表**自動生成的權限勾選矩陣
  （每資源 CRUD＋少數敏感欄位的欄位級更新權；勾 `fullAccess` 時矩陣自動隱藏）。
  管理 `Roles` 本身＝**僅 `isFullAccess`**（硬紅線，委派角色無法自我擴權）。防鎖死 hooks：
  不可移除最後一個全權角色的全權、不可刪除最後一個全權角色、不可刪除仍被使用者使用的角色。
- **`Users.role` 改為 `relationship`→`roles`**（`saveToJWT`；取代舊 select）；`role` 欄位
  `access.update = fieldUpdateAccess('users','role')`（僅全權或被明確授權者可改，防自升權）。
  **首位帳號 bootstrap**：`beforeChange` 若 users 為空 → 指派 fullAccess 角色。

**權限引擎（集中）**
- 登錄表 [`src/payload/permissions/registry.ts`](src/payload/permissions/registry.ts)＝
  **唯一可權限化資源清單**＋key 產生器（`permKey`／`fieldPermKey`）。**新增集合/欄位務必更新它**。
  刻意**不含前台公開 read**（內容/全域 read 恆公開，只 `users` 開 read 切換）；刻意**不含 `roles`**
  （管理角色僅全權）。
- [`src/payload/permissions/roleFields.ts`](src/payload/permissions/roleFields.ts)：由登錄表生成
  Roles 的 collapsible 勾選矩陣（標準 checkbox，**無自訂 React 元件 → 免 `generate:importmap`**）。
- [`src/payload/access.ts`](src/payload/access.ts) 重寫：`loadRole(req)`（依 relationship 取角色，
  `overrideAccess` 防遞迴，per-request memoize）＋`allow()`＋工廠 `opAccess`／`contentCollectionAccess`／
  `globalAccess`／`usersReadOrSelf`／`usersUpdateOrSelf`／`fieldUpdateAccess`／`isFullAccess`／
  `canAccessAdmin`（有角色即可進 `/admin`）。**欄位級語意＝deny-by-default**：非全權者要編輯敏感欄位
  需「資源 update ＋ 該欄位勾選」皆具備。
- 已接線：Media（create/update/delete 走矩陣）、Faqs／HomeActivities／AcademyArticles
  （`contentCollectionAccess` ＋ `enabled`／`academy.slug` 欄位級）、6 個 globals（`globalAccess`）。
- [`payload.config.ts`](src/payload.config.ts)：註冊 `Roles`；`onInit` 確保存在一個 `Administrator`
  （fullAccess）角色，並在「僅一個帳號且無角色」時自動指派（單一業主遷移自癒；連 DB 才執行）。

**紅線（維持）**：前台 `read` 恆公開（SSG／無 DB fallback 不受影響）；facts 仍在 `HATC_FACTS.md`、
核可條件仍在 `tradingConditions.ts`；`Roles` 管理僅全權；角色指派防自升權。

**⚠ DB 遷移（未做，正式/本機接新 schema 前必讀）**
- `users.role` 由 enum(select) 改為 relationship（新 `roles` 表＋`users.role_id`）。Payload push 後
  **既有帳號的 role 會變 null**；因 `role` 欄位僅全權可改，唯一帳號若無角色會**無人能進後台**。
- **緩解**：`onInit` 會自動種 `Administrator` 角色；且「單一帳號且無角色」時自動指派 admin
  → 單一業主帳號（本機 id=1）接新 schema 後**首次啟動即自癒**。多帳號情境需手動：
  1) 啟動一次讓 `onInit` 建立 `Administrator`（或手動 `INSERT`）；
  2) `UPDATE users SET role_id = (SELECT id FROM roles WHERE full_access = true LIMIT 1) WHERE ...;`
     把既有管理者指到全權角色（其餘帳號再由 admin 於 `/admin` 逐一指派/建立角色）。
- build 以 `DATABASE_URI=` 空跑 SSG fallback 驗證。
- **本機 Docker DB 遷移已完成並驗證（2026-08-10）**：Payload dev push 對 `role` enum→relationship
  會**互動式詢問**「role_id 新建/改名」而在背景卡住 → 解法＝**先 `ALTER TABLE users DROP COLUMN
  role; DROP TYPE enum_users_role;`**（消除改名歧義），再讓 push 純新建 `roles` 表＋`role_id`。
  結果：`/admin` 200；`roles` 表建立；`onInit` 種出 `Administrator`(fullAccess)；owner 帳號
  `skyyuch@gmail.com` 自癒為 `role_id=1`（全權）。**正式環境遷移沿用同法**：先 drop 舊 enum 欄位再
  push，避免互動提問卡住（或改用 Payload migrations）。

**Admin UX 微調（第二十九輪同輪，業主逐點）**
- **麵包屑首頁 logo 空框**：Payload `.step-nav__home` 是固定 18×18 圖示槽，會裁掉寬版 wordmark
  → 看似空框。`adminBrand.css` 解除該槽尺寸限制、wordmark 以 18px 高顯示（logo 保留且可見）。
- **列表「建立新項目」→「新增」**：可見文字用通用 `general:createNew`（實體名僅進 aria-label）
  → `payload.config.ts` `i18n.translations` 覆寫三語 `general.createNew`＝新增／新增／Add new。
  刪除為 Payload 內建（列表勾選批次刪除／編輯頁「⋯」選單），未另做自訂按鈕。
- ⚠ 全域 admin CSS／i18n 改動要**硬重新整理**（Cmd+Shift+R）＋dev server 重啟才生效。
- **業主決策（第二十九輪）**：(1) 建立按鈕**維持通用「新增」**，不做逐集合具體名稱（如「新增角色」）；
  (2) **不加**儀表板「編輯各內頁文案」卡片 — 側欄「頁面文案」群組（各頁全域）已足夠，逐頁從側欄進編輯。

**待業主／下一棒**
- 接 DB 後於 `/admin`：建立非全權角色（如「內容編輯」勾 FAQ/最新消息/學堂 CRUD、留空 `enabled`
  ＝可編輯不可上下架）、指派給帳號，實測多帳號 access（含欄位級）。
- 若要更細顆粒（欄位讀取權、create 欄位級、更多可控欄位），在 `registry.ts` 加項＋接 `fieldUpdateAccess`
  ＋`generate:types` 即可擴充。

## ▶▶ 角色與權限（Roles & Permissions）— ✅ 已於第二十八輪完成（原計畫存查）

> 已實作，見上方「🟢 第二十八輪」。以下為當初計畫（存查）。
> 目標：後台多用戶分權（例如 管理員 admin＝全權；編輯 editor＝只改內容，不能動 Users／
> 系統）。Payload 原生 access control，**不需自建**。

**建議做法（Payload 3）**
1. **Users 加 `role` 欄位**（`select`，如 `admin`／`editor`；或 `roles` 多選）。首位使用者預設
   `admin`；`access.admin` 控制能否進 `/admin`。用 `adminLabel` 三語標籤。
2. **集合／全域 `access`**：以 `req.user?.role` 判斷 `create/read/update/delete`。
   - 內容類（HomeActivities／Faqs／AcademyArticles／各 Page globals／SampleTradingConditions）：
     admin＋editor 可寫；公開 `read: () => true` 維持（前台讀取）。
   - **Users／Media**：僅 admin 可管理（Users 建議 `access.admin`＋`create/delete` 限 admin）。
3. **欄位級 access**（選用）：敏感欄位（如 role 本身）僅 admin 可改，避免 editor 自升權。
4. **治理不變**：facts 仍在 `HATC_FACTS.md`；核可條件仍在 `tradingConditions.ts`；權限只管「誰能編輯」。
5. 加欄位後 `npm run generate:types`；本機 Docker Postgres 可測多帳號。

**注意**：`AdminHeaderLogout` 連 `/admin/logout`（預設路由）；若日後改 `admin.routes.logout` 要同步。

**非本棒／業主**
- 託管 Postgres（Neon／Supabase）正式環境；本機已有 Docker `hatc-postgres:5433`＋`/admin` 可用。
- 業主於 `/admin` 撰寫學堂 Lexical 全文後，詳情頁才有完整內文（種子 a1–a3 僅以摘要當內文）。
- 硬重新整理 `/admin` 驗第二十七輪主題（奶油底、navy「建立新項目」、側欄金線 active）。

## 🟢 第二十七輪（2026-08-10）：Payload admin UI/UX 重做（A 主題化 ＋ B 客製視圖）

> 業主回饋後台「很醜／沒設計、根本不行」。經與業主討論架構（headless 內嵌 vs 獨立、
> 自建成本），業主選 **A ＋ B**：在 Payload 框架內把視覺重做到位、並加品牌化入口，
> **不脫離 Payload、不改 CMS 資料模型**（自建 C 成本以週計、放棄升級紅利，不採）。
> `lint`／`build` 綠燈。

**A — 深度主題化** [`adminBrand.css`](src/components/payload/adminBrand.css)（由
[`app/(payload)/layout.tsx`](src/app/(payload)/layout.tsx) **全域 import**）
- 品牌字體 **Sora**（`@import` Google Fonts）覆寫 `--font-body`，含 CJK fallback
  （PingFang TC／JhengHei／Noto Sans TC）；`h1–h6`＋body 套用、標題負字距。
- 淺色 **cream 底＋navy elevation** 全套覆寫；`--button-radius`/`--field-border-radius`
  6px、`--gutter-h` 加寬。
- 側欄分組（uppercase muted）／active（金線指示）、`.nav__link` hover 面。
- 表格（圓角卡面、cream 表頭）、搜尋列、輸入 focus ring（navy）、field label／description、
  doc-controls sticky 頭、dashboard `.card` hover lift＋navy 標題、登入頁背景。
- 「建立新項目」pill → navy CTA（用 `--bg-color` 等變數，非 `!important`）。

**B — 客製視圖／IA**
- 新元件 [`DashboardHub`](src/components/payload/DashboardHub.tsx)（`beforeDashboard`，排在
  `DashboardIntro` 前）：深色 navy／gold 品牌 hero ＋ 6 張快速入口卡（最新消息／FAQ／學堂／
  頁面文案／營運設定／示意條件表），**三語**（讀 `i18n.language`：zh-TW／zh／en）；SVG 圖示內嵌。
- IA：左側分組（系統／內容／頁面文案／營運與示意）第二十四輪已建，本輪沿用；Users／Media 歸「系統」。
- `payload.config.ts` `beforeDashboard` 改陣列 `[DashboardHub, DashboardIntro]`；importMap 已含。

**邊界**
- 仍是 Payload 殼（列表／編輯表單結構、權限、Lexical、上傳皆用官方）；未自訂重寫整個 admin。
- 深色主題（若業主切換）僅有限對應；預設 `theme: 'light'`。
- 字體走 Google Fonts `@import`（內部後台可接受）；如需離線／自託管，未來可改 next/font 自託管。

**業主可驗**：硬重新整理 `/admin` → 儀表板頂部品牌入口卡、Sora 字體、cream 底、navy「建立
新項目」、側欄金線 active、表格圓角卡面。

**全面複檢（業主疑慮：先前 CMS 可能用低品質模型）結論**
- **資料／後端層品質良好**：collections（Users/Media/Faqs/HomeActivities/AcademyArticles）三語
  admin labels＋`revalidate` hooks＋治理註解齊；globals（Site/Home/Trading/About/Products/
  Sample）結構清楚、`optionalLocalized` 工廠 DRY；readers（尤其 `academyArticles.ts`）嚴謹
  `DB→fallback`＋`unstable_cache`＋cache tags＋型別對應；infra（`payload.ts` 單例、
  `cacheTags`、`revalidateContent`、`copyPick`）乾淨。**未發現需重寫的低品質問題**。
- **修正 1 個真 bug**：列表「建立新項目」先前仍白底 pill——泛用
  `html[data-theme='light'] .btn--style-pill` 白底規則特異度壓過 CTA 覆寫。已用
  `html[data-theme] .list-create-new-doc__create-new-button.btn` 直接設 navy 背景修正。

**第二次加強（業主仍嫌「像預設 Payload」）：外殼改造**
- 業主兩次反饋前述「上妝」仍像預設殼。改動最大觀感槓桿：**側欄改為深藍品牌 rail**
  （navy 漸層底、淺色連結、金色 active 指示、logo cream chip、account/logout 淺色、
  `--nav-width` 264px）。頂欄維持白、內容區 cream、列表卡面＋DashboardHub 落地卡不變。
- **Payload 外殼上限**：列表／編輯頁的骨架（左欄＋表格＋表單）仍是 Payload；要「完全不同的
  列表/編輯互動」需 custom views（`admin.components.views.*`，成本高、逐集合重造）——尚未做，
  待業主看深藍 rail 方向後再決定是否加碼。
- **提示**：全域 admin CSS 改動需**硬重新整理**（Cmd+Shift+R）才生效（HMR 不一定熱更新）。

**第三次修正（業主逐點抽查：logo／雙語言／登入）**
- **Logo 空白**：`.nav__header` 是 `position:absolute` 固定高度的 Icon 槽，上一輪誤加 padding／
  border 把 wide-wordmark logo 擠出可視區。已移除該 override，改 `.hatc-admin-icon img
  { height:22px; width:auto }`（依高度縮放，wordmark 才清晰）。login 頁 `AdminLogo` 同圖，一併恢復。
- **兩個語言切換**：自訂 `AdminLanguageSwitcher`（介面語言）與內建 Localizer（內容語系）並存＝混淆。
  **已刪除** `AdminLanguageSwitcher.tsx`、移出 config `actions`、regen importMap；介面語言改走
  **帳號 → 語言**。`DashboardIntro` 文案同步更新。
- **登入**：`/admin` 直接進入＝已有登入 session（非缺登入；Users `auth:true`，未登入會導向登入頁）；
  登出在側欄左下圖示。logo 修好後登入頁品牌恢復。
- lint／build 綠。

**第四次調整（業主逐點）：logo／登出／收合鍵**
- **左上收合鍵移除＋改放 logo**：桌機（`min-width:1025px`）隱藏
  `.template-default__nav-toggler-wrapper`；手機 hamburger 保留（<1025px 仍能開關側欄）。
  Icon logo 佔左上位。
- **登出移到右上**：新元件 [`AdminHeaderLogout`](src/components/payload/AdminHeaderLogout.tsx)
  （`admin.components.actions`，`next/link` → `/admin/logout`，label 用 `authentication:logOut`）；
  隱藏側欄底 `.nav__log-out`。樣式 `.hatc-admin-logout`（取代已刪語言器的死 CSS）。
- regen importMap；lint／build 綠。

## 🟢 第二十六輪（2026-08-10）：`/academy/[slug]` 詳情頁（Lexical）

> `lint`／`build` 綠燈；三語 `/academy/a1|a2|a3` SSG（無 DB＝i18n 種子）；CMS 文章經
> `generateStaticParams` + on-demand revalidate。

**完成**
- Reader 擴充 [`src/lib/academyArticles.ts`](src/lib/academyArticles.ts)：
  `getAcademyArticleBySlug`／`getAcademyArticleSlugs`；`body`＝Lexical JSON；
  無 body／種子 → 以 **excerpt** 合成最小 Lexical（**不捏造全文**）；CMS 有文但 slug
  不存在 → 404（僅空 CMS 才回退種子，與列表一致）。
- 詳情頁 [`/[locale]/academy/[slug]`](src/app/(frontend)/[locale]/academy/[slug]/page.tsx)
  ＋ [`AcademyArticleView`](src/components/academy/AcademyArticleView.tsx)
  （`@payloadcms/richtext-lexical/react` `RichText`；淺色 fig 表面，對齊列表頁）。
- 首頁 Academy 卡＋`/academy` 列表卡改為 `Link` → `/academy/{slug}`。
- Revalidate：`revalidatePath(/${locale}/academy, 'layout')` 覆蓋列表＋詳情。
- `sitemap.ts` 異步納入學堂文章路徑；三語 `academy.{backToList,breadcrumb,bodyEmpty}`。
- Docs：`WEBSITE_STRUCTURE.md` 標學堂列表＋詳情已上線；CMS Phase 0–4 狀態更正。

**未動／待業主**
- 種子卡無完整內文（僅摘要）— 業主於 admin 寫 Lexical body 後前台才有全文。
- `/trading` 第十八輪暫緩項、Figma 佔位圖、Footer／mega `#` 等仍待業主。

## 🟢 第二十五輪（2026-08-10）：首頁鉑金文案清理（對齊 FACTS）

> 第十四輪 KNOWN：首頁 SEO／舊 hero 副標仍寫鉑金，與 FACTS「目前僅黃金、白銀，不提供鉑金」抵觸。

**完成**
- 三語 `src/messages/{zh-Hant,zh-Hans,en}.json`：
  - `metadata.home.description`：移除鉑金／platinum，改為黃金、白銀（與 `/products` 一致）。
  - `home.hero.subtitle`：同上（舊 hero 鍵；現行 UI 用 `heroV2`，該鍵已無鉑金，仍校正以免殘留）。
- Docs 對齊：`DESIGN_DIRECTION.md`、`WEBSITE_STRUCTURE.md` 之 CFD 標的表述改為「目前金銀、不含鉑金」。
- `.cursor/rules/hatc-website.mdc` 第十四輪 KNOWN follow-up 標為已清。

**未動**
- 現行首頁 hero（`home.heroV2`）本來就無鉑金；產品頁本來就只列金銀。
- 未改視覺／版面；CMS 模型未動。

## 🟢 第二十四輪（2026-08-10）：Payload admin 介面多語＋UI 優化

> 業主回饋「後台全是英文」→ 修好並確認「可以了」。右上 **Locale**＝內容語系；
> **繁中／简中／EN**＝後台殼層語言。

**完成**
- `payload.config.ts` 啟用 `i18n.supportedLanguages`：`zh-TW`（預設）／`zh`／`en`
  （`@payloadcms/translations`；鍵名必須是 `zh-TW`）。
- Collection／Global labels 用 admin 鍵 **`zh-TW`／`zh`／`en`**（`src/payload/adminLabels.ts`）；
  側欄分組：內容／頁面文案／營運與示意／系統。
- 品牌化：`src/components/payload/{AdminLogo,AdminIcon,DashboardIntro,AdminLanguageSwitcher}`＋
  `adminBrand.css`；`titleSuffix: — HATC CMS`；淺色主題；navy 主按鈕。
- **預設繁中**：`src/proxy.ts` 在 `/admin` 無 `payload-lng` 時注入 `zh-TW`（避免英文
  Accept-Language 蓋掉 fallback）。
- 本機：Docker `hatc-postgres`:**5433**；`.env` `DATABASE_URI` 已指該庫（開發用）。

**業主操作**
- 介面語：右上 **繁中／简中／EN**（或帳戶→語言）。
- 內容三語：右上 **Locale**（zh-Hant／zh-Hans／en）。

## 🟢 第二十三輪（2026-08-10）：CMS Phase 4 — 行銷 globals＋示意交易條件表

> `lint`／`build` 綠燈；三語 `/` `/trading` `/about` `/products` SSG；無 DB 時全數回退 i18n／
> `sampleTradingData.ts` 種子。

**(a) 頁面行銷文案 globals**（只開業主要改欄位；結構留 code；每欄空＝i18n）
- `src/globals/HomePage.ts`（`home-page`）→ `lib/homeMarketing.ts`
- `src/globals/TradingPage.ts`（`trading-page`）→ `lib/tradingMarketing.ts`
- `src/globals/AboutPage.ts`（`about-page`）→ `lib/aboutMarketing.ts`
- `src/globals/ProductsPage.ts`（`products-page`）→ `lib/productsMarketing.ts`
- 共用欄位工廠 `src/globals/fields/optionalLocalized.ts`；`lib/copyPick.ts`（`pickText`／messages）
- 前台元件改讀 resolved marketing（Hero／區塊 intro／CTA）；卡片格／功能列等結構字串仍 i18n。
- Revalidate：各 global `afterChange` → tag + 對應 locale path。

**(b) 示意交易條件表**
- Global `src/globals/SampleTradingConditions.ts`（`sample-trading-conditions`）
- Reader `lib/sampleTradingConditions.ts`：DB 陣列非空 → CMS；否則 `sampleTradingData.ts`
  （**種子保留、不得刪**）。UI 仍標「示意數據」。
- **核可事實隔離**：gold 27／silver 30／1:100 **只**來自 `products/tradingConditions.ts`；
  `/products` 條件表數字路徑不經此 CMS global。

**Infra**
- `CACHE_TAGS`＋`revalidateContent` 補 home/trading/about/products marketing＋sample tables。
- `payload.config.ts` 註冊 5 個新 globals；`payload-types.ts` 已 `generate:types`。

**待業主／下一棒**
- 託管 Postgres 後手動驗證：admin 改行銷文案／示意表 → 前台 revalidate。
- `/academy/[slug]` → **第二十六輪已完成**。

## 🟢 第二十二輪（2026-08-10）：CMS Phase 3 — 學堂文章（AcademyArticles）

> `lint`／`build` 綠燈；三語首頁＋`/academy` SSG；無 DB 時 Academy 回退 i18n 三卡（a1–a3）。

**完成**
- 新 collection [`src/collections/AcademyArticles.ts`](src/collections/AcademyArticles.ts)：
  `title`／`slug`／`excerpt`／`body`（Lexical richtext）／`cover`／`category`／
  `publishedAt`／`order`／`enabled`；localized；hooks → revalidate。
- Reader [`src/lib/academyArticles.ts`](src/lib/academyArticles.ts)：DB→i18n fallback
  （`home.goldAcademy.articles` a1–a3；**messages 種子保留**）；CMS 空列表亦 fallback。
- Revalidate：`revalidateAcademyArticles` → `cacheTags.academyArticles` + `/${locale}` +
  `/${locale}/academy`。
- 前台：首頁 [`Academy`](src/components/home/Academy/Academy.tsx) 改讀 CMS；新增
  [`/academy`](src/app/(frontend)/[locale]/academy/page.tsx) 列表（`AcademyList`）；
  `sitemap.ts` 加 `/academy`。
- i18n：三語 `academy.*`＋`metadata.academy.*`＋`home.goldAcademy.imageAlt`（區塊 chrome；
  文章種子 `home.goldAcademy.articles` **未刪**）。
- `payload.config.ts` 註冊；`payload-types.ts` 已 `generate:types`。

**待下一棒／業主**
- Phase 4（見第十九輪 §分階段）。← **Phase 4 已於第二十三輪完成**
- 託管 Postgres 後手動驗證：admin 增刪 AcademyArticles → 首頁／`/academy`／詳情頁經 revalidate 更新。
- `/academy/[slug]` 詳情頁 → **第二十六輪已完成**。

## 🟢 第二十一輪（2026-08-10）：CMS Phase 2 — 新聞／活動（HomeActivities 前台消費者）

> `lint`／`build` 綠燈；三語首頁＋`/news` SSG；無 DB／空列表時顯示中性空狀態（不捏造活動）。

**完成**
- Reader [`src/lib/homeActivities.ts`](src/lib/homeActivities.ts)：DB→`[]`（**刻意無活動
  種子 fallback**；治理＝不捏造促銷）；limit 50；缺標題過濾。
- Revalidate：`revalidateHomeActivities` → tag + `/${locale}` + `/${locale}/news`。
- 首頁 [`LatestNews`](src/components/home/LatestNews/LatestNews.tsx)（Academy 後、淺色帶、
  `#news`；非 Figma 4:4，CMS Phase 2 新增）＋共用 [`ActivityCard`](src/components/news/ActivityCard.tsx)
  （無圖＝品牌漸層，非假圖）。
- [`/news`](src/app/(frontend)/[locale]/news/page.tsx) 由 ComingSoon 改為列表頁（`NewsList`）；
  `sitemap.ts` 加 `/news`（可索引）。
- i18n：三語 `news.*`（kicker／heading／empty／viewAll／imageAlt）＋`metadata.news.*`
  （區塊 chrome only；**無假新聞種子**）。

**待下一棒／業主**
- Phase 3–4（見第十九輪 §分階段）。
- 託管 Postgres 後手動驗證：admin 增刪 HomeActivities → 首頁／`/news` 經 revalidate 更新。
- 業主於 `/admin` 填寫真實活動／公告內容後前台才有卡片。

## 🟢 第二十輪（2026-08-10）：CMS Phase 0＋Phase 1 完成（FAQ 端到端）

> `lint`／`build` 綠燈；三語 `/trading` SSG；無 DB 時 FAQ 回退 `trading.faq.items`（q1–q6）。

**Phase 0 — 共用 infra**
- 新增 [`src/lib/payload.ts`](src/lib/payload.ts)（`hasDb()`、`getPayloadClient()` singleton）。
- 新增 [`src/lib/cacheTags.ts`](src/lib/cacheTags.ts)、[`src/lib/revalidateContent.ts`](src/lib/revalidateContent.ts)
  （Next.js 16：`revalidateTag(tag, 'max')` + `revalidatePath`）。
- 重構 [`siteSettings.ts`](src/lib/siteSettings.ts)、[`homeActivities.ts`](src/lib/homeActivities.ts)：
  共用 client + `unstable_cache` + cache tags。
- `SiteSettings` global、`HomeActivities` collection 補 revalidate hooks。

**Phase 1 — FAQ**
- 新 collection [`src/collections/Faqs.ts`](src/collections/Faqs.ts)：`question`/`answer`（textarea）
  localized、`category`（trading/products/general）、`order`、`enabled`；hooks → revalidate FAQ + `/trading`。
- Reader [`src/lib/faqs.ts`](src/lib/faqs.ts)：`getFaqs(locale, category)`；`trading` fallback＝
  `trading.faq.items`；CMS 空列表亦 fallback。
- [`TradingFaq.tsx`](src/components/trading/TradingFaq/TradingFaq.tsx) 改讀 CMS；區塊 badge/heading/subtitle 仍 i18n。
- `payload.config.ts` 註冊 `Faqs`；`payload-types.ts` 已更新。

**待下一棒／業主**
- Phase 2–4（見第十九輪 §分階段）。← **Phase 2 已於第二十一輪完成**
- 託管 Postgres（業主開 Neon/Supabase 後方可 `/admin` 實際編輯）。
- 接 DB 後手動驗證：admin 增刪 FAQ → 前台 `/trading` 經 revalidate 更新。

## 🟠 第十九輪（2026-08-10，規劃）：CMS-first 內容架構（業主拍板；Phase 0–1 已實作 → 第二十輪）

> 業主在交棒前提出「概覽頁的常見問題想做成 CMS 配置、不要寫死」，並追問是否該**停做頁面、
> 先做好 CMS**。討論後業主拍板三件事：**(1) 推進順序＝CMS 先行**（暫停新頁面，先把編輯型內容
> 模型做齊再回來做頁面）；**(2) 範圍＝廣**（含頁面行銷文案／交易條件表）；**(3) 交棒**給下一棒實作。
> 本輪＝**產出決策與可執行計畫＋更新規則/handoff**，未動 code。

**為何 CMS-first 但不「全部進 CMS」（內容分層，務必守）**
1. **事實層** → `HATC_FACTS.md` 唯一來源，**不放進 CMS 供隨意改**（治理紅線）。核可交易條件
   （金 27／銀 30／槓桿 1:100）續留 `src/components/products/tradingConditions.ts` 當真值。
2. **營運連結** → Payload `SiteSettings` global（已完成）。
3. **編輯型/行銷內容（業主可改）** → 新 CMS collections/globals：FAQ、新聞/活動、學堂文章、
   頁面 hero/區塊行銷文案、示意交易條件顯示表。
4. **UI 結構字串**（導覽、按鈕、區塊 kicker、表單標籤、metadata 模板）→ **維持 `src/messages/*`**。
   不把每個微字串都 CMS 化（過度工程；本就需工程師/QA）。

**技術基礎（沿用現有模式 + DRY）**
- **既有可複用模式**：Payload localized collection/global ＋ `lib/*` reader「DB→fallback」
  （`lib/siteSettings.ts`、`lib/homeActivities.ts`）。Payload 已開三語 `localization`（`fallback:true`）。
- **新增共用 infra**：`src/lib/payload.ts`＝`getPayloadClient()` ＋ `hasDb()`；把兩個既有 reader
  重構到它上面（減重複）。
- **reader 一律 DB→fallback i18n**：接了 DB 讀 CMS，沒接（dev/preview）回退現有 i18n messages
  →**維持 SSG、無 DB 也能 build/跑**。i18n messages＝各類型的**預設種子＋fallback，不得刪**。
- **刷新＝SSG + on-demand revalidate**：reader 讀取加 cache tag；Payload `afterChange`/`afterDelete`
  hook 呼叫 `revalidateTag`/`revalidatePath`。**不改成全 SSR**。
- 每次改 collection/欄位後跑 `npm run generate:types`（更新 `payload-types.ts`）。
- **存取控制**：`read: () => true`（公開）、寫入＝登入管理者（Payload 預設）。

**分階段實作（即使暫停頁面，仍分段交付、逐段綠燈）**
- **Phase 0 — 共用 infra**：建 `src/lib/payload.ts`（shared client + `hasDb()`）＋ 定 cache tag/
  revalidate 慣例；重構 `siteSettings`/`homeActivities` reader。（打地基，無前台變化）
- **Phase 1 — FAQ（先做，打通端到端）**：新 `Faqs` collection（欄位：`question` localized、
  `answer` localized〔richtext 或 textarea，待業主定〕、`category`〔select：trading/products/
  general…〕、`order`、`enabled`）＋ `getFaqs(locale, category)` reader（fallback＝現有
  `trading.faq.items`）＋ 接上 `/trading` 的 `TradingFaq`（改讀 CMS，無 DB 回退 i18n）。
  ＝直接回應「FAQ 不寫死」的最初需求。
- **Phase 2 — 新聞/活動**：**復用**現有 `HomeActivities`（已 localized、目前無前台消費者）；
  加前台消費者（首頁「最新消息」區＋ `/news`）＋ revalidate hook。
- **Phase 3 — 學堂文章**：新 `AcademyArticles` collection（title/slug/excerpt/body richtext/
  cover/category/publishedAt/order/enabled，localized）；消費者＝首頁 Academy 區＋（未來）`/academy`。
- **Phase 4 — 最重、最後做（廣範圍核心）**：
  (a) **頁面行銷文案 globals**（如 `HomePage`/`TradingPage`/`AboutPage`/`ProductsPage`）：**只開放
      業主真的要改的欄位**（hero 標題/副標/徽章、區塊 intro、CTA label），localized，每欄 i18n fallback。
      **結構仍留 code、只讓文案可覆蓋**（避免業主誤改版面）。此為最大/最有治理風險的一塊，故排最後。
  (b) **示意交易條件表**（現 `sampleTradingData.ts`）：改為 CMS 可編輯（讓業主「慢慢調數字」），
      **但 UI 仍標「示意數據」**；**核可事實仍以 code 為準，CMS 不得悄悄覆蓋核可事實**。

**待業主定案（下一棒動工前確認）**
1. **託管 Postgres 由誰開、用哪家**（Neon／Supabase／其他）？上線讓業主能進 `/admin` 編輯的前提。
2. **FAQ／學堂內文**：允許 Lexical **richtext**（粗體/連結/清單）還是**純文字 textarea**？
   （建議：學堂用 richtext、FAQ 用 textarea 或輕量 richtext。）
3. **行銷文案 globals**：確認要開放哪些欄位可改（避免整頁曝露、業主誤改）。
4. **三語翻譯責任**：業主自行維護三語，還是 zh-Hant 主、其餘靠 Payload fallback？
5. **治理確認**：業主同意 CMS 編輯型內容之正確性由業主負責（勿打未證實數據/見證/獎項）；
   事實仍走 FACTS、示意表仍標示意。

**驗收準則（每 Phase）**：`lint`/`build` 綠燈；無 DB 時前台仍以 i18n fallback 正常顯示（SSG）；
接 DB（本機或 preview）後 `/admin` 可增刪改、前台經 revalidate 即時更新；三語齊備；`payload-types.ts` 已更新。

## 🟢 第十八輪（2026-08-10）：「概覽」內頁 `/trading` 上線（Figma `44:4`，NEW 淺色系）

> 業主給概覽頁 Figma（同檔 `GGCUJwo9drmEUibcs9mLtq`，frame **`44:4`** `hatc-gold-trading-overview`，
> 1440×5055）。**實測發現此 Figma 為淺色系**（白底／navy `#1a3366`／Instrument Serif＋Geist／
> 奶油膠囊徽章／gold `#c9a84c`），與 kickoff 紅線寫的「深色金色」矛盾 → 已問業主，**業主拍板
> 「忠實還原此淺色 Figma」**。`lint`／`build` 綠燈（`/trading` 三語 SSG）；三語 200；三斷點
> （1440／834／390）headless(CDP) 截圖比對 Figma 通過。

**業主本輪定案（實作前 5 問）**
1. **路由＝`/trading`**。
2. **IA**：「交易」頂層＋mega「概覽」都指 `/trading`；`/products` 保留為「交易條件」細節子頁
   （mega「交易條件」與概覽頁「查看完整交易條件」CTA → `/products#conditions`）。
3. **設計系統**：忠實還原淺色 Figma（新語言，暫僅此頁）。
4. **FAQ 軟化**：移除未確認的具體時限/渠道，改通用措辭；資金隔離託管句保留（已核可事實）。
5. **帳戶／點差兩表**：照 Figma 當「示意」佔位（標示意數據，不寫入 FACTS，上線前替換）。

**已完成**
- **新頁** `src/app/(frontend)/[locale]/trading/page.tsx`（三語 SSG，`generateMetadata` 用
  `metadata.trading.*`，canonical `/trading`＋hreflang）。順序＝TradingHero → TradingServices →
  AccountComparison → TradingTrust → PricingConditions → TradingFaq → TradingCta（全域白底 Header
  ＋深色 Footer 由 `[locale]/layout.tsx` 注入）。
- **7 區塊元件**（`src/components/trading/*`，全讀 i18n、無寫死）＋共用 `SectionHeader`（奶油膠囊
  徽章＋Instrument Serif 標題＋Geist 副標）。FAQ 用原生 `<details>` 手風琴（無 client JS，首題預開）。
  示意數字集中在 `src/components/trading/sampleTradingData.ts`（`PRICING_ROWS` 報價表、`ACCOUNT_ROWS`
  帳戶表，檔頭註明 sample、不得寫入 FACTS）。
- **字體**：`src/lib/fonts.ts` 新增 **Instrument Serif**＋**Geist**（`next/font/google`），變數掛 `<html>`
  （`[locale]/layout.tsx`）。**tokens**：`src/styles/tokens.css` 新增 **additive** `--trd-*` 淺色系
  tokens＋`--font-serif-display`／`--font-geist`；深色系與暖白系原封不動。元件以明確 class 引用（含覆蓋
  全域 `h1-h4{serif;navy #09395f}` base rule → 用 `font-[family-name:var(--font-serif-display)]`＋
  `text-[var(--trd-navy)]`）。
- **接線**：`Header.tsx` `NAV.goldTrading.href`＝`/trading`、`MEGA_HREF.overview`＝`/trading`；
  `sitemap.ts` 加 `/trading`（可索引）。修正 `Header.tsx` **既有 TS 型別 latent bug**（`NAV` 常數缺
  `label` → 改 `Omit<NavLink,'label'>`；第十七輪引入、因只跑 eslint 未被 `next build` 型檢抓到）。
- **i18n**：三語新增 `metadata.trading.*` 與 `trading.{hero,services,accounts,trust,pricing,faq,cta}`。
  **複用**：`home.heroV2.badge`（AA/008 徽章）、`home.heroV2.ctaPrimary`（開始了解）、`common.contactUs`、
  `common.readMore`（帳戶「了解更多」）、`nav.openAccount`。

**本輪取捨／待業主（詳見 rules 第十八輪與上方「▶ 下一步」）**
- 淺色系目前僅 `/trading`（是否推廣＝全站級決策，待業主）；帳戶分級真偽與真實條件待業主；
  `#c9a84c` vs `#d4af37` 是否統一；hero 平板圖／合作夥伴標誌為佔位；營運連結走 CMS。

## 🟢 第十七輪（2026-08-10）：Header 依 Figma `38:5` 重建為「白底＋mega‑menu」

> 業主給新 Figma（node `38:5`）指定 Header 改版。這是**全站層級**變更：header 由深色
> 轉**白底**（覆蓋第十輪「深色 header 全站」的決定），**Footer 維持深色**。`lint` 綠燈、
> 三語 `/`、`/about`、`/products` 皆 200；headless(CDP) 截圖驗證關閉態／mega 展開態／
> 手機抽屜皆比對 Figma 通過。

- **白底 sticky header**（`Header.tsx`）：`bg-white`、下邊框 `#e6e6e6`、高 80、`lg:px-20`；
  logo 改用真實 wordmark 但**去白底座**（`BrandLogo chip={false}` h-35，白底上深藍字本就清晰）。
- **桌機導覽＝新 client 元件 `HeaderNav.tsx`**：連結預設 `#8e99b0`，當前路由/選單開啟＝金
  `#d4af37`；**「黃金交易」hover/focus 展開雙欄 mega‑menu**（黃金產品交易／交易支援＆流程
  ＋底部 `#fffbf2` 奶油色「立即開戶」橫幅），Esc／點連結關閉、120ms 關閉延遲防閃爍。
- **手機抽屜（`HeaderMobileMenu.tsx`）改白底**＋「黃金交易」手風琴列出 6 個 mega 項目；
  `LocaleSwitcher.module.css` 由深色樣式改為淺色（`#8e99b0` 文字、透明邊、hover 轉深）。
- **i18n**：三語新增 `nav.mega.*`（欄標題／6 項 title+desc／banner）與 `nav.primary`。
- **mega 連結對照**（內容連結，非營運連結）：概覽→`/products`、倫敦金→`/products#gold`、
  交易條件→`/products#conditions`；**公斤條／交易帳戶／入金出金＝`#` 佔位**（尚無頁面）；
  banner「立即開戶」→CMS 開戶連結（`primaryContactHref`，外開）否則 `/register`。
- **待業主確認**：① 新產品詞 **倫敦金交易／公斤條買賣** 來自業主 Figma 文案，照用但
  **未寫入 FACTS**，確認後才可當事實；② 公斤條 icon 用 lucide `Boxes`（Figma 該格是佔位圖示）；
  ③ 公斤條／交易帳戶／入金出金的正式路由待業主補（現 `#`）。
- 取捨：mega 面板在桌機**置中於觸發連結下方**（Figma 為 `left-260` 絕對定位），視覺自然且
  響應式安全；寬度 `min(720px, 100vw-2rem)`。
- **業主微調（同輪）**：① header 互動色由金改**深藍 `#1C4A70`**（開啟/當前頂層連結、下拉項
  hover 的字＋icon＋icon 底色 `rgba(28,74,112,0.12)`、「立即開戶」橫幅、登入 hover 皆用之）；
  ② 導覽字「黃金交易」縮短為**「交易」**（`nav.goldTrading`，僅 header 用；`mega.openLabel` 同步）；
  ③ 產品欄 kilobar 由「公斤條買賣」改**「人民幣公斤條」**（以人民幣計價實物公斤條），與倫敦金並列
  ＝概覽／倫敦金交易／人民幣公斤條。**業主已確認並寫入 FACTS**（`HATC_FACTS.md`
  「Featured product lines on site」）：倫敦金＝證書 Loco London Gold 100 Ounces（XAU/USD）；
  人民幣公斤條＝證書 RMB Kilo Gold。名稱屬事實，具體交易條件仍限業主提供。

## 🟢 第十六輪（2026-08-10）：真實 Logo 上牆（Header／Footer）＋ About 牌照牆點擊放大

- **真實品牌 Logo**：原本 Header／Footer 用純文字「HATC 華安泰昌」，現改用原項目的
  真實 logo 圖檔（`public/brand/hatc-logo.png`＝深藍字＋綠三角，透明底 PNG，與
  `lp/gold-cfd/assets/hatc-logo.png` 同檔）。新增共用元件 `src/components/BrandLogo.tsx`：
  因 logo 是**深藍字**、在深色 `--fig-nav`／`--fig-ink` 上看不見，沿用 LP 做法把 logo 放在
  **白色圓角底座**（`bg-white rounded-[10px] px-3 py-1.5`＋陰影/內描邊）。Header 高度 26px、
  Footer 28px；用 `next/image` 依原圖比例（3065×903）算寬。Header logo 外層 `Link` 保留
  `aria-label=common.brandFull`、圖 `alt=""`（避免重複朗讀）；Footer 圖 `alt=common.brandFull`。
- **About 牌照牆點擊放大**：`CredentialsGallery` 圖庫改為可點擊燈箱。新增客戶端元件
  `CredentialsGalleryGrid.tsx`（`'use client'`）負責 Figma 排版 + 燈箱；server 元件仍取 i18n/資料。
  每張圖＝按鈕（hover 顯示放大鏡圖示＋縮放、focus ring、`aria-label`）；點擊開全螢幕燈箱
  （原生 `<img>` 全解析度、`object-contain`），Esc／點背景／關閉鈕皆可關，開啟時鎖 body 捲動，
  `role=dialog`+`aria-modal`。三語新增 `common.close` 與 `about.gallery.zoomHint`。
- 驗證：`lint` 綠燈；三語 `/`、`/about`、`/products` 皆 200；Header logo headless 截圖目視正常。

## 🟢 第十五輪（2026-08-10）：About 驗收微調（時間軸連接線＋牌照牆補海關證書）

> 業主逐區驗收 About 時提出兩點：① 發展歷程「時間線沒顯示、與 Figma 有落差」
> ② 辦公室/牌照/獎項 LP 頁已備好素材、為何沒用齊。已修，`lint`／`build` 綠燈，
> 三斷點截圖比對 Figma 通過。

- **時間軸（`Timeline.tsx`）對齊 Figma `12:92`**：原本只在年份下放一條深灰 `h-px`
  （幾乎看不見）→ 改為 Figma 的「金色大年份 + 向右**金色漸層連接線**（`from-gold
  to-transparent`）」，四欄串成一條時間線。年份仍用 **FACTS 真實里程碑**（2025/2025/
  2026/2026，保留精確日期 `<time>`），未採 Figma 佔位年份。
- **牌照榮譽牆（`CredentialsGallery.tsx`）改照 Figma `12:134` 排版重建、換業主指定實圖**：
  業主給定素材＋排版後定案採 **Figma 四框排版**＝左大框＋右側上下兩小框＋底部寬框（2 欄）：
  ① 左大框＝交易所行員證書(`member-2025.jpg`)；② 右上＝辦公室(`office/office2.jpg`，
  業主 `HATC材料/office2.jpeg`)；③ 右下＝品牌榮譽獎座(`certificates/award2.jpg`，業主
  `HATC材料/award.jpeg`＝Capital CEO Entrepreneur「服務大獎」星形獎座)；④ 底部寬框 2 欄
  ＝參與者證書(`participant-2026.jpg`)＋**香港海關 A 類註冊證書**(`certificates/cert-dpms.jpg`，
  由 `lp/gold-cfd/assets/` 複製)。新素材以 `sips` re-encode 轉正 EXIF。海關牌照為 FACTS 已核可
  （No. A-B-24-12-08564），先前 About 漏列。三語 gallery 新增 `customsLabel`＋`alt.customs`；
  `licenseLabel`／`documentLabel` 文案改「交易所行員證書／交易所參與者證書」。
  取捨：Figma 底部為單一寬框（佔位），本輪填「參與者證書＋海關證書」2 欄以保留海關牌照。
  舊 `certificates/award.jpg`（另一「金」獎座）與 `office/reception.jpg` 現已不被 gallery 引用
  （檔案保留未刪）。
- **附記**：業主先前截到的「空框」是 dev 模式 `next/image` 首次最佳化尚未載出所致，非缺圖；
  正式 build 皆正常。LP 另有 `harbour.jpg`（真實維港夜景）目前未用於 About——若要，
  可換掉 `HongKongConnection`／`AboutHero` 的 Figma 佔位背景（待業主一句話即可接）。

## 🟢 第十四輪（2026-08-10）：產品／CFD 頁上線（待辦 5，業主選定）

> 業主本輪定案推進**待辦 5**：新建「產品／CFD」頁，用**已核可**的點差／槓桿（金 27／
> 銀 30 點、槓桿 1:100，來源 `HATC_FACTS.md`）以**正式**（非「示意」）方式呈現，並把
> Footer 的 `/trading-rules`、`/margin` 指過去。沿用首頁/About 的深色金色共用設計系統
> （**無專屬 Figma**）。`lint`／`build` 綠燈（新增 `/products` 三語 SSG）；三語 200、
> 三斷點（1440／834／390）headless Chrome 截圖目視通過；舊 stub 404、sitemap 已含 `/products`。

**已完成**
- **新頁** `src/app/(frontend)/[locale]/products/page.tsx`（三語 SSG）：`generateMetadata`
  用新 `metadata.products.*`，canonical `/products`＋hreflang。順序＝ProductsHero →
  ProductList → TradingConditions → ProductsCredibility → ProductsCta（Header/Footer
  由 `[locale]/layout.tsx` 全域深色注入）。
- **5 個深色金色區塊元件**（`src/components/products/*`，全讀 i18n、無寫死）：
  `ProductsHero`（金條背景＋麵包屑「首頁／產品」＋AA 008 徽章＋雙 CTA，走 CMS operational link）、
  `ProductList`（淺區 2 卡：黃金 CFD `XAU/USD`／白銀 CFD `XAG/USD`，每卡秀**核可**平均點差＋
  最高槓桿，**無「示意」標記**，附 `id=gold/silver` 供 Footer 錨點）、`TradingConditions`
  （深區規格表：產品／代碼／平均點差／最高槓桿／交易平台＝MetaTrader 5；**其餘條件**〔最低
  手數/手續費/執行方式〕列「將另行公佈」不虛構；附平均值＋槓桿風險註記，`id=conditions`）、
  `ProductsCredibility`（淺區 3 卡**複用** `home.trust.*`＋資產安全條**複用**
  `about.credentials.security`）、`ProductsCta`（深區雙 CTA，走 `getSiteSettings()`／
  `primaryContactHref()`，無模擬帳戶承諾）。
- **核可事實常數** `src/components/products/tradingConditions.ts`：`CFD_PRODUCTS`＝
  金(spread 27, 1:100)／銀(spread 30, 1:100)，檔頭註明**是核可事實非 sample、僅金銀、
  不含鉑金**。標籤/單位走 i18n（`products.conditions.*`），數值 locale-neutral。
- **i18n（三語同步、複用優先）**：新增 `metadata.products.*`、`nav.products`（＝產品/产品/
  Products，供麵包屑；未動 Header 導覽結構）、`products.{hero,list,items,conditions,
  credibility,cta}`。**複用** `home.heroV2.badge`（AA 008 徽章）、`home.trust.*`、
  `about.credentials.security`、`common.{contactUs,viewMore}`、`nav.{home,openAccount}`。
- **接線**：`Footer.tsx` 交易服務欄 → `l1 /products#gold`、`l2 /products#silver`、
  `l3+l4 /products#conditions`（取代舊 `/trading-rules`、`/margin`）；**刪除**兩個 stub
  頁與空資料夾（僅 Footer 曾引用，已確認）。首頁 `Services` CTA「了解黃金交易服務」由原本
  `#mt5`（文不對題）改指 `/products`（下鑽到產品頁）。`sitemap.ts` `paths` 加入 `/products`
  （正式核可內容 → 可索引）。

**本輪自主決策（可回退，已標注）**
1. **route＝`/products`**（可擴充多產品）；沿用首頁 hero 佔位背景 `raw_2.png`、CTA 背景
   `about-cta-bg.png`（皆為 Figma 佔位圖，上線前隨其他頁一起換真實素材）。
2. **平台列標 MetaTrader 5**：與全站既有文案一致（首頁 MT5Showcase、About `identity.p3`
   已對外述明 MT5），非本輪新造事實；FACTS「平台名稱仍待業主提供」的其餘平台細節未編造。
3. 未在 Header 主導覽加「產品」項（避免動綠燈導覽結構）；入口＝首頁 Services CTA＋Footer
   交易服務欄。若要 Header 直達，改 `Header.tsx` NAV 常數即可（`nav.products` 已備）。

**本輪發現、需業主/下一棒處理（未在本輪擅改綠燈首頁文案）**
- ✅ **鉑金不一致（第二十五輪已修）**：`metadata.home.description` 與 `home.hero.subtitle`
  （三語）已改為僅黃金、白銀，對齊 FACTS。

**下一步建議**：① 業主驗收產品頁文案/版面 ② ~~修正首頁鉑金不一致~~（已完成） ③ 業主給其餘交易條件
（最低手數/手續費/執行方式）後替換「將另行公佈」④ 續推其他待辦（真實素材、獎項全名、
Footer 完整連結表、模擬帳戶流程、隱私權/免責法律文字）。

## 🟢 第十三輪（2026-08-10）：About 頁 Figma 深色金色重構——實作完成

> 承第十二輪規格（`docs/FIGMA_ABOUT_SPEC.md`，frame `12:4`）。本輪把 **About 內文
> 八區全部重寫**為與首頁一致的深色金色系，退役暖白舊元件。`lint`／`build` 綠燈
> （About 三語 SSG），三斷點（1440／834／390）headless Chrome 截圖比對 Figma 通過。

**業主本輪定案（實作前 3 問，2026-08-10）**
1. **發展歷程**＝用 **FACTS 真實里程碑**（2025-01-13 / 2025-10-09 / 2026-03-27 /
   2026-03-30），**不呈現成立年**（Figma 的 2018–2023 佔位年份已棄用）。
2. **資金託管/隔離聲明**＝業主確認**屬實、可對外**，照 Figma 文案刊登。→ 已登錄
   `HATC_FACTS.md` 新節「Client fund custody（業主確認 2026-08-10）」為核可事實。
3. **金色**＝沿用全站 **`#d4af37`**（`--fig-gold`/`--color-gold`），維持一致。

**已完成**
- **8 個深色區塊元件**（`src/components/about/*`，全讀 i18n、無寫死）：`AboutHero`
  （HK 夜景背景＋麵包屑＋「關於／華安泰昌」）、`CompanyIdentity`（淺區兩欄＋真實
  `office/reception.jpg`）、`Credentials`（深區 3 卡＋資產安全聲明條，ShieldCheck）、
  `Principles`（淺區 4 白卡＋半透明金 01–04）、`Timeline`（深區 4 欄，**用 FACTS 真實
  年份**：`milestoneEntries` 日期＋`about.timeline.items.*.title` 短標＋**複用**
  `home.milestones.items.*` 描述）、`HongKongConnection`（維港背景帶）、
  `CredentialsGallery`（**真實素材牆**：reception/award/member-2025/participant-2026；
  證書/獎座用 `object-contain`、辦公室 `cover`；獎項全名未確認故僅標中性「品牌榮譽獎座」）、
  `AboutCta`（深區背景＋雙 CTA）。共用首頁 `SectionTitle`（`tone="dark"`）。
- **`page.tsx` 順序**：AboutHero → CompanyIdentity → Credentials → Principles →
  Timeline → HongKongConnection → CredentialsGallery → AboutCta（Header/Footer 由
  `[locale]/layout.tsx` 全域深色注入）。
- **i18n**：三語新增 `about.*` 命名空間（hero/identity/credentials/principles/
  timeline/hongkong/gallery/cta），三語同步。**複用** `home.milestones.items`（時間軸
  描述）、`home.facts`、`footer.address`、`nav.*`、`common.brand/contactUs`（不重造 key）。
- **operational link 守紅線**：`AboutCta`「聯絡我們」走 `getSiteSettings()`／
  `primaryContactHref()`（無 DB 回退 `/account`）；「了解黃金交易」→ `/#gold-services`；
  **不承諾模擬帳戶**（Figma 的「模擬 MT5 試用」語氣已移除）。
- **公司簡介治理**：Figma「資深金融專家團隊創立」屬未核可草稿，**未照抄**；改以 FACTS
  可核可事實（AA/008/證書/MT5）＋業主已確認的資產安全立場撰寫，不虛構創辦人資歷。
- **退役**（已刪）：`about/{AboutIntro,Milestones,Certificates,Office}`、
  `home/ContactBand`；三語移除死 keys `home.{about,contact,certificates,office}`
  （保留 `home.milestones`＝Timeline 複用、`home.facts`＝首頁 CompanyStory 用）。

**本輪取捨／待業主**
1. **背景佔位圖**（`public/figma/about/{about-hero-bg,about-hk-bg,about-cta-bg}.png`）
   為 Figma 佔位，上線前可換業主真實香港/辦公室實拍。
2. **獎項全名**未確認 → gallery 僅標「品牌榮譽獎座」；業主逐字確認後再標全名（FACTS 註記）。
3. **牌照牆**用 `object-contain` 完整顯示直式證書（Figma 佔位為橫式滿版）；若業主要橫式
   裁切填滿或提供橫式素材可再調。
4. `home.assetPending` 現已無前台消費者（三語仍同步保留，未刪，避免多餘 churn）。

**下一步建議**：① 業主逐區驗收 About 文案/素材 ② 換正式香港/辦公室背景圖與獎項全名
③ 若對外呈現點差/槓桿 → 做產品/CFD 頁（非 About）④ 決定 Footer 選單正式連結對照表。

## 🟠 第十二輪（2026-08-10）：About 頁 Figma 重構——規格已備（實作待下一棒）

> 業主提供 About 重構 Figma（同檔 `GGCUJwo9drmEUibcs9mLtq`，frame `hatc-about-page`
> node **`12:4`**，1440×5247）並定案「下一步做關於我們、照 Figma 重構」。本輪＝**讀齊
> Figma + 產出規格 + 交棒**（未動元件 code，業主選 spec→kickoff）。

**已完成**
- **逐區讀 Figma**：`get_metadata`(12:4) + `get_design_context`(hero 12:19 / 香港連結
  12:129 / cta 12:143) + 整頁 `get_screenshot`。判定 **About 方向＝與首頁一致的深色金色系**
  （深/淺交錯），**將取代現在 About 暖白內文** → 全站統一深色系。
- **規格** → `docs/FIGMA_ABOUT_SPEC.md`（唯一實作依據）：9 內容區（hero / 公司簡介 /
  會員資格＋安全條 / 服務理念4卡 / 發展歷程 / 香港連結 / 牌照榮譽牆 / CTA），含 node id、
  文案、tokens 差異、資產、**治理紅線**、以及「現有→新」元件對映。
- **資產**：下載 3 張深色背景佔位圖 → `public/figma/about/{about-hero-bg,about-hk-bg,
  about-cta-bg}.png`（7 天 URL 已存檔）。公司簡介圖/牌照榮譽牆在 Figma 全為「待替換」佔位。

**本輪發現的紅線（實作前必處理，已寫進 spec §4）**
1. 🔴🔴 **發展歷程年份衝突**：Figma 標 2018/2019/2021/2023（「佔位資料」），但 `HATC_FACTS.md`
   的 008/AA 真實里程碑為 **2025–2026**。**不得用 2019 對外聲稱已有 008 席位**；時間軸文案
   須改採 FACTS 事實或業主正式沿革。
2. 🔴 **資金託管/隔離聲明**（安全聲明條、principle 01）未列於 FACTS → 上線前須業主確認屬實。
3. 🔴 **金色色值**：About design context 回報 `#c9a84c`，與首頁 token `#d4af37` 不同；
   建議沿用 `#d4af37` 維持一致（待業主定）。
4. 🔴 交易條件語氣（principle 02「公開點差報價」）勿放具體數字；operational link 走 CMS。

**下一步（實作 About，務必讀 `docs/FIGMA_ABOUT_SPEC.md`）**：比照首頁重構——新建深色
`about/*` 區塊元件、退役暖白 `about/{AboutIntro,Milestones,Certificates,Office}`＋
`home/ContactBand`，三語 i18n 同步，時間軸用 FACTS，牌照榮譽牆用真實 `certificates/`、
`office/` 素材，lint/build 綠燈＋三斷點截圖比對。

## 🟢 第十一輪（2026-08-10）：Footer 連結接線 + 佔位頁（業主定案）

> 承第十輪。業主本輪定案「先接 Footer 連結」，其餘素材/流程仍待交付。
> `lint`／`build` 綠燈；三語 × 5 新頁皆 200；Footer 內 `href="#"` 歸零。

**業主本輪定案（2026-08-10）**
1. **綠燈連結照現有頁/錨點接**：公司簡介／金銀業席位／安全與監管 → `/about`；
   倫敦黃金/白銀交易 → `/#gold-services`；MT5 四項（含「客戶端下載」）→ `/#mt5`；
   學堂四項 → `/#academy`。
2. **缺頁面項 → 建「即將推出」佔位頁**並接上：最新新聞 `/news`、市場交易細則
   `/trading-rules`、合約保證金 `/margin`、隱私權 `/privacy`、免責 `/disclaimer`。

**已完成**
- **`Footer.tsx` 集中連結對照表**：新增 `FOOTER_LINKS`（4 欄×4）＋`LEGAL_LINKS`
  常數，改用 next-intl `Link`（locale-aware，自動帶 `/zh-Hant` 等前綴）。**移除全部
  18 個 `#` 佔位**。註解說明：這些是內容導覽連結（非 operational 客服連結，後者仍走
  `getSiteSettings()`），故用站內路由/錨點；缺頁項指向 coming-soon stub。
- **5 個佔位頁**（`(frontend)/[locale]/{news,trading-rules,margin,privacy,disclaimer}/page.tsx`）：
  沿用 `ComingSoon` 元件與既有 i18n 文字（`home.footerV2.cols.*` / `.privacy` / `.disclaimer`）
  →**零新增 messages key**。`trading-rules`／`margin` 檔內註明「交易條件僅業主提供、
  不得虛構」，維持純佔位。
- **驗證**：`lint` 綠燈、`build` 綠燈（新增 15 個 SSG 頁＝5×3 語）；dev 執行期抽查
  三語連結帶前綴、5 stub 頁三語 200、Footer `href="#"` 計數＝0。

**本輪取捨／待業主**
- **佔位頁未進 sitemap**（比照既有 `/register`／`/account` 不索引），避免薄內容被索引；
  待業主給正式內容（尤其隱私權/免責法律文字）後再加入 `src/app/sitemap.ts` 並填內容。
- **連結對照表值為現階段最佳對映**，集中於 `FOOTER_LINKS`／`LEGAL_LINKS` 易改；若業主
  日後給正式路由（如外部 MT5 下載 URL、獨立產品/CFD 頁），只需改常數值。
- 其餘四條線（正式素材替換、模擬帳戶流程、產品/CFD 頁、最新活動區）**仍待業主交付**，未動。

**下一步（等業主交付後才動）**：① 業主給正式素材 → 替換 `public/figma/raw/*` 佔位圖
② 業主定案「免費模擬帳戶」流程 ③ 若對外呈現正式點差/槓桿 → 做「產品／CFD」頁並把
Footer `/trading-rules`／`/margin` 指過去 ④ 業主給隱私權/免責正式法律文字 → 填 `/privacy`
`/disclaimer` 並加入 sitemap ⑤ 決定是否重做「最新活動」區（沿用 `HomeActivities` collection）
→ 填 `/news`。

## 🟢 第十輪（2026-08-10）：驗收微調 + 收尾（清理 + 業主定案落檔）

> 承第九輪（首頁已 100% 還原並綠燈）。本輪＝**清理未用資產**＋**取得業主對 4 個
> 開放項的定案**。`lint`／`build` 綠燈（19 靜態頁），三語 messages 各 **190 key、完全同步**。

**已完成（清理，皆已驗證無破壞）**
- **刪除未用元件**：`home/Process`、`home/Activities`(+`ActivitiesCarousel`)、`home/Insights`
  (+`Insights.module.css`) 及空資料夾——首頁自第八輪改版後已不再引用。
- **刪除未用內容**：`src/content/products.ts`（無任何 import）。
- **移除死 messages key（三語同步）**：`home.{markets,services,stats,process,activities,
  academy,insights}` 與 `nav.{markets,platform,academy,about,activities}`。**保留**
  `home.{contact,about,milestones,certificates,office,facts,assetPending}`（About／ContactBand
  仍用）與 `nav.{home,aboutHatc,goldTrading,mt5,goldAcademy,support,login,openAccount}`（Header 用）。
- **保留（CMS 基礎設施，本輪不動）**：`src/lib/homeActivities.ts` 與 Payload
  `HomeActivities` collection（`payload.config.ts` 註冊、`payload-types.ts`）。前台消費者
  （舊 Activities 元件）已刪 → 目前無前台引用，但移除 collection＝schema 變更，留待業主
  決定是否日後重做「最新活動」區再處理。

**業主定案（2026-08-10，本輪 4 項全部拍板）**
1. **Header/Footer**：深色 Figma 版**維持全域套用 About**（About 內文續用暖白系，兩系統並存）。
   → 不需獨立 Figma、不改 About 內文。
2. **Footer 連結／隱私權／免責／選單**：**先保留 `#` 佔位**（`Footer.tsx` 已註解說明），
   等業主提供**完整連結對照表**後再一次接 CMS/實際路由並移除 `#`。
3. **首頁行情數字**：**維持純示意數據**（金價卡／ticker／報價卡／K線，UI 標「示意數據」）。
   正式點差（**金 27／銀 30**）與**槓桿 1:100**（FACTS 已核可）留待**日後產品／CFD 頁**呈現，
   首頁不加交易條件小區。
4. **佔位圖 + 模擬帳戶**：Figma 佔位圖（hero 背景／MT5 截圖／公司故事／final-cta／3 學堂縮圖）
   **待業主提供正式素材**再整合；「免費模擬帳戶」**維持現狀**（連 `/register` 即將推出）。

**下一步（等業主交付後才動）**：① 業主給連結對照表 → 接 Footer/選單（走 CMS/路由、移除 `#`）
② 業主給正式素材 → 替換 `public/figma/raw/*` 佔位圖 ③ 業主定案模擬帳戶流程 ④ 若要對外
呈現正式點差/槓桿，做「產品／CFD」頁（非首頁）⑤ 決定是否重做「最新活動」區（沿用保留的
`HomeActivities` collection）。

## 🟢 第九輪（2026-08-10）：照 Figma 100% 還原重構首頁——實作完成

> 承第八輪規格（`docs/FIGMA_HOMEPAGE_SPEC.md`），本輪把**首頁十區塊全部重寫**為
> Figma 深色交易所風。`lint`／`build` 綠燈（19 靜態頁、TS 通過）；三語 × 三斷點
> （1440／834／390）headless 截圖目視通過；About 亦 200。

**已完成**
- **字體**：`src/lib/fonts.ts` 以 `next/font/google` 導入 **Sora**（標題＋正文）＋
  **Inter**（ticker／大數字），變數掛在 `<html>`（`[locale]/layout.tsx`）。
- **tokens**：`src/styles/tokens.css` 新增 `--fig-*` 深色金色 tokens（**additive**，
  暖白系原封不動，About 續用）；`--font-app` 指向 Sora、新增 `--font-ticker`(Inter)；
  `--header-h` 改 80px。`globals.css` `@theme` 橋接 `--color-gold`（→`bg-gold`/`text-gold`/
  `border-gold`）與 `--font-sans`/`--font-ticker`（→`font-sans`/`font-ticker`）。
- **shadcn button**：基底圓角改 **6px**（全站共用系統，非 pill）；新增 `gold` variant
  （金底黑字）與強化 `onDark`（1.5px 白框透明）；新增 `fig` size（px24 py12）。
- **messages**：三語新增 `nav.{aboutHatc,goldTrading,mt5,goldAcademy,support,login,openAccount}`、
  `common.{openMenu,closeMenu}`、`home.{heroV2,trust,goldServices,mt5,whyV2,goldAcademy,
  story,support,finalCta,footerV2}`。示範數字集中在 `src/components/home/sampleMarketData.ts`
  （金價/ticker/報價卡/K線/折線，標 sample，UI 顯示「示意數據」，**未寫入 FACTS**）。
- **元件（全部讀 i18n、無寫死文案）**：`Header`（深色 sticky nav＋`HeaderMobileMenu` client 抽屜）、
  `Hero`（金條背景＋金價卡＋`MarketTicker`）、**`TrustStrip`(新)**、`Services`(gold-services：
  K線 SVG＋報價卡)、**`MT5Showcase`(新)**、`WhyHATC`(4 卡＋半透明金數字)、`Academy`(3 文章卡)、
  **`CompanyStory`(新，008)**、**`ClientSupport`(新)**、**`FinalCta`(新)** ＋ 全域 `Footer`
  改深色 main-footer。共用 `SectionTitle`。`page.tsx` 順序＝規格 §2。
- **資產**：背景/截圖/學堂圖用 `public/figma/raw/*.png`（Figma 佔位圖）；圖示改 `lucide-react`；
  K線/折線以 inline SVG 畫。刪除 `Header.module.css`、`Footer.module.css`（改 Tailwind）。
- **operational link 守紅線**：開戶/聯絡/最終 CTA 皆走 `getSiteSettings()`／`primaryContactHref()`，
  無 DB/env 時回退 `/register`（開戶）或 `/account`（登入/聯絡），不硬編碼。

**本輪做的取捨（待業主確認，皆已標 TODO）**
1. **深色 Header/Footer 全域套用**（含 About）：About **內文維持暖白系**，僅頭尾為深色框；
   兩系統並存、目視良好。若業主要 About 也給獨立 Figma 再調。
2. **Footer 導覽連結、隱私權/免責、footer 各欄**目前為 `#` 佔位（去向待業主確認）。
3. **背景照片/MT5 截圖/學堂縮圖**＝Figma 佔位圖，上線前由業主換真素材。
4. **「免費模擬帳戶」**暫連 `/register`（即將推出）；待業主提供模擬流程。
5. **示範行情數字**（金價/ticker/報價/K線）為佔位；FACTS 已核可者僅金 27 點差、銀 30、
   槓桿 1:100（本輪未於 UI 逐一標數，維持示意卡）。

**未使用但保留**（清理可留待下輪）：`home/Process`、`home/Activities(+Carousel)`、`home/Insights`
不再被首頁引用；`home.{markets,services,stats,process,activities,academy,contact,insights}`
舊 messages key 首頁已不用（About 仍用 `home.{about,milestones,certificates,office,facts}`、
`ContactBand` 仍被 About 引用）。

**下一步建議**：① 業主逐區驗收微調（文案/數字/素材）② 決定 Footer/選單連結去向並接 CMS
③ 清理未用元件與舊 messages key ④ 依業主素材替換 Figma 佔位圖 ⑤ 決定是否給 About 獨立 Figma。

## 🟠 第八輪（2026-08-10）：照 Figma 100% 還原重構首頁（業主拍板，實作待續）

> 業主提供**完整 Figma 設計**（`GGCUJwo9drmEUibcs9mLtq`，frame `hatc-v2-homepage`
> `4:4`，1440×5501）並決定**照 Figma 100% 還原重構首頁、同步更新設計系統**。
> 這**推翻了部分既有紅線（僅限首頁／共用設計系統）**：金色 `#d4af37` 回歸為主點綴、
> 首頁改**深色交易所風**、字體改 **Sora（+ ticker 用 Inter）**、按鈕改 **6px 圓角**。
> 治理紅線（示範≠事實、operational link 走 CMS、i18n 三語、事實只引 FACTS）**仍有效**。

**本輪已完成（讀齊規格 + 固化 + 資產 + 文件，尚未動元件 code）**：
- **讀完 Figma 每個組件**：10 大區塊（navigation / hero＋market-ticker / trust-strip /
  gold-services / mt5-showcase / why-hatc / gold-academy / company-story /
  client-support / footer＋final-cta-band）逐一 `get_design_context`。
- **完整還原規格** → `docs/FIGMA_HOMEPAGE_SPEC.md`（顏色/字體/圓角/字級 tokens、
  每區塊版面與文案、node id、資產與治理紅線）。**這是實作唯一依據**。
- **資產下載** → `public/figma/raw/*.png`（16）、`public/figma/svg/*.svg`（13），見
  `public/figma/MANIFEST.md`。圖示建議改用 `lucide-react`；背景/截圖為佔位圖。
- **文件/規則同步**：`DESIGN_DIRECTION.md` 開頭、`.cursor/rules/hatc-website.mdc`
  「Brand tone」加註 2026-08-10 Figma-led 方向（標明 supersedes、紅線仍在）。
- 交棒原因：讀規格已耗用大量 context，依規則「context 過長前先交棒」保品質。

**下一步（依序，逐區實作，務必讀 `docs/FIGMA_HOMEPAGE_SPEC.md`）**：
1. **字體**：`next/font/google` 導入 `Sora` + `Inter`，接到 `--font-app` / 新 token
   （ticker 用 Inter）。
2. **tokens/globals**：在 `src/styles/tokens.css` **新增**（不破壞既有暖白系，供 About 用）
   Figma 深色金色 tokens；`globals.css` `@theme` 橋接；按鈕圓角新增 6px 變體。
   ⚠ 全域 `h1-h4{color:navy;font-serif}` 會影響新標題 → 首頁元件用明確 class 覆蓋
   （`text-white`/`text-[#0c111d]` + Sora），避免動全域破壞 About。
3. **shadcn ui**：`button` 加 6px 圓角 + 金色 `gold` variant + `onDark` 白框；
   `card`/`badge` 對齊 Figma。
4. **messages**：三語新增/整理 `home.*`（nav、hero、ticker、trust、services、mt5、
   why、academy、story、support、footer、finalCta）；示範數字集中為常數並標 sample。
5. **逐區元件**（首頁七段 → 對齊 Figma 十段；Header/Footer 一起換）：
   Header(nav) → Hero(+ticker) → **TrustStrip(新)** → Services(gold-services K線/報價卡) →
   **MT5Showcase(新)** → WhyHATC(4卡+金數字) → Academy(3文章卡) → **CompanyStory(新)** →
   **ClientSupport(新)** → Footer(+final-cta-band)。更新 `page.tsx` 順序。
6. **驗證**：`npm run dev`、三語 × 三斷點截圖比對 Figma、`lint`/`build` 綠燈。
7. 完成後更新本檔與 `DESIGN_DIRECTION.md`「Visual system」細節，並給下一棒 kickoff。

**開放待確認**：① 深色系是否一併套到 About（目前決定 About 先維持暖白系，兩系統並存）
② 背景/MT5/學堂正式素材（目前 Figma 佔位）③ 選單/footer 連結實際去向（現多為 `#` 佔位）。

## 🟢 第七輪（2026-08-07）：UI rollout 完成（方向 A 全站換皮＋收尾）

> 承第六輪：Tailwind v4 已併入、Hero 已換皮。本輪把**其餘所有區塊**換成
> shadcn/ui + Tailwind，**收斂 token 單一來源**，並**移除隔離 pilot**。
> `lint`／`build` 綠燈（19 靜態頁，已無 `/ui-pilot`）；三語 × 三斷點 headless 截圖目視通過。

**已完成（逐區換皮，全部讀 `src/messages/*`、保留 i18n/a11y/RWD/SEO）**：
- 首頁：`Services`(Markets)、`WhyHATC`、`Process`、`Activities`(server+`ActivitiesCarousel`)、
  `Academy`、`ContactBand`。About：`AboutIntro`、`Milestones`、`Certificates`、`Office`。
  各元件的 `*.module.css` 皆已刪除；改用 `@/components/ui/*`（button/card/badge/tabs）＋
  Tailwind utilities。深色區（ContactBand）用 `buttonVariants` 的 `accent`/`onDark`。
- **Markets 示範點差表**（業主 Development-placeholders 授權）：Markets 區加入
  **「示範交易條件」表**（黃金/白銀/鉑金 × 點差/槓桿/最低手數），數字為 `SAMPLE_CONDITIONS`
  常數（locale-neutral、集中易改）、欄名帶「（示範）」、附 `示範內容` badge 與免責說明；
  三語新增 `home.markets.sample.*`。**未寫入 `HATC_FACTS.md`**，上線前由業主替換。
- **色彩收斂＝單一來源 `src/styles/tokens.css`**：`globals.css` 的 `@theme` **不再放 hex**，
  只以 `var(--token)` 橋接 shadcn 語意色。修正名稱衝突：新增 `--color-muted-surface`
  （shadcn muted 面）＝`#eef1f4`；原 `--color-muted`（文字灰 `#857f77`）**改名
  `--color-ink-muted`**（同步改 `Footer.module.css` 引用）。`bg-muted` 現正確指向淺面。
- **移除 pilot**：刪 `src/app/(pilot)`（route group＋`ui-pilot`）、`src/styles/pilot.css`；
  `src/proxy.ts` matcher 移除 `ui-pilot` 例外；順手刪空的 `src/app/preview`。
  **注意**：改動 route 後若 build 報 `.next/dev/types/validator.ts` 找不到 pilot，
  請 `rm -rf .next` 後重 build（stale generated types）。

**仍待業主提供（未提供前不得虛構；沿用歷輪清單）**：① CFD 正式**交易條件**（槓桿/點差/
手數/手續費/平台名稱＋畫面素材）→ 替換 Markets 示範表 ② 完整可交易**貴金屬清單**
③ 正式**活動內容**（`/admin` → 首頁活動；未接 DB 前前台顯示示範 banner）④ Hero／收尾／學院
**正式行銷文案** ⑤ About 品牌定位段落（`home.about.positioning` 仍為佔位、未渲染）
⑥ 信任卡是否顯示證書編號。

**下一步建議**：① 全域 **Header/Footer** 亦可換成 Tailwind（目前仍 CSS Modules，與 Tailwind
共存無礙，非必要）② 刪除**未被引用**的 `src/components/home/Insights`（含 `home.insights`
佔位 keys）③ 需要 shadcn CLI 產新元件時補 `components.json` ④ 待業主給 CFD 數據後替換
Markets 示範表並移除 sample 標記。

**紅線（維持）**：事實只用 `HATC_FACTS.md`；深藍不用橘；hero 深色；示範/佔位值不得寫入
`HATC_FACTS.md` 冒充事實。

## 專案概述

HATC（華安泰昌有限公司 / HATC Group Limited）官方網站。

技術棧：
- Next.js 16（App Router）+ TypeScript，`package.json` 為 `"type": "module"`
- next-intl 三語 i18n：`zh-Hant`（預設）／`zh-Hans`／`en`，路由 `/[locale]/...`
- CSS Modules + design tokens（`src/styles/tokens.css`）
- Payload CMS（同倉，`/admin`）+ PostgreSQL
- Next 16 以 `src/proxy.ts`（原 middleware 慣例）處理 i18n 路由

## 🟢 第六輪（2026-08-07）：UI 系統改採 shadcn/ui + Tailwind（業主核准方向 A，待整合）

> 業主反映手刻 UI 花太多 token 且不夠好看。討論後**定案採 shadcn/ui + Tailwind v4**
> 作為元件系統，**保留 HATC 深藍品牌（不用橘）**，**從首頁 Hero 開始逐區換皮**。
> 已先做**隔離 pilot** 給業主看並**核准方向 A（正式整合並逐區 rollout）**。本輪只交棒整合工作。

**已就緒（隔離、對已上線頁零影響）**：
- **相依**：`tailwindcss`＋`@tailwindcss/postcss`（dev，v4.3.3）；`class-variance-authority`、
  `clsx`、`tailwind-merge`、`@radix-ui/react-slot`、`@radix-ui/react-tabs`、`lucide-react`。
- **設定**：根目錄 `postcss.config.mjs`（Tailwind v4 plugin）；`src/lib/utils.ts`（`cn`）。
- **shadcn 元件（你擁有原始碼）**：`src/components/ui/{button,card,badge,tabs}.tsx`。
- **隔離 pilot**：`src/app/(pilot)/layout.tsx`（自帶 `<html>`＋只在此 import 的
  `src/styles/pilot.css`＝Tailwind＋HATC `@theme` 主題）與 `src/app/(pilot)/ui-pilot/page.tsx`
  （深色 CFD hero／Why 卡片／Markets tabs／收尾 CTA，全用核可事實）。`src/proxy.ts` matcher
  已排除 `ui-pilot`。**noindex**。
- **為何零風險**：只有 `pilot.css` `@import 'tailwindcss'`，Tailwind 的 preflight 只出現在
  pilot 專屬 stylesheet、只在 `/ui-pilot` 載入；`globals.css`／CSS Modules／首頁／About 完全不動。
  `lint`／`build` 綠燈；首頁＋About 仍 200。

**整合進度（rollout，方向 A）**：
- ✅ **Tailwind 已併入 (frontend)**：`src/styles/globals.css` 只引入 Tailwind 的
  **theme + utilities（跳過 preflight）**：`@import 'tailwindcss/theme.css' layer(theme)`
  ＋`@import 'tailwindcss/utilities.css' layer(utilities)`，並宣告 `@layer theme, base,
  components, utilities;`。既有 reset/元素樣式已收進 **`@layer base`**，`@theme` 的 HATC 色/
  圓角映射也放此檔。**關鍵**：CSS Modules（未分層）優先級高於所有 layer，故已上線頁零走樣；
  且 utilities 能覆蓋 base 元素預設（先前未分層的 `h1{color}` 會壓過 utility → 已修）。
- ✅ **Hero 已換皮**：`src/components/home/Hero/Hero.tsx` 改用 Tailwind＋shadcn 按鈕
  （`buttonVariants`，新增 `light` variant），維持核准深色 CFD 版面、讀 i18n；`Hero.module.css` 已刪。
- ⏳ **待逐區換皮**：Markets(Services)／WhyHATC／Process／Activities／Academy／ContactBand
  ＋ About 的 AboutIntro／Milestones／Certificates／Office。一次一區，**務必讀 `src/messages/*`**
  （不得寫死）、a11y／RWD／SEO 不變、每區桌機/平板/手機比對。
- ⏳ **tokens 收斂**：目前 `globals.css` 的 `@theme` 用具體 hex（與 `src/styles/tokens.css` 重複）；
  全部換完後整合為單一來源。
- ⏳ **收尾**：rollout 完成後**移除** `(pilot)` route group、`src/styles/pilot.css`、proxy 的
  `ui-pilot` 例外。需要 shadcn CLI 時再補 `components.json`。

**開發期內容規則（業主 2026-08-07 指示）**：可先放**示範/佔位交易數字**、做**競品式版型**
（點差表、統計數字帶）、用**佔位圖**以推進版面；一律當可編輯示範值，**上線前由業主替換**。
詳見 `.cursor/rules/hatc-website.mdc`「Development placeholders」與 `HATC_FACTS.md` 開發註記。

**紅線（維持）**：事實只用 `HATC_FACTS.md`；深藍不用橘；hero 深色；示範/佔位值不得寫入
`HATC_FACTS.md` 冒充事實；**pilot 頁寫死文案，嚴禁直接上線**。

## 🟢 第五輪（2026-08-07）：關於我們（About）頁上線＋導覽跨頁修正

> 業主定案 About 頁：**沿革簡介 → 里程碑 → 證書 → 辦公室**（不含團隊/董事會，先精簡）；
> 交易平台**先不做獨立頁**（Header「交易平台」維持指向首頁 `#process`）；活動卡 **href 先留空**。

**已交付**：
- **新頁** `src/app/(frontend)/[locale]/about/page.tsx`（三語 SSG）：組合
  `AboutIntro → Milestones → Certificates → Office → ContactBand`。含 `generateMetadata`
  （新 `metadata.about.{title,description}`、canonical `/`＋hreflang `/about`）。
- **元件搬遷**：`Milestones`／`Certificates`／`Office` 由 `components/home/*` **移至
  `components/about/*`**（首頁本就已不引用；沿用既有 `home.{milestones,certificates,office}`
  keys，不動文案）。新增 `components/about/AboutIntro/*`：kicker＋h1＋沿革句＋事實面板
  （交易所／會員類別／會員編號／註冊地址，全部取自 FACTS，經 `home.facts.*`＋`footer.address`）。
- **Header 導覽跨頁修正（根因）**：主導覽全部改用 locale-aware `Link`；首頁區段錨點改為
  **絕對路徑** `/#markets`、`/#process`、`/#academy`、`/#activities`（next-intl 產出
  `/zh-Hant#markets` 等，從任何頁都能回首頁對應區段）；「關於我們」改指 `/about`。
- **SEO**：`sitemap.ts` `paths` 加入 `/about`（三語）。
- **i18n**：三語新增 `metadata.about.*`、`home.about.kicker`、`home.about.officeLabel`；
  `home.about.positioning` 仍為【待確認】佔位，**未於頁面渲染**（避免對外露出佔位字）。
- `lint`／`build` 綠燈（19 靜態頁，含 `/{locale}/about`）；正式伺服器驗證三語 About＝200、
  首頁＝200、導覽 href 帶正確語系前綴、事實面板與地址正確呈現。

**仍待業主提供（未提供前不得虛構）**：① About 品牌定位段落（`home.about.positioning`
正式文案）② 是否日後補「團隊/董事會」與沿革展開 ③（CFD）交易條件與平台素材 ④ 完整貴金屬
清單 ⑤ 正式活動內容（`/admin`）⑥ Hero／收尾／學院正式行銷文案 ⑦ 信任卡是否顯示證書編號。
**下一頁建議**：待業主給素材後做「交易平台」頁或把平台/交易條件補在 Markets。

## 🟢 第四輪（2026-08-07）：業主「同意」概念 → 已落為正式三語首頁＋活動 CMS

> 業主核准第三輪概念稿後，已把 `/preview` 落為**正式 i18n 首頁**並移除鷹架。
> `lint`／`build` 綠燈（三語 SSG）；三語 × 三斷點（1440／834／390）headless 截圖目視通過。

**已交付**：
- **Payload 活動 CMS**：新增 collection `home-activities`（`src/collections/HomeActivities.ts`，
  已註冊於 `payload.config.ts`；欄位 title／summary／tag／image(→media)／href／date／order／
  enabled，皆三語 localized）＋讀取 lib `src/lib/homeActivities.ts`（比照 `siteSettings` 的
  **DB＋fallback**；未接 DB 回傳空陣列）。`npm run generate:types` 已更新 `payload-types.ts`。
- **正式首頁元件**（全部走 i18n，無寫死文案）：
  - `Hero`：深色 CFD hero（漸層＋格線＋綠光暈；標題「貴金屬 **CFD** 交易」；信任列 交易所／
    會員類別／會員編號；真實接待處相片，無浮動 008 卡）。
  - `Services`：改為 **Markets** 探索（`#markets`）——主頁籤「貴金屬 CFD」4 卡＋次頁籤
    「實金交易所產品」7 項（來源 FACTS 參與者證書）；**不列交易條件**。
  - `WhyHATC`：精簡信任帶（008／AA／7／4 計數＋三張信任卡）＋ kicker。
  - `Process`：如何開始交易（3 步）。
  - `Activities`：server 取 `getHomeActivities(locale)` → client `ActivitiesCarousel` 輪播；
    **無 CMS 資料時回退 i18n 示範 banner**（品牌漸層 `.t1`~`.t4`，非假圖）。有 `imageUrl`
    時改用上傳圖＋暗角。
  - `Academy`：交易教育（中性、非投資建議）。
  - `ContactBand`：深藍收尾 CTA（聯絡我們＋開始交易）。
- **Header**：加主導覽（產品市場／交易平台／學院／最新活動／關於我們 → 首頁錨點；
  ≤900px 收合）＋主 CTA 改「開始交易」。
- **首頁順序**（`(frontend)/[locale]/page.tsx`）：Hero → Markets → WhyHATC → Process →
  Activities → Academy → ContactBand。**證書／里程碑／辦公室已移出首頁**（元件檔保留給 About）。
- **文案**：三語 messages 全面更新為 CFD 主軸（新增 `home.markets`／`home.academy`、
  `home.stats.kicker`、`home.process` 實填、`home.activities.samples`、`nav.*`、
  `common.startTrading/viewProducts/viewMore`）。保留 `home.{about,milestones,certificates,
  office,insights}` 供 About 重用。
- **鷹架移除**：刪 `src/app/preview/*`；`src/proxy.ts` matcher 還原（移除 `preview` 例外）。

**仍待業主提供（未提供前不得虛構）**：① CFD **交易條件**（槓桿／點差／手數／手續費／平台
名稱＋畫面素材）→ 之後補在 Markets 或獨立平台頁 ② 完整可交易**貴金屬清單**（目前 CFD 卡為
黃金／白銀／鉑金／更多）③ 正式**活動內容**（於 `/admin` → 首頁活動 建立；DB 未接前前台顯示
示範 banner）④ Hero／收尾／學院**正式行銷文案**（現用核准方向之工作文案）⑤ 信任卡是否顯示
證書編號（MEC-…）。**下一頁：關於我們（About）**——把證書牆／里程碑／辦公室相片搬過去。

## 🟢 第三輪（2026-08-07）：業主定案「網站主打貴金屬 CFD」＋概念稿已出（已由第四輪落地）

> 重大轉向：業主明確表示 **HATC 亦做 CFD**，且**官網主軸改為貴金屬 CFD 交易**
> （黃金／白銀／鉑金等），**不需 SFC 牌照、法規風險暫不納入考量**（業主指示）。
> 實金交易所行員資格（008／AA／參與者證書）轉為**可信度背書**。已同步更新
> `HATC_FACTS.md`（新增「CFD business」）、`DESIGN_DIRECTION.md`、
> `.cursor/rules/hatc-website.mdc`、`REDESIGN_VANTAGE_BRIEF.md` 的紅線。

**已交付（設計優先）**：獨立概念稿 `/preview`（不動現有首頁、不套全域 Header/Footer；
`src/app/preview/*`；i18n proxy 已排除 `/preview`）。含 CFD 主打 hero **深/淺兩版切換**
（`?hero=light|dark`）、CFD 產品探索（貴金屬 CFD／實金 7 項頁籤）、Why HATC 信任帶
（008/AA/7/4 計數）、平台流程、**活動輪播（CMS 概念）**、學院、里程碑、真實證書、
辦公室、深藍收尾 CTA。`lint` 綠燈；三斷點截圖目視通過。文案為 zh-Hant **佔位【待確認】**。

**業主已再定案（2026-08-07）**：① **hero＝深色**（概念頁 default dark；規則/DESIGN 已更正，
先前「淺色 hero」作廢）② **公司資料全部移出首頁 → 放「關於我們」**：真實證書牆、資格里程碑、
**辦公室環境相片**。首頁只留精簡可信度帶（008/AA 計數＋信任卡）聚焦 CFD 產品。概念頁已據此
移除證書、里程碑、辦公室三區。現行首頁區段＝Hero→貴金屬市場→為何選 HATC→如何開始→
最新活動→交易教育→收尾 CTA。

**視覺微調（2026-08-07，業主回饋）**：① hero 的「008 浮動卡」已**移除**（業主兩次反映擺法
卡卡的），008 僅保留在 hero 下方信任列；照片維持乾淨。② 活動輪播卡的灰底佔位改為**品牌設計
banner**（深藍／綠漸層＋格線花紋＋角落光暈＋分類標籤＋白色標題；`.activityThumb` / `.t1`~`.t4`）。
依紅線用**設計圖形非 AI 假圖**；真實活動圖由業主日後於 Payload CMS 上傳。

**仍待業主定案 / 提供**：① 整體概念是否核准（核准後才把 `/preview` 落為正式 i18n 首頁並
移除鷹架）② CFD **交易條件**（槓桿／點差／手數／手續費／平台名稱＋畫面素材）③ 完整可交易
**貴金屬清單** ④ 活動卡正式內容（走 Payload CMS）⑤ Hero／收尾正式文案 ⑥（待確認）信任卡是否
保留證書編號文字（MEC-…）。
**紅線**：CFD 交易條件與清單未提供前不得虛構，不照抄競品點差表／用戶數／獎項。

## 🔴 首頁改版：第二輪業主不滿意 → 設計優先＋活動 CMS（已被上方第三輪接續）

> 業主看過第一輪淺色 Vantage-informed 版後表示**「不夠像 Vantage」**，並提供實站截圖
> `docs/references/vantage-home-zh-2026-08-07.png`。**動工前必讀 `REDESIGN_VANTAGE_BRIEF.md`
> 第 10 節**（第二輪回饋、差距分析、CMS 活動做法、深/淺 hero 張力、紅線）。

**業主定案的工作流程（2026-08-07）**：下一棒**先出概念圖／視覺設計稿給業主看** →
**業主同意後才動工實作**。未獲同意前不要改前台 code。

重點三項：
1. **設計優先（核准制）**：先做正式**視覺設計稿（概念圖）**、業主點頭後再改 code。
2. **活動 banner 要 CMS 配置**：現行 `home/Activities` 是靜態【待確認】卡，不合格；需建
   Payload collection（見 brief 10.4，比照 `SiteSettings`／`lib/siteSettings.ts` 的
   DB＋fallback 模式，Payload 已開 `localization`）＋前台輪播元件。
3. **hero 已定案＝淺色**（業主拍板；非 Vantage 深色）。但別再做扁平純漸層：淺色 hero 仍要靠
   實拍影像＋層次＋動態做出質感。深色只留給收尾 CTA。

**業主已定案（2026-08-07）**：hero＝**淺色**；**Email 快速註冊先不做**（`/register` 維持
「即將推出」）。

紅線（2026-08-07 更新）：HATC 業務含**實金＋黃金 CFD**（業主定案，CFD／槓桿可呈現、
不需 SFC 牌照）。仍不得虛構 CFD 的槓桿／點差／手續費／手數／平台，也不得沿用競品的
競爭性點差表／5,000,000+ 交易者／award-winning／見證等未核實數據；Email 開戶維持先不做。
詳見 `HATC_FACTS.md` →「CFD business」。

---

## 首頁改版第一輪：已實作（2026-08-07，Vantage-informed，HATC 深藍）

- 業主定案：借 Vantage **版型／動態／IA**、保留 HATC 深藍（不用橘）；**hero 改淺色**
  （深藍滿版 hero 被否決為太浮誇）；內容**產品／教育／流程為主、公司資料為輔**；並要求
  加入「活動板塊」。流程：先出淺色 hero＋整頁 mockup（`/preview`）確認 → 全面套用 → 移除鷹架。
- 首頁新順序（`(frontend)/[locale]/page.tsx`）：Hero → **Services（7 產品分頁籤，主角）**
  → **Activities（最新消息與活動）** → **Insights（認識實金交易）** → **Process（如何開始）**
  → **WhyHATC（008／AA／7／4 計數＋三張信任卡，公司資料收斂於此）** → Milestones →
  Certificates → Office → ContactBand（深藍收尾 CTA）。
- 新元件：`home/{Activities,Insights,Process,WhyHATC}`；`Hero`／`Services` 重寫；
  `TrustStrip`／`AboutIntro` 已移除；`/preview` 鷹架已刪。
- tokens 新增：`--color-brand-darker/-bright`、`--radius-xl`、`--radius-pill`、
  `--shadow-card/-hero`、`--section-pad`（皆 additive）。`DESIGN_DIRECTION.md` 與
  `.cursor/rules/hatc-website.mdc` 已同步放寬並記錄紅線。
- 文案：新增 `home.{stats,activities,insights,process}` 與 `home.services.tabs`、
  `common.readMore`（三語同步）。**活動／教育／流程／產品一句話說明皆為【待確認】佔位**，
  結構先行，未虛構任何活動、市場數據、產品規格或流程（嚴守 `HATC_FACTS.md`）。
- `lint` 綠燈；三語 `/` 皆 200。**仍待業主提供正式文案**：活動卡、實金教育、服務流程、
  Hero 定位語、聯絡帶標題／說明。

## 目前狀態：骨架完成且已驗證

- `npm run build`：通過（三語 SSG；`/admin`、`/api`、GraphQL 為動態）
- `npm run lint`：無錯誤
- 執行期：`/` → 307 導向 `/zh-Hant`；各語系 200；`<html lang>`、本地化 `<title>`、
  `robots.txt`、`sitemap.xml` 皆正常

### 已完成項目

- 三語路由與 `src/messages/*.json` 文案（相同文字重用 key）
- 全域 Header／Footer（`(frontend)/[locale]/layout.tsx` 只渲染一次）
- 註冊、用戶中心「入口按鈕」→ 連至「即將推出」佔位頁（`/register`、`/account`）
- SEO：Metadata API、`hreflang`+`x-default`、`sitemap.ts`、`robots.ts`、
  `Organization` JSON-LD（事實來源 `HATC_FACTS.md`）
- 追蹤埋碼位：`src/components/Analytics/Analytics.tsx`（工具待定，以 env 注入不寫死）
- Payload：`Users`、`Media`、`SiteSettings`（客服／聯絡連結配置，前台不寫死；
  未接 DB 時 `getSiteSettings` 回退讀 `NEXT_PUBLIC_CONTACT_*`）

## 下一步（依優先序）

0. **🔴 首頁視覺改版（交棒進行中）**：業主看過目前克制編輯風後不滿意，要求改
   **參考 Vantage（Vantage Markets）** 風格。詳見 `docs/REDESIGN_VANTAGE_BRIEF.md`。
   ⚠ 動工前必讀該檔第 2 節：Vantage 的高能量 fintech 風與現行品牌規則
   （禁模板 fintech／霓虹漸層等）**直接抵觸**，需先與業主確認優先順序、先出 mockup，
   確認後才改 tokens 與規則文件。功能骨架沿用（換皮不換骨）。

1. **首頁結構已實作完成**（定案見 `WEBSITE_STRUCTURE.md`「首頁 Home 定案」）：
   - 8 個區段：Hero → 事實信任條 → 關於（#about）→ 里程碑（#milestones）→
     證書（#credentials）→ 業務範疇佔位（#services）→ 辦公室（#office）→ 聯絡（#contact）
   - 元件位於 `src/components/home/*`，`page.tsx` 組合；里程碑資料 `src/content/milestones.ts`
   - 文案全進 `src/messages/*`（三語同步）；未定文案以【待確認】標記
   - 跨頁 CTA 先做首頁內錨點；已於 `globals.css` 加 `scroll-padding-top` 避開 sticky header
   - 證書／辦公室無真實素材，先用標記「【待確認】素材」的佔位框（不用假圖）
   - `npm run lint`／`npm run build` 通過；三語 SSR 已 curl 驗證區段與錨點
   - RWD 已以 headless Chrome 於 1440／820／390px 截圖目視通過（斷點 640／860px
     正確、Header 於 ≤640px 隱藏「用戶中心」、聯絡帶按鈕轉全寬堆疊）；
     Hero 標題加 `text-wrap: balance` 消除 CJK 孤字
2. **真實素材已置入並改版（2026-08-07，素材來源 `~/Downloads/HATC材料`）**：
   - 配色向品牌 logo 靠齊：深藍 `#09395f`（主）＋綠 `#009944`（少量點綴）＋暖白／炭黑；
     黃銅金退役。tokens（`src/styles/tokens.css`：`--color-brand*`／`--color-accent*`）、
     `DESIGN_DIRECTION.md`、`.cursor/rules/hatc-website.mdc` 已同步。
   - 資產於 `public/`：`brand/hatc-logo.png`（已裁切透明）、`office/*.jpg`（6 張實拍，
     已 EXIF 校正＋壓縮）、`certificates/member-2025.jpg`（已校正旋轉）與
     `participant-2026.jpg`。
   - Header 用 logo；Hero「文字＋接待處」並列（`next/image`）；證書區兩張真證書可點開原圖；
     業務區 7 項真實產品；辦公室相片畫廊；頁尾加地址。
   - **新事實已登錄** `HATC_FACTS.md` 與 `src/content/company.ts`：註冊地址、
     行員／參與者證書編號、首屆董事會、7 項獲准交易產品（來源：官方證書，業主提供）。
   - `lint`／`build` 通過；三斷點截圖目視通過。
   - 仍為佔位【待確認】：Hero 定位語、關於區定位段落、聯絡帶標題／說明（正式行銷文案）。
3. 補正式行銷文案（Hero 定位語、關於定位段落、聯絡帶標題／說明）
4. 決定追蹤工具（GA4／GTM…）並接上 `Analytics.tsx` 埋碼位
5. 後續頁面：About／Credentials／Services／Contact

## 待確認事項

- 追蹤工具選型（暫緩，已預留）
- 首頁正式文案與版塊
- Header 主導覽項目（目前僅品牌 + 入口按鈕）
- 部署平台與託管 Postgres（建議 Vercel + Neon/Supabase）

## 本機啟動備忘

1. 複製 `.env.example` → `.env`，設定 `PAYLOAD_SECRET`、`DATABASE_URI`、`NEXT_PUBLIC_SITE_URL`
2. `npm run dev`；前台 `http://localhost:3000`、後台 `/admin`（首次建立管理者帳號）
3. 未設 `DATABASE_URI` 時 `/admin` 會 500（預期），前台仍可運行

## 過程中已解決的坑（避免重踩）

- 專案資料夾含大寫 → 以暫存夾建立再合併至根目錄
- Next 16 `middleware` 已棄用 → 改用 `src/proxy.ts`
- Node 22 + Payload lexical top-level await 錯誤 → 設 `"type": "module"`
- `@payloadcms/next/routes` 無 `GRAPHQL_OPTIONS` → graphql route 的 OPTIONS 用 `REST_OPTIONS`
