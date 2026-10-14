# HATC Website Structure

> 狀態：草稿骨架，待與業主討論後定案。
> 頁面與內容未確認前標記 `【待確認】`，不得憑空填入產品或交易資訊。

## 交付階段

- 已上線：首頁 Home（三語，Figma 深色系＋CMS 最新消息區）、關於我們 About、
  交易概覽 `/trading`、產品 `/products`、所有交易產品 `/products/all`、交易帳戶 `/accounts`、
  入金與出金 `/funding`、**交易平台 `/platforms`**（Figma `89:4`；CMS `trading-platforms`
  ＋ faqs `platforms` 分類）、最新消息 `/news`（CMS `home-activities`）、
  **官方公告 `/announcements` ＋ `/announcements/[slug]`**（第六十輪；CMS `announcements`
  ＋業主可自建的 `announcement-categories`，無公告時中性空狀態），
  黃金學院 `/academy`（Figma `98:4` 改版：hero＋分類篩選/排序/分頁＋電子報）
  ＋`/academy/[slug]`（CMS `academy-articles`，本機現有 49 篇原創長文；封面為佔位圖）、
  **隱私權政策 `/privacy` 與免責聲明 `/disclaimer`**（第五十六輪；共用
  `src/components/legal/LegalPage.tsx`，內文在 i18n `legal.{privacy,disclaimer}`。
  ⚠ 文字為**依網站實況撰寫的保守版草稿，待業主／法務審核**——治理註記寫在該元件檔頭）
- **App／h5 嵌入版（第七十輪）**：`/[locale]/embed/{announcements,announcements/[slug],
  disclaimer,privacy}` ＝公開頁的**無頭尾**孿生版本，給 HATC App／h5 的 webview 用。
  見下方「App／h5 嵌入版面」。
- CMS：Phase 0–4 完成（infra／FAQ／新聞活動／學堂／行銷 globals＋示意表）
- 後續階段（待規劃）：交易平台細節、Credentials 獨立頁、Contact 獨立頁（如需）

## 網站地圖（提案，待確認）

- 首頁 Home ✅ 已上線
- 關於我們 About ✅ 已上線（`/[locale]/about`）
  - 公司沿革／更名歷程（依 `HATC_FACTS.md`）
  - 交易所會員資格與里程碑
- 黃金交易概覽 ✅（`/[locale]/trading`）
- 產品／交易條件 ✅（`/[locale]/products`）／所有交易產品 ✅（`/[locale]/products/all`）
- 交易帳戶 ✅（`/[locale]/accounts`）／入金與出金 ✅（`/[locale]/funding`）
  - **出入金渠道表＝對外正式資訊（第六十九輪，業主 2026-10-14 指示拿掉「示意數據」）**。
    資料只來自 CMS `funding-methods`（以 `type` 分入金／出金），**沒有 i18n 後備種子**——
    舊種子是 Figma 範本的虛構渠道（Neteller／Skrill／JCB…），拿掉標籤後若還留著，
    資料庫讀不到時就會把不存在的渠道當成正式渠道印出來。因此**空清單＝整個表格區塊不渲染**
    （與見證／最新消息／公告同一條「不造假、空則隱藏」紅線）。
  - 表格下方的說明（`funding.{deposit,withdraw}.note`）必須保留：處理時間為預估且受銀行／
    支付機構／區塊鏈網絡影響，手續費欄只涵蓋華安泰昌收取的費用（對齊 FACTS「交易手續費全免
    不含出入金費用」）。這些值**不寫入 `HATC_FACTS.md`**（營運資訊會變動，非交易條件）。
  - ⚠ 每一列都要**三語各自填對**。Payload 的 fallback 只在某語系為空時回退，把同一份文字
    貼進三個語系會讓繁中站與英文站都顯示那份文字（上線前同事即如此，三語全簡體）。
