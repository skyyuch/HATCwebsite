# 首頁改版交棒 Brief：改參考 Vantage 風格

> 建立：2026-08-07。本檔為「下一個 agent」的接手依據。
> 先讀 `AGENTS.md` 與 `docs/`（BRIEF / FACTS / STRUCTURE / DESIGN_DIRECTION），
> 再讀本檔。事實仍以 `HATC_FACTS.md` 為唯一來源。

> **⚠ 業主定案覆蓋（2026-08-07）——優先於本檔以下所有「非 CFD」紅線：**
> 業主明確表示 **HATC 亦提供黃金 CFD（差價合約）業務**，且指示此業務**不需 SFC
> 牌照、法規風險議題暫不納入考量**。因此本檔多處「HATC 是實金行員**非 CFD**、
> 不得出現 CFD／槓桿」的措辭**已作廢**：黃金 CFD 現為核可業務，可如實呈現。
> **仍必守**：不得虛構其**槓桿倍數／點差／最低手數／手續費／執行方式／平台名稱**，
> 也不得沿用競品的「競爭性點差表／5,000,000+ 交易者／award-winning／見證」等未核實
> 行銷數據——這些要業主提供才可上站。詳見 `HATC_FACTS.md` →「CFD business」。

## 1. 背景

- 首頁已完整實作（8 區段、三語、`lint`／`build` 綠燈、真實素材已整合、
  新事實已登錄 `HATC_FACTS.md`）。詳見 `HANDOFF.md`。
- 業主看過目前「克制編輯風（暖白／深藍／綠）」後**表示風格不滿意**，
  要求改**參考 Vantage（Vantage Markets）**的風格。
- 本輪僅交棒；視覺改版由下一個 agent 執行。功能骨架可沿用，屬「換皮不換骨」為主。

## 0. 業主已定案（2026-08-07）

- **借用範圍**：借 Vantage 的**版型／動態／資訊架構**，**保留 HATC 深藍品牌色**
  （`#09395f` 為主、綠 `#009944` 少量點綴）。**不**照搬 Vantage 橘色系。
- **規則放寬**：業主**同意為 Vantage 風放寬**現行「不得像 fintech」的限制。
  → 允許更高能量的版型／動態／卡片／漸層等；但仍須保留 HATC 藍為主、
  事實治理不變（見第 4 節）。定案後**必須**同步改寫 `DESIGN_DIRECTION.md`
  與 `.cursor/rules/hatc-website.mdc` 的相關禁令，使規則與實作一致。
- 因此第 2 節的「是否覆寫規則／是否照搬橘色」兩問已解決；下個 agent 仍建議
  先出 hero＋一兩區 mockup 給業主確認再全面實作。

## 2. ⚠ 動工前必須先與業主確認的治理衝突（最重要）

- 現行 `DESIGN_DIRECTION.md` 與 `.cursor/rules/hatc-website.mdc` 明訂：
  網站**不得像 crypto／AI／博彩／模板 fintech**，禁用霓虹漸層、glassmorphism、
  發光金、浮動 3D 幣、滿版 K 線背景，要求機構級、克制、可信。
- Vantage 是 CFD／外匯零售經紀商，視覺**高能量**：深色基底＋高彩度橘、粗體大標、
  漸層／光暈、動態、平台裝置 mockup、pill 按鈕、行動導向文案。
  → 這與上述規則**直接抵觸**。
- 因此**不要**自行覆寫 tokens 或規則。請先讓業主拍板：
  1. 採 Vantage 風是否**覆寫**既有品牌規則？覆寫到什麼程度？
     （全面照搬 vs 只借「版型結構／動態／資訊架構」但保留 HATC 品牌色）
  2. 品牌色是否改動？（見第 4 點，建議保留 HATC 藍為主，不照搬 Vantage 橘）
- 建議流程：先做 1–2 個方向的 **hero＋一兩區 mockup** 給業主選，確認後才全面實作。
- 一旦定案，**必須同步更新** `DESIGN_DIRECTION.md` 與
  `.cursor/rules/hatc-website.mdc`，否則規則與實作長期矛盾（違反 meta 規則）。

## 3. Vantage 風格特徵（參考；請以實站為準）

