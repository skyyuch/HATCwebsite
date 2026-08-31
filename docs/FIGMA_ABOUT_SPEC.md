# HATC 關於我們（About）Figma 還原規格（100% restoration spec）

> 來源：Figma `GGCUJwo9drmEUibcs9mLtq`，frame `hatc-about-page`（node **`12:4`**，
> 1440×5247）。URL：
> https://www.figma.com/design/GGCUJwo9drmEUibcs9mLtq/Untitled?node-id=12-4
>
> 本檔由 agent 於 2026-08-10 逐區讀取 `get_metadata` + `get_design_context` +
> 整頁 `get_screenshot` 後彙整，作為 **「照 Figma 100% 還原重構 About 頁」** 的唯一
> 實作依據。與首頁一致的設計系統見 `docs/FIGMA_HOMEPAGE_SPEC.md`（本檔只列 About 的
> 差異與各區細節）。資產 URL 7 天後失效；已先下載 3 張深色背景圖到
> `public/figma/about/`（見 §3）。

---

## 0. 整體風格與方向判斷

- **方向＝與首頁完全一致的「深色黑藍底 + 金色點綴」系統**（Sora 字體、6px 按鈕圓角、
  深/淺區塊交錯）。**這會取代現在 About 內文的暖白系**——即全站（首頁＋About）統一為
  Figma 深色系。（回應業主「你看 Figma 再判斷方向」：整頁截圖確認為深色系。）
- 版心 1440、左右 `padding 120px`；section-title＝kicker（金 13px uppercase）+ heading。
- **深/淺交錯順序**：hero(深·背景圖) → 公司簡介(淺) → 會員資格(深) → 服務理念(淺·白卡) →
  發展歷程(深) → 香港連結(深·背景圖) → 牌照榮譽(深) → CTA(深·背景圖) → footer(深)。

## 1. 設計 tokens（沿用首頁；僅記差異）

- **顏色/字體/圓角/字級**：與 `FIGMA_HOMEPAGE_SPEC.md` §1 相同。實作沿用既有
  `--fig-*` tokens 與 `--color-gold`、`--font-sans`(Sora)。
- ⚠ **金色色值差異**：About 的 `get_design_context` 回報金色為 **`#c9a84c`**，
  首頁既有 token 為 **`#d4af37`**。兩者相近但不同。**建議：沿用既有 `#d4af37`
  （`--fig-gold`/`--color-gold`）以維持全站一致**，除非業主要求 About 用 `#c9a84c`。
  （此為 owner-decided 項，kickoff 已列入待確認。）
- 背景遮罩：hero `rgba(7,10,20,0.85)`、香港連結 `rgba(7,10,20,0.8)`、CTA `rgba(7,10,20,0.95)`。
- 內文暗區 `#8e99b0`、淺區 `#475467`；深標題白、淺標題 `#0c111d`；暗區邊框 `#1f293d`、
  淺區白卡邊框 `#e4e7ec`。

---

## 2. 區塊清單（由上到下，含 node id）

> nav（`12:5`）與 footer（`12:152`/`12:153`）＝與首頁**相同的全域深色 Header/Footer**，
> **直接沿用既有 `src/components/Header`、`src/components/Footer`，不重做**。以下只列 About 內文區。

### 2.1 hero（`12:19`，h450，背景圖＋遮罩 `rgba(7,10,20,0.85)`）
- `pt120 pb60 px120`；背景圖＝香港夜景（佔位，`public/figma/about/about-hero-bg.png`）。
- 麵包屑（`12:21`，Sora 13）：`首頁`(`#8e99b0`) `>` `關於HATC`(金)。
- H1 56px ExtraBold（w900）：「關於」白 +「**華安泰昌**」金，leading 1.2。
- 副標 20px `#8e99b0` leading1.5：「立足香港，連接全球黃金市場，為機構與個人投資者
  提供最流暢的交易通道」。