- 交易平台 ✅（`/[locale]/platforms`，Figma `89:4`；分頁 MT5＋HATC App＋網頁交易端＝
  業主確認之平台，Payload `trading-platforms`＋faqs `platforms`）
  - 平台圖（`/platforms` hero＋分頁、`/accounts` 卡片）一律經
    `components/platforms/{platformVisuals.ts,PlatformVisualPanel.tsx}`：
    CMS 上傳 → HATC 交易端真實截圖（三語，第五十一輪）→ 平台供應商官方畫面（僅 MetaTrader 5，
    第五十二輪業主決定）→ 自家品牌面板。通用範本裝置圖與 AI 算圖**永不使用**。
  - 截圖素材由 `scripts/capture-terminal.mjs` 產生（截圖紅線寫在該檔與 `platformVisuals.ts` 檔頭）：
    手機檔＝一個手機螢幕（430×932 @2x），桌機檔＝一個瀏覽器視窗（1000×820 @2x，交易端無桌機版版面，
    所以就是 500px 欄置中的實況）。
  - 外框依來源決定：`phone`→手機、`browser`→瀏覽器視窗（位址列印核可網域 `h5.hatcmarket.com`）、
    `combo`→hero 的瀏覽器＋手機交疊、`vendor`→螢幕薄邊。呈現＝深藍景深＋金色細線幾何＋切出面板下緣。
  - 註記由 `visualNote()` 決定：自家截圖印 `platforms.types.screenshotNote`，供應商示範畫面印
    `platforms.types.vendorNote`（說明是示範帳戶、並點明 HATC 只提供黃金／白銀／人民幣公斤條）。
- 最新消息 ✅（`/[locale]/news`，Payload `home-activities`；無內容時中性空狀態）
- 官方公告 ✅（`/[locale]/announcements` 列表＋`/[locale]/announcements/[slug]` 詳情；
  第六十輪，業主指定與「最新消息」分開的獨立版面，header 第五個頂層項目）
  - Payload `announcements`（標題／網址代稱／分類／摘要／內文 richText／發佈日／置頂／啟用）
    ＋ **業主可自建的** `announcement-categories`（名稱／網址代稱／排序／啟用；種子只給
    業主指定的兩類＝重要公告 `important`／交易安排 `trading-arrangement`）。
  - **不種任何公告**（公司對外聲明不得由程式捏造），空 → 中性「目前尚無公告」。
  - **公告的「網址代稱」可留空**（第六十一輪）：`src/payload/slug.ts` 的 `autoSlug` 會正規化
    輸入、空值時依標題或發布日期（香港時間 `YYYY-MM-DD`）產生，並以 `-2`／`-3` 去重。
    **分類的代稱仍需自填**（它是會被分享的 `?category=…` 篩選網址），但同樣會被正規化，
    留空時給的是說明該填什麼的三語訊息。日後新增任何 slug 欄位都接 `autoSlug`，
    不要再做沒有正規化的 `required` 文字欄 —— 業主第一次發公告就把它填成了一段路徑而導致 404。
  - 分類篩選用 `?category=<slug>`（slug 來自 CMS，不是程式常數；未知值忽略＝不篩選），
    `useSearchParams` 以 Suspense 隔離 → 列表維持 ● SSG（同學院頁的做法）。
  - 置頂（`pinned`）排最前，其餘依發佈日新→舊；分類被刪除的公告自動歸「未分類」。
- 黃金學院 ✅（`/[locale]/academy` 列表〔Figma `98:4`：navy/gold hero＋分類篩選 sidebar
  ＋排序＋分頁＋電子報誠實佔位〕＋`/[locale]/academy/[slug]` 詳情；Payload `academy-articles`
  本機現有 49 篇原創長文；無 DB／空 CMS → i18n 種子 a1–a3；篩選分類＝固定 6 類
  `academy.categories`，可用 `?category=<slug>` 深連，見下方「導覽與版面」）