參考站：`https://www.vantagemarkets.io/en/`（2024 改版後版本）。
（註：本次自動抓取實站逾時，以下為公開新聞＋既有認知整理，
**下個 agent 請親自瀏覽實站並截 3–5 張關鍵區塊**，顏色請直接自實站取樣，勿臆測 hex。）

- **色彩**：深色基底（近黑／深藍）＋ 高彩度品牌橘做 CTA／重點；大量白底區塊交錯。
- **字體**：粗體無襯線（geometric／grotesk），大字級標題、緊字距；數字／統計強調。
- **版型**：滿版 hero＋平台裝置 mockup；獎項／信任條；產品分類卡片格；
  平台功能區；帳戶類型比較；學院／資源；App 下載；法遵頁尾。
- **元件**：pill 圓角按鈕、卡片、漸層／光暈點綴、hover 動效、計數／輪播動畫。
- **語氣**：高能量、行動導向（Open Live Account／Start Trading）。

## 4. 即使改風格仍必守的 HATC 限制

- **事實**：仍以 `HATC_FACTS.md` 為唯一來源；不得因換風格而虛構產品、績效、
  獎項、客戶數、交易量或見證。
- **業務定位**：HATC 是**香港黃金交易所行員／參與者（實金業務）**，不是 CFD／
  槓桿零售經紀。**不可照抄** Vantage 的「award-winning／1,000+ CFDs／槓桿」等行銷語。
- **品牌色**：HATC logo 為深藍 `#09395f`＋綠 `#009944`。若要導入 Vantage 的橘，
  等於改動品牌識別（高風險）。**建議**保留 HATC 藍為主色，借鏡 Vantage 的
  版型／動態／資訊架構，而非照搬其橘色系——但最終由業主決定。
- **維持**：三語 i18n、SEO（Metadata／hreflang／JSON-LD）、a11y、RWD、
  客服／聯絡連結走 CMS 不寫死。

## 5. 給下個 agent 的建議步驟

1. 親自瀏覽 Vantage 實站，截關鍵區塊，與業主確認「要借的是哪些」
   （版型／動態／卡片 vs 全套色系）。
2. 提 1–2 個 HATC 版方向做 mockup（例：A＝HATC 藍為主＋Vantage 式版型／動態；
   B＝更接近 Vantage 深色＋強調色），給業主選。
3. 定案後才改 `tokens.css` 與規則文件，並逐區重構（沿用現有元件與資料結構）。
4. 保留現有功能骨架（i18n／SEO／CMS／證書與產品資料）。

## 6. 現況技術狀態（快速接手）

- 首頁區段元件：`src/components/home/{Hero,TrustStrip,AboutIntro,Milestones,
  Certificates,Services,Office,ContactBand}`（各含 `*.module.css`）。
- 文案：`src/messages/{zh-Hant,zh-Hans,en}.json`（共用 `common.*`；勿硬寫文案）。
- 內容／事實：`src/content/{company,milestones,products}.ts`；`docs/HATC_FACTS.md`。
- 素材：`public/{brand,office,certificates}`（logo 已裁切透明；證書已校正旋轉）。
- 設計 tokens：`src/styles/tokens.css`（`--color-brand` 深藍／`--color-accent` 綠）。
- 全域樣式：`src/styles/globals.css`（含 `scroll-padding-top` 供錨點）。
- `lint`／`build` 綠燈；本機開發 `npm run dev`（`http://localhost:3000`，`/` → `/zh-Hant`）。

## 8. Vantage 首頁佈局拆解（實站存檔，2026-01；顏色請以實站取樣）

> 來源：Wayback 存檔 `web.archive.org/.../vantagemarkets.com/en/`（實站有
> Cloudflare 人機驗證與地區/法遵 interstitial，無法直接截圖）。以下為真實 IA。

由上而下的區段順序（**這就是要學的佈局／資訊架構**）：

1. **Sticky Header**：logo＋主導覽＋顯眼主 CTA（Open Live Account）。
2. **Hero**：大促銷式標題＋副標＋CTA（＋Email 快速註冊）＋平台裝置 mockup 視覺。
3. **比較表帶**「See Our Competitive Spreads」：本家 vs 市場平均的數據表（商品列）。
4. **統計數字帶**「An Award-Winning Broker」：大數字計數（5,000,000+ 用戶、1,000+
   產品、From 0.0 pips、$0）＋三個價值主張卡（Trusted／Secure Funds／Spreads）。
