# HATC 首頁 Figma 還原規格（100% restoration spec）

> 來源：Figma `GGCUJwo9drmEUibcs9mLtq`，頁面 `00_Design_System`，主 frame
> `hatc-v2-homepage`（node `4:4`，1440×5501）。URL：
> https://www.figma.com/design/GGCUJwo9drmEUibcs9mLtq/Untitled?node-id=4-4
>
> 本檔由 agent 於 2026-08-10 逐區塊讀取 `get_design_context` 後彙整，作為
> **「照 Figma 100% 還原重構首頁」** 的唯一實作依據（業主 2026-08-10 拍板「完全照
> Figma、更新設計系統」）。取新的資產 URL：對各 node 重新呼叫 `get_design_context`
> 即可（舊 URL 7 天後失效；已先下載一份到 `public/figma/`，見該資料夾 MANIFEST）。

---

## 0. 整體風格

深色系金融交易所風格首頁：**深黑藍底 + 金色點綴**，深/淺區塊交錯。1440 設計寬、
版心左右 `padding 120px`，多數區塊 `padding-y 96px`、section 內 `gap 64px`、
section-title 為置中（kicker + heading）。

## 1. 設計 tokens（Figma 實際 hex，無 Figma variables）

### 顏色
| 用途 | 值 |
|---|---|
| 最深底 / 按鈕文字 | `#070a14` |
| 導覽列底（半透明） | `rgba(9,12,23,0.92)` |
| 卡片 / 信任條底 | `#111625` |
| Hero 價格卡底（毛玻璃） | `rgba(17,22,37,0.8)` + `backdrop-blur 8px` |
| 淺區底 | `#f4f6f9` |
| 白卡底 | `#ffffff` |
| **金色主點綴** | `#d4af37` |
| 金色淡底（icon/badge/hover） | `rgba(212,175,55,0.1)`～`0.12` |
| 金色半透明大數字 | `rgba(212,175,55,0.17)`～`0.2` |
| 白文字 | `#ffffff` |
| 深文字（淺區標題） | `#0c111d` |
| 內文（暗區） | `#8e99b0` |
| 內文（淺區） | `#475467` |
| 暗區邊框 | `#1f293d` |
| 淺區白卡邊框 | `#e4e7ec` |
| 漲（綠） | `#10b981`（卡片）/ `#21c773`（ticker） |
| 跌（紅） | `#eb4545` |
| ticker 中性數字 | 標籤 `#8c94a1`、值 `#ebedf2`、註記 `#666b75` |

### 字體
- **Sora**：標題與正文主字體（Regular / SemiBold / Bold / ExtraBold）。
- **Inter**：Hero 底部 market-ticker 的數字（Medium / SemiBold）。
- Noto Sans TC：中文備援（ticker 的「示意數據」）。
- 導入方式建議 `next/font/google` 的 `Sora` + `Inter`，接到 tokens（見下方交棒）。

### 圓角
- 按鈕：**6px**（全站一致，非 pill）。
- 卡片：8px；大卡（Hero 價格卡 / MT5 圖卡）：16px。
- badge / 小標籤：4px。
- icon 底方塊：pill（rounded 14/20/24 對應 size 28/40/48）。

### 字級（px）
56 / 36 / 32 / 28 / 22 / 20 / 18 / 16 / 15 / 14 / 13 / 12 / 11 / 10；
`leading` 標題 1.15、正文 1.5～1.65。

---

## 2. 區塊清單（由上到下，含 node id）

> 版面順序（Figma y 座標）：navigation → hero → trust-strip → gold-services →
> mt5-showcase → why-hatc → gold-academy → company-story → client-support → footer。

### 2.1 navigation（`4:5`，h80，sticky）
- 底 `rgba(9,12,23,0.92)`，`border-bottom rgba(51,56,71,0.6)`，`px 80`，兩端對齊。
- Logo：「HATC 」白 + 「華安泰昌」金 `#d4af37`，22px ExtraBold。
- 中間選單（`#8e99b0` 14px SemiBold，gap 32）：關於HATC / 黃金交易 / MT5平台 /
  黃金學堂 / 客戶支援。
