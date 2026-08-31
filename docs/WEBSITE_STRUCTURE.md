# HATC Website Structure

> 狀態：草稿骨架，待與業主討論後定案。
> 頁面與內容未確認前標記 `【待確認】`，不得憑空填入產品或交易資訊。

## 交付階段

- 已上線：首頁 Home（三語，Figma 深色系＋CMS 最新消息區）、關於我們 About、
  交易概覽 `/trading`、產品 `/products`、最新消息 `/news`（CMS `home-activities`）、
  黃金學堂 `/academy`＋`/academy/[slug]`（CMS `academy-articles`）
- CMS：Phase 0–4 完成（infra／FAQ／新聞活動／學堂／行銷 globals＋示意表）
- 後續階段（待規劃）：交易平台細節、Credentials 獨立頁、Contact 獨立頁（如需）

## 網站地圖（提案，待確認）

- 首頁 Home ✅ 已上線
- 關於我們 About ✅ 已上線（`/[locale]/about`）
  - 公司沿革／更名歷程（依 `HATC_FACTS.md`）
  - 交易所會員資格與里程碑
- 黃金交易概覽 ✅（`/[locale]/trading`）
- 產品／交易條件 ✅（`/[locale]/products`）
- 最新消息 ✅（`/[locale]/news`，Payload `home-activities`；無內容時中性空狀態）
- 黃金學堂 ✅（`/[locale]/academy` 列表＋`/[locale]/academy/[slug]` 詳情；Payload
  `academy-articles` Lexical body；無 DB／空 CMS → i18n 種子 a1–a3）
- 資質與證書 Credentials 【後續】
  - 真實證書展示（About 已有牌照牆）
- 聯絡我們 Contact 【後續】

## 每頁需求（模板）

針對每個頁面，定案時填寫：

- 目的：
- 核心訊息：
- 內容區塊：
- 所需素材（照片／證書／文案）：
- 呼籲行動 CTA：

## 關於我們 About 定案（2026-08-07，已上線）

> 業主定案：把首頁移出的公司資料集中於 About。**區塊順序＝沿革簡介 → 里程碑 →
> 證書 → 辦公室**（＋收尾 CTA）。**不含**團隊/董事會（先精簡，日後可補）。

- **路由**：`/[locale]/about`（三語 SSG）；`generateMetadata` 提供 `metadata.about.*`、
  canonical 與 hreflang（`/about`）。
- **區段**：`AboutIntro`（公司簡介 kicker＋h1「關於華安泰昌」＋沿革句＋事實面板：交易所／
  會員類別／會員編號／註冊地址，全部取自 FACTS）→ `Milestones`（`#milestones`，4 里程碑）→
  `Certificates`（`#credentials`，行員 No. MEC-2510003／參與者 No. MEC-2603003）→
  `Office`（`#office`，實拍畫廊）→ `ContactBand`（`#contact`，深藍收尾 CTA）。
- **元件位置**：`src/components/about/{AboutIntro,Milestones,Certificates,Office}`
  （後三者由 `components/home/*` 搬遷而來，keys 不變）。
- **導覽**：Header「關於我們」→ `/about`；首頁區段錨點改絕對路徑（`/#markets` 等）以便
  從 About 等內頁也能跳回首頁對應區段。
- **仍待業主提供**：`home.about.positioning`（品牌定位段落，目前【待確認】未渲染）；
  是否日後加入團隊/董事會與沿革展開。

## 首頁 Home 第三輪定案（2026-08-07，CFD 主打）

> **取代以下所有舊順序。** 業主定案：**官網主軸＝貴金屬 CFD 交易**（目前為黃金／白銀；
> 鉑金不提供 — 業主 2026-08-10），
> 交易所行員資格（008／AA／證書）作為**可信度背書**。**hero＝深色**。**證書與里程碑不放首頁、
> 改置「關於我們」**。**已實作（2026-08-07，第四輪）**：概念已落為正式 i18n 首頁、
> `/preview` 鷹架已移除、活動改由 Payload `home-activities` collection 管理。
> 事實仍以 `HATC_FACTS.md`（含新增「CFD business」）為唯一來源。

- **首頁區段順序**：Hero（深色，CFD 定位＋雙 CTA＋008 背書＋接待處實拍）→ 貴金屬市場
  （CFD／實金 7 項頁籤）→ 為何選 HATC（008/AA/7/4 計數＋信任卡，精簡）→ 如何開始（流程＋
  平台 teaser）→ 最新活動（CMS 輪播）→ 交易教育 → 收尾 CTA（深藍）。
- **移至「關於我們」**：真實證書牆、資格里程碑、**辦公室環境相片**（及公司沿革）。
  首頁不放任何「公司資料」展示，只保留精簡可信度帶當作 CFD 差異化。
- **待業主提供**：CFD 交易條件與平台素材、完整貴金屬清單、活動內容、正式文案。

## 首頁 Home 第二輪定案（2026-08-07，Vantage-informed，淺色 hero — 已被上方第三輪取代）