### 2.2 company-identity 公司簡介（`12:28`，h620，**淺區**）
- 兩欄兩端對齊：左文字 w580、右圖 w580×420。
- 左：section-title（左對齊，非置中）kicker「COMPANY OVERVIEW」/ heading 36
  「公司簡介」；三段內文：
  1. `12:34`（lead，較大）：華安泰昌有限公司（HATC Group Limited）由深耕貴金屬領域
     多年的資深金融專家及技術團隊共同創立。
  2. `12:35`：我們為香港金銀業貿易場合法認證行員，經營合規黃金及白銀之電子交易與實物
     託管業務…（見 Figma 全文）。
  3. `12:36`：作為正式交易商成員，HATC 始終秉持客戶資產安全第一…配備國際頂尖的 MT5…。
- 右：`image-placeholder-frame`（`12:37`，rounded、580×420），角落標籤「待替換實拍素材」。
  → **實作用真實素材**：`public/office/*.jpg` 或接待處相片。
- 🔴 **治理**：上述簡介為**行銷草稿文案**（非 FACTS 明列事實）。「資深金融專家團隊創立」、
  「實物託管業務」等**需業主確認**後才對外；不得當成已核可事實。KYC/託管等具體聲明見 §4。

### 2.3 credentials 會員資格與權威身份（`12:41`，h726，**深區**）
- section-title（置中）kicker「AUTHORITATIVE CREDENTIALS」/ heading 白 36「會員資格與權威身份」。
- 3 張卡（各 384 寬，深卡 `#111625`／border `#1f293d`）：大標題金/白 ~28、小標 18、body 13：
  1. **香港黃金交易所** — 正規交易商席位 — 「香港金銀業貿易場嚴格監管行員，合規安全框架…」
  2. **AA類行員** — 最高經營資質 — 「金銀業貿易場中最高級別行員，獲授權經營倫敦金、倫敦銀…」
  3. **會員編號 008** — 尊貴早期席位號 — 「尊享貿易場第 008 號認證行員席位…」
  （三卡核心事實＝008／AA／香港黃金交易所，**與 FACTS 一致** ✅。）
- 下方 **安全聲明條**（`12:61`，1200×96，icon＋文字）：「監管與資產安全聲明 / 華安泰昌一切
  業務均遵守香港金銀業貿易場合規章程。**客戶資金存放於指定託管信託賬戶中，與公司運營資金
  嚴格分離。**」🔴 見 §4：資金託管/隔離聲明**須業主確認屬實**才可上線。

### 2.4 mission-and-values 我們的服務理念（`12:67`，h584，**淺區·白卡**）
- section-title（置中）kicker「OUR PRINCIPLES」/ heading `#0c111d` 36「我們的服務理念」。
- 4 卡（各 282 寬，白卡 border `#e4e7ec`）：半透明金大數字 01–04（~32）、標題 18、body 13：
  1. **專業合規服務** — 遵循金銀業貿易場最嚴格的合規審查與運營標準…
  2. **資訊清晰透明** — …提供實時極具競爭力的公開點差報價，確保每一筆合約…（🔴 見 §4：
     「公開點差報價」屬交易條件語氣，勿放具體數字；泛述可。）
  3. **學堂知識沉澱** — …提供持續更新的國際宏觀與技術指標實戰…
  4. **全心客戶關懷** — 專屬一對一中英文客服，簡化 KYC 審查手續…

### 2.5 company-timeline 華安泰昌發展歷程（`12:92`，h507，**深區**）
- section-title（置中）kicker「DEVELOPMENT HISTORY」/ heading 白 36「華安泰昌發展歷程」。
- 4 欄橫向時間軸（各 276 寬）：金色大年份 + 連接線 + 標題 16 + body 13 + 角落「佔位資料」標。
  - **2018** 集團成立與籌備 — 華安泰昌於香港創立，組建高管及…核心團隊。
  - **2019** 取得貿易場會員席位 — …獲取香港金銀業貿易場合規 AA 類行員第 008 號席位。
  - **2021** 全新 MT5 平台接入 — …引進 MetaTrader 5…。
  - **2023** 黃金學堂正式上線 — …。