- 右側：「繁中 / EN」（`#8e99b0` 14）、「登入」（白 14 SemiBold）、金色按鈕
  「開立帳戶」（bg `#d4af37`、文字 `#070a14`、rounded 6、px24 py12）。

### 2.2 hero（`4:19`，h720）
- 滿版背景圖 + 遮罩 `rgba(7,10,20,0.8)`；`pt 160 pb 80 px 120`。
- 左欄 w687，gap24：
  - 徽章：bg `rgba(212,175,55,0.12)`、border `#d4af37`、rounded4、金字 12px Bold
    「香港黃金交易所 AA類行員 008號」。
  - H1 56px ExtraBold 白，leading 1.15：「連接全球黃金市場」／「**華安泰昌**(金) 專業護航」。
  - 副標 `#8e99b0` 16px leading1.6（公司簡介句）。
  - 雙 CTA：金色實心「開始了解」 + 透明白框 1.5px「聯絡我們」（皆 rounded6）。
- 右欄 w481：**實時金價卡**（毛玻璃 `rgba(17,22,37,0.8)` blur8、border `#1f293d`、
  rounded16、p24、gap20）：
  - 頭列：「實時金價 XAU/USD」金 14 Bold ／「示意數據」`#8e99b0` 12。
  - 主數字 `$2,342.80` 白 32 ExtraBold ／ `+1.42%` 綠 `#10b981` 14 Bold。
  - 折線 SVG 分隔。
  - 今日最高 `$2,351.10` / 今日最低 `$2,320.50`（label `#8e99b0` 11、值白 14 Bold）。
- 底部 **market-ticker**（`7:2`，absolute top664，h56，滿版）：bg `rgba(8,10,18,0.85)`、
  `border-top rgba(51,56,71,0.5)`、置中、`px40`。6 組報價（Inter 字體）：
  - XAU/USD 2,342.80 `+18.60 +0.80%`(綠) ｜ XAG/USD 28.45 `+0.32 +1.14%`(綠) ｜
    XAU/HKD 18,312.50 `-42.30 -0.23%`(紅) ｜ USD/CNH 7.2480 `+0.0085 +0.12%`(綠) ｜
    HKD/USD 0.1281 `-0.0001 -0.01%`(紅) ｜ XAU/EUR 2,156.20 `+12.40 +0.58%`(綠)
  - 分隔線 `rgba(64,69,82,0.6)` w1 h24；尾端「示意數據」`#666b75` 10（Noto Sans TC）。
  - 標籤 `#8c94a1` 12、值 `#ebedf2` 13、漲 `#21c773`／跌 `#eb4545` 12。

### 2.3 trust-strip（`4:52`，h140，`#111625`）
- `border-bottom #1f293d`，`px120`，三欄兩端對齊，各欄 w327 gap20：
  - 金色盾牌 icon（bg `rgba(212,175,55,0.12)`、rounded24、size48、內 shield 24）。
  - 標題 20 白 ExtraBold ／ 副 `#8e99b0` 12。
  - 三項：金銀業貿易場（香港金銀業貿易場 • 正規合規認證交易所成員）／
    AA 類行員（最高級別認可行員 • 可經營倫敦金銀及實物黃金）／
    會員編號 008（官方認證席位編號 • 資金安全受貿易場嚴格監管）。

### 2.4 gold-services（`4:71`，淺 `#f4f6f9`，py96 px120 gap64）
- section-title 置中：kicker `#d4af37` 13 Bold uppercase「PREMIUM TRADING SERVICES」／
  heading `#0c111d` 36 ExtraBold「優質黃金交易服務」。