5. **信任背書帶**「Trust We Have Earned」：獎項／信任 logo 牆。
6. **平台帶**「Trade Anytime, Anywhere」：桌機／行動 App 展示＋說明。
7. **產品分類探索**「Driving Excellence…」：分頁籤／卡片切換 FOREX／INDICES／
   GOLD & SILVER／ENERGY／ETFS／SOFT COMMODITIES／SHARES，每項標題＋說明＋Learn。
8. **支援與資源**「Support & Resources」：24/7 客服／Help Center／Learn 三卡。
9. **收尾轉換帶**「Start Your Trading Now」：重複統計數字＋CTA（進 footer 前再收單）。
10. **法遵頁尾**：大量監管／法律連結。

**可借鏡的設計／動態模式**（保留 HATC 藍即可）：
- Sticky header＋常駐主 CTA；hero「標題＋副標＋CTA＋視覺」黃金結構。
- 數字計數動畫（counter-up）；分頁籤／segmented 產品探索；alternating 明暗色帶。
- 獎項/信任 logo 牆；卡片格；pill 圓角按鈕；scroll-reveal 進場動效；
- footer 前重複一次轉換 CTA。

## 9. Vantage → HATC 區段對應（下個 agent 的實作藍圖）

> 借「版型／動態／IA」，內容一律回到 `HATC_FACTS.md`。HATC 是黃金交易所
> 行員／參與者（實金），**非** CFD 零售；**嚴禁**照抄下列 Vantage 內容：
> spreads/pips 比較表、槓桿、「5,000,000+ 用戶／1,000+ 產品／award-winning」、
> 「Open Live Account」等——這些 HATC 無事實依據。

| Vantage 區段 | HATC 對應（用現有事實／素材） |
| --- | --- |
| Hero＋mockup | Hero：HATC 定位標題＋CTA（了解我們／聯絡）＋接待處實拍（非誇大促銷語） |
| Competitive Spreads 表 | **改為事實信任帶**：香港黃金交易所／AA 類行員／行員編號 008 |
| Award 統計數字＋3 卡 | 統計以**事實**呈現：行員編號 008、AA 類、7 項獲准產品、里程碑數；三卡＝交易所行員資格／實體辦公室／真實證書（勿用客戶數／交易量等未核可數字） |
| Trust We Have Earned（獎項牆） | **真實證書牆**：行員證書 No. MEC-2510003、參與者證書 No. MEC-2603003 |
| Trade Anytime（平台） | 第一階段無交易平台 → 改「註冊／用戶中心入口」teaser（即將推出）或辦公室意象 |
| 產品分類分頁籤 | **業務範疇**：7 項獲准交易產品（99 金／港元公斤金條／999.9 金／香港白銀／人民幣公斤金條／倫敦金 100 安士／倫敦銀 5000 安士）做 Vantage 式卡片／頁籤 |
| Support & Resources 三卡 | 聯絡／客服（CMS 連結）＋（後續）About／Credentials 連結 |
| Start Your Trading Now 收尾 CTA | 收尾**聯絡／註冊**轉換帶（沿用 ContactBand，改為 Vantage 式全寬帶，HATC 藍） |
| 法遵頁尾 | 沿用現有 Footer，補公司資訊／會員編號／地址（已完成） |

## 7. 仍為佔位【待確認】的正式文案

- Hero 定位語、關於區品牌定位段落、聯絡帶標題／說明（正式行銷文案未定）。

## 10. 第二輪業主回饋（2026-08-07，交棒給下一個 agent）

> 第一輪已「借結構」做出淺色 Vantage-informed 首頁（10 區、三語、lint/build 綠燈）。
> 業主看過後**仍不滿意**，提供 Vantage 實站截圖（繁中版）：
> `docs/references/vantage-home-zh-2026-08-07.png`。以該圖與實站為設計依據。

### 10.1 業主明確指示
1. **「不夠像 Vantage」**：現行實作能量／動態不足。要更接近實站的視覺與互動。
2. **活動 banner 必須 CMS 配置**：目前活動區是靜態【待確認】卡，**不合格**。活動／推廣
   內容要能在後台新增／編輯（如同客服連結不可寫死的規則）。
3. **設計優先（核准制，業主 2026-08-07 定案）**：下一個 agent **先產出概念圖／視覺設計稿
   給業主看，業主同意後才動工實作**；未獲同意前不要改前台 code。
   （業主原話：「先交棒，之後先看概念圖，我同意再做」。）