- 隱私權政策 ✅（`/[locale]/privacy`）／免責聲明 ✅（`/[locale]/disclaimer`）
  - 兩頁共用 `components/legal/LegalPage.tsx`（麵包屑＋navy/gold 標題帶＋編號章節＋聯絡卡）。
  - 內文來源：**只有兩樣**——① 網站**實際**行為（未啟用任何分析追蹤、前台無會送出資料的表單、
    cookie 僅 `NEXT_LOCALE` 與後台 `payload-lng`／登入 cookie）；② `HATC_FACTS.md` 的公司資料。
    **刻意不寫**保存期限、具名的資料處理者／主機商、管轄法律／仲裁條款與任何合規保證。
  - 聯絡卡的電郵／電話讀 CMS `SiteSettings`（營運資料紅線），**未設定即不顯示該列** →
    **上線前必須在後台填入**（值為 FACTS 已核可的 `info@hatchk.com`／`(852) 2322 2888`）。
    公司名稱與註冊地址用在地化的 `common.brandFull`／`footer.address`，三語各自正確。
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

## App／h5 嵌入版面（第七十輪，2026-10-14，開發端需求）

開發端要把公告與兩份法律文件放進 App／h5 的 webview，問官網有沒有「去掉頭尾的參數」。
**答案是沒有參數，改成獨立路徑** `/[locale]/embed/…`（業主拍板：四頁全做、只給路徑不收
參數、標題區精簡）。網址契約給開發端的版本在 `docs/DEPLOYMENT.md` §10。

- **為什麼不是 `?embed=1`**：**Next 的 layout 讀不到 search params**（layout 導航時不重渲染，
  值會過期；官方文件 `file-conventions/layout.md`），而 Header／Footer 依本站慣例只在
  `(frontend)/[locale]/layout.tsx` 渲染一次。靠參數只能走「把頭尾搬進每一頁」（失去 ● SSG
  並破壞全域版面慣例）或「前端 JS 事後隱藏」（webview 先閃一次完整官網頭尾）。
- **實作＝平行 route group ＋ 自己的 root layout**：`src/app/(embed)/[locale]/embed/layout.tsx`。
  **巢狀 layout 無法移除父層 chrome**，所以必須是平行 group，不是子資料夾；本倉本來就有兩個
  root layout（`(frontend)`／`(payload)`），`[locale]` 同時出現在兩個 group 已實測可行。
  公開頁面零改動。
- **紅線（檔頭有完整版，改動前先讀）**：`noindex, nofollow` 且**刻意不給 canonical**
  （canonical 與 noindex 併用是矛盾訊號，有讓 noindex 被套到正式頁的風險）；不進 `sitemap.ts`；
  `robots.txt` 不加 `Disallow`（擋了抓取，爬蟲就讀不到 noindex）；不放 Header／Footer／麵包屑／
  skip link／JSON-LD，頁內連結全部留在 `/embed` 底下；**文案與資料與公開頁同一份，不得為 App
  另開一份**（兩份法律文件仍待業主／法務審核）。
- **元件以 `embed` 旗標切換**（`AnnouncementsList`／`AnnouncementFeed`／`AnnouncementView`／
  `LegalPage`）。兩個刻意的差別：① embed 列表不渲染 hero（它帶著回首頁的麵包屑），所以
  **列表的 h1 是 `announcements.results.title`「公告列表」而非「官方公告」**，避免 App 標題欄
  ＋h1＋h2 三層標題；② 公告內文裡業主自己打的連結不會被改寫。
- 日後要再嵌別的頁：照這套加路由＋傳旗標，**不要**動公開頁版面。第三個頁面出現時再把精簡
  標題抽成共用元件（目前只有 `LegalPage` 用，刻意不先抽）。

## 導覽與版面

- **Header 與 Footer 為全域共用**：在 `[locale]/layout.tsx` 只渲染一次，
  各頁面不得各自實作；頁面只負責兩者之間的內容。
  - **唯一例外＝`/[locale]/embed/*`**（第七十輪，App／h5 webview）：它在自己的 route group
    `(embed)` 內有獨立 root layout，刻意不渲染頭尾。見上方「App／h5 嵌入版面」。