- 內容兩欄 gap48：
  - 左 w533 gap32：標題 28「專注、合規、高效的倫敦金/銀投資通道」；body `#475467` 15；
    3 個 check 條列（check SVG 18、標題 15 Bold `#0c111d`、副 13 `#475467`）：
    靈活槓桿與低交易門檻 / 24小時雙向不間斷交易 / 極速訂單執行通道；金色按鈕
    「了解黃金交易服務」。
  - 右 w635 gap20：
    - **chart-mockup**（bg `#070a14`、border `#1f293d`、rounded8、h280、p20）：
      頭列「XAU/USD (倫敦金)」白14 + 「● 實時交易中」綠12 + 右「示意數據 (設計佔位)」；
      chart-canvas h160（4 條水平格線 SVG + 7 根蠟燭 SVG，位置 x=30/70/110/150/190/230/270 w20）；
      時間軸 10:00~15:00（`#8e99b0` 11）。
    - 兩張 price-card（bg `#111625` border `#1f293d` rounded8 p16）：XAU/USD 倫敦金 +1.42% /
      XAG/USD 倫敦銀 +0.85%（漲幅 badge bg `rgba(16,185,129,0.1)` 綠字），大數字金 `#d4af37` 22 Bold。

### 2.5 mt5-showcase（`4:154`，背景圖 + 遮罩 `rgba(7,10,20,0.9)`，py96 px120 gap64）
- section-title：kicker「METATRADER 5 PLATFORM」／heading 白 36「國際頂尖 MT5 交易平台」。
- 兩欄 gap48：
  - 左：平台截圖卡（bg `#111625` border `#1f293d` rounded16 h380 w584，內滿版圖）。
  - 右 w584 gap32：標題 28 白「功能強大，多端無縫連通」；body `#8e99b0` 15 leading1.65；
    3 項功能（金淡底 icon 方塊 rounded14 size28 內 smartphone14；標題 15 Bold 白、副 13 `#8e99b0`）：
    全天候多端自適應 / 精細化訂單與持倉管理 / 極致的智能圖表系統；雙 CTA 金實心「了解MT5」+
    透明白框「操作指南」。

### 2.6 why-hatc（`4:188`，淺 `#f4f6f9`，py96 px120 gap64）
- section-title：kicker「WHY CHOOSE HATC」／heading `#0c111d` 36「為什麼選擇華安泰昌」。
- 4 張白卡（flex 均分 gap24；bg white、border `#e4e7ec`、rounded8、p32、gap24，等高）：
  - 大數字 32 ExtraBold **半透明金** `rgba(212,175,55,0.2)`（01/02/03/04）；
    標題 18 ExtraBold `#0c111d`；body 13 `#475467` leading1.5。
  - 四項：合規安全保障 / 一流執行速度 / 個性化尊貴服務 / 投資教育資源。

### 2.7 gold-academy（`4:213`，最深 `#070a14`，py96 px120 gap64）
- section-title：kicker「HATC GOLD ACADEMY」／heading 白 36「黃金交易學堂」。
- 3 張文章卡（flex 均分 gap24；bg `#111625` border `#1f293d` rounded8，overflow-clip，等高）：
  - 頂圖 h180；內文 p24 gap16：金色標籤 badge（bg `rgba(212,175,55,0.1)` rounded4 金11 Bold）／
    標題 16 ExtraBold 白（單行省略）／body 13 `#8e99b0` leading1.5（省略）／「閱讀全文」金13 SemiBold 底線。
  - 標籤/標題：基礎教學・倫敦金(XAU)與美金的關聯… ／ MT5實戰・在MT5上利用MA均線交叉策略… ／
    巨集觀視野・2024年全球地緣衝突對黃金市場避險屬性的影響。
- 下方置中透明白框按鈕「瀏覽所有學堂內容」。

### 2.8 company-story（`4:245`，背景圖 + 遮罩 `rgba(7,10,20,0.8)`，px120，兩端對齊）
- 左 w635 gap24：kicker 金13「ABOUT HATC GROUP」；標題 32 白 ExtraBold
  「立足香港金融樞紐，誠信開拓全球格局」；body `#8e99b0` 14 leading1.65（公司故事段）；
  金色按鈕「深入了解企業故事」。