### 10.2 Vantage 實站 vs 現行實作的差距（依截圖）
- **Hero**：實站為**深色＋能量/K 線影像背景**、大標＋副標、**Email 快速註冊輸入框＋
  「立即註冊」＋QR code**、右側視覺。現行是扁平純漸層淺色塊、無影像、無 Email 快註。
- **Hero 下方活動輪播**：實站是**橫向可滑動的卡片輪播**（交易平台／促銷活動／產品，
  每張帶圖＋標籤＋左右箭頭）＋「查看更多」。現行是三張靜態卡、無輪播、無圖、非 CMS。
- **競爭性點差比較表**：實站有 本家 vs 市場平均 的數據表。HATC 無此事實 → 改事實信任帶
  （已於對應表第 3 節說明；不可照抄 spreads）。
- **Header/客服**：實站完整主導覽＋註冊/登入＋LINE 浮動客服鈕。現行 Header 僅品牌＋入口。

### 10.3 hero 方向（業主 2026-08-07 已定案）
- **hero 用淺色**（業主拍板；不採 Vantage 的深色背景）。
- 但第一輪的問題是**扁平純漸層太單薄**：淺色 hero 仍要靠**實拍影像＋層次＋動態**做出質感與
  energy，別再只是一塊漸層。深色僅保留給收尾 CTA 帶與小面積點綴。

### 10.4 活動 banner 的 CMS 做法（建議）
- 依現有樣式：Payload 已設定 `localization`（zh-Hant/zh-Hans/en，見 `payload.config.ts`）。
- 新增 collection（例 `Promotions` 或 `HomeActivities`），欄位建議：
  `image`(upload→Media)、`tag`(select：活動/公告/產品…)、`title`(localized)、
  `summary`(localized)、`date`、`href`(text，可空)、`order`(number)、`enabled`(checkbox)。
- 前台以「DB 讀取＋無 DB 時 fallback（空陣列或 env）」模式，比照 `src/lib/siteSettings.ts`；
  在 `payload.config.ts` 的 `collections` 註冊，並 `generate:types`。
- 首頁活動輪播元件從此 collection 取資料渲染（RWD、可鍵盤操作、a11y、可滑動）。
- **紅線**：活動內容由業主於後台填寫；程式不得寫死活動文案；不得虛構活動。

### 10.5 仍必守（不因像 Vantage 而破）
- **（2026-08-07 更新）** HATC 業務含**實金＋黃金 CFD**；CFD／槓桿為核可業務，可呈現。
  但**不得虛構** CFD 的槓桿倍數、點差、最低手數、手續費、執行方式、平台名稱，也不得
  沿用競品的競爭性點差表、5,000,000+ 交易者、award-winning、見證等未核實行銷數據。
- **Email 快速註冊/開戶：業主已定案「先不做」**（`/register` 維持「即將推出」佔位）
  → hero 不要放 Email 快註元件。
- 事實一律回 `HATC_FACTS.md`；三語 i18n／SEO／a11y／RWD／客服連結走 CMS 不變。

### 10.6 下一棒建議步驟
1. **設計優先**：出 1–2 版 Vantage 級首頁**視覺設計稿**（hero 影像式＋活動輪播＋
   產品探索），連同深/淺 hero、Email 快註是否適用一起問業主定案。
2. 定案後：實作活動 CMS collection＋輪播元件；升級 hero（影像式）；補主導覽。
3. 逐步替換現有【待確認】為業主提供之正式文案。
4. 全程守 10.5 紅線；完成後同步更新 tokens／DESIGN_DIRECTION／規則／本檔。

### 10.7 目前程式現況（交接點）
- 首頁 10 區已實作（`src/components/home/*`）：Hero/Services(分頁籤)/Activities(靜態,待CMS化)/
  Insights/Process/WhyHATC/Milestones/Certificates/Office/ContactBand。`lint`/`build` 綠燈。
- 活動、實金教育、服務流程、產品說明皆為【待確認】佔位（未虛構）。
- `/preview` 鷹架已移除；tokens 已加 navy scale/pill/shadow/section-pad。
- 生產伺服器可 `npm run build && npm start`（`http://localhost:3000`，`/`→`/zh-Hant`）。