> 借 Vantage 版型／動態／IA、保留 HATC 深藍、hero 淺色。
> 內容重心：**產品／教育／流程為主，公司資料為輔**（業主指示）。事實仍以
> `HATC_FACTS.md` 為唯一來源。

- **區段順序**：
  1. Hero（淺色，定位＋雙 CTA＋信任列＋接待處實拍＋008 憑證 chip）
  2. **業務範疇 Services（主角）**：7 項獲准產品，全部／黃金／白銀分頁籤卡片
  3. **最新消息與活動 Activities**：活動／公告卡帶（文案【待確認】）
  4. **認識實金交易 Insights**：中性市場／實金教育（文案【待確認】，非投資建議）
  5. **如何開始 Process**：三步驟服務流程（步驟【待確認】）
  6. **為何選擇 WhyHATC**：008／AA／7／4 計數＋行員資格／實體辦公室／真實證書三卡
  7. 里程碑 Milestones（4 個核可日期）
  8. 證書 Certificates（行員 No. MEC-2510003、參與者 No. MEC-2603003）
  9. 辦公室 Office（實拍畫廊）
  10. 聯絡 ContactBand（深藍全寬收尾 CTA；聯絡連結讀 CMS）
- **錨點**：`#services`／`#activities`／`#insights`／`#process`／`#why`／`#milestones`
  ／`#credentials`（證書）／`#office`／`#contact`。Hero 主 CTA→`#why`、次 CTA→`#contact`。
- **待業主提供正式文案**：活動卡、實金教育、服務流程、Hero 定位語、聯絡帶標題／說明。

## 首頁 Home 舊定案（2026-08-07，已被上方改版取代，保留供追溯）

- **目的**：正式業務文案未定前，先以「身分 + 資質 + 里程碑 + 真實素材」
  建立機構級可信形象，並保留註冊／用戶中心／聯絡入口。
- **核心訊息**：香港黃金交易所 AA 類行員（行員編號 008）、可查證的資質與里程碑。
- **內容區塊（依序）**：
  1. Hero 主視覺（沿用現有，微調）
  2. 事實信任條（交易所名稱、AA 類、行員編號 008；皆為核可事實）
  3. 關於華安泰昌簡述（更名沿革為核可；定位段落【待確認】）
  4. 資質與里程碑時間軸（4 個核可里程碑日期）
  5. 證書展示（真實證書掃描）
  6. 辦公室／香港意象編輯帶（真實照片）
  7. 聯絡／行動帶（聯絡連結讀 CMS，不寫死）
  - **服務／業務**：已改為正式 Services 區塊，列出參與者證書所載 7 項獲准交易產品
    （見 `HATC_FACTS.md`「Approved trading products」）；不列交易條件、收費或執行方式。
- **所需素材**：008 行員證等真實證書掃描、辦公室／團隊實拍、（可選）香港意象。
- **呼籲行動 CTA**：
  - 指向尚未建立的 About／Credentials 頁之 CTA，第一階段先實作為
    **首頁內錨點滾動**至對應區塊；待頁面上線後再改為跨頁連結。
  - 聯絡我們／註冊沿用既有入口（聯絡連結由 CMS 配置）。
- **文案處理**：定位語與各區塊描述文案先以【待確認】佔位，全部進 `src/messages/*`
  三語同步、共用既有 `common.*` key；結構先行，正式文案確認後替換。
- **決策紀錄（2026-08-07）**：跨頁 CTA＝首頁內錨點。
- **素材與配色更新（2026-08-07）**：
  - 配色改為向品牌 logo 靠齊（深藍 `#09395f` 主色、綠 `#009944` 少量點綴、
    暖白／炭黑），黃銅金方向退役；tokens 與 `DESIGN_DIRECTION.md` 已同步。
  - Header 改用 logo；Hero 採「文字＋接待處實拍」並列版型。
  - 證書區改用兩張真實證書（行員 No. MEC-2510003、參與者 No. MEC-2603003）。
  - 業務區改為 7 項真實產品；辦公室區改為真實相片畫廊；頁尾加入公司地址。
  - 仍為佔位【待確認】：Hero 定位語、關於區定位段落、聯絡帶標題／說明。

## 導覽與版面

- **Header 與 Footer 為全域共用**：在 `[locale]/layout.tsx` 只渲染一次，
  各頁面不得各自實作；頁面只負責兩者之間的內容。
- **註冊 / 用戶中心入口**：Header 先放入口按鈕（第一階段僅入口，功能與頁面後續再做）；
  連結目標與行為【待確認】（可先導向 placeholder 或標示「即將推出」）。
- 全站導覽項目：【待確認】
- 頁尾內容（公司名稱、會員編號等，依 `HATC_FACTS.md`）：【待確認】
- 客服 / 聯絡連結：由 CMS 配置讀取，不得寫死於程式碼

## 國際化 (i18n)

- 三語第一階段同時上線：繁體中文（預設）、簡體中文、英文
- 建議路由策略：`[locale]` 區段，`zh-Hant`（預設）、`zh-Hans`、`en`
- 內容以 message 檔集中管理，避免在元件內硬寫文案

## 工作流程

- 一次規劃並完成一個頁面
- 每頁檢查桌機、平板、手機版面