- 右 w379 靠右：巨大「008」96px ExtraBold **半透明金** `rgba(212,175,55,0.17)`；
  下方金 14 Bold uppercase「TRADE FIELD MEMBER SEAT」。

### 2.9 client-support（`4:255`，淺 `#f4f6f9`，py96 px120 gap64）
- section-title：kicker「HATC CLIENT SUPPORT」／heading `#0c111d` 36「全方位的專業客戶支援」。
- 4 張白卡（bg white border `#e4e7ec` rounded8 p24 gap16 等高）：金淡底 icon（headset 18，
  rounded20 size40）／標題 16 ExtraBold `#0c111d`／body 13 `#475467`：
  開立帳戶問題 / MT5平台操作 / 資金及出入金支援 / 市場與交易基礎。
- 下方置中金色按鈕「聯絡我們的在線專屬團隊」。

### 2.10 footer-container（`4:287`，`#070a14`，`border-top #1f293d`）
- **final-cta-band**（`4:288`，背景圖 + 遮罩 `rgba(7,10,20,0.9)`，py80 px120 gap24 置中）：
  標題 32 白 ExtraBold「立即開始您的黃金投資旅程」；body `#8e99b0` 15；雙 CTA 金實心
  「立即線上開戶」+ 透明白框「免費模擬帳戶」。
- **main-footer**（`4:296`，pt80 pb40 px120 gap64）：
  - 上排兩端對齊：品牌欄 w327（「HATC 華安泰昌」20、公司說明 `#8e99b0` 12 leading1.5）
    + 4 連結欄 w153（金 13 Bold 標題 + `#8e99b0` 12 連結 gap10）：
    關於我們（公司簡介/金銀業席位/安全與監管/最新新聞）／交易服務（倫敦黃金交易/倫敦白銀交易/
    市場交易細則/合約保證金）／MT5平台（MT5客戶端下載/移動平台操作/EA程序化支持/操作常見指南）／
    黃金學堂（基礎課程/進階分析/巨集觀基本面/技術指標解讀）。
  - 下排 `border-top #1f293d` pt32：風險聲明 `#8e99b0` 10 leading1.5；版權列 11
    「© 2024 HATC Group Limited 華安泰昌有限公司. All Rights Reserved.」+ 右側「隱私權政策 / 免責聲明」。

---

## 3. 資產（assets）

`get_design_context` 回傳的圖片/SVG URL 會過期。已先下載一份到
`public/figma/raw/*.png`（16 張，含 4 張背景圖、MT5 截圖、3 張學堂圖等）與
`public/figma/svg/*.svg`（13 個：shield / check / smartphone / headset / 折線 / 7 根蠟燭）。
實作時建議：
- **圖示**（shield / check / smartphone / headset）改用專案已有的 `lucide-react`
  （`ShieldCheck` / `Check` / `Smartphone` / `Headphones`），毋須沿用 Figma SVG。
- **背景照片 / MT5 截圖 / 學堂圖**：優先用專案 `public/` 內真實 HATC 素材
  （如 `office/*.jpg`）；Figma 的是佔位圖，可先用、上線前由業主替換。
- **K 線 / 折線**：用 SVG 或以 div 畫（示意數據，非真實行情）。

## 4. 治理紅線（重構時仍必守）

- **示意數字**（金價、K線、ticker、漲跌幅、報價卡、今日高低）一律為 **sample/佔位**，
  UI 需保留「示意數據」標記，且**不得寫入 `HATC_FACTS.md`** 冒充事實。
- **operational link**（開戶、聯絡我們、登入等）不得硬編碼 URL；沿用既有
  `getSiteSettings()` / `primaryContactHref()`（CMS）機制。
- **i18n**：所有文案進 `src/messages/{zh-Hant,zh-Hans,en}.json`，三語同步、不得寫死中文。
- 真實公司事實只引 `HATC_FACTS.md`（008 / AA / 會員資格 / 地址等）。