- **Header 頂層項目（第六十輪起 5 項）**＝關於HATC `/about`／交易 `/trading`（含 mega-menu）／
  交易平台 `/platforms`／黃金學院 `/academy`／**公告 `/announcements`**；右側＝語言切換、
  （CMS 設定後才出現的）登入、立即開戶。
  - 🚩 **桌機橫列的斷點是 `min-[1360px]`，不是 `lg`（第六十輪實測）**。加入第五個項目後，
    英文標籤最長的情況在 1024／1280 會把 logo 擠成 0 寬並讓標籤換行。於 1920 量到不換行
    所需的實際寬度＝**1411px**（含業主尚未設定、設定後會出現的登入連結）；再把導覽間距收為
    `gap-6`（`2xl` 才放大到 `gap-8`）、header 內距收為 `lg:px-12`（`2xl:px-20`）後降到
    **1307px**，因此以 1360px 為切換點（餘裕 53px），未達者走手機抽屜
    （`HeaderMobileMenu` 的 `min-[1360px]:hidden`）。**不要把導覽改回 `lg`／`xl`。**
    日後再加頂層項目必須重新量測，或改採收納式設計。
- **開戶入口**：全站「立即開戶」按鈕讀 CMS `SiteSettings → 開戶（註冊）連結`
  （業主 2026-10-11 提供線上註冊頁，見 `HATC_FACTS.md`）；未設定時退回客服連結，
  兩者皆無才退到 `/register`「即將推出」佔位頁。解析器＝`openAccountHref()`。
- **外部連結一律同視窗開啟（業主 2026-10-11 第五十六輪）**：業主要求開戶跳轉不要開新視窗，
  並選擇套用到全站外部連結。因此開戶／模擬／客服／header mega 橫幅／平台 CTA／外部消息卡
  都**不帶** `target="_blank"`；新增 CTA 亦同。
- **模擬帳戶入口**：仍待業主提供；CMS 未設定即**不渲染**模擬按鈕（不做死連結）。
- **會員登入入口（業主 2026-10-11 第五十八輪：先隱藏）**：Header 的「登入」改由 CMS
  `SiteSettings.memberLoginUrl`（網站營運設定 → 帳戶入口 → 會員登入連結）決定，
  解析器 `memberLoginHref()`；**未設定即不渲染**（桌機與手機抽屜皆同），比照模擬帳戶的做法。
  業主填入交易端登入頁網址後即自動出現，不需改碼。原本的 `/account`「即將推出」佔位頁
  **刻意保留但已無任何連結指向**（也不在 sitemap），不要再把登入指回去。