- 🔴🔴 **重大治理衝突（必處理）**：Figma 年份標「佔位資料」，且**與 `HATC_FACTS.md`
  的真實里程碑直接矛盾**。FACTS 明載：
  - 2025-01-13 取得金銀業貿易場行員 008 證書
  - 2025-10-09 取得香港黃金交易所行員 008 證書及股份證書
  - 2026-03-27 取得參與者證書
  - 2026-03-30 升為 AA 類行員
  → **不得以 2019 對外聲稱已取得 008 席位**（會與真實時間線衝突、誤導）。實作前**必須**：
  用 FACTS 的真實年份重寫時間軸文案，**或**由業主明確提供正式沿革（含成立年）。
  在業主定案前，此區**保留 Figma 版型、但文案改採 FACTS 事實**（沿用既有
  `src/content/milestones.ts` / `home.milestones.*`）。

### 2.6 hong-kong-connection（`12:129`，h445，**深區·背景圖**遮罩 `rgba(7,10,20,0.8)`）
- 背景圖＝維港（佔位，`public/figma/about/about-hk-bg.png`）；`p120`，左欄 w720 gap24。
- kicker 金 14「HONG KONG LEGACY, GLOBAL REACH」；標題 40 白 ExtraBold「根植香港金融樞紐 」+
  「服務全球華語市場」金，leading1.3；body 16 `#8e99b0` leading1.8：「香港金銀業貿易場作為
  超過百年歷史的貴金屬交易重鎮…用最流暢的數字化渠道將香港實體黃金防護網絡與國際投資脈搏
  同步相連。」（🔴 品牌敘事文案，需業主確認語氣；不含可查核事實爭議。）

### 2.7 credentials-gallery 牌照、辦公室與榮譽（`12:134`，h1127，**深區**）
- section-title（置中）kicker/heading「牌照、辦公室與榮譽」（Figma kicker 誤填同中文，實作
  用英文 kicker，如「LICENSES · OFFICE · HONORS」，待業主定英文）。
- 圖片牆（全為佔位 `image-placeholder`「待替換」）：
  - 大卡 760×420「交易所會員牌照」（`16:4`）
  - 右上 456×196「辦公室環境」（`16:6`）／右下 456×196「公司獎項或榮譽」（`16:9`）
  - 寬卡 1200×220「交易所證書或官方文件」（`16:12`）
  - 註記文字：「以上為 HATC 相關牌照、辦公室及榮譽展示區域，實際內容待更新。」
- → **實作用真實素材**：`public/certificates/{member-2025,participant-2026,award,booth}.jpg`
  與 `public/office/*.jpg`（皆 FACTS「Marketing assets」已登錄之真實照片）。獎項全名未確認
  前**不得逐字標示**（FACTS 註記）。

### 2.8 cta-section（`12:143`，h310，**深區·背景圖**遮罩 `rgba(7,10,20,0.95)`，置中）
- 背景圖佔位 `public/figma/about/about-cta-bg.png`；標題 32 白「了解 HATC 的黃金交易服務」；
  body 16 `#8e99b0`：「如需了解在線極速開戶流程、一對一客戶支援或獲取模擬 MT5 賬戶試用，
  歡迎立即與我們專業團隊建立聯繫。」
- 雙 CTA：金實心「聯絡我們」+ 透明白框 1.5px「了解黃金交易」。
  - 🔴 **operational link**：「聯絡我們」走 `getSiteSettings()`/`primaryContactHref()`（勿硬編碼）；
    「了解黃金交易」→ `/#gold-services`（首頁錨點）。
  - 「模擬 MT5 賬戶試用」語氣呼應首頁待定的**免費模擬帳戶流程**（仍待業主定案，勿承諾未定流程）。