- **Footer 連結對照表**＝`src/components/Footer/Footer.tsx` 的 `FOOTER_LINKS`（內容導覽連結，
  非營運連結，可用站內路徑）。**標籤必須對得上站上真實存在的頁面或區段**；沒有目的地就不列，
  也不得用標籤承諾未確認的功能。
  - 每一列是 `{href, labelKey}`，**`labelKey` 是完整的 message 路徑**，所以一列可以借用它指向的
    頁面自己的標籤鍵，不必為同一段文字再開 footer 專用鍵（第六十一輪）。這與`交易服務`欄讀
    `products.items.*.name`、`黃金學院`欄讀 `academy.categories` 是同一個慣例：**標籤盡量從
    目的地的正本取，就不可能漂移。**第五十三輪已把「MT5平台」欄改為 **「交易平台」**
  （鍵 `home.footerV2.cols.platforms`），四個連結分別指 `/platforms`、`#platform-types`（×2）、
  `#platform-faq`，取代原本全部指向首頁 `/#mt5` 且含「MT5客戶端下載／EA程序化支持」等不存在
  或未經確認的項目。
  - 第五十四輪已把**黃金學院欄**改成真實目的地：全部文章 → `/academy`，另外三格＝
    `academy.categories` 的前三類（黃金基礎／交易策略／技術分析），以
    `/academy?category=<slug>` 深連到分類篩選。**標籤直接讀 `academy.categories`**，不另開
    footer 文案鍵，所以永遠不會和篩選選項不一致（業主 2026-10-11 決定該欄維持 4 格，
    其餘三類在 `/academy` 頁內篩選）。
  - 第五十七輪已把**交易服務欄**改成**由 `CFD_PRODUCTS` 生成**（業主 2026-10-11 選定 A 案）：
    三個核可品種 → `/products#{gold,silver,kilobar}`（產品卡本來就渲染 `id={p.key}`）＋
    交易條件 → `/products#conditions`。**標籤讀 `products.items.*.name` 與
    `products.conditions.heading`**，比照學院欄不另開 footer 鍵，所以增刪品種時 footer 自動
    跟上、不可能再漏品種。取代原本四個寫死標籤（倫敦黃金交易／倫敦白銀交易／市場交易細則／
    合約保證金）——那組缺人民幣公斤條、l3 與 l4 指向同一個 `#conditions`，而「合約保證金」
    承諾了站上不存在的保證金內容。i18n `home.footerV2.cols.trading` 現在只剩 `title`。
  - 第六十一輪（業主指示）在**關於我們欄**加了 **`官方公告` → `/announcements`**，插在
    `安全與監管`與`最新新聞`之間（該欄 5 列，其餘 4 列），標籤借用該頁 h1 的
    `announcements.hero.title`。**刻意不開第五個導覽欄**——格線是
    `md:grid-cols-[327fr_repeat(4,153fr)]`，`md`(768px) 時每欄只剩 ~81px，第五欄會壓到 ~70px。
    **也刻意不做分類深連**：公告分類在 CMS，深連進全域 footer 會讓每個靜態頁都依賴
    `announcementCategories` tag（它只 revalidate `/announcements`），業主改分類後其他頁的
    footer 就會是舊的；學院欄能深連是因為它的 slug 是程式常數。
  - 仍待整理（下一棒候選）：關於我們欄前三列都指 `/about` **沒有錨點**（第十三輪 About 改版
    後舊的 `#milestones`／`#credentials` 等區段 id 全部消失，全站也沒有東西連過去），
    且 l3 標籤「安全與監管 / Security & supervision」容易被讀成 HATC 本身受監管；
    業主 2026-10-11 第五十七輪決定該欄暫不處理。
- **黃金學院分類深連**＝`/academy?category=<slug>`（可逗號分隔多選，如
  `?category=gold-basics,portfolio`）。slug 清單在
  [`src/lib/academyCategories.ts`](../src/lib/academyCategories.ts)，**順序必須對齊
  `src/messages/*` 的 `academy.categories`**（slug 是穩定的英文代號，分類顯示名改字不會斷連結；
  未知 slug 會被忽略＝退回不篩選）。`AcademyExplorer` 兩向同步：進站時套用網址參數，頁內套用／
  重設篩選時以 `history.replaceState` 回寫網址（排序與頁碼刻意**不**進網址）。
  讀網址的 `useSearchParams` 被隔離在一個不渲染內容的 `<Suspense>` 子元件裡，**文章格維持
  預先渲染**、`/academy` 仍是 ● SSG；代價是篩選在 hydration 後才套用（首幀仍是完整清單）。
- **公告分類深連**＝`/announcements?category=<slug>`（單選）。與學院不同，**slug 來自 CMS
  `announcement-categories` 的「網址代稱」欄，不是程式常數**（業主要自由增刪分類），
  因此沒有需要同步的清單檔；前台只接受當前存在的 slug，未知值忽略＝退回不篩選。
  寫回網址同樣用 `history.replaceState`，`useSearchParams` 同樣以 `<Suspense>` 隔離
  以保住 ● SSG。通用的「全部」與分頁文案**沿用 `academy.*` 既有鍵**，不重複開新鍵。
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