---

## 3. 資產（assets）

- 已下載 3 張**深色背景佔位圖**到 `public/figma/about/`：
  `about-hero-bg.png`（hero 香港夜景）、`about-hk-bg.png`（維港）、`about-cta-bg.png`（CTA 底圖）。
  皆為 Figma 佔位圖，上線前可由業主換真實香港/辦公室實拍。
- **公司簡介圖、牌照榮譽牆**：Figma 全為灰底佔位（「待替換」）。實作**優先用專案既有真實素材**：
  `public/office/*.jpg`（辦公室）、`public/certificates/*.jpg`（member-2025 / participant-2026 /
  award / booth）。獎項全名未經業主確認前不得逐字標示。
- 圖示（shield/check/headset/vector 等）：沿用 `lucide-react`（同首頁）。

## 4. 治理紅線（重構時必守）

1. 🔴 **發展歷程年份**：Figma 的 2018/2019/2021/2023 為**佔位且與 FACTS 衝突**。008/AA 的真實
   年份為 **2025–2026**（見 §2.5）。**必須改用 FACTS 事實或業主正式沿革**，不得對外用 2019
   聲稱已有 008 席位。
2. 🔴 **資金託管/隔離聲明**（§2.3 安全聲明條、§2.4 principle 01）：「客戶資金存放於指定託管
   信託賬戶、與運營資金嚴格分離」等**營運事實聲明未列於 FACTS**。上線前**須業主書面確認屬實**，
   否則刪除或改為不涉及具體託管安排的中性表述。
3. 🔴 **交易條件語氣**（§2.4 principle 02「公開點差報價」）：可泛述，**不得放具體點差/槓桿數字**
   （正式數字只放日後產品/CFD 頁）。
4. 🔴 **公司簡介行銷文案**（§2.2）：「資深金融專家團隊創立」「實物託管業務」等**非 FACTS 明列**，
   屬草稿，需業主確認；FACTS 已核可者（008/AA/交易所/地址/證書編號/董事會/獲准產品）可直接引用。
5. **operational link**（聯絡我們/開戶）走 CMS（`getSiteSettings()`），不硬編碼。
6. **i18n**：所有文案進 `src/messages/{zh-Hant,zh-Hans,en}.json`，三語同步、不寫死中文。
7. **獎項全名**未經業主逐字確認前不得對外標示（FACTS「Marketing assets」註記）。

## 5. 實作對映（現有 → 新）

> About 重構＝比照首頁重構模式：**新建深色區塊元件、退役現有暖白 About 元件**。

- **沿用**：全域 `Header`、`Footer`（已深色）；`getSiteSettings()`/`primaryContactHref()`；
  `src/content/milestones.ts`（時間軸真實資料）；`public/certificates`、`public/office` 真實素材；
  `lucide-react`；`SectionTitle`（首頁共用，可重用於置中標題）。
- **新建**（建議置於 `src/components/about/*`，深色版）：`AboutHero`、`CompanyIdentity`、
  `Credentials`（3 卡＋安全條）、`Principles`（4 卡）、`Timeline`（用 FACTS 事實）、
  `HongKongConnection`、`CredentialsGallery`（真實素材牆）、`AboutCta`。
- **退役**（重構完成後移除，比照首頁清理）：現有暖白 `about/AboutIntro`、`about/Milestones`、
  `about/Certificates`、`about/Office` 與 `home/ContactBand`（About 專用）。舊 messages
  `home.{about,milestones,certificates,office,facts}` 視新結構決定保留/改名（milestones 事實續用）。
- **page.tsx 順序**：AboutHero → CompanyIdentity → Credentials → Principles → Timeline →
  HongKongConnection → CredentialsGallery → AboutCta（Header/Footer 由 layout 全域注入）。
- **i18n**：新增 `about.*`（或 `home.aboutV2.*`）命名空間；三語同步。時間軸文案改採 FACTS。
