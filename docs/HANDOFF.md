# HATC 交棒摘要 (Handoff)

> 最後更新：2026-10-14（第六十七輪：**報價改為推送，價格跳動 0.3 秒內上畫面**。業主回報
> 「報價輪詢不應做成這樣…現在這樣太差了」。原本是瀏覽器每 5 秒問一次，中間的每一次跳動
> 全部看不到。現在伺服器對閘道開**一條 WebSocket**、以 **SSE** 分送給所有訪客，
> 實測 **20 秒 43 筆**（原本 4 筆），並加上漲綠跌紅的閃動提示。
> 🚩 業主要的「1 秒 4 次」**市場本身給不出來**——生產閘道每 300 毫秒向 MT5 取一次且只在
> 價格真的變動時才推，實測黃金約 1.2–1.6 次/秒，硬湊成固定 4 次只能重送同一個價格。
> 詳見下方第六十七輪。
> 第六十六輪：**品牌圖示 ＋ 社群分享預覽卡** —— favicon 原本是
> **Next.js 範本預設圖示**，而且全站**完全沒有 `og:image`**，所以貼到 WhatsApp／Telegram／
> Facebook 只有純文字。現在圖示是從真實 wordmark 取出的「A ＋ 綠三角」（16px 仍可辨識），
> 分享卡是 1200×630 深色品牌卡，學院文章用自己的封面。本輪查出三個會無聲出錯的機制：
> **頁面宣告 `openGraph` 會把父層整個物件換掉（圖一起不見）**、**layout 設 `og:url` 會讓
> 每個子頁被歸給首頁**、**`Disallow: /api` 會讓 Facebook 抓不到文章封面**。詳見下方第六十六輪。
> 第六十五輪：站台改部署到 **`web.hatcmarket.com`**（上線前的暫時位址）；從外部證明
> **閘道握手每一次都失敗**（不是「遊客組沒配產品」那一關）；新增 **`stg` 環境**修掉預覽站
> 被開放索引、canonical 指向別人內容的問題。
> 第六十四輪：**部署後沒有行情** —— 從外部證明**閘道／UAT 遊客組／
> UAT 密鑰全都正常**（本機當場取到三個產品的即時價），問題在部署主機自己的設定；用端點
> 自身的 60 秒失敗快取當指紋，證明主機**有**設 `QUOTE_GATEWAY_URL`，失敗落在與閘道的那次
> 對話。並補上可診斷性：原本兩條**完全靜默**的失敗路徑現在會各印一次 log，另加
> **需管理員登入**的自我檢測端點 `/api/market/diagnostics`（`{ok:false}` 契約不變、
> 密鑰永不外洩）。詳見下方第六十四輪。
> 第六十三輪：**開發端已部署，同步他們的改動＋導出 CMS 資料**
> —— 採納 `next` 16.3.3，拒絕他們 commit 進 Gitee 的三份含憑證 `.env` 檔；**正式網域改為
> `https://www.hatcmarket.com`**（業主確認）；導出 `hatc-cms` 全庫＋`media/` 實體檔案給開發
> 匯入。**查出一個不會報錯但會讓官網完全不被搜尋引擎收錄的部署問題**（`.env.local` 蓋掉
> `config/env/prd.env` → localhost canonical ＋ 全站 noindex）。**追加：新增
> `config/env/<環境>.secrets.env`**（git-ignored，按環境的密鑰檔）—— 開發端要的是
> 「一台機器預先配好三個環境的 `DATABASE_URI`、只靠指令切換」，這是他們兩度把憑證寫進
> commit 檔案的真正動機，現在有了正規做法。詳見下方第六十三輪。
> 第六十二輪：分環境配置 `config/env/*.env`＋載入器 `scripts/with-env.mjs`＋`build:*`／
> `start:*`／`env:check`；7 個營運連結變數去掉 `NEXT_PUBLIC_` 前綴；新增 `SITE_INDEXABLE`。
> **實測更正**：營運連結即使去前綴也**不是** runtime 可切換（SSG 在 prerender 就讀掉了）。）
> 新對話請先閱讀 `AGENTS.md` 與 `docs/`（BRIEF / FACTS / STRUCTURE / DESIGN_DIRECTION），
> `.cursor/rules/*` 會自動載入。本檔記錄「目前進度與下一步」，決策細節以各文件為準。

## ▶ 下一輪任務（第六十八輪：首頁 K 線接即時報價 ＋ 可點選的產品切換）

> ## 🟩 2026-10-14 17:00 現況（最新，先看這段）
>
> **✅ 第六十九輪完成：`/funding` 的「示意數據」標籤退役 —— 出入金渠道變成對外正式資訊，
> 並刪掉會在資料庫讀不到時冒出來的 14 筆虛構渠道。順便做了全站「示意」字樣稽核。**
> 業主：「/funding 頁的示意數據拿掉，你順便檢查一下全站還有沒有此字，因為要準備上線了。」
> 詳見下方「🟢 第六十九輪」。無 schema 變更。
>
> 🚩 **上線前還剩兩處「示意」是真的佔位，需要業主素材**：首頁 MT5 區塊用的
> `public/figma/raw/raw_3.png` 是 **AI 算圖的假 MT5 畫面**（與 `HATC_FACTS.md`
> 「Trading platforms」寫的「站上已無標示為示意的平台裝置圖」直接衝突），以及 `/trading`
> hero 的 `figma/trading/hero-tablet.png`。兩者都可以改用既有的真實交易端截圖
> （`components/platforms/platformVisuals.ts` ＋ `PlatformVisualPanel`），**待業主決定**。
>
> 🚩 **正式站的出入金資料要業主自己修**：同事把**簡體**文字貼進三個語系，所以繁中站顯示
> 「银行卡支付／免费」、英文站也是中文。校對過的三語對照表在第六十九輪那一節。
>
> **✅ 第六十八輪完成：首頁服務區的 K 線可切換三個產品，當日那根蠟燭接即時報價，
> 並加上現價橫線＋每秒跳動的價格標籤。**
> 業主回報「首頁的 K 線並沒有更新」＋「我想點擊不同產品會更換指定產品的日 K」。
> 詳見下方「🟢 第六十八輪」。無 schema 變更。
>
> ✅ **已部署並於 2026-10-14 下午從外部驗證完成**（業主自行部署；程式＝GitHub `7bb2260`
> ＋ Gitee `09f351c`）。線上實測：`/zh-Hant` 的服務區有**三個** `aria-pressed` 報價卡、
> 圖表選擇器 `aria-label="選擇圖表產品"` 存在、`/api/market/bars` 三個品種皆 `ok:true`、
> `/api/market/quotes` 回真實報價、`/api/market/diagnostics` 回 **401**（不是 404 ⇒ 新版），
> 且前置 nginx 的舊快取已不再回舊 HTML（用 Chrome 完整 `Accept-Encoding` 驗過）。
> SSE 20 秒 35 幀、間隔 0.20–1.06 秒散亂 ⇒ 走真實推送，非 4.0 秒降級模式。
>
> 🚩 **判斷線上是否為新版的方法（下一棒沿用）**：不要只看畫面——打
> `/api/market/diagnostics`（舊版 404、新版 401）最快；畫面層面則數服務區報價卡是否三張。
> 部署步驟＝`DEPLOYMENT.md` §2.0b，**部署後必須再清前置 nginx 快取**
> （§2.0c，順序是先部署再清），否則使用者看到的仍是舊版。
>
> 🚩 **先說誠實的限制**：K 線的資料鏈路本來就是好的（本輪從外部逐層驗過），
> 「沒有更新」是**尺度問題**——30 根日 K 的縱軸要容下近一個月的價格範圍，
> 一次 tick 的位移是**次像素級**。接上即時報價後實測 15 秒內蠟燭實體高度
> 由 4.295 → 4.477（viewBox 單位，1 單位≈1px），**確實在動但肉眼看不出來**。
> 要「看得出來在動」只有兩條路，兩條都已向業主說明過：縮短日 K 視窗（放大縱軸），
> 或加時間週期切換（1 小時／4 小時）。**業主本輪明確選擇不做週期切換。**
>
> **正式網域 `https://www.hatcmarket.com` 已切換成這個站，並跑 `build:prd` / `start:prd`。**
> 下面「網域切換仍未發生」那幾段是切換前的紀錄，保留作為脈絡。當天切換後依序爆出三個問題，
> **全部已解、已驗證**：
>
> | 項目 | 狀態 |
> | --- | --- |
> | 行情推送 | ✅ 25 秒 45 幀、間隔散亂（真實 tick） |
> | `/admin`、`/api/users/me` | ✅ 200（曾因密鑰檔缺漏雙雙 500） |
> | SEO | ✅ `Allow: /`、每頁 `index, follow`、canonical 指 www |
> | nginx 舊快取 | ✅ 已清除；`next.config.ts` 移除 `s-maxage` 防止復發 |
>
> 1. **換環境要換密鑰檔**：`config/env/<環境>.secrets.env` 按環境名載入，目錄裡只有
>    `stg.secrets.env` → 改跑 `prd` 後四個密鑰全讀不到，行情 `{ok:false}`、後台 500。
>    修法＝複製一份成 `prd.secrets.env` **並重新 build**（只重啟無效）。
> 2. **前置 nginx 把舊 HTML 存了一年**（寶塔共用 `proxy.conf` 全域開 `proxy_cache cache_one`
>    ＋ Next 預設只送 `s-maxage=31536000`）。最陰的地方：快取鍵含原始 `Accept-Encoding`
>    字串 → **Chrome 看到舊版、`curl` 看到新版**。完整說明與清除指令＝`DEPLOYMENT.md` **§2.0c**。
> 3. **重啟 nginx 會打斷上游 WebSocket**，之後約一分鐘 SSE 間隔是固定 4.0 秒（降級模式），
>    會自己接回來 —— 不要據此判定壞掉，詳見 `DEPLOYMENT.md` §5。
>
> **🚩 未結**：`web.hatcmarket.com` 與 `www` 由**同一個 nginx server 區塊**服務
> （`server_name web.hatcmarket.com www.hatcmarket.com;`），但憑證今天重簽時只勾了 `www`
> → `web.hatcmarket.com` 的 TLS 已不匹配（`curl` exit 60）。待業主決定：補 SAN 讓兩個都能用，
> 或把 `web` 301 到 `www`。

> **✅ 第六十七輪（2026-10-14）完成：報價即時推送（WebSocket → SSE）＋ 價格閃動。**
> 詳見下方「🟢 第六十七輪」。**本輪同時把預覽主機從 `prd` 設定改成 `stg`**（業主授權
> 由我直接部署）——預覽站先前是 `index, follow` 且 canonical／sitemap 全指
> `www.hatcmarket.com`（服務的是另一個既有站）。
>
> **✅ 2026-10-14 實測：生產行情已經正常。** `https://web.hatcmarket.com/api/market/quotes`
> 回 `{"ok":true}`（黃金 4164.2）——第六十五輪補上的空值密鑰確實是唯一根因。
> 另以生產密鑰直接連 `node.hatcmarket.com` 實測：**WebSocket 推送可用**，握手 91ms、
> 第一筆 tick 176ms、三個產品全部接受訂閱。
>
> **✅ 第六十六輪（2026-10-14）完成：品牌圖示 ＋ 社群分享預覽卡。** 詳見下方
> 「🟢 第六十六輪」。上線前要記得：分享卡的 `og:image` 是絕對網址，**只有在部署主機
> 用對環境（`build:stg` 或正式的 `build:prd`）時才抓得到圖**。
>
> **🚩 2026-10-14 實測：`web.hatcmarket.com` 仍在跑 `prd` 設定，不是 `stg`。**
> `robots.txt` 是 `Allow: /` ＋ `Host: https://www.hatcmarket.com`、每頁 `index, follow`、
> canonical 指 `https://www.hatcmarket.com/zh-Hant`（而那個網址 307 轉到既有站的 `/zh-HK`，
> 內容完全不同）。`/api/market/diagnostics` 仍 404 ＝**部署的還是舊版**，
> `/api/market/quotes` 仍 `{"ok":false}`。搜尋引擎目前查不到這個網域（還沒被收錄），
> 所以**現在改成 `build:stg` 就來得及**。⚠ 若日後真的被收錄了，處置相反：要先**允許抓取
> 但保留 `noindex`**（robots.txt 擋掉抓取，爬蟲就看不到 `noindex`，頁面會卡在索引裡），
> 等移除後再擋。
>
> **✅ 第六十五輪（2026-10-14）完成：** 站台改部署到 **`web.hatcmarket.com`**（業主確認
> ＝**上線前的暫時展示位址**，正式仍會切回 `www.hatcmarket.com`）。從外部證明
> **閘道握手每一次都失敗**（不是「遊客組沒配產品」那一關），最可能是生產
> `QUOTE_HTTP_CRYPT_SECRET` 沒設或用了 UAT 的值；並新增 **`stg` 環境**修掉預覽站
> 被開放索引、canonical 指向別人內容的問題。詳見下方「🟢 第六十五輪」。
>
> **下一棒最可能要做的事**：等開發端補上生產密鑰＋部署新版後，請他們開
> `/api/market/diagnostics` 貼回 `verdict`。**預期會看到第二道關卡**
> （「握手成功但遊客交易組沒有 HATC 產品」），那是後端業務後台的設定，官網不必改碼。
>
> **✅ 第六十四輪（2026-10-13）完成：行情失效的範圍已從外部證實，並補上可診斷性。
> 詳見下方「🟢 第六十四輪」。** 結論兩句話：**閘道、UAT 遊客交易組、我們手上的 UAT 密鑰
> 全都是好的**（本機實測當場取到金 4184.65／銀 60.231／公斤條 900.04）；**問題在部署主機
> 自己的設定**，而且部署主機**確實有設 `QUOTE_GATEWAY_URL`**（用端點自身的 60 秒失敗快取
> 指紋從外部證明的，見下方方法），所以失敗發生在「對閘道的那一次對話」裡。
>
> ### ▶ 下一棒要做的事
>
> 1. **等業主把下面這段問題轉給開發端**（已整理成可直接貼的文字，見「🟢 第六十四輪」第 4 節
>    ＋下面「2026-10-13 21:00 追加」的加強版）。最快的一條：請他們把這一版部署上去，
>    登入 `/admin` 後開 **`https://www.666678910.com/api/market/diagnostics`**，
>    `verdict` 一句話就會說出原因。
> 2. 拿到 `verdict` 後對照 `docs/DEPLOYMENT.md` §5.1 的表格處理。**多數情況官網不必改碼**
>    （不是改他們的啟動指令，就是後端把產品配進遊客交易組）。
> 3. 其餘未結案項見下方 A–D、a–d、0–8。
>
> ### 2026-10-13 21:00 追加（純查證，未改任何程式碼；業主選擇「先等開發回覆」）
>
> **① 程式碼早就交付了，是開發端還沒重新部署。**
> `git fetch gitee master` → `208f1ea Sync HATC website source (c11769e)`，第六十四輪的
> 診斷端點已經在 Gitee `master` 上，開發端在那之後沒有再提交東西（與本地 `HEAD` 的唯一
> 差異是刻意排除的 `lp.zip`）。但 `https://www.666678910.com/api/market/diagnostics`
> **回 404** → 線上跑的仍是舊建置。
> 🚩 **慣例：要判斷對方有沒有部署到某一版，找那一版新增的路由打一下就好**
> （404＝舊版、401＝新版已上線）。比問「你們部署了嗎」可靠。
>
> **② 線上仍是 uat 設定。** `robots.txt` ＝ `Disallow: /`、每頁 `noindex, nofollow`、
> canonical ＝ `https://www.666678910.com/zh-Hant` → 確實是 `build:uat` 的產物。
> `/api/market/{quotes,bars}` 仍回 `{"ok":false}`（＝正常的降級答案）。
> `https://www.hatcmarket.com/` 仍 307 → `/zh-HK`（既有站台），正式切換還沒發生。
>
> **③ 業主轉述開發端新說法：「UAT 目前跑不起來，只有 prd 可以。」**
> 本倉這端實測 **`build:uat` 完全正常**（`pkill` → `rm -rf .next` → `npm run build:uat`
> 冷建綠、全頁 ● SSG、`[with-env] uat` 正確套用、`env:check` 綠），所以**不是倉庫的
> uat 路徑有 bug**；缺的是他們那邊的確切錯誤訊息。三個最可能：3000 埠被還活著的
> `start:prd` 佔住／`config/env/uat.secrets.env` 存在但 git 沒忽略（`with-env` 會 exit 1
> 並印出原因，是防呆不是 bug）／他們在找根本不會被讀取的 `.env.uat`。
>
> **④ 🚩 回答業主「這跟報價有關嗎」＝有關，而且「改用 prd」會讓事情更糟，不會更好。**
> 兩個環境在報價這條線上差的就是閘道：`uat.env` → `node.666678910.com`（第六十四輪實測
> 正常，三個產品都取得到）；`prd.env` → `node.hatcmarket.com`（**生產遊客交易組至今沒配
> 產品**＝已知後端阻塞，且生產密鑰是另一組值）。**在 UAT 主機跑 prd 設定＝連到一個確定
> 不會回報價的閘道**，同時還帶 `SITE_INDEXABLE=true` ＋ canonical `www.hatcmarket.com`
> → **測試站會被搜尋引擎收錄並與未來的正式站互搶**，而畫面上完全看不出來。
> 這個症狀**還沒寫進 `DEPLOYMENT.md` §5.1 的 verdict 對照表**（業主本輪選擇先不動），
> 下一棒若要做，第一件就是補這一列 ＋ 讓 `start:*` 在 build 與 start 環境名不一致時擋下來。
>
> ### 仍然成立的背景（第六十三輪查到，不要重新摸索）
>
> **① 🚩 最重要的發現：`www.hatcmarket.com` 目前跑的不是我們這個站。**
> 實測（2026-10-13 20:00 左右）：
>
> | 網址 | 實際內容 |
> | --- | --- |
> | `https://www.hatcmarket.com/` | 307 → **`/zh-HK`**，`<title>華安泰昌 \| 首頁` |
> | `https://www.hatchk.com/zh-HK` | **同一個站**（同標題） |
> | `https://www.hatcmarket.com/zh-Hant` | **307**（我們的 locale 不存在） |
> | `https://www.hatcmarket.com/api/*` | `{"code":1,"message":"系统繁忙！","data":[]}`（**別的後端**） |
> | `https://www.hatcmarket.com/robots.txt` | 回 **HTML**（`class="dark --font-primary …"`，不是我們的 markup） |
> | **`https://www.666678910.com/zh-Hant`** | ✅ **我們的站**（`華安泰昌有限公司 HATC Group Limited`） |
>
> 也就是說：**新官網目前只部署在 UAT 網域**，`www.hatcmarket.com` 還是既有站（和
> `www.hatchk.com` 同一個）。所謂「部署到服務器」＝部署到 `www.666678910.com`。
> 這同時給了待辦 C 一個資料點：**兩個網域現在服務同一個既有站**。
> ⚠ `HATC_FACTS.md` 寫的 `www.hatcmarket.com`＝業主確認的**目標**網域，不是現狀。
>
> **② 我們的站在 UAT 網域上是健康的，而且確實走 `build:uat`。**
> `robots.txt` 是 `Disallow: /`、每頁 `noindex, nofollow`、canonical＝`https://www.666678910.com/zh-Hant`
> → `config/env/uat.env` 的 `NEXT_PUBLIC_SITE_URL`＋`SITE_INDEXABLE=false` 有生效，
> **代表他們用的是我們的 npm script，不是裸 `npm run build`**（第六十三輪的情況已改善）。
> `/admin` 200、`/api/users/me` 回 `{"user":null,…}` → **資料庫接上了**。
> 首頁 HTML 仍標「示意數據」＝降級狀態正確，**畫面上沒有任何不實標籤，不是 UI bug**。
> （HTML 裡同時搜得到「即時報價」字樣是正常的：那是傳給 client 元件的標籤 prop，
> 真資料到了才會用上，不要誤判成「示意數字掛即時標籤」。）
>
> **③ 行情端點回 `{"ok":false}`，而 UAT 閘道本身是活的。**
> `https://www.666678910.com/api/market/{quotes,bars}` 都是 `{"ok":false}`
> （**這是設計上的正常答案**＝「沒有真資料，前台請維持示意」，不是 500）。
> 我從本機 `POST https://node.666678910.com/v1/context/resolve {"scene":"guest"}`
> 實測閘道**正常回 AES-256-GCM 信封**，所以閘道與 UAT 遊客組沒壞
> （第四十三輪確認 UAT 遊客組有 29 個白名單符號，含金／銀／公斤條）。
>
> **④ 第六十三輪的首要假設（主機缺 `QUOTE_HTTP_CRYPT_SECRET`）已被第六十四輪縮小但未排除。**
> 第六十四輪證明主機**有**設 `QUOTE_GATEWAY_URL`，所以剩下的是「對閘道那一次對話」失敗：
> 密鑰沒設／值不對、主機對外網路不通、或它連的是**生產**閘道（生產遊客組沒配產品）。
> ⚠ UAT 與生產密鑰不同（閘道專案 `deploy/env/*.env`；h5 的 `env.prd.uts` 把生產值寫成了
> UAT 值）。正規放法＝`config/env/uat.secrets.env`（git-ignored）或主機環境變數。
>
> ### 🚩 第六十三輪移交給開發端、需要追問結果的事項
>
> A. **部署機上的 `.env.local` 必須刪除** —— 這是本輪查出的 P0：開發端 commit 的
>    `.env.local` 寫著 `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 與
>    `SITE_INDEXABLE=false`，而 `.env.local` 在 production 也會被 Next 載入、且
>    `with-env.mjs` 刻意對它讓路 → **跑 `build:prd` 也修不掉**，結果是 canonical／
>    sitemap 指向 localhost、`robots.txt` 全站 `Disallow: /`、每頁 `noindex`。
>    **官網等於完全不會被搜尋引擎收錄，而畫面看起來完全正常。**
>    說明已寫給開發端（`~/Desktop/hatc-cms-export-20261013/給開發端-環境變數與憑證處理.md`
>    ＋永久版在 `docs/DEPLOYMENT.md` §2.4）。**下一棒請向業主確認開發端是否已修**，
>    驗法＝`curl https://www.hatcmarket.com/robots.txt` 應為 `Allow: /`、
>    頁面 `name="robots"` 應為 `index, follow`、canonical 應為正式網域。
> B. **兩個憑證的輪換** —— 業主 2026-10-13 決定**兩個都換**：`PAYLOAD_SECRET`
>    與 MongoDB 的 root 密碼（都已進 Gitee 的 git 歷史；倉是私有的，所以沒有公開
>    洩漏，但協作者永久可見）。步驟已寫給開發端，另建議改用非 root 的 `readWrite`
>    專用帳號、並把 27017 從公網收回。**待追問是否已執行。**
>    ⚠ **UAT 與生產目前用同一組 root 密碼 `Gold1234`**（第六十三輪追加從開發端的
>    `config/env/*.env` 看到）—— 輪換時兩台必須各用不同密碼，否則一台被攻破另一台也沒了。
> D. **開發端已連續兩次把憑證寫進 commit 的檔案**（2026-10-13 兩次 push）。第二次是
>    `DATABASE_URI` 進了全部三份 `config/env/*.env`，導致 `build:prd`／`build:uat`／
>    `build:local` 與 CI 的 `env:check` **全部 exit 1、整個建置無法開始**。
>    已移除並把替代做法寫進他們會看到的三個地方（三份檔案的檔頭、`with-env.mjs` 的
>    錯誤訊息、`DEPLOYMENT.md` §2.0／§2.3）。**下一棒同步前務必先
>    `git fetch gitee master` 並 `git diff` 檢查，不要假設他們沒有再改。**
>    ✅ **根因已處理（同輪追加）**：他們真正要的是「一台機器預先配好多個環境、
>    打包時不用改連線字串」，而當時倉內**沒有任何合法做法**能做到（只有「主機環境變數」
>    與「整機通用的 `.env`」兩條路）。現在有 `config/env/<環境>.secrets.env`
>    （`DEPLOYMENT.md` §2.3a），`build:uat`／`build:prd` 自動載入對應那份。
>    **下一棒若再看到他們把憑證放進 commit 檔案，先確認他們知道這個機制存在。**
>    另外他們的 `local.env` 曾指向 UAT 資料庫 —— 那個檔案是共用的，等於強制每個開發者
>    的 `npm run dev` 都讀寫 UAT 資料。本機請連自己的 Mongo。
> C. **`www.hatchk.com` 與 `www.hatcmarket.com` 的關係** —— 業主確認新官網**將**部署在
>    `www.hatcmarket.com`（已寫進 FACTS 與 `config/env/prd.env`），但**哪個是主站、
>    要不要 301 導向或 canonical 互指，業主尚未說明**。不得自行推定，也不得在頁面上
>    並列兩個網域。
>    ⚠ **2026-10-13 實測：這兩個網域現在服務的是同一個既有站**（`/zh-HK`、`/api/*` 由
>    別的後端回答），**我們的新站只在 `https://www.666678910.com`**。所以正式切換還沒發生
>    ——切換時必須改用 `build:prd`＋`start:prd`（才會拿到正式網域與 `SITE_INDEXABLE=true`）、
>    刪掉部署機上的 `.env.local`（待辦 A），並把 `QUOTE_GATEWAY_URL` 連同**生產**的
>    `QUOTE_HTTP_CRYPT_SECRET` 一起換成生產閘道。
>
> ### 第六十二輪新增的待業主項目
>
> a. ~~UAT 站台網域~~ —— **已結案（2026-10-13 第六十三輪追加）**：開發團隊提供
>    **`https://www.666678910.com`**，業主確認採用，已填進 `config/env/uat.env`。
>    DNS 驗證過它與 UAT 行情閘道 `node.666678910.com` 指向同一台 UAT 主機
>    （`8.210.7.28`），生產站 `www.hatcmarket.com` 在 AWS ELB，兩者不同機器。
>    **刻意不寫進 `HATC_FACTS.md`**（測試網域不是公司對外事實），紅線＝這個網域
>    只能出現在 `uat.env`，不得進生產建置、不得出現在任何頁面內容裡。
> b. **UAT 的開戶／登入／客服入口** —— 業主 2026-10-12 決定**三個全部留空**：HATC 沒有
>    UAT 版的入口，而把生產入口放進 UAT 會讓測試人員在測試站開到真帳戶。按鈕沒有目的地
>    本來就不渲染，所以留空是安全的。**不要自己編一個 UAT 網域。**
> c. ~~交付時必須告知開發端變數改名~~ —— 第六十三輪已寫進給開發端的說明文件。
> d. **追蹤工具仍未定** —— `NEXT_PUBLIC_ANALYTICS_ID` 與 `components/Analytics` 還是
>    回傳 `null` 的佔位。法律頁「未啟用任何分析追蹤」的敘述建立在這個事實上，
>    **接上追蹤工具時必須同時改 `/privacy` 的對應章節**。
>
> ### 其餘未結案事項（之後可挑，都要先問業主）
>
> 0. **公告內容** —— `/announcements` 已可用但**資料庫裡一則公告都沒有**（公司對外聲明
>    不得由程式捏造）。業主 2026-10-12（第六十一輪）選擇**自己到 `/admin → 公告` 發佈**，
>    不需要 agent 代寫；分類已備好兩個（重要公告／交易安排），可自行增刪。
>    ~~Footer 公告入口~~ 已於第六十一輪完成。仍待業主決定：**`/news`**（最新消息，CMS
>    `home-activities`，目前 0 筆）與公告定位重疊 —— 業主選擇兩者併存，若日後只用公告，
>    `/news` 連同首頁 `LatestNews` 區塊可一起退役（Footer`關於我們`欄的「最新新聞」列也要一起撤）。
>
> 1. **交易條件「執行方式」** —— `HATC_FACTS.md` 唯一仍待業主提供的交易條件（官網目前
>    刻意完全不提，**不要加回「將另行公佈」佔位列**，第五十八輪決定）。
> 2. **模擬帳戶連結** —— 業主未提供，全站模擬按鈕因此不渲染（設計行為）。
> 3. **會員登入連結** —— 同上，頁首「登入」目前不顯示。
> 4. **MT5 的 EA 支援** —— `platforms.faq.items[3]` 與 CMS `faqs` id=12 聲稱支援 EA，
>    業主說會正式確認為事實但**尚未確認**；在那之前不得據此在別處新增 EA／量化文案。
> 5. **法律頁審核** —— `/privacy`、`/disclaimer` 是保守版草稿，待業主／法務逐條審核；
>    改動文字時必須同步更新 `legal.updatedAt`。
> 6. **生產環境行情** —— 生產遊客交易組仍未配產品（403 `SYMBOL_NOT_ALLOWED`），
>    首頁停在示意數據。**後端配好即自動變真，官網不需改碼。**
> 7. **About 區段錨點** —— Footer「關於我們」欄三個連結都指 `/about` 且該頁沒有任何
>    區段 id（第五十七輪業主決定暫不處理）。
> 8. **舊 Postgres 容器** —— `hatc-postgres` 仍在本機跑著（內含換引擎前的資料）。
>    確認 MongoDB 一切正常後可由業主刪除：`docker rm -f hatc-postgres`。

## ▶ 交付狀態：開發團隊從 Gitee 部署（2026-10-12 起）

> **GitHub `origin` 是唯一來源與完整歷史**（`https://github.com/skyyuch/HATCwebsite.git`）；
> **開發端從 Gitee `master` 部署**（`git@gitee.com:spingpeng/homeindex.git`）。
>
> - **更新交付＝`sh scripts/sync-gitee.sh`**（工作區要乾淨）。它以 `gitee/master` 為 parent
>   疊一個 tree 等於本地 `HEAD` 的 commit，**排除 `lp.zip`**（4 MB 設計素材，部署用不到）。
> - 🚩 **絕對不要 `git push gitee main`。** 完整歷史＝**39.6 MiB** 物件（幾乎全在最初幾個
>   commit 的圖片），業主上行 3–13 KiB/s，第五十八輪兩次都被 Gitee 的 receive-pack 時限砍掉
>   （69 分鐘連線中斷／57 分鐘 `Grpc Receive Pack error: DeadlineExceeded`）。
>   **增量同步實測只送 18 KiB、5 秒完成。**
> - **Gitee 是獨立血統的部署鏡像**（開發端當初用 zip 匯入成單一 commit `cd2692b`，與我們的
>   `main` 無共同祖先），本地以分支 `gitee-main` 記錄鏡像最新點。完整歷史只在 GitHub。
> - **zip 交付（`git archive`）已退役**，只在對方無法用 git 時備用；屆時要提醒對方
>   `chmod +x` 腳本檔（zip 會丟掉執行權限）。
> - **部署交接文件＝[`docs/DEPLOYMENT.md`](DEPLOYMENT.md)**（給開發／維運讀，繁中）。
>   本檔（HANDOFF）是內容／設計決策史，不要拿去當部署手冊。
> - ⚠ **交接時務必一併提醒開發**：① **MongoDB 不需要建表、沒有 migration 步驟**
>   （舊說明要求的 `npm run migrate` 指令已不存在）；② **頁面文案類 global 要保持留空**
>   （填入就會永久覆蓋內建三語文案，日後修正看不見）；③ **按鈕沒有目的地就不顯示**
>   （模擬帳戶、會員登入）是設計行為不是 bug；④ **交易條件刻意不開放後台編輯**（治理設計）。
## 🟢 第六十九輪（實作，2026-10-14）：`/funding` 示意數據退役 ＋ 全站「示意」稽核

> 業主：「/funding 頁的示意數據拿掉，你順便檢查一下全站，還有沒有此字，因為要準備上線了。
> 另外，同事在 CMS 處理了出入金渠道，但目前只是 3 個語言用同一個值，那要怎麼處理比較好？」

### 1. 拿掉標籤的前提＝必須同時刪掉虛構後備（本輪最重要的一條）

`funding-methods` 自第三十六／三十七輪起是「示意表」，所以 `lib/fundingMethods.ts` 有一層
i18n 後備種子 `funding.{deposit,withdraw}.methodsSample`。那份種子是 **Figma 範本的虛構渠道**：
入金 8 列（Visa/Mastercard、Apple Pay/Google Pay、銀聯、SWIFT 電匯、Neteller、Perfect Money、
Fasapay、JCB）、出金 6 列（Visa/Mastercard、銀聯原路返回、網上銀行轉帳、國際電匯、Neteller、
Skrill）——**HATC 一個都沒有**。

只把「示意數據」badge 拿掉、種子留著的話，只要資料庫讀不到、或某個 `type` 沒有啟用列，官網就會
把這 14 個不存在的渠道**當成正式渠道、而且毫無標示**印出來。業主拍板 **「空就隱藏整個表格區塊」**
（＝見證 `testimonials`／最新消息／公告的同一條「不造假、空則中性隱藏」紅線）。落地：

- `lib/fundingMethods.ts` **沒有 fallback**：無 DB／讀取失敗／空清單一律回 `[]`。
- `FundingMethods.tsx` 收到 0 列就 `return null`（移除 badge 與 `productsAll.table.sampleLabel` 的引用）。
- `scripts/seed-funding.ts` 的渠道種子**整段移除**，只留背景圖連結（圖片欄沒有 i18n fallback 層，
  種圖仍安全，這點第五十七輪已確立）。
- i18n 三語刪 `funding.{deposit,withdraw}.methodsSample`（14 列 × 4 欄）＋
  **`productsAll.table.sampleLabel`**（`/products/all` 的 badge 早在第四十七輪移除，它只剩
  `/funding` 在借用，本輪成死鍵）→ **732 → 675 鍵**。

**實測**：`DATABASE_URI=` 空值冷建後 `/funding` 的 `zh-Hant` 靜態 HTML **`<tbody>` 0 個**、
`Neteller`／`Skrill`／`Visa` 各 0 次，rendered `<h2>` 只剩「如何將資金存入…／如何從…提取資金？／
經常查詢的交易支援主題／準備好開始了嗎？」＝兩個表格區塊完整消失，頁面照常 200。
⚠ 降級時會變成三個連續的淺色區塊（入金 intro → 出金 intro → 支援主題），版面偏平但可接受。

### 2. 文案改寫（三語，紅線對齊）

- `funding.{deposit,withdraw}.note` 改成**不承諾**的說明：處理時間為一般情況下的預估、實際到賬／
  入賬時間受銀行／支付機構／區塊鏈網絡影響；**手續費欄只涵蓋華安泰昌收取的費用**，第三方費用
  不在此列 —— 這一句同時對齊 `HATC_FACTS.md`「交易手續費全免**不含**入金／出金費用」。
- `metadata.funding.description` 移除「出金渠道與時間為示意數據，實際條件以官方公告為準」
  （SEO 規則：`metadata.*.description` 與頁面內容受同一套紅線管轄，第五十五輪）。
- `collections/FundingMethods.ts`：欄位標籤去掉「（示意）」，集合說明改為「存進來就是客戶看到的
  內容、沒有預設資料、整張表留空則不顯示」，並在 `time`／`fee` 欄位加上**不得寫成保證到賬時限**、
  **不得寫「免任何費用」**的提示。**這些值仍不寫入 FACTS**（營運資訊會變動，不是交易條件）。

### 3. 🚩 localized 欄位被填成同一份值（業主本輪另問的問題）

線上三語的表格內容**完全相同且全部是簡體**：繁中站顯示「银行卡支付／免费／视区块链处理时间」、
英文站也是同一份中文。根因不是程式——Payload `localization.fallback: true` **只在某語系為空時**
回退到 `zh-Hant`，三個語系都有值就各自顯示，所以**「把同一份文字貼進三個語系」比「留空」更糟**。

**慣例**：要嘛三語都填對，要嘛**只填 `zh-Hant` 讓其餘留空**（後台 Save 旁的「一鍵機器翻譯」可
產生另兩語草稿，第三十二輪起內建，需主機設 `MT_API_KEY`）。集合說明已寫進這一條。

**本機 DB 已換成校對過的三語版本（6 列，取代原本 14 筆虛構種子）**；正式站資料由業主自行修正。
對照表（入金 4 列、出金 2 列；`free` 勾選＝手續費顯示綠色）：

| 類型 | 繁體中文 | 简体中文 | English |
| --- | --- | --- | --- |
| 入金 | 銀行卡支付 ｜ 15 - 30 分鐘 ｜ 免費 ｜ CNY | 银行卡支付 ｜ 15 - 30 分钟 ｜ 免费 ｜ CNY | Bank card payment ｜ 15 – 30 minutes ｜ Free ｜ CNY |
| 入金 | 支付寶 ｜ 15 分鐘內 ｜ 免費 ｜ CNY | 支付宝 ｜ 15 分钟内 ｜ 免费 ｜ CNY | Alipay ｜ Within 15 minutes ｜ Free ｜ CNY |
| 入金 | 微信 ｜ 15 分鐘內 ｜ 免費 ｜ CNY | 微信 ｜ 15 分钟内 ｜ 免费 ｜ CNY | WeChat Pay ｜ Within 15 minutes ｜ Free ｜ CNY |
| 入金 | 數字貨幣 ｜ 視區塊鏈處理時間 ｜ 視區塊鏈手續費 ｜ USDT-ERC20、USDT-TRC20、USDT-Polygon | 数字货币 ｜ 视区块链处理时间 ｜ 视区块链手续费 ｜ USDT-ERC20、USDT-TRC20、USDT-Polygon | Cryptocurrency ｜ Depends on blockchain confirmation ｜ Blockchain network fee ｜ USDT-ERC20, USDT-TRC20, USDT-Polygon |
| 出金 | 網上銀行卡轉賬（本地銀行）｜ 一個工作天內 ｜ 免費 ｜ CNY | 网上银行卡转账(本地银行) ｜ 一个工作天内 ｜ 免费 ｜ CNY | Online bank card transfer (local bank) ｜ Within one business day ｜ Free ｜ CNY |
| 出金 | 數字貨幣 ｜ 視區塊鏈處理時間 ｜ 免費 ｜ USDT-ERC20、USDT-TRC20、USDT-Polygon | 数字货币 ｜ 视区块链处理时间 ｜ 免费 ｜ USDT-ERC20、USDT-TRC20、USDT-Polygon | Cryptocurrency ｜ Depends on blockchain confirmation ｜ Free ｜ USDT-ERC20, USDT-TRC20, USDT-Polygon |

⚠ 英文的「微信 → WeChat Pay」與「數字貨幣 → Cryptocurrency」是我按通用產品名譯的，業主可改。
簡體一欄是同事原本輸入的字面值（只補了數字與單位之間的空格），繁體是逐字轉換。

### 4. 全站「示意」稽核（14 筆，逐一分類）

**稽核方法**：掃 `src/messages/*` 的**鍵路徑**，不要只 grep `*.tsx` —— 絕大多數命中都在 i18n
字串裡，元件檔只看得到 `t('sampleData')` 這種取鍵呼叫。

| 分類 | 鍵 | 處置 |
| --- | --- | --- |
| 行情降級標籤（**紅線必須留**） | `home.heroV2.sampleData`、`home.goldServices.chartSample` | 保留 —— 標籤隨資料來源切換，拿不到行情時必須標示 |
| 對降級標籤的說明（仍為真） | `home.footerV2.risk`、`legal.disclaimer.sections[2].{heading,body[1]}` | 保留 |
| **真的是佔位圖，待業主素材** | `home.mt5.screenshotAlt`（`figma/raw/raw_3.png` ＝ AI 算圖的假 MT5 畫面）、`trading.hero.imageAlt`（`figma/trading/hero-tablet.png`） | **待業主決定** |
| 裝飾背景圖描述 | `home.heroV2.bgAlt`、`home.finalCta.bgAlt`、`products.hero.bgAlt` | 保留（「示意圖」＝illustration，合理） |
| 本輪移除 | `metadata.funding.description`、`funding.{deposit,withdraw}.note`、`productsAll.table.sampleLabel`（刪鍵） | 已處理 |

🚩 **首頁 `raw_3.png` 與 FACTS 直接衝突**：`HATC_FACTS.md`「Trading platforms」寫著
「官網現已改用真實交易端截圖……**站上已無標示為「示意」的平台裝置圖**，相關文案不得再這樣描述」，
但首頁 MT5 區塊仍是 Figma 的 AI 算圖（含浮動金塊的假 MT5 畫面），第五十二輪就列為待業主決定。
素材與元件都現成（`platformVisuals.ts` 的 `resolvePlatformVisual()` ＋ `PlatformVisualPanel`），
換掉是小工程，**但屬首頁視覺變更，需業主同意再動**。

另註：`funding-page` global 的媒體 `alt` 雖然含「（示意）」（種子寫的），但 `FundingHero`／
`FundingIntro`／`FundingCta` 三個元件都用 `alt=""`（裝飾圖），所以不會進畫面，無需處理。

### 5. 驗收

`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check`
三語 **675 鍵**／`env:check` 通過／冷建綠且維持 **53 個 ● SSG**。`npm start` 實測三語
`/funding` 200，桌機 1440／平板 834／手機 390 截圖逐一看過（手機維持橫向捲動＋捲動提示）。
另以 `DATABASE_URI=` 空值冷建驗證空資料路徑（見第 1 節）。未動 schema，`generate:types` 無變更。

### 6. 待業主

- (a) **正式站 CMS 的三語內容**（現為三語同一份簡體）——對照表見第 3 節。
- (b) 首頁 `raw_3.png` 與 `/trading` hero 佔位圖是否改用真實交易端截圖。
- (c) 若要讓「一鍵機器翻譯」在正式站可用，主機要設 `MT_API_KEY`（Gemini，server-only）。

## 🟢 第六十八輪（實作，2026-10-14）：首頁 K 線接即時報價 ＋ 可點選的產品切換

> 業主兩句話：「1. 首頁的 K 線並沒有更新 2. 我想點擊不同產品會更換指定產品的日 K」。

### 1. 「K 線沒有更新」的真正原因＝尺度，不是壞掉

從外部逐層排除（方法可重用）：

- `/api/market/bars?symbol=…` 線上三個品種**全部**回到當天那根（10-14），
  回應帶 `cache-control: no-store`，**沒有**被前置 nginx 的 `proxy_cache` 吃掉
  （帶 Chrome 完整 `Accept-Encoding` 驗過）。70 秒前後收盤價 4151.81 → 4152.29。
- 前台 DOM 讀到的狀態標籤是「日 K 線（MT5 行情）」而非「示意數據」，
  日期軸到 10/14 ⇒ 畫的確實是真資料。
- **算術**：30 根日 K 的縱軸要容下 4144–4435（291 美元），映射到 136px 繪圖區
  ⇒ **1 美元＝0.47px**。一次 tick 的 0.5 美元＝0.22px。再怎麼「更新」都看不見。

**業主拍板：不加時間週期切換，只做「當日那根蠟燭接即時報價」。**
（我已把「要看得出來在動只能縮短視窗或加週期切換」講清楚，業主選擇現況。）

### 2. `withLiveCandle()` —— 當日蠟燭由 tick 重新定價

新函式在 [`src/lib/marketQuoteTypes.ts`](../src/lib/marketQuoteTypes.ts)（純邏輯、無
`server-only`，client 可用）：

```
close = quote.bid（bar feed 本來就是 priceType=bid，兩者同口徑）
high  = max(bar.high, quote.high ?? bid, bid)
low   = min(bar.low,  quote.low  ?? bid, bid)
```

🚩 **只有 tick 真正所屬的那個 bucket 可以動**：`quote.ts` 必須落在
`[last.time, last.time + 24h)`。跨日之後閘道還沒發佈新 bucket，若把昨天那根
用今天的價格拉長，等於畫出一根從未成交的蠟燭（＝「真價格旁不放假走勢」紅線）。
`quote.high/low` 是 `tickStat` 的**當日** BidHigh/BidLow，所以也只有在這個
條件成立時合併才正確。值沒變就回原陣列，避免每次 render 產生新物件。

實測（`npm start` 對 UAT 閘道，15 秒取樣 6 次）：蠟燭實體高度
4.2947 → 4.3170 → 4.3133 → 4.3394 → 4.4663 → 4.4775（viewBox 單位）＝**確實逐 tick 在動**。

### 2a. 現價橫線 ＋ 價格標籤（業主選定，解決「看不出來在動」）

蠟燭的位移是次像素級，但**標籤上的數字每秒都在跳**，所以一眼就看得出圖是活的。
實測 12 秒：4,149.69 → 4,149.66 → 4,149.86 → … → 4,149.94，線的位置
73.07% → 72.96%。

- 金色虛線橫跨繪圖區 ＋ 右端金色價格籤（`ServiceChart` 的 `currentPrice` prop）。
- 🚩 **標籤必須是 HTML、不能用 SVG `<text>`**：那張 svg 是
  `preserveAspectRatio="none"` 橫向拉伸約 2.1 倍，SVG 文字會跟著變形。
  改成絕對定位的 HTML 疊在 `relative` 容器上，`top` 用百分比。
- 🚩 **`buildCandles` 改名 `buildPlot`，同時回傳 `y(price)`**，讓橫線與蠟燭
  **共用同一條價格尺規**（分開算遲早會對不上）。因為 `withLiveCandle` 已把
  即時價併進最後一根的 high/low，縱軸範圍必然涵蓋現價，不需要額外 clamp。
- **沒有即時報價就不畫**（示意模式、或有 K 線但無 tick）——標籤不得把示意序列
  或過期的 bar 收盤價標成「現價」。已用空 `QUOTE_GATEWAY_URL` 實測確認不出現。
- 標籤 `aria-hidden`：它重複的是下方那張報價卡的數字，否則螢幕閱讀器會唸兩次。

### 3. 三張報價卡＝產品切換器

- `ServicePriceCards` 改由 **`MARKET_SYMBOLS` 驅動**（不再是寫死兩張卡），
  所以卡片、跑馬燈、FACTS 的產品清單**不可能再漂移**——順手補上原本缺席的
  **人民幣公斤條**（站上跑馬燈早就有三個，只有這裡少一個）。
- 卡片變成 `<button aria-pressed>`，選中＝金色外框；`role="group"` 掛
  `chartPicker` 作為 aria-label。
- `ServiceMarketPanel` 持有 `selected` state、改用 `useLiveQuotes()`（一個 hook
  取全部，不必為每個品種各叫一次 `useLiveQuote`）、把 `useDailyBars(selected)`
  的結果餵進 `withLiveCandle`。
- **圖表標題在 server 端先把三個品種都格式化好**（`chartTitles` record）再傳給
  client，這樣 client 面板不需要自己帶一份 translator。
- `SAMPLE_PRICE_CARDS` 由陣列改成 **`Record<MarketSymbol, …>`**，缺品種會是型別錯誤。

### 4. i18n（三語 730 → **732 鍵**）

- 刪 `home.goldServices.chartSymbol`（寫死的 "XAU/USD (倫敦金)"）。
- 加 `chartTitle` = `"{symbol} ({name})"`（標題隨選取的產品變）、
  `chartPicker`（選擇器的 aria-label）、`loco.kilobar`（人民幣公斤條／
  人民币公斤条／RMB Kilobar，英文沿用站上既有譯法）。

### 5. 驗收

`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit`／
`i18n:check` 三語 732 鍵／`env:check`／冷建綠且全頁維持 ● SSG。
`npm start` 對 UAT 閘道實測：三個品種 bars 皆 `ok:true`（⚠ UAT 的 `RKGCNH`
只有 9 根，生產是 30 根，`MIN_BARS=5` 以上就會畫）；以 CDP 點過三張卡，
標題／日期軸／蠟燭數都跟著換；`QUOTE_GATEWAY_URL=` 空值重跑 ⇒ 完整退回
示意蠟燭＋「示意數據 (設計佔位)」雙標籤。版面看過 1440／834（英文）／390。

⚠ **本輪沒有部署。** 要上線照 `DEPLOYMENT.md`：部署後**必須**清前置 nginx 快取
（`rm -rf /www/server/nginx/proxy_cache_dir/* && nginx -s reload`，先部署再清）。

### 6. 環境雷（又中一次，記錄備查）

`pkill -f "next start"` 之後**立刻** `rm -rf .next && npm run build` 仍然失敗，
錯誤訊息是看起來毫不相干的 `next/font/google queries have exactly one entry`。
第五十八輪已記錄過：殘留程序在搶 `.next`。**處置＝先 `ps aux | grep next` 確認
真的沒有程序，再 `rm -rf .next` 重建一次**（不要去查 Google Fonts 連不連得到）。

另外：用 `&` 背景啟動的 headless Chrome **會隨指令結束被收掉**，截圖腳本會
`ECONNREFUSED`。要當成常駐背景任務跑（同第四十九輪對 `npm start` 的記錄）。

## 🟢 第六十七輪（實作，2026-10-14）：報價改為推送 ＋ 價格閃動

> 業主原話：「我想做報價輪詢，不應做成這樣，可以做 1 秒 4 口，現在這樣太差了。」

### 1. 🚩 先更正需求本身：「1 秒 4 次」是市場給不出來的

生產閘道 `TICK_INTERVAL_MS=300`（UAT 400），而且 `WsGateway.pushTicks` **對每個 session
按 `fingerprint(symbol|bid|ask|spread|last|volume|datetimeMsc)` 去重**——價格沒動就不推。
以生產閘道實測 20 秒：**黃金 24 筆（1.21/s）、人民幣公斤條 15 筆、白銀 12 筆**。
所以固定每秒 4 次只能靠**重送同一個價格**，那是讓畫面看起來在動而已。

本輪的驗收標準改成「**每一次真實價格變動都在 0.3 秒內上畫面**」：
實測 SSE **20 秒 43 筆、連續重複 0 筆**（原本 5 秒輪詢＝20 秒 4 筆）。

### 2. 架構：一條上游 WebSocket → SSE 扇出

```
閘道 wss://node.*/ws ──(1 條/每個 Node 程序)──> 本站 marketQuoteHub
                                                     │
                      /api/market/stream (SSE) ──────┴──> 每位訪客
```

- **`src/lib/marketGateway.ts`（新）**＝從 `marketQuotes.ts` 抽出的共用底層：設定、
  AES-256-GCM 信封、guest context 握手、狀態變更才印一次的 `report()`。
  HTTP 讀取與 WebSocket 兩條路**共用同一份**，不要再各自複製一份解密／握手邏輯。
- **`src/lib/marketQuoteHub.ts`（新）**＝單例 tick hub。第一位訂閱者進來才連線，
  最後一位離開 **30 秒**後斷開（閒置站台不佔連線）。
- **`src/app/api/market/stream/route.ts`（新）**＝SSE。**payload 與
  `/api/market/quotes` 完全相同**（含 `{ok:false}` 契約），兩者不得分岔。

**🚩 tick 只有 bid/ask，沒有日統計。** 漲跌幅需要 `tickStat.PriceClose`、最高／最低需要
`BidHigh/BidLow`，那些只有 HTTP `symbol-detail` 有。所以 hub 以 HTTP 快照打底
（每 **60 秒**刷新一次），WebSocket 的 tick 疊在上面、用存下來的 `previousClose` 重算漲跌。
為此 `marketQuotes.ts` 新增 `getQuoteSnapshots()`（回傳 `{quote, previousClose}`），
`getLiveQuotes()` 變成它的 `.map()`。

**降級是分層的，不是全有全無**：
① WebSocket 連不上／這個 runtime 沒有 `WebSocket` → hub 自動改用**每 2 秒** HTTP 快照，
照樣走 SSE 推給前台（仍比舊的 5 秒好）；② 瀏覽器開不了 SSE（連續 3 次 error）→
`LiveQuotesProvider` 自動退回輪詢 `/api/market/quotes`；③ 完全沒有行情 → `{ok:false}`
→ 前台照舊顯示「示意數據」。

**不浪費頻寬的兩個細節**：hub 的 `emit()` 以 `symbol:bid:ts:high:low` 做指紋，**狀態沒變
就不送**（否則降級時會每 2 秒送一筆一模一樣的 `{"ok":false}`）；SSE 端再以 **200 毫秒**
合併視窗，三個品種同時跳動只送一幀。

### 3. 🚩 Node 22 的全域 `WebSocket`，不要加 `ws` 套件

`marketQuoteHub.ts` 用的是 **Node 內建的全域 `WebSocket`**（v22 起穩定，生產主機是
v22.22.3）。閘道的 WS **沒有 origin 檢查**（`server.on('upgrade')` 只看 pathname），
而且 **WS 訊息是明文 JSON、不套 AES 信封**（只有 HTTP 回應才套），所以伺服器端連線
不需要任何額外相依。若日後 runtime 沒有全域 `WebSocket`，hub 會自己印一行 log 並退回輪詢。

**contextToken 過期不會殺掉已連上的 socket**：閘道只在 handshake 時 `contextStore.get()`，
之後 session 持有的是 context **物件參照**（TTL 10 分鐘，`QuoteContextStore`）。
所以**不需要**為了續約定期重連。斷線偵測改用**應用層 ping/pong**（每 30 秒 `{"op":"ping"}`，
75 秒完全沒有任何 frame 才判定死亡）——**不能用「多久沒 tick」判斷**，週末休市本來就不會有 tick。

### 4. 🚩 SSE 最大的部署風險是反向代理的緩衝

nginx 預設 `proxy_buffering on`，會把 tick 累積成一陣一陣。回應已帶
**`X-Accel-Buffering: no`** ＋ `Cache-Control: no-transform`，nginx 認這個 header，
**正常不需要改 nginx 設定**。每 15 秒送一次 `: ping` 註解，避免代理因閒置切斷。
驗收指令寫在 `DEPLOYMENT.md` §5（不需登入即可跑）。

### 5. 價格閃動（業主選定）

`src/components/market/FlashOnChange.tsx` ＋ `globals.css` 的
`.price-flash-up/.price-flash-down`（450ms，emerald/red 淡出，`prefers-reduced-motion`
下不動畫）。套在四處：首頁跑馬燈、hero 金價卡、服務區金／銀價卡、`/trading` 即時價格欄。

三個實作重點：
- **傳數值、不要傳格式化後的字串**（`value={quote?.bid ?? null}`）：格式化會四捨五入，
  兩個不同價格可能印出同一串字，那一次跳動就不會閃。示意資料一律傳 `null`＝永不閃。
- **CSS 動畫不會自己重播**：同一個 class 還掛著時再次變動不會重新觸發，所以用
  `key={nonce}` 讓那個 `<span>` 重新掛載。
- **🚩 不能用 `useRef` 在 render 期間比較前後值**——本倉的 React 編譯器 lint
  （`react-hooks/refs`）會直接報 error。改用 React 官方的「render 期間比較
  `useState` 存的上一次 props」寫法。
- 閃動用 `background-color` ＋ `box-shadow` 同色擴散，**不加 padding**，否則跑馬燈
  每跳一次就位移一次。

### 6. 其他

- `sparkline` 取樣改成**每 2 秒最多一點**、保留 90 點（≈3 分鐘）。推送後每秒好幾筆，
  若照單全收，48 點只剩 30 秒視窗、線會變成雜訊。畫的仍然只有**實際觀測到的價格**。
- `/api/market/diagnostics` 加 `stream` 區塊（`mode`: `push`/`polled`/`idle`、
  `socketOpen`、`subscribers`、`lastTickAgoMs`）。**密鑰相關輸出一字未改**。
- `LiveQuotesProvider` 在分頁隱藏時**關閉** SSE（伺服器端因此能釋放上游 socket），
  回到前台再開。

### 7. 已部署到 `web.hatcmarket.com`（2026-10-14，業主授權我直接上）

本輪**同時**把預覽主機從 `start:prd` 換成 **`start:stg`**，並把 `/project/hatc-web`
從「解壓縮的目錄」改成 **GitHub 的 git checkout**（開發端先前無法 `git pull`，這也是他們
一直停在舊版的原因）。主機實際組態（寶塔 Node項目、node 路徑、sudo PATH 陷阱等）
已寫進 `DEPLOYMENT.md` **§2.0b**，下一棒不必重新摸索。

線上實測結果：

- `robots.txt` → `Disallow: /`、每頁 `noindex, nofollow`、canonical →
  `web.hatcmarket.com`（先前三項全錯，canonical 指向服務**另一個站**的 `www.hatcmarket.com`）
- `/api/market/stream` **22 秒 30 幀，間隔 0.23–2.23 秒平均散佈** → 前面那層 nginx
  有認 `X-Accel-Buffering: no`，**沒有被緩衝**；間隔多在 0.5 秒而非整齊的 2.0 秒，
  也同時證明走的是 WebSocket 推送而非降級輪詢
- 瀏覽器實測三個品種持續跳動，`price-flash-up`／`price-flash-down` 兩個方向都有出現

🚩 **驗線上畫面務必先繞過瀏覽器快取**（`?cachebust=…`）。第一次測時瀏覽器給的是部署前的
bundle，樣式表雜湊與 `curl` 拿到的 HTML 不一致，看起來像「閃動功能壞掉」，實際上只是舊快取。
**比對 HTML 裡的 `.css` 檔名與瀏覽器實際載入的是否相同**，是最快的判別法。

舊版目錄保留為 `/project/hatc-web.bak-20261014`（含舊 `node_modules` 與 112MB 的
`homeindex.zip`），確認穩定後可刪。

### 8. 驗收

`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit`／`i18n:check`
**三語 730 鍵不變**（本輪沒有任何新文案，閃動是純視覺）／`env:check`／冷建綠且全頁維持
● SSG。`npm start` 實測：SSE 20 秒 43 幀、`{ok:false}` 降級路徑（`QUOTE_GATEWAY_URL=`
空值）正確、`/api/market/bars?symbol=EURUSD` 仍 `{ok:false}`（品種鎖未放寬）、
`diagnostics` 匿名 401、三語首頁與 `/trading` 皆 200。瀏覽器實測 8 秒內跑馬燈出現
27 個不同價格、閃動 class 持續出現。

---

## 🟢 第六十六輪（實作，2026-10-14）：品牌圖示 ＋ 社群分享預覽卡

> 業主原話：「我看到 favicon 是沒有 hatc 的 logo，需要更換。另外…在不同媒介（例如 whatsapp,
> telegram 等）都需要顯示到公司 logo 及內容。」＝兩件不同的事：瀏覽器／手機圖示，以及
> Open Graph／Twitter Card 分享預覽卡。

### 1. 修掉的兩個問題

| 項目 | 原狀 | 現狀 |
| --- | --- | --- |
| `src/app/favicon.ico` | **Next.js 範本預設圖示**（建立時間與 `next.svg`／`vercel.svg` 同批），只有 16／32 | HATC 標記，16／32／48 |
| `icon.png`／`apple-icon.png` | 不存在 → 手機「加到主畫面」沒有品牌圖示 | 512（圓角）／180（滿版） |
| `og:image`／`twitter:image` | **完全沒有** → WhatsApp／Telegram／Facebook 分享只有純文字 | 品牌卡 1200×630；學院文章用自己的封面 |
| `twitter:card` | `summary`（因為沒有圖） | `summary_large_image` |
| `OrganizationJsonLd` | 沒有 `logo` | 加上 wordmark（搜尋引擎的組織標誌） |

### 2. 業主拍板（`AskQuestion`，2026-10-14）

① **圖示＝深藍底白色標記、圓角**（不是白底、也不是滿版方形）；② **分享卡＝深色交易檯**
（配合使用者點進來看到的首頁深色系，不是品牌深藍或白底）；③ **學院文章用 CMS 封面當縮圖、
沒有封面的頁面（含公告）退回品牌卡**。

### 3. 圖示為什麼是「A ＋ 綠三角」而不是整個 HATC 字樣

字樣是 **3.4:1 橫式**，壓進 16px 分頁只是一團糊（已做 16／32px 對照才決定）。標記是用
**連通區域標記（connected-component labelling）** 從真實 logo 裡取出來的，**不是重畫**：
`A` 與隔壁 `T` 的 x 範圍重疊（A 右腳到 1660、T 橫畫左端從 1588 起），**矩形裁切一定會
框到 T 的一截**。`icon.png` 圓角、`apple-icon.png` **刻意滿版**——iOS 會自己套 squircle
遮罩，預先圓角會變成雙重圓角、navy 角落外露。

### 4. 🚩 `openGraph` 是整個物件被覆蓋，不是深層合併（本輪最重要的發現）

頁面只要宣告 `openGraph: {title, description, type}`，**父層的 `openGraph` 整個被換掉，
圖一起消失**，而 `twitter` 若沒宣告則照常繼承 → 同一則公告**分享到 WhatsApp／Facebook
沒有圖、分享到 X 有圖**，而且毫無錯誤訊息。`/academy/[slug]` 則是反過來：`og:image` 是
文章封面、`twitter:image` 卻是品牌卡（兩個平台顯示不同的圖）。
**處置**：分享卡改成 `src/lib/seo.ts` 的 **`SHARE_CARD`**（`public/brand/share-card.jpg`），
由 layout 同時給 `openGraph.images` 與 `twitter.images`；兩個詳情頁各自明確宣告。
**刻意不用 Next 的 `opengraph-image.jpg` 檔案約定**——它掛在單一 segment 上，正好會被
「宣告了 `openGraph` 的子頁」弄丟，而且放在 `[locale]` 下產生的網址是
`/-/opengraph-image-xxx.jpg`（`[locale]` 被代換成 `-`）。

### 5. 🚩 不要在 layout 設 `og:url`

本輪一度加上去，實測 `/privacy` 的 `og:url` 變成首頁 → **抓取端把 `og:url` 當成被分享的
正規網址**，等於每個子頁分享出去都被歸給首頁。layout 不可能知道當前路徑，所以**已移除**；
沒有 `og:url` 時抓取端會用實際抓到的網址，是正確的。只有知道自己路徑的頁面才設
（`/academy/[slug]`、`/announcements/[slug]` 已設）。

### 6. 🚩 `robots.txt` 原本會擋掉文章縮圖

學院文章封面是 `/api/media/file/…`，而原本是 `Disallow: /api`。**Facebook／WhatsApp 的
抓取器會遵守 robots.txt** → 文章分享永遠沒有縮圖。已加 **`Allow: /api/media/`**（維持
`Disallow: /api` 擋其餘端點）。**不要把這條合併回去。**

### 7. 檔案

- **`scripts/generate-brand-images.mjs`**（新）＝從 `public/brand/hatc-logo.png` 一次產出
  `favicon.ico`／`icon.png`／`apple-icon.png`／`public/brand/share-card.jpg`。圖示只用
  sharp（含自寫的 ICO 容器，sharp 不能寫 .ico）；**分享卡用無頭 Chrome 排版截圖**，因為
  Sora 沒有中文字、中文要靠系統字體（PingFang TC）→ **這一步依賴 macOS ＋ 網路**，committed
  的 JPEG 才是正式產物。
- 卡片是 **JPEG 61 KB**（同一設計 PNG 要 350 KB，部分通訊軟體會跳過過大的預覽圖）。
- 順手刪掉 5 個從未被引用的 Next 範本素材（`public/{next,vercel,file,globe,window}.svg`）。

### 8. 驗收

`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit`／`i18n:check`
**三語 730 鍵不變**（卡片的 alt 重用 `common.brandFull`，**沒有新增鍵**）／`env:check`／
冷建綠且全頁維持 ● SSG。逐頁檢查建置產物的 `og:`／`twitter:` 標籤：首頁、`/privacy`
（無自有圖）、公告詳情（品牌卡）、學院文章（封面，兩個平台一致）、英文版 alt 為
`HATC Group Limited`。`npm start` 實測 `/brand/share-card.jpg`、`/favicon.ico`、
`/icon.png`、`/apple-icon.png` 皆 200。未動 schema、未動 CMS 資料。

### 9. 待業主

(a) 分享卡的中文是用系統字體排版，若日後要用品牌中文字體需業主提供字檔；
(b) 公告沒有封面欄位——若希望公告分享時各有不同縮圖，需要在 CMS `announcements` 加上
`cover` 上傳欄（schema 變更，Mongo 免 migration，只需 `generate:types`）；
(c) WhatsApp／Telegram 會長時間快取預覽，上線後重新檢查要在網址後加參數。

## 🟢 第六十五輪（實作，2026-10-14）：行情卡在「握手」而非白名單 ＋ 新增 `stg` 預覽環境

> 業主截圖問：「接口是 200 通的，但沒有行情，你可以怎麼分析？」
> **`/api/market/quotes` 回 200 與有沒有行情無關** —— `{"ok":false}` 本來就是 200
> （契約：「沒有真資料，前台維持示意」）。要看的是 body，不是狀態碼。

### 1. 現況變了：站台已改部署到 `web.hatcmarket.com`，而且跑的是 prd 設定

| 量到的 | 值 |
| --- | --- |
| `web.hatcmarket.com/robots.txt` | `Allow: /`（＝`SITE_INDEXABLE=true` ＝ prd 設定） |
| canonical／sitemap | 全部指向 `https://www.hatcmarket.com`（**服務另一個既有站**） |
| `/api/market/diagnostics` | **404 ＝ 仍是第六十四輪之前的建置** |
| DNS | `web.hatcmarket.com` 與 `node.hatcmarket.com` **同一台 `13.251.150.207`** |

也就是說：開發端說的「UAT 跑不起來只能跑 prd」＝**他們真的改用 prd 設定了**，正是
第六十四輪追加警告過的那個做法。

### 2. 🚩 用快取 TTL 當探針，分辨出「握手失敗」vs「白名單沒產品」

第六十四輪只證明到「主機有設 `QUOTE_GATEWAY_URL` 且真的發了請求」。本輪再進一步，
**方法記下來，日後診斷遠端一律可用**：

- **基準線**＝`/api/market/bars?symbol=EURUSD`（不在 `MARKET_SYMBOLS`，程式更早 return，
  不發任何外部請求）→ 穩定 **0.245–0.283s**，這是純路由開銷。
- **`/api/market/quotes` 的報價快取只有 2 秒，但閘道 context token 壽命是 10 分鐘**
  （本輪用 UAT 密鑰實測 `expiresAt`，減去程式的 60 秒更新邊際＝約 9 分鐘內不會重握手）。
  → **每隔 3 秒打 6 次**：若握手成功過一次，第 2 次起就該掉回基準線（白名單是空的話
  `loadQuotes` 零網路呼叫直接 return）。實測 **6 次全部 0.325–0.367s**。
- **結論：每一次都在重握手、每一次都失敗。**

這**排除了**原本的頭號嫌疑「生產遊客交易組沒配產品」—— 那一關握手是會成功的。
也排除網路不通：程式對外逾時 8 秒，而失敗只多 60–110ms（何況網站與閘道同一台機器）。
生產閘道 `POST /v1/context/resolve` 從外部打也回 200。

**剩下的可能，依序**：① 生產 `QUOTE_HTTP_CRYPT_SECRET` 沒設、或填成了 UAT 那一組
（密鑰不符時解密是瞬間失敗，符合觀測到的毫秒級）；② 生產閘道拒絕 `scene:"guest"`
或回錯誤碼。兩者從外部無法再細分 —— **而 `/api/market/diagnostics` 一句話就會說完，
偏偏他們部署的還是舊版**。十分鐘的鑑識，部署新版後是十秒的事。

⚠ **密鑰修好後很可能會撞上第二道關卡**（生產遊客組沒配產品，第四十三輪起的後端阻塞）。
兩件事要一起交辦，否則會以為修了沒用。

### 3. 新增 `stg` 環境（`config/env/stg.env` ＋ `build:stg` / `start:stg`）

業主確認 `web.hatcmarket.com`＝**上線前的暫時展示位址**，正式仍會切回 `www`。
在這個網域上跑 `build:prd` 會同時造成兩件**畫面上完全看不出來**的事：預覽站
**被開放收錄**，而且 canonical／`hreflang`／`sitemap.xml` 全部指向一個**內容不同**的網址。

`stg.env`＝**除了「站台自己的網址」與「可不可以被索引」之外，與 `prd.env` 完全相同**
（同樣的營運連結、同樣的生產行情閘道 `node.hatcmarket.com`）。切換當天改回
`build:prd`／`start:prd` 即可，其他都不用動。實測產物：canonical
`https://web.hatcmarket.com/zh-Hant`、每頁 `noindex, nofollow`、`robots.txt` `Disallow: /`、
sitemap 用 `web.hatcmarket.com`。

- **刻意不叫開發端臨時 `export` 兩個變數**：主機環境變數雖然也會贏，但看不見、無法複查，
  而這支團隊已經兩次跟錯設定。一份 commit 的環境檔是自我說明的，一行指令就能切。
- **營運連結刻意與 prd 相同**（不學 UAT 留空）：這是正式站的忠實預覽，按鈕要通往
  上線後會去的地方。UAT 留空是為了避免測試人員開到真帳戶，預覽站沒有這個問題。
- ⚠ **密鑰按環境名載入**：`build:stg` 讀 `config/env/stg.secrets.env`，**不會**讀
  `prd.secrets.env`。改用 stg 後若行情消失先查這個。
- `scripts/with-env.mjs` 無需修改（`availableEnvironments()` 自動掃 `config/env/*.env`），
  `env:check` 已自動納入：`✓ local, prd, stg, uat contain no credentials`。
- `web.hatcmarket.com` **刻意不寫進 `HATC_FACTS.md`**（暫時位址不是公司對外事實，
  同 UAT 網域的處置）；它只出現在 `config/env/stg.env`，**不得出現在任何頁面內容**。

### 4. 🎉 當天解決：生產站行情已上線（業主 SSH 進主機實測）

開發端提供 IP／pem 後，業主自己連上生產主機（`/project/hatc-web`）跑完診斷，
**根因確認＝`config/env/prd.secrets.env` 裡 `QUOTE_HTTP_CRYPT_SECRET=` 這一行是空的**
（其餘三個密鑰都有填）。空字串讓解密直接失敗，症狀與密鑰填錯完全相同。
補上值 → 重啟（**不需要重新 build**，這是 runtime 變數）→ **生產站行情正常**。

- **🚩 「生產遊客交易組沒配產品」這個阻塞已經解除**（第四十三輪記錄、第六十四輪還在列）。
  本輪用生產密鑰實測 `node.hatcmarket.com`：**29 個白名單代號、三個產品都在**，
  當場取到金 4167.74／銀 59.261／公斤條 896.54 ＋ 51 根日 K。
  **日後排查不要再預設是這個原因**；`DEPLOYMENT.md` §5 已改寫。
- **生產密鑰的位置**＝閘道專案 `~/Desktop/mt5-web/mt5-tcp-quote-gateway-node/deploy/env/prd.env`
  的 `QUOTE_HTTP_CRYPT_SECRET`（本輪比對確認：prd ≠ uat，本倉 `.env` 用的是 uat 那組；
  `real.env` 該欄為空，不是生產值）。**值不得寫進本倉任何檔案或對話**；要給人就用
  `… | pbcopy` 複製到剪貼簿。
- **診斷指令的兩個坑（已寫進 `DEPLOYMENT.md` §5.2）**：① `sudo tr … < /proc/$PID/environ`
  會 `Permission denied` —— `<` 重導向是**呼叫者的 shell** 執行的，`sudo` 只套用到 `tr`；
  要寫 `sudo cat … | tr`。②「`grep` 鍵名有找到」不代表有值，要用
  `grep -c '^KEY=..'`（至少兩個字元）才分得出空值。③ `sudo -E` 多半被忽略，
  取 node 路徑用 `sudo readlink -f /proc/$PID/exe`。
- **部署環境的事實**（下一棒會用到）：主機是 **AWS + 寶塔面板（aaPanel）**，
  node 在 `/www/server/nodejs/v22.22.3/bin/node`，站台以
  `node scripts/with-env.mjs prd next start` 執行；`.env.local` **不存在**（正確）。
  🚩 **`/project/hatc-web` 不是 git repo**（`fatal: not a git repository`）—— 他們是用
  複製／解壓部署的，**沒辦法 `git pull`**，這就是他們一直停在舊版（`/api/market/diagnostics`
  回 404、`config/env/` 裡沒有 `stg.env`）的原因。要他們更新必須另外約定方式。

### 5. 仍未解決（接續項）

- **`web.hatcmarket.com` 還在跑 `start:prd`** → 預覽站仍是 `index, follow`、canonical
  指向 `www.hatcmarket.com`（服務舊站）。本輪做好的 `stg` 環境**他們還沒拿到**
  （見上面的 git 問題）。
- **報價輪詢頻率**：業主覺得「很久才更新一口」。實測端點本身是即時的（每次都回當下
  tick），慢的是前端 `LiveQuotesProvider` 的 `POLL_INTERVAL_MS = 5_000`（且
  `document.hidden` 時暫停）。要更靈敏可降到 2–3 秒 —— **伺服器端有 2 秒快取，
  所以對閘道的壓力完全不變**，只是自家伺服器多接幾次請求；需重新 build 才生效。
  業主尚未決定，本輪未改。（K 線是**日 K**、60 秒輪詢，本來就幾乎不動，不是 bug。）

### 6. 驗收

`env:check`（含新環境）／`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／
`tsc --noEmit`／`i18n:check` 三語 **730 鍵不變**（本輪未新增任何文案）／
`pkill` → `rm -rf .next` → `npm run build:stg` 綠、203 個靜態頁照常產生。
未動 schema，`generate:types` 無變更。

---

## 🟢 第六十四輪（實作，2026-10-13）：部署後沒有行情 —— 從外部定位 ＋ 補上可診斷性

> 業主指定題目：「部署了到服務器，但目前是沒有行情。」業主本輪拍板**兩件一起做**
> （補可診斷性 ＋ 同時請開發端回答兩個精準問題），診斷範圍選**「log ＋ 需管理員登入的
> 自我檢測端點」**。

### 1. 先把範圍從外部查清楚（沒有伺服器存取權也能做到的程度）

- **閘道那一端完全正常。** 用本機 `.env` 裡的 UAT 密鑰重跑一次完整握手
  （`POST /v1/context/resolve {"scene":"guest"}` → `GET /v1/market/symbol-detail`），
  當場取到 **XAUUSD 4184.65／XAGUSD 60.231／RKGCNH 900.04**，遊客白名單 **29 個代號、
  三個產品都在**。所以**閘道、UAT 遊客交易組、我們手上的 UAT 密鑰三者都沒問題**。
- 🚩 **部署主機「有」設 `QUOTE_GATEWAY_URL` —— 這是從外部用快取指紋證明的，方法記下來。**
  `getDailyBars()` 失敗時會把空結果寫進 **60 秒**的 `barCache`，而 `gatewayConfig()` 回 null
  那條路**在寫快取之前就 return**。於是對 `www.666678910.com` 量測：
  `/api/market/bars?symbol=XAGUSD` 冷呼叫 **0.32s**，接下來 60 秒內都是 **0.13s**，
  等 65 秒後再打又變 **0.44s**，然後立刻再打回到 0.13s；而**不被代理的 `EURUSD`**
  （在 `MARKET_SYMBOLS` 之外，更早就 return）**每一次都是 0.13s 基準值**。
  有快取行為＝走到了 `loadBars()`＝**設定存在且真的對閘道發了請求**。
  → 失敗點落在「與閘道的那一次對話」裡。
  **慣例：下次要從外部判斷遠端程式走到哪一步，先找程式自己的快取 TTL 當探針，
  不必等對方給 log。**
- 生產閘道 `node.hatcmarket.com` 也活著（回 AES 信封），但**UAT 密鑰解不開它**
  → 證實文件寫的「prd 與 uat 密鑰不同」屬實。

### 2. 補上可診斷性（本輪的程式改動）

- **`src/lib/marketQuotes.ts`**：新增 `report(key, message, ok)` ——
  **狀態改變時才印一次**（不洗版，但故障與恢復都看得到），`clearReport()` 讓同一個
  故障日後復發時會再印。原本**完全靜默**的兩條路現在都有訊息：
  ① `QUOTE_GATEWAY_URL` 沒設（訊息直接點名最可能的原因＝**用裸 `npm start` 啟動**，
  因為它是 runtime 變數，只有 `start:uat`／`start:prd` 會帶進去）；
  ② 遊客白名單缺我們的產品（印出**缺哪幾個**、白名單總數、以及「該閘道的遊客交易組
  沒配產品」的判讀）。既有的例外訊息也補上**閘道主機名**（公開值，`config/env/*.env`
  裡就有），這樣 log 一眼看得出連的是 UAT 還是生產。恢復時印
  `live quotes active from <host>: XAUUSD, XAGUSD, RKGCNH`。
- **新端點 `GET /api/market/diagnostics`（`src/app/api/market/diagnostics/route.ts`）**＝
  端到端自我檢測，**需登入且必須是全權角色**（未登入 401／非全權 403）。回傳
  `verdict`（一句話結論）＋`gateway.{configured,host,secretConfigured}`＋
  `guestContext.allowedSymbolCount`＋`symbols[]`（三個產品各自 ok／no-tick／error／
  not-whitelisted ＋ bid）。**刻意跳過報價快取**，看到的是當下狀態。
  權限沿用 CMS 角色矩陣（`createLocalReq({user}, payload)` → `hasFullAccess(req)`），
  不另寫一套判斷。
- **紅線落地**：`/api/market/{quotes,bars}` 的 **`{ok:false}` 回傳形狀完全沒動**（那是契約）；
  失敗原因**不對匿名訪客公開**；**密鑰永不出現在 log 或回應裡**，連長度都不報
  （只有 `secretConfigured` 布林）。
  ⚠ 這支端點不能放進 Payload config 的 `endpoints`：`marketQuotes.ts` 有
  `import 'server-only'`，進了 config graph 會讓 `payload` CLI 整個掛掉（第三十二輪的教訓）。
  所以做成 Next route handler，用 `payload.auth({headers})` 自己認證。
- **順手修掉同類 bug**：`/api/dev-revalidate` 還在用 `revalidateTag(tag,'max')`，
  那是 stale-while-revalidate，**第一次重新整理仍是舊值**——正是第六十一輪修掉的那個毛病，
  只是這支 dev 工具漏改。改成 `{expire: 0}`。

### 3. 三種狀態都實機驗過（`npm run build && npm start`，不是 `next dev`）

| 情境 | `verdict` | log |
| --- | --- | --- |
| 正常（本機接 UAT 閘道） | `Live quotes are working: node.666678910.com is serving all 3 products.` | `live quotes active from node.666678910.com: XAUUSD, XAGUSD, RKGCNH` |
| `QUOTE_GATEWAY_URL=`（空） | 點名 `start:uat`／`start:prd` 與裸 `npm start` | 只印一次（quotes 與 bars 兩支都走到也只一行） |
| 密鑰錯誤 | `Cannot resolve a guest context from node.666678910.com: …` ＋ 提醒 UAT／生產不同 | 同訊息，**grep 不到密鑰字串** |

匿名 401／非全權角色 403 都實測過（臨時建全權與受限兩個帳號，**驗完已刪除**，
DB 只剩業主本人的帳號）。

### 4. 要請業主轉給開發端的問題（本輪的另一半）

> 1. 新官網目前在 `www.666678910.com`，首頁沒有行情。請問**實際的啟動指令是什麼**？
>    必須是 `npm run build:uat` 之後 `npm run start:uat`（或 `start:prd` 對應 `build:prd`）。
>    **`QUOTE_GATEWAY_URL` 是 runtime 變數，裸 `npm start` 不會帶進去**，行情就一定是空的。
> 2. 主機上有沒有設 **`QUOTE_HTTP_CRYPT_SECRET`**？要用 **UAT** 那一組
>    （閘道專案 `deploy/env/*.env`；⚠ 交易端 H5 的 `env.prd.uts` 把生產值寫錯成 UAT 值，
>    不要照抄）。放 `config/env/uat.secrets.env`（git-ignored）或主機環境變數。
> 3. 伺服器 log 裡有沒有 **`[marketQuotes]`** 開頭的行？有的話請整行貼回來。
> 4. 部署這一版之後，登入 `/admin` 再開 **`/api/market/diagnostics`**，把 `verdict` 貼回來——
>    一句話就會說出原因。

### 5. 驗收

`lint`（0 error，僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit`／`i18n:check`
三語 730 鍵（**未新增任何 i18n 鍵**：診斷輸出是給維運看的英文 JSON，不是站台文案）／
`env:check`／`pkill` → `rm -rf .next` → `build` 綠，**所有頁面維持 ● SSG**，
新路由是預期的 ƒ Dynamic。未動 schema，故 `generate:types` 無變更。

### 6. 待業主／開發端

- (a) 上面第 4 節的四個問題 —— **本輪結果取決於他們的回覆**。
- (b) 若 `verdict` 是「遊客交易組沒配產品」，那就是第四十三輪那個**非本倉**的阻塞：
  後端配好產品後官網不需改碼即自動變真。
- (c) 正式網域切換時，`QUOTE_GATEWAY_URL` 會跟著 `prd.env` 變成 `node.hatcmarket.com`，
  **密鑰也必須同時換成生產那一組**，否則會從「沒行情」變成「解不開信封」。

---

## ▶ 下一步（下一位 agent）

> **✅ 第六十三輪（2026-10-13）完成：同步開發端的部署改動 ＋ 導出 CMS 資料給開發匯入。**
>
> 業主原話：「開發已經部署完了，他說有些東西改了，否則一直報錯。你做 2 件事：
> 1. 先 pull 最新代碼；2. 把現有 db 的資料導出，我要給開發導入。」
> 本輪三個方向題業主拍板：① 正式網域＝**`https://www.hatcmarket.com`**（開發端實際
> 部署的網域，寫進 FACTS）；② Gitee 上三份含憑證的 `.env` 檔**移除並附說明給開發端**；
> ③ `PAYLOAD_SECRET` 與 MongoDB root 密碼**兩個都輪換**。
>
> ### 1. 開發端的改動：逐項審過，只採納一半
>
> `gitee/master` 多了 `745b8be`（新增配置文件）與 `e563949`（功能优化），diff 只有 5 個檔案：
>
> | 他們改的 | 處置 | 理由 |
> |---|---|---|
> | `next` 16.3.0 → **16.3.3** | ✅ 採納 | patch 升級，應是「否則一直報錯」的修復。已 `npm install`，冷建與 `npm start` 實測正常 |
> | `.gitignore` 加 `*.zip` | ✅ 採納 | 無害；`lp.zip` 已被追蹤故不受影響 |
> | `.gitignore` **刪掉 `.env*` 忽略** | ❌ 拒絕 | 見下 |
> | commit `.env.local`／`.env.uat`／`.env.prd` | ❌ 不進本倉 | 見下 |
>
> **為什麼拒絕**：那三份檔案裡有生產 MongoDB 的 **root 連線字串（含密碼）** 與
> **`PAYLOAD_SECRET`**。`PAYLOAD_SECRET` 是 Payload 簽發後台登入 JWT 的金鑰 ——
> 洩漏等於可以偽造任何管理員的 token，不需要密碼。而 **GitHub `origin` 是公開倉**
> （本輪以 API 實測確認：`origin` PUBLIC、Gitee `spingpeng/homeindex` 私有／匿名 403），
> git 歷史推上去就收不回來。`.gitignore` 的忽略規則已恢復，並在該檔補上為何不能動的說明。
> 三份檔案的內容已保存到 `~/Desktop/hatc-dev-env-backup-20261013/`（倉外）供參考。
>
> ### 2. 🚩 本輪最重要的發現：一個不會報錯、但讓官網完全不被收錄的問題
>
> 那三份檔案有兩個**功能性**問題，與憑證無關，即使他們不 commit 也會發生：
>
> - **`.env.uat` 與 `.env.prd` 這兩個檔名根本不會生效。** Next 只載入 `.env`、
>   `.env.local`、`.env.$(NODE_ENV)`、`.env.$(NODE_ENV).local`，而 **`NODE_ENV` 只接受
>   `production`／`development`／`test`**（已查 `node_modules/next/dist/docs` 的
>   Environment Variable Load Order 確認）。這正是第六十二輪要自己寫
>   `scripts/with-env.mjs` 的原因。
> - **唯一會生效的 `.env.local` 會把生產站打成 localhost ＋ 全站 noindex。** 它寫著
>   `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 與 `SITE_INDEXABLE=false`，而
>   `.env.local` 在 `NODE_ENV=production` **也會**被載入、且優先於 `.env`；更關鍵的是
>   **`with-env.mjs` 刻意對「已出現在 `.env.local`／`.env` 的鍵」讓路**（第六十二輪的
>   設計，避免我們的預設值蓋掉開發者本機設定）→ **跑 `npm run build:prd` 也不會覆蓋它**。
>   結果：canonical／`hreflang`／`sitemap.xml` 全部指向 localhost、`robots.txt` 變
>   `Disallow: /`、每頁再補 `noindex, nofollow`。**畫面一切正常，沒有任何錯誤訊息。**
>
> 永久版說明已寫進 **`docs/DEPLOYMENT.md` §2.4**（含驗收用的三條 `curl`）；
> 一次性的開發端溝通文件在 `~/Desktop/hatc-cms-export-20261013/`。
> **這是第六十二輪「第二層依鍵名讓路」設計的副作用** —— 那個讓路是對的（否則會默默蓋掉
> 開發者的 `.env`），但它意味著**部署機上不該存在 `.env.local`**，這點第六十二輪沒寫進
> 文件，本輪補上了。
>
> ### 3. 正式網域改為 `www.hatcmarket.com`
>
> 開發端的 `.env.prd` 用 `hatcmarket.com`，而倉內 `config/env/prd.env` 是
> `hatchk.com`（FACTS 登錄的既有官方網站）。業主拍板**以開發端實際部署的
> `https://www.hatcmarket.com` 為準**，與交易端 `h5.hatcmarket.com`、行情閘道
> `node.hatcmarket.com` 同一家族。
> - 改動處：`config/env/prd.env`（檔頭註解＋`NEXT_PUBLIC_SITE_URL`）、
>   `src/app/robots.ts` 註解、`docs/DEPLOYMENT.md` §2.0／§2.1a、
>   **`docs/HATC_FACTS.md`「Official contact & website」新增一條已核可事實**。
> - ⚠ **`www.hatchk.com` 與 `www.hatcmarket.com` 的關係業主尚未說明**（哪個是主站、
>   要不要 301 或 canonical 互指）→ FACTS 已標註不得自行推定，也不得在頁面上並列。
> - `CONTACT_EMAIL=info@hatchk.com` **沒有跟著改**：那是 FACTS 核可的電郵，與站台網域無關。
>
> ### 4. CMS 資料導出（給開發匯入）
>
> 位置 `~/Desktop/hatc-cms-export-20261013/`（倉外，不進 git）：
>
> | 檔案 | 內容 |
> |---|---|
> | `hatc-cms.archive.gz`（259 KB） | `mongodump --archive --gzip` 全庫＝18 個 collection、**144 筆**，含索引 |
> | `media.tar.gz`（74 MB） | **106 個媒體實體檔案**（解開成 `media/`） |
> | `README-匯入說明.md` | `mongorestore` 指令、逐項筆數對照、內容治理說明 |
> | `給開發端-環境變數與憑證處理.md` | 上述 §2 的 P0 ＋ 憑證輪換步驟 |
>
> - 🚩 **DB 與 media 必須一起匯入。** `media/` 被 `.gitignore` 排除（第 38 行），不在 git 裡，
>   而 DB 的 `media` collection 只存檔名與尺寸 metadata → **只匯 DB 會讓後台媒體庫全破圖、
>   學院 49 篇封面與出入金 4 張背景圖全部 404**。容器部署還要把 `media/` 掛成持久化 volume。
> - **已實測還原**（不能只相信 dump 成功）：`mongorestore` 到臨時庫 `hatc-restore-test`
>   → 18 collections／144 筆／0 失敗、索引還原、`users.hash` 在、localized 欄位結構完好，
>   驗完 `dropDatabase()`。⚠ `--dryRun` **不會**讀出文件數（回報 0 documents），
>   要真驗證就得真的還原到臨時庫。
> - 盤點時順手確認了兩件治理狀態：**`funding-page` global 只有 4 個圖片欄有值、
>   文字欄全空**（符合「行銷 global 要留空」紅線，第五十七輪清空後沒有復發）；
>   `announcements` 有業主自己發的 1 則（分類 2 個）。
> - ⚠ 業主那則公告的「網址代稱」填成 `announcements`，所以網址是
>   `/announcements/announcements`。**不是 bug**（slug 合法、頁面 200），但如果要改，
>   在 `/admin` 改該欄即可（`autoSlug` 會正規化）。
>
> ### 5. 同輪追加（同日第二次 pull）：開發端又把 `DATABASE_URI` 寫進三份 commit 的檔案
>
> 業主在交付後問「怎麼分 uat 跟 PRD」，接著開發端 push 了 `25be3e8`。業主要求檢查，
> 結果是**做錯了，而且後果是硬性阻塞**：`DATABASE_URI`（含 root 密碼）進了
> **全部三份** `config/env/{local,uat,prd}.env`，實測 `env:check`（CI）、`build:prd`、
> `build:uat`、`build:local` **全部 exit 1 —— 整個建置不會開始**。
> 他們的站還活著，說明他們實際上跑的是**裸的 `npm run build`**（不套環境檔），
> 所以那三行既危險又根本沒被讀取（連線來自部署機上 git-ignored 的 `.env`）。
>
> - 🚩 **先用 DNS 查清機器歸屬，不要憑連線字串猜**：`www.666678910.com` 與
>   `node.666678910.com` 都解析到 **`8.210.7.28`＝UAT 主機**；`www.hatcmarket.com`
>   在 **AWS ELB**、`node.hatcmarket.com` 是另一個 IP。所以他們的 `prd.env` 寫
>   `127.0.0.1` 指的是生產機本機的 Mongo，**並沒有「三個環境共用生產庫」**
>   （我一開始的推測是錯的，查了 DNS 才確定）。真正的問題是 `local.env` 指向 UAT 庫
>   ——那個檔案是共用的，等於強制每個開發者的 `npm run dev` 都讀寫 UAT 資料。
> - **業主拍板**：① 我移除三處 `DATABASE_URI` 並同步回 Gitee，附說明給開發端；
>   ② **保留**他們填的 UAT 網域 `https://www.666678910.com`（結案待辦 a 項）。
> - **根因修復（光靠註解擋不住，他們犯了兩次）**：替代做法現在寫在他們一定會看到的
>   三個地方 —— ① 三份 `config/env/*.env` 的檔頭各加一段「放這裡會讓建置 exit 1，
>   請改放主機環境變數」並附 `export` 範例；② **`with-env.mjs` 的錯誤訊息改成
>   `SECRET_PLACEMENT_HELP`**，被擋下來時直接列出兩個正確位置與指令（已實測輸出）；
>   ③ `DEPLOYMENT.md` §2.0 補上「被擋＝exit 1，不是警告」。
> - `local.env` 的檔頭另外點明**本機要連自己的 Mongo**，因為該檔共用。
>
> ### 6. 驗收
>
> `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
> `i18n:check` 三語 **730 鍵**（本輪未動文案）／`env:check` 綠／`pkill` 後 `rm -rf .next`
> 冷建綠、**53 筆 ● SSG ＋ 7 筆 Dynamic**。`npm start` 實測六頁 200（含
> `/announcements/announcements`）、`/admin` 與 `/api/users/me` 200、公告「測試」從 CMS
> 正常讀出。`build:prd` 與 `build:uat` 的 `robots.txt`／canonical／`robots` meta 都實測過。
> **本輪沒有改任何前台程式邏輯**（只有 `robots.ts` 一行註解＋`with-env.mjs` 的錯誤訊息），
> 所以沒有 UI 回歸風險。
>
> ### 7. 同輪追加：`config/env/<環境>.secrets.env` —— 按環境的密鑰檔（git-ignored）
>
> 開發端原話：「我想预先在某一个地方把 local、uat、prd 等 DATABASE_URL 配置好，这样就
> 可以通过命令不同的环境区分，这要一套代码就行，不用我打包 prd 就要改下数据库连接，
> uat 部署要改成数据库连接。」
>
> - **🚩 這才是他們兩度把憑證寫進 commit 檔案的動機，而倉內當時沒有任何合法做法。**
>   第六十二輪只給了兩條路：主機環境變數（一台機器一個值）與整機通用的 `.env`（同上）。
>   兩者都無法「同一台打包機持有多個環境的連線字串、靠指令切換」。我前一次回答
>   「不需要區分，一台機器只屬於一個環境」是**答錯了題**——那是情境 B，他問的是情境 A。
>   **慣例：當同一個紅線被違反兩次，先問「我們是不是沒給他可用的替代路徑」。**
> - **機制**：`config/env/<環境>.secrets.env`，每個環境一份，**git-ignored**，
>   由 `scripts/with-env.mjs` 依環境名自動載入 → `build:prd` 用 `prd.secrets.env`、
>   `build:uat` 用 `uat.secrets.env`，中間不改任何檔案。範本＝已 commit 的
>   `config/env/secrets.env.example`（只有佔位值）。
> - **優先序（`with-env.mjs` 檔頭／`DEPLOYMENT.md` §2.0 已更新）**：① 主機環境變數
>   → ② `<環境>.secrets.env` → ③ 倉內 `.env.local`／`.env` → ④ `<環境>.env`（commit）。
>   **第 2 層刻意會蓋掉第 3 層**（為單一環境特別寫的值該贏過整機通用值，與 Next 自己的
>   `.env.production.local` 勝過 `.env.local` 同理）；**第 4 層仍依鍵名讓路給 `.env`**
>   （否則公開預設值會蓋掉開發者自己的設定——第六十二輪已確立）。兩者方向相反是刻意的。
> - **防呆（開發端已經刪過一次 `.gitignore` 的 `.env*`）**：`.gitignore` 新增
>   `config/env/*.secrets.env`；只要該檔存在而 git **沒有**忽略它，`env:check` 與每個
>   `build:*`／`start:*` 都 **exit 1**。實作＝`isGitIgnored()` 包 `git check-ignore -q`，
>   git 不可用時回 `null` 並跳過（不為了無關原因擋掉建置）。已實測：把忽略規則註解掉後
>   `build:uat` 與 `env:check` 都 exit 1。
> - **log 只印鍵名不印值**：`applied 9 default(s) from config/env/prd.env; 1 value(s)
>   from prd.secrets.env (DATABASE_URI)`。
> - **`availableEnvironments()` 已排除 `*.secrets.env`**，否則 `uat.secrets` 會被當成
>   第四個環境名。`secrets.env.example` 也因為不以 `.env` 結尾而不被掃。
> - **實測方式（值得沿用）**：用 `@next/env` 的 `loadEnvConfig()` 在注入後印出實際生效值，
>   就能證明「我們注入的值勝過 `.env`」而不必跑完整 build。實測 `uat.secrets.env` 的
>   `DATABASE_URI` 贏過 `.env`、沒有 `prd.secrets.env` 時沿用 `.env`。另跑一次真實冷建
>   （`prd.secrets.env` 指向本機 Mongo）＝綠、203 頁、CMS 內容讀到、SSG 不變。
> - **文件**：`DEPLOYMENT.md` 新增 **§2.3a**（規格／優先序／防呆）、改寫 **§2.1b**
>   為「情境 A：一台機器多環境 → `.secrets.env`／情境 B：一機一環境 → 主機環境變數／
>   CI runner → secret store」、§2.0 優先序改四層、§2.3 紅線改成「密鑰只有三個合法位置」、
>   §2.4 的「`.env.uat` 不會生效」補上正規替代。`.env.example` 檔頭同步。
>   給開發端的那份（`~/Desktop/hatc-cms-export-20261013/給開發端-環境變數與憑證處理.md`）
>   已改寫成「✅ 已支援：預先配好三個環境…（請拉最新代碼）」。
>
> ---
>
> **✅ 第六十二輪（2026-10-12）完成：分環境配置 local / uat / prd。**
>
> 業主原話：「下一輪做分不同的環境配置文件出來，比如 local、uat、prd，把那些開戶等的域名
> 也放到這個配置文件中，這樣每次打包不同環境就不用去改域名。」四個方向題業主拍板：
> ① **UAT 的開戶／登入／客服一律留空**（HATC 沒有 UAT 版入口，也不把生產入口放進 UAT）；
> ② **兩種切換方式都要**（per-env build script ＋ 允許部署端自行注入變數）；
> ③ **要 npm script**，同時保留「自己注入變數再跑 `npm run build`」這條路；
> ④ **維持 CMS 優先**，配置檔只當 CMS 未填時的後備。
>
> ### 1. 做法：三份已 commit 的公開配置檔 ＋ 一支載入器
>
> - `config/env/{local,uat,prd}.env`：**已 commit，只放公開值**（站台網域、
>   `SITE_INDEXABLE`、營運連結後備、行情閘道位址）。`.gitignore` 的 `.env*` 只比對檔名開頭，
>   `local.env` 這種名字不會被忽略（已用 `git check-ignore` 確認）。
> - 載入器 [`scripts/with-env.mjs`](../scripts/with-env.mjs)，優先序（高→低）＝
>   **主機／CI 環境變數 → 倉內 `.env.local`／`.env` → `config/env/<環境>.env`**。
>   🚩 第二層是**依鍵名**讓路：某個鍵只要出現在 `.env`，載入器就完全不碰它（會印
>   `kept existing …`）。沒有這個判斷的話我們注入的預設值會**默默蓋掉開發者的 `.env`**，
>   因為 Next 的查找順序是 `process.env` 先、`.env*` 後。
> - **為什麼不用 Next 原生的 `.env.<name>`**：`NODE_ENV` 只接受
>   `production`／`development`／`test`，沒有 `uat` 這個合法值（已查 Next 16 文件）。
> - npm scripts：`dev`（自動套 local）／`build:local|uat|prd`／`start:local|uat|prd`／
>   **`env:check`**。**裸的 `build`／`start` 刻意不套任何環境檔**，維持原行為給 CI
>   （CI 自己注入變數）與「完全沒有環境變數」的降級測試用。
>
> ### 2. 🚩 實測更正：營運連結**不是** runtime 可切換的
>
> 第六十一輪的盤點筆記寫著「去掉 `NEXT_PUBLIC_` 前綴 → 同一份產物可以靠主機環境變數在
> runtime 切環境」。**對營運連結來說這是錯的，本輪已實測推翻**：頁面是 SSG，
> `getSiteSettings()` 在 **prerender 時**就被讀掉並寫進靜態 HTML。實測＝用「完全沒有環境
> 變數」建置出來的產物跑 `npm run start:prd`（注入了 `OPEN_ACCOUNT_URL`），首頁的開戶按鈕
> **仍然是 `/register`**。
> - **真正 runtime 的只有**：`QUOTE_GATEWAY_URL`／`QUOTE_HTTP_CRYPT_SECRET`（走
>   `force-dynamic` 的 `/api/market/*`，實測 `start:prd` 確實改打生產閘道）、`MT_*`
>   （後台 API）、`DATABASE_URI`／`PAYLOAD_SECRET`（資料庫連線）。
> - **要在不重新部署的前提下改連結，唯一的路是 CMS**（`afterChange` → `revalidateTag`，
>   第六十一輪已修成存檔後第一次重新整理就生效）。這剛好就是業主選的治理方向。
> - 所以 `build:*` 與 `start:*` **必須用同一個環境名**，已寫進 DEPLOYMENT §2.0。
> - 前綴還是該去掉，但理由改成：那 7 個前綴只是白白把客服電話、電郵、開戶網址塞進**每一個**
>   瀏覽器 bundle。改名後 `siteSettings.ts` 檔頭已記錄這個實測結論。
>
> ### 3. 環境變數改名（7 個，舊名完全失效）
>
> `NEXT_PUBLIC_CONTACT_{WHATSAPP,PHONE,EMAIL,LIVECHAT}` → `CONTACT_*`、
> `NEXT_PUBLIC_{OPEN_ACCOUNT_URL,DEMO_ACCOUNT_URL,MEMBER_LOGIN_URL}` → 去前綴。
> **沒有保留舊名的相容讀取**：本專案從未部署過（DEPLOYMENT §0），不存在會被靜默打斷的
> 線上設定。`.env.example`、`docs/DEPLOYMENT.md` §2.2、`README.md` 都已同步，
> **交付時要主動告知開發端**（未結案清單 c）。
> `NEXT_PUBLIC_SITE_URL` 與 `NEXT_PUBLIC_ANALYTICS_ID` **刻意保留前綴**：前者本質上就是
> 建置期值、後者是公開的追蹤 ID 且日後會在瀏覽器執行。
>
> ### 4. 順手修掉一個會讓整個 build 崩掉的既有地雷
>
> `src/lib/seo.ts` 原本是 `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`
> —— **`??` 只接 `undefined`／`null`，接不到空字串**。於是 `NEXT_PUBLIC_SITE_URL=`
> （空值，而 `.env.example` 對很多鍵就是這樣寫）會讓 `siteUrl` 變成 `''`，
> locale layout 的 `new URL(siteUrl)` 在**每一頁** prerender 時丟 `ERR_INVALID_URL`，
> 整個 build 失敗、錯誤訊息還只指向 `metadataBase`。本輪 `uat.env` 刻意留空該鍵時踩到，
> 已改成 `?.trim() || …`。
>
> ### 5. 新增 `SITE_INDEXABLE`（UAT 不可被索引）
>
> 引入 UAT 環境就會多出一個「測試站被搜尋引擎收錄、和生產站搶同一批內容」的風險，
> 所以一併處理：`SITE_INDEXABLE=false`（`local.env`／`uat.env`）時 → `robots.txt` 變成
> `Disallow: /`，**而且**每頁 metadata 改 `noindex, nofollow`（robots.txt 只擋爬取，
> 擋不住外部連結造成的收錄，所以兩層都要）。`prd.env` 為 `true`；**未設定時預設可索引**，
> 所以 CI 與既有流程行為完全不變。原本 locale layout 裡是寫死的 `{index: true, follow: true}`。
>
> ### 6. 密鑰紅線改成機器把關
>
> `config/env/*` 是 commit 進倉的，靠註解提醒不夠 → 載入器內建
> `SECRET_KEY_PATTERN = /SECRET|TOKEN|PASSWORD|_KEY$|^DATABASE_URI$/`：
> `build:*`／`start:*` 會檢查當前環境檔，`npm run env:check` 會檢查全部三個，**CI 已加這一步**。
> 用 pattern 而不是固定清單，日後出現 `PAYMENT_API_KEY` 之類的新變數也會被擋下
> （負向測試：塞一個 `MT_API_KEY` 進去 → 兩種呼叫都 exit 1）。
>
> ### 7. 刻意沒做的事
>
> - **`WEB_TERMINAL_HOST` 不跟著環境變**（`components/platforms/platformVisuals.ts`）：
>   它是平台截圖瀏覽器外框位址列印出來的字，紅線是 **UAT 網域不得出現在官網任何畫面**，
>   永遠是生產網域 `h5.hatcmarket.com`（FACTS 已核可）。
> - **沒有讓環境檔蓋掉 CMS**（業主第 4 題選 CMS 優先）。那樣做後台會永遠改不動連結。
> - **沒有把本機 Mongo 連線字串寫進 `local.env`**（含帳密＝憑證，留在 git-ignored `.env`）。
> - **沒有在 CI 加 `build:uat`**（會多一次完整建置，而 `env:check` 已能擋真正的風險）。
>
> ### 驗收
>
> `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
> `i18n:check` 三語 **730 鍵**（本輪未動文案）／`env:check` 綠／`pkill` 後
> `rm -rf .next` 冷建綠、**51 筆 ● SSG，動態路由集合與改動前一致**（admin／`/api/*`／
> `robots.txt`／`sitemap.xml`／`_not-found`）。另外實測：
> - `build:prd` → canonical／sitemap／`robots.txt` host 全為 `https://www.hatchk.com`、
>   `robots` meta 為 `index, follow`、開戶 CTA 取到 CMS 的值（CMS 優先確認）、
>   全頁 `target="_blank"` 數量 0。
> - `build:uat` → `robots.txt` 為 `Disallow: /`、每頁 `noindex, nofollow`。
> - **完全沒有環境變數**（`.env` 移走、裸 `npm run build` ＋ `npm start`）→ 首頁 200、
>   行情卡與 K 線標「示意數據」、`/api/market/quotes` 回 `{ok:false}`、開戶 CTA 退回
>   `/register`、頁首「登入」不渲染。
> - `npm run dev`（已改成經過載入器）→ 前台 200、`/api/users/me` 200、`/admin` 200。
> - ⚠ 驗證環境陷阱（再次踩到）：**在同一個 Shell 呼叫裡用 `&` 背景起 `npm start`，
>   呼叫結束時會被收掉**，之後的 `curl` 會拿到空回應（看起來像頁面壞了）。請用獨立的
>   背景 Shell 任務跑 server，再在另一次呼叫裡 curl。
>
> ---
>
> **✅ 第六十一輪（2026-10-12）完成：Footer 加公告入口。**
>
> 業主從第六十輪留下的 0–8 項裡選了 **0(ii)「要不要在 Footer 也加公告入口」＝要**，
> 並表示**第一則公告他自己到 `/admin` 發佈**（公告內容紅線不變：程式不得捏造，DB 現在仍是
> 零公告＋兩個分類）。
>
> ### 1. 放在`關於我們`欄，不開第五欄
>
> `官方公告` → `/announcements`，插在`安全與監管`與`最新新聞`之間（同欄 5 列，其餘欄仍 4 列）。
> - **為什麼不開第五個導覽欄**：footer 的格線是 `md:grid-cols-[327fr_repeat(4,153fr)]`，
>   在 `md`（768px）時每個導覽欄已經只有 ~81px（英文標籤本來就會換行）；加第五欄會壓到 ~70px。
>   Header 第六十輪才因為第五個頂層項目被迫把斷點推到 `min-[1360px]`，footer 不要重蹈。
> - **為什麼放這一欄**：該欄已經有`最新新聞`（`/news`），兩者同屬「通知類」版面；公告排在
>   最新新聞**上面**，因為公告是會持續更新的版面，而 `/news` 目前 0 筆只顯示空狀態。
> - 🚩 **刻意只放一個列表連結，沒有做分類深連**（學院欄有做）。公告分類在 CMS，
>   把它們深連進**全域** footer 會讓每一個靜態頁都依賴 `announcementCategories` 這個 cache tag，
>   而該 tag 目前只 revalidate `/announcements` → 業主改分類後其餘頁面的 footer 會是舊的。
>   學院欄能這樣做是因為它的 slug 是程式常數（`academyCategories.ts`），不是 CMS 資料。
>
> ### 2. Footer 靜態欄改成可變長度的條目清單（小重構）
>
> `FOOTER_LINKS` 由 `Record<StaticCol, Record<'l1'|…|'l4', string>>` 改成
> `Record<StaticCol, readonly {href, labelKey}[]>`（`LINKS`／`LinkKey` 刪除）。
> - **`labelKey` 是完整的 message 路徑**，所以一列可以**借用它指向的頁面的標籤鍵**，
>   不必為同一段文字再開一個 footer 專用鍵。公告列用的是 `announcements.hero.title`
>   （＝該頁自己的 h1「官方公告」／"Announcements"）→ **i18n 鍵數不變，仍 730 鍵**。
>   這跟`交易服務`欄讀 `products.items.*.name`、`黃金學院`欄讀 `academy.categories` 是同一個慣例：
>   **footer 標籤盡量從目的地的正本取**，就不可能漂移。
> - 欄位長度不再被綁死成 4 列，日後要增減某一欄的列數不需要再動型別。
>
> ### 驗收
>
> `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
> `i18n:check` 三語 **730 鍵**（未增減）／`pkill` 後 `rm -rf .next` 冷建綠、全頁維持 ● SSG。
> 驗證方式：直接讀 `.next/server/app/<locale>/*.html` 裡的 footer `<nav>`，確認三語都有
> `/<locale>/announcements → 官方公告／官方公告／Announcements`（**靜態 HTML 裡就有**，
> 不是 hydration 後才長出來）。版面以無頭 Chrome 截 footer 區塊看過 **1440／1024／834／390 ×
> 英文＋繁中**：5 列欄位沒有擠壞其他欄，`md` 時的換行與改動前一致（本來就會換行）。
>
> ### 3. 業主實測回報的三個問題（同一輪修掉）
>
> 業主發了第一則公告後回報三件事。**第 1 與第 3 件是同一個根因。**
>
> - **🚩「網址代稱」是個陷阱欄位 → 公告詳情 404。** 業主把它填成 **`" /announcements"`**
>   （開頭還有一個空格）——他把「網址代稱」讀成「這一頁的網址」。卡片連結是
>   `` `/announcements/${item.slug}` `` → `/announcements/ /announcements` → 404。
>   根因不是填錯，而是**欄位設計**：`required` 卻沒有任何正規化，而且本站標題都是中文、
>   沒有可轉寫的拉丁字，等於強迫業主自己發明一個代稱。
>   **處置＝新的 [`src/payload/slug.ts`](../src/payload/slug.ts)**：
>   - `slugify()` 把輸入正規化成 ASCII＋連字號（斜線、空白、標點全部清掉）；
>   - `autoSlug(collection, from)`＝欄位 `beforeValidate` hook：先正規化輸入 → 空的話依
>     候選值推導 → 再用 `-2`、`-3` 補到不撞號（排除自己那筆）；
>   - `dateSlug()` 以**香港時間**產生 `YYYY-MM-DD`（不是 UTC，否則頁面上印的日期和網址會差一天）。
>   - **公告**：`slug` 改成**可留空**（移除 `required`），候選＝標題 → 發布日期。
>     實測：`" /announcements"`→`announcements`／留空＋中文標題→`2026-10-12`／同一天第二則→
>     `2026-10-12-2`／`"  /Trading Hours//  "`→`trading-hours`。
>   - **分類**：同樣正規化＋去重，但**刻意不自動產生**（它是會被分享的篩選網址
>     `?category=…`，`category-2` 這種值沒有意義）；改成自訂 `validate` 訊息
>     （`slugRequired()`，依後台語言三語）告訴業主該填什麼，而不是 Payload 的「必填」。
>   - ⚠ `slug` 由必填改為選填 → `payload-types.ts` 變成 `slug?: string | null`，
>     `lib/announcements.ts` 的分類 mapper 要改成 map+型別守衛（`filter` 不會窄化型別）。
> - **內文（richText）欄位是灰底、其他欄位是白底。** Lexical **完全沒有自己的背景色**
>   （它的樣式表只定義 error 狀態），所以在米色後台底上看起來像一塊灰色空隙。
>   `adminBrand.css` 補上與 text/textarea 一致的白底＋邊框＋6px 圓角＋`min-height`。
>   🚩 兩個實作陷阱：① **要套在 `.editor-container`，不是 `.rich-text-lexical__wrap`** ——
>   `__wrap` 裡面**也包含欄位說明文字**，套在它上面會把說明包進輸入框內（第一版就是這樣，
>   已截圖發現並改掉）；② 必須加 **`:not(.error)`** —— `adminBrand.css` 在
>   `@payloadcms/next/css` **之後**載入，同特異度時我們會贏，等於默默吃掉無效欄位的紅色提示。
> - **順手驗了一個沒人問但更危險的情境**：`/announcements/[slug]` 是 `generateStaticParams`
>   產生的 ● SSG，**build 之後才新增的公告會不會 404？** 實測**不會** —— Next 預設
>   `dynamicParams: true`，新 slug 走 on-demand 渲染（`getAnnouncementBySlugCached` 以 slug
>   為 key，新 slug 必然 cache miss → 直接讀 DB）。**正式站新增公告不需要重新 build。**
>
> 驗收（第 3 節）：`generate:types` 已重生並 commit（`slug` 轉選填）／`lint` 0 error／
> `tsc --noEmit`／`i18n:check` 730 鍵（未動文案）／冷建綠。後台畫面以**臨時 full-access 帳號**
> 登入無頭 Chrome 截圖確認（驗完即刪該帳號）；hook 行為以 Payload local API 跑過上述四組輸入
> （臨時公告驗完即刪，現 DB 只剩業主自己那筆測試公告，slug＝`announcements`）。
>
> ### 4. 業主回報「改了內容不會馬上生效」→ 全站 revalidation 一直是 stale-while-revalidate
>
> 🚩 **這不是公告專屬的 bug，是全站每一個 CMS 讀取都中的。** 根因在
> [`src/lib/revalidateContent.ts`](../src/lib/revalidateContent.ts) 的 `safeRevalidateTag()`：
> 它呼叫 `revalidateTag(tag, 'max')`，而 `'max'` 是 Next 16 的 **stale-while-revalidate**
> 設定檔 —— 只把條目標記為 stale，**存檔後第一次造訪仍然回舊值**、同時在背景重新產生，
> 所以要重新整理**兩次**才看得到新內容。所有集合與 global 的 revalidate 函式都走這支 helper，
> 等於後台改任何東西（公告、學院文章、FAQ、網站設定…）都是這個行為。
>
> **處置＝改成 `revalidateTag(tag, {expire: 0})`（立即過期）。**
> - Next 為「read-your-own-writes」準備的 API 是 `updateTag()`，但它**只能在 Server Action
>   裡呼叫**；Payload 的存檔跑在它自己的 **REST route handler**，官方文件對這個情境給的寫法
>   正是 `revalidateTag(tag, {expire: 0})`（見 `node_modules/next/dist/docs` 的
>   `revalidateTag.md`「Good to know」與 `updateTag.md`「Differences from revalidateTag」）。
> - **不要改回 `'max'`。** 原因已寫在該檔的註解裡。
> - 代價：存檔後的那**一個**請求會是真實的資料庫讀取（阻塞式 cache miss）而不是秒回舊值，
>   之後照常走快取。對 CMS 來說這是正確的取捨。
> - `revalidatePath` 不必改 —— 它在 route handler 裡本來就是「下次造訪時重新產生」，
>   真正回舊值的是帶 tag 的 `unstable_cache` 條目。
>
> **驗收方式（日後驗快取都可照做）**：`npm start` 跑正式建置，用 REST PATCH 改資料
> （與 `/admin` 存檔同一條 code path，`afterChange` 會在同一個程序內跑），然後比對
> **存檔後第一次** `curl` 的 HTML。修正前：第 1 次仍是舊值、第 2 次才變新值；修正後：
> 第 1 次就是新值（公告列表＋詳情皆驗）。另外驗了**只 revalidate tag、沒有 `revalidatePath`
> 的 global**（`site-settings` 的電話 → `/privacy` 的聯絡卡）也是第一次就更新，確認 tag
> 失效會連帶讓用到該 tag 的預產生頁面重新產生。驗完已把測試值全部還原。

> **✅ 第六十輪（2026-10-12）完成：官方公告 `/announcements` 上線（CMS 可新增、分類可自建）。**
>
> 業主指示：「我想加一個公告位在官網，在 CMS 要有地方加，分重要公告及交易安排（要有分類）」。
> 四個方向級問題先問齊，業主拍板：**① 獨立新頁 `/announcements`（`/news` 保留不動）；
> ② 需要詳情頁（可放長文、清單、表格）；③ 分類要能在後台自由增刪；④ 頂部菜單加一個獨立項目。**
>
> ### 1. 資料模型：兩個新集合（分類是集合，不是自由文字）
>
> - **`announcements`**（`src/collections/Announcements.ts`）：標題／網址代稱（唯一、index）／
>   分類（relationship → `announcement-categories`，可空）／摘要／內文 richText／發佈日
>   （預設今天）／**置頂**／啟用。標題、摘要、內文為 localized。
> - **`announcement-categories`**（業主自建）：名稱（localized）／網址代稱／排序／啟用。
>   **刻意做成集合而不是學院那種自由文字 `category` 欄** —— 自由文字打錯字就會從前台篩選
>   消失（第三十九輪的已知債），relationship 不可能漂移，而且業主新增分類後前台篩選自動長出來。
> - 🚩 **不種任何公告。** `scripts/seed-announcements.ts` 只建立業主指定的兩個分類
>   （`important` 重要公告／`trading-arrangement` 交易安排，三語，冪等）。公告是公司對外聲明，
>   比照 news／見證的紅線：**空就顯示中性空狀態，不造假資料**。
> - 分類被刪除時，原本屬於它的公告**自動變成「未分類」**（reader 的 `mapCategory` 容錯），
>   不會 500、也不會從列表消失。
>
> ### 2. 前台：列表 ＋ 詳情，維持 ● SSG
>
> - `/announcements`＝`AnnouncementsHero`（沿用學院的 navy→gold 標題帶＋白色麵包屑）
>   ＋ server `AnnouncementsList`（`Promise.all` 取公告與分類）＋ client `AnnouncementFeed`
>   （分類 chip 篩選＋每頁 10 筆分頁）。`/announcements/[slug]`＝`AnnouncementView`
>   （Lexical `RichText`，沿用學院 prose 樣式**並補上表格樣式** `[&_table]/[&_th]/[&_td]`，
>   因為交易安排公告大多是時段表）。
> - **排序＝置頂優先，其次發佈日新→舊**（無日期排最後）。
> - 🚩 **`useSearchParams` 必須關在一個不渲染內容的 `<Suspense>` 子元件裡**（`CategoryQuerySync`），
>   否則整個列表會變成 client render、公告從靜態 HTML 消失（＝SEO 回歸）。這是第五十四輪
>   `/academy` 的既有慣例，本輪照做並已驗證三語 `announcements.html` 內含公告卡片。
>   寫回網址用 `history.replaceState`。
> - **分類深連＝`/announcements?category=<slug>`**，slug 來自 CMS（不是程式常數，因為業主要
>   自由增刪），未知值忽略＝退回不篩選。
> - **通用文案沿用 `academy.*` 既有鍵**（「全部」、分頁的上一頁／下一頁／第 N 頁），不重複開鍵。
>   順手把 `/academy` 與 `/announcements` 重複的日期格式化與分頁頁碼計算抽成
>   `src/lib/dates.ts`、`src/lib/pagination.ts`（行為不變）。
>
> ### 3. 🚩 Header 斷點：加第五個頂層項目後 `lg` 不夠用了（本輪最花時間的坑）
>
> 加「公告」之後，**英文版在 1024px 與 1280px 都會把 logo 擠成 0 寬、導覽標籤換行**。
> 在 1920px 實測不換行所需寬度＝**1411px**（含業主尚未設定、設定後會出現的「登入」連結）。
> 處置：導覽間距收為 `gap-6`（`2xl` 才 `gap-8`）、header 內距收為 `lg:px-12`（`2xl:px-20`）
> → 需求降到 **1307px**，於是把桌機橫列的斷點改成 **`min-[1360px]`**（餘裕 53px），
> 未達者走手機抽屜（`HeaderMobileMenu` 改 `min-[1360px]:hidden`）。
> **不要把導覽改回 `lg`／`xl`**；量測數字寫在 `Header.tsx` 的註解裡。
> 日後再加頂層項目必須重新量測，或改採收納式設計。
>
> ### 4. 接線
>
> `payload.config`／`permissions/registry`（create/update/delete ＋ `slug`、`enabled` 欄位權限）／
> `cacheTags`（`announcements`、`announcementCategories`）／`revalidateContent`
> （兩者都 revalidate `/${locale}/announcements` 的 `'layout'`，所以詳情頁也會更新）／
> `sitemap.ts`（列表＋每則公告 ×3 語）／`DashboardHub` 新增「公告」入口卡（三語）／
> `nav.announcements` 與 `metadata.announcements`。
>
> ### 驗收
>
> `generate:types` 已重生並 commit／`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／
> `tsc --noEmit` 乾淨／`i18n:check` 三語 **730 鍵**（716 ＋14）／`pkill` 後 `rm -rf .next` 冷建綠，
> `/announcements` 與 `/announcements/[slug]` 皆 ● SSG。`npm start` 實測：三語列表 200、
> 詳情 200、不存在的 slug 404、`/admin` 與 `/api/users/me` 200、sitemap 含列表與各公告 ×3 語。
> **用三筆臨時測試公告驗過互動後已全部刪除**（深連 `?category=important` 正確篩選並點亮 chip、
> 點分類會寫入網址、「全部」清除參數、未知 slug 退回不篩選、header「公告」會亮 navy），
> 現在 DB 只剩兩個分類、零公告，前台顯示中性空狀態。
> 截圖檢查：1440／1360／1280／390 四個寬度 × 三語 × 列表/詳情。
> **沒有 `migrate:check` 可跑**（Postgres 時代的閘門，第五十九輪已退役）；
> Mongo 是 schemaless，新集合不需要任何 DDL 或 migration。

> **✅ 第五十九輪（2026-10-12）完成：CMS 換到 MongoDB（庫名 `hatc-cms`）、migration 機制退役、
> 交付改走 Gitee 增量同步。**
>
> 業主三項指示：「1. db 改用 mysql　2. 數據庫改名為 `hatc-cms`　3. 之後直接 push 到 git 地址上改」。
>
> ### 1. 🚩 MySQL 不存在 → 業主改選 MongoDB
>
> **Payload 3 沒有 MySQL adapter**（`@payloadcms/db-mysql` 在 npm 上 404，本輪再次驗證）。
> 依規則先 `AskQuestion` 問業主，業主給的理由是「要與公司既有系統共用同一個資料庫」卻選了
> MongoDB —— **這兩件事互相矛盾**（Mongo 一樣無法與 MySQL 共用，伺服器上反而要多裝一套），
> 已把矛盾明白指出並再問一次，**業主確認照做 MongoDB**，接受 migration 全部重做。
> **日後再有人提 MySQL，答案仍是「沒有 adapter」，不要自行實作。**
>
> - **程式改動極小、風險集中在周邊**：`payload.config.ts` 換成
>   `mongooseAdapter({url: process.env.DATABASE_URI || false})`。**`|| false` 不可拿掉** ——
>   它讓無資料庫時 Payload 仍可載入（`next build`／CI 走 i18n/SSG fallback）；空字串會被當成
>   要連線而拋錯。移除 `@payloadcms/db-postgres`，安裝 `@payloadcms/db-mongodb@3.87.1`（對齊
>   payload 版本，不用 npm 上較新的 3.90）。
> - **ID 由數字變字串（ObjectId）**：`payload-types.ts` 重生後 45 處 `id: number` → `string`。
>   **全站零改動**，因為每個 reader 本來就寫 `String(doc.id)`、access 只做等值比較；
>   `tsc --noEmit` 乾淨。**新程式碼不得假設數字 ID。**
> - **migration 機制整套退役**：刪 `src/migrations/*`（三個 Postgres SQL migration ＋ 39 表
>   基線 snapshot）、`scripts/check-migrations.sh`，拿掉 `migrate`／`migrate:create`／
>   `migrate:status`／`migrate:check` 四個 npm script、CI 的「Payload migration drift」步驟、
>   pre-commit 的 schema 閘門（i18n 閘門保留）。
>   **Mongo 是 schemaless，Payload 連線時自動建立 collection 與索引**，所以改 schema 後
>   **只要 `npm run generate:types`**。若日後需要**資料**（非 schema）搬遷，才用
>   `npx payload migrate:create`。
> - **交易不受影響**：adapter 偵測到連線不是 replica set 會自動 `transactionOptions=false`，
>   單機 standalone 照常運作（已實測）。
>
> ### 2. 庫名 `hatc-cms` ＋ 本機資料搬遷
>
> 本機新容器 **`hatc-mongo`**（`mongo:7`，volume `hatc-mongo-data`，帳密 `hatc`/`hatc_dev`，
> port 27017），連線字串 `mongodb://hatc:hatc_dev@127.0.0.1:27017/hatc-cms?authSource=admin`。
> ⚠ 庫名含連字號，`mongosh` 指定時要加引號。**舊的 `hatc-postgres` 容器刻意沒刪**（舊資料可查）。
>
> **資料用種子腳本還原，與舊庫逐項對齊**：學院 49（三批原創 ＋ GitBook 匯入 22）／媒體 53／
> 出入金 14／FAQ 12／帳戶賣點 4／平台 3／`roles` 1。另外手動補回 `site-settings` 的電話、
> 電郵、開戶連結，以及後台帳號（**直接沿用原本的密碼雜湊與 salt**，所以原密碼仍可登入；
> 若失敗就刪掉 `users` 文件重新註冊，第一個帳號會自動拿到全權角色）。
>
> ### 3. Gitee 改走增量同步（新腳本 `scripts/sync-gitee.sh`）
>
> 業主拍板「以開發的 `gitee/master` 為基線、保留他們的部署檔、再把我們的改動疊上去，
> GitHub 保留完整 33 commit 歷史」。**已比對：開發端沒有新增任何檔案**（zip 原封不動匯入，
> 差異只有 zip 丟失的執行權限、刻意排除的 `lp.zip`，以及我們之後更新的四份文件）。
>
> - **🚩 量測結果決定了做法**：把 `main` 整條推上 Gitee 需要 **39.6 MiB**（＝第五十八輪推爆
>   兩次的那包）。以 `gitee/master` 為 parent、只疊一個 commit → **實際只傳 18 KiB、5 秒完成**。
> - 流程寫成 `scripts/sync-gitee.sh`：fetch → 用**暫存索引**（不碰真索引）組出 tree 等於
>   `HEAD`、排除 `lp.zip` 的 commit → 推 `master`。會擋髒工作區、樹沒變就結束、推前印出預估量。
> - **Gitee = 獨立血統的部署鏡像，GitHub = 真歷史。** 本地分支 `gitee-main` 記錄鏡像最新點
>   （現為 `3e17493`）。
> - 從 Gitee `fetch` 這次只花 22 秒（第五十八輪說「>10 分鐘」是首次抓整包）。
>
> ### 4. 順手修掉的生產隱患：種子腳本會吃掉文案修正
>
> 重建本機資料時發現 **`scripts/seed-funding.ts` 會把 `funding-page` global 的 22 個文字欄位
> × 3 語系灌成 i18n 預設值的逐字副本** —— 這正是第五十七輪查到「CMS 影子副本吃掉紅線修正」的
> **真正來源**（當時以為是有人在 `/admin` 手動測試留下的）。而 `docs/DEPLOYMENT.md` §4.1 正是
> 叫開發在正式站跑這支腳本 → 上線即永久凍結該頁文案。**已移除該段種子邏輯**（圖片欄位的
> 連結保留，圖片沒有 i18n fallback 層，不會造成影子副本），並把這條寫進規則檔。
>
> ### 驗收
>
> `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check`
> 三語 **716 鍵**（未動文案）／`rm -rf .next` 冷建綠且全頁 ● SSG（`/academy` 49 篇全部預先
> 渲染＝確認是從 Mongo 讀到的）。`npm start` 實測：六個三語頁面、`/admin`、`/api/users/me`
> 全 200，`/api/market/quotes` 仍回真實報價，`/funding` 回到 i18n 文案（影子副本已清）。
> **沒有 `migrate:check` 可跑了 —— 那是 Postgres 時代的閘門，已隨 migration 一起退役。**

> **✅ 第五十八輪（2026-10-11）完成：官網不再提及未提供的「執行方式」；Header 登入按鈕改走
> CMS 設定、未填即隱藏。**
>
> 業主本輪兩項指示：「去除其餘交易條件（執行方式等）」＋「先隱藏登入按鈕」。兩個方向級問題先問齊，
> 業主拍板：**四處全部移除（含免責聲明那句）**、登入**改成 CMS 可設定**（而非直接刪掉按鈕）。
> - **移除「待公佈」佔位（四處）**：`/products` 條件表與 `/trading` 帳戶比較表的
>   「其餘交易條件（執行方式等）／將另行公佈」列、`accounts.tiers.note` 的「執行方式將另行公佈。」、
>   `/disclaimer`「交易條件」章節的對應句子（三語）。`products.conditions.pendingLabel` 已刪；
>   **`pending`（將另行公佈）保留**——`/products/all` 仍用它填「CMS 自建但無核可條件」的格子。
>   `legal.updatedAt` 本就是 2026-10-11（＝改動日），無需再動。
> - **🚩 順手修掉一個與 FACTS 衝突的舊文案**：`/trading` FAQ「HATC 的交易時間是？」原答
>   「**華安泰昌的實際交易時段將另行公佈**」——交易時段早在第四十七輪就成為**已核可事實**
>   （夏令／冬令，見 FACTS「Contract size & trading hours」），該句直接與同站其他頁矛盾。
>   已三語改寫為核可時段＋每日休市一小時，**依紅線不標夏令/冬令轉換日期**。
>   （`faqs(category='trading')` DB 無資料 → 走 i18n fallback，改 messages 即生效。）
> - **登入 ＝ 第四個 CMS 營運連結**：新欄位 `SiteSettings.memberLoginUrl`（＋
>   `NEXT_PUBLIC_MEMBER_LOGIN_URL` fallback）＋ `memberLoginHref()`；`Header`／`HeaderMobileMenu`
>   **未設定即不渲染**（比照 `demoAccountHref()`）。原先硬指 `/account`「即將推出」＝對真客戶是死路。
>   `/account` 佔位頁保留但**已無連結指向、也不在 sitemap**。
>   ⚠ **schema 變更** → migration `20261011_122325_add_member_login_url`（本機 dev 另手動
>   `ALTER TABLE site_settings ADD COLUMN member_login_url varchar`，因為 build 會讀這個 global）。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 既有 warning）／`tsc --noEmit`／`i18n:check`
>   三語 **716 鍵**（718 −`pendingLabel` −免責那句）／`migrate:check` 無漂移／`rm -rf .next` 冷建綠
>   ● SSG。實測 **CMS 填值→登入出現（桌機＋手機抽屜、三語）／清空→消失**；`/products`、`/trading`、
>   `/accounts`、`/products/all`、`/disclaimer` 渲染後的 markup 已無「其餘交易條件」與多餘的
>   「將另行公佈」（僅 `/accounts` FAQ 的模擬帳戶那句保留＝仍屬實）。
> - **⚠ 本輪踩到的環境雷（新增紀錄）**：`lsof -ti:3000 | xargs kill` **只殺掉監聽程序，`npm start`
>   外層仍在**，接著 `rm -rf .next && npm run build` 會與它搶 `.next` → 冷建失敗並噴出看似無關的
>   `next/font/google queries have exactly one entry`（Google Fonts 其實連得到）。**建置前請
>   `pkill -f "next start"; pkill -f "next-server"`**，失敗後要再 `rm -rf .next` 才能恢復。
>   另外 `npm start` 與 `chrome-headless-shell` 都**必須以背景 Shell 任務執行**（用 `&` 起會被收掉，
>   症狀是 curl 回 `000`、截圖變成錯誤頁）。
> - 細節見下方「🟢 第五十八輪」。
>
> **下一輪候選（皆非阻塞，請先問業主要做哪一項，一次做一件）**
> - **(a) 補齊 About 區段錨點，再修 Footer「關於我們」欄**（第五十七輪業主暫不處理的保留項）。
>   該欄 l1–l3 全指 `/about` 且 **About 改版後完全沒有任何區段 id**；標籤「安全與監管 /
>   Security & supervision」容易被讀成 HATC 自身受監管。要做必須先在 `src/components/about/*`
>   補 id ＋ `scroll-mt`，並重寫該標籤。
> - **(b) EA／自動化交易支援轉為核可事實**（業主 2026-10-11 表示 MT5 伺服器確實允許 EA、會正式確認）。
>   確認後：寫入 `HATC_FACTS.md`「Trading platforms」、把 `platforms.faq.items[3]` 與 **CMS `faqs`
>   id=12** 的措辭對齊，並檢查是否要在 `/platforms` 賣點補一條。**未正式確認前不得在別處新增 EA 文案。**
> - **(c) 首頁 MT5 展示區換真實截圖**：`home/MT5Showcase` 仍用 `public/figma/raw/raw_3.png`
>   ＝Figma AI 算圖的假 MT5 畫面，與第五十一／五十二輪確立的「站上不放假平台截圖」紅線衝突。
>   可改走 `resolvePlatformVisual()`／`PlatformVisualPanel`，或用 `public/platforms/mt5-desktop.png`
>   （業主已放寬的供應商示範畫面，但**顯示它的版面必須印 `platforms.types.vendorNote`**）。
> - **(d) 正式站上線前的營運設定盤點**：本機 DB 已填核可的客服電郵／電話（法律頁的資料查閱窗口讀它）
>   與開戶連結；**正式站是空庫，必須重新填**。模擬帳戶連結與本輪新增的會員登入連結**業主尚未提供**，
>   未填即不渲染（這是設計行為，不是 bug）。
> - **(e) 兩個法律頁（`/privacy`、`/disclaimer`）仍待業主／法務逐條審核**，並決定是否補管轄法律、
>   資料保存期限、具名資料處理者。**改法律文字必須同時更新 `legal.updatedAt`。**
> - **(f) FACTS 唯一剩下的待提供交易條件＝執行方式**（本輪起官網不再提及；業主提供後才新增正式內容）。

> **✅ 第五十七輪（2026-10-11）完成：全站行銷文案補齊第三個 CFD 品種「人民幣公斤條」，Footer
> 交易服務欄改由 `CFD_PRODUCTS` 生成；順手拆掉兩個會讓文案修正「看不見」的陷阱。**
>
> 業主選定第五十五輪留下的候選 (d)＋(e)（我先指出兩者是同一個根因＝全站產品清單還停在「黃金／白銀」），
> 並在三個方向級問題上拍板：交易服務欄走 **A 案**（三品種＋交易條件）、**關於我們欄本輪不動**、
> **EA FAQ 保留不改**。
> - **六個活鍵改文案（三語）**：`home.heroV2.subtitle`／`home.footerV2.brandDesc`／`accounts.cta.body`／
>   `funding.cta.body`／`platforms.faq.items[4].a`／`nav.mega.banner.desc`。mega 橫幅太窄，列三個會換行
>   → 用**「貴金屬」**概括；`heroV2` 的「全球黃金市場」也改成**全球貴金屬市場**（白銀不屬黃金市場）。
> - **🚩 `home.hero.*` 整個區塊是死鍵 → 已刪（6 鍵 × 3 語）**。首頁 hero 渲染的是 `home.heroV2`，
>   CMS 覆寫也掛在 `heroV2` 上，全站沒有東西讀 `home.hero.*`。**第五十五輪清單裡「`home.hero.subtitle`
>   〔⚠ 可被 CMS 覆寫〕」指錯對象**——可被覆寫的是 `heroV2.subtitle`。
> - **🚩 新發現的通用陷阱：CMS marketing global 的影子副本會吃掉 i18n 修正**。`funding_page` 的 22 個
>   欄位、三語全部是 i18n 預設值的逐字副本，而 `pickText` 只要 CMS 非空就贏 → 改 i18n 無效。
>   **已清成 NULL**（輸出不變、圖片在父表不受影響）。**日後改任何可被 global 覆寫的文案前，
>   先查 `*_page_locales`。** 寫進規則「CMS-first content architecture」。
> - **`faqs` 不能清空**（collection 級 fallback：該分類有列就完全不讀 i18n）→ 直接 UPDATE id=13 三語。
>   `scripts/seed-platforms.ts` 是 seed-once，正式站空庫會種到新文案，腳本不需改。
> - **Footer 交易服務欄改生成式**（比照第五十四輪學院欄）：由 `CFD_PRODUCTS` 產生
>   `/products#{gold,silver,kilobar}`＋`#conditions`，標籤讀 `products.items.*.name`／
>   `products.conditions.heading`，**不另開 footer 鍵** → 增刪品種自動跟上。
>   刪掉 `cols.trading.l1–l4` → 三語 **718 鍵**（728 − 6 − 4）。
> - **業主保留的兩項（不要自行改）**：① 關於我們欄——已知 l1–l3 都指 `/about` 而 **About 完全沒有
>   區段 id**，且「安全與監管」易讀成 HATC 受監管；要做需先補 About 錨點。② EA FAQ——業主表示
>   MT5 伺服器確實允許 EA、日後正式確認為核可事實，已在 FACTS 記為**【待業主確認】**。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 718 鍵／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠且維持
>   ● SSG。`npm start` 實測六個鍵三語渲染、footer 四連結三語正確、四個錨點以 CDP 量測皆停在 80px
>   sticky header 下方、mega 橫幅單行；footer 桌機／平板／手機＋英文截圖逐一看過。
> - 細節見下方「🟢 第五十七輪」。

> **✅ 第五十六輪（2026-10-11）完成：業主一次給了三件事，全部做完 —— ① 最低手數 0.01 與交易手續費
> 全免成為已核可事實（四個頁面同源顯示）；② 全站外部連結改同視窗；③ 隱私權政策與免責聲明兩頁三語上線。**
>
> 業主沒有從候選清單選，而是直接指示：「交易條件最低手數：0.01、手續費全免。另外，開戶跳轉不要用打開
> 新視窗方式。另外，需要完成隱私權政策及免責聲明。」依工作規則**先把方向級紅線問齊才動手**（手續費涵蓋
> 範圍／手數適用品種／法律文本來源／同窗套用範圍），四個問題業主都已拍板。
> - **🚩 最重要的一個邊界**：FACTS 原本明文「**無佣金欄位** → 官網不得聲稱佣金金額或『零佣金』」。
>   業主確認「手續費全免」**只涵蓋交易時收取的手續費／每手佣金**，**不含隔夜利息（庫存費／swap）與
>   入金／出金費用** → 官網一律寫**「交易手續費」**，並在同一版面以細則交代排除範圍；**不得**寫
>   「免任何費用」「零成本」。第四十四輪那條限制**到此解除**，但非零佣金金額仍屬虛構。
>   FACTS「仍待業主提供」現在**只剩「執行方式」**。
> - **事實仍留在程式**：`products/tradingConditions.ts` 新增 `MIN_LOT = 0.01` 與
>   `MIN_LOT = 0.01`（手續費不建常數，範圍限制寫在檔頭 ⚠ 區塊）。五個元件同源顯示：`/products` 產品卡（2×2）與條件表、
>   `/trading` 帳戶比較表、`/accounts` 帳戶卡、`/products/all` 表格（新增兩欄、`min-w` 720→920px）。
> - **外部連結同窗**：業主選擇**套用到全站**（不只開戶）→ 移除 22 處 `target="_blank"`＋
>   `rel="noopener noreferrer"`。新增 CTA 不得再加回去（已寫進規則「Content governance」）。
> - **法律頁＝保守版草稿，待業主／法務審核**。內文只由兩個來源推導：網站**實際**行為（未啟用任何
>   分析追蹤、前台無會送出資料的表單、cookie 實測只有 `NEXT_LOCALE` 與後台兩個）＋ FACTS 公司資料。
>   **刻意不寫**保存期限、具名資料處理者／主機商、管轄法律／仲裁條款、合規保證。詳見下方第三節。
> - **⚠ 上線前必辦**：後台 `SiteSettings` 要填客服**電郵／電話**（法律頁的資料查閱窗口讀它，
>   未設定即不渲染該列；值為 FACTS 已核可的 `info@hatchk.com`／`(852) 2322 2888`。本機 DB 已填入以
>   驗證渲染）。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 三語 **728 鍵**（662 → 666 → 728）／`migrate:check` 無漂移（未動 schema）／
>   `rm -rf .next` 後 `build` 綠，`/privacy`、`/disclaimer` 三語皆 ● SSG。`npm start` 實測六頁 200、
>   sitemap 含兩條新路徑；`/products`、`/products/all`、`/accounts`、`/trading` 與兩個法律頁
>   以獨立 headless Chrome 截圖檢查桌機 1440／平板 834／手機 390。
> - 細節見下方「🟢 第五十六輪」。

> **✅ 第五十五輪（2026-10-11）完成：三語 SEO 描述修正 —— `/platforms` 不再宣稱「平台介面為示意」
> （第五十一／五十二輪換成真實截圖後該句已不實），並把首頁／`/trading`／`/platforms` 的產品清單
> 補齊成已核可的三個 CFD 品種。**
>
> 業主從第五十四輪留下的候選清單選定 (b)。
> - **根因**：`metadata.*.description` 是**搜尋結果上對外的第一句話**，但歷輪改頁面內容時沒人回頭
>   對照它。`/platforms` 那句「平台介面為示意，實際畫面以正式發佈為準」是第三十八輪平台圖還是
>   Figma mockup 時寫的，第五十一／五十二輪換成真實交易端截圖＋供應商官方畫面後就變成不實陳述。
> - **順修同類缺漏**（同一個 `metadata` 區塊、同一種錯）：`metadata.home.description` 只寫
>   「黃金、白銀」、`metadata.trading.description` 只寫「倫敦金與公斤條」（漏白銀）——FACTS 的 CFD
>   標的自 2026-10-11 起是**黃金／白銀／人民幣公斤條**三項。三語九句一次補齊。
> - 同時修掉 `platforms/page.tsx` 的 JSDoc：「Platform visuals are branded gradient placeholders」
>   也是同一句過時敘述，會誤導下一位 agent。
> - **🚩 本輪順手做了全站文案稽核**（列出所有「只講金銀、漏公斤條」的鍵），**刻意沒改**——那是行銷
>   文案不是 metadata，且 `home.hero.subtitle` 可被 CMS 覆寫，屬獨立決策。清單見下方「🟢 第五十五輪」
>   第三節，是現成的下一棒候選。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 三語 **662 鍵**（只改值、未增減鍵）／`migrate:check` 無漂移（未動 schema）／
>   `rm -rf .next` 後 `build` 綠且頁面維持 ● SSG；直接讀 `.next/server/app/**` 的靜態 HTML 確認
>   九個 `<meta name="description">` 全部是新文案。無版面變更（只動 `<meta>` 與註解）。
> - 細節見下方「🟢 第五十五輪」。

> **✅ 第五十四輪（2026-10-11）完成：Footer「黃金學院」欄四個標籤改成真實分類，`/academy` 新增
> `?category=` 深連（兩向同步），而且 `/academy` 仍是 ● SSG。**
>
> 業主從第五十三輪留下的候選清單選此項，並拍板該欄**維持 4 格**（全部文章＋三個分類）。
> - **問題同第五十三輪的根因**：原標籤（基礎課程／進階分析／巨集觀基本面／技術指標解讀）對不上
>   `academy.categories` 的真實六分類，四格還全部指向未篩選的 `/academy`。
> - **分類 slug 新增單一來源 `src/lib/academyCategories.ts`**（gold-basics／trading-strategy／
>   technical-analysis／market-moves／risk-management／portfolio）。**順序必須對齊三語
>   `academy.categories`**；slug 穩定，所以業主改分類顯示名不會斷連結。⚠ **日後增刪分類要同一次
>   改動同時改這支檔**（`i18n:check` 看不到它）。
> - **🚩 SSG 保衛戰（新慣例）**：`useSearchParams` 會把**最近的 `<Suspense>` 邊界以內**改成
>   client render。直接加在 `AcademyExplorer` 上，49 篇文章的卡片會整批從靜態 HTML 消失。正解＝
>   把讀網址的邏輯抽成**不渲染任何東西**的 `CategoryQuerySync`，單獨包一層
>   `<Suspense fallback={null}>`。日後任何「URL 狀態同步」都照這個做。
> - **Footer 標籤直接讀 `academy.categories`**，不另開 footer 鍵 → `cols.academy.l2/l3/l4` 刪除、
>   `l1` 改「全部文章」，三語 **662 鍵**（665 − 3）。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 三語 662 鍵／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠、
>   `/academy` 維持 ● SSG 且靜態 HTML 仍含 9 張卡＋「49 篇精選」。`npm start` 以 CDP 實測深連、
>   多選、未知 slug、同頁再點 footer、瀏覽器上一頁、頁內套用／重設回寫網址共 12 個情境；
>   三語 × 桌機 1440／平板 834／手機 390 的 footer 截圖逐一看過。
> - 細節見下方「🟢 第五十四輪」。

> **✅ 第五十三輪（2026-10-11）完成：Footer「MT5平台」欄改為「交易平台」，四個連結從首頁 teaser
> 改接 `/platforms` 的真實區段；順手清掉該欄的未確認平台能力宣稱。**
>
> 業主本輪從候選清單選此項，並同意先把落後的兩個 commit push（已推，origin＝`25417e0`）。
> - **不只是改名**：該欄四個連結原本**全部**指向首頁 `/#mt5` teaser，標籤還承諾了不存在的目的地
>   （MT5客戶端下載／移動平台操作／操作常見指南），其中 **「EA程序化支持」是未確認的平台能力宣稱**
>   （FACTS「Trading platforms」明列不得聲稱跟單/量化等能力）→ 整欄重做。
> - **i18n 鍵改名** `home.footerV2.cols.mt5` → **`cols.platforms`**（三語，沿用第三十八輪 header
>   `nav.mt5`→`nav.platforms` 的命名）；鍵數不變 **665 鍵**。新標籤＝平台總覽／MetaTrader 5／
>   行動與網頁交易端／平台常見問題。
> - **連結全部落到真實目的地**：`/platforms`、`/platforms#platform-types`（×2）、
>   **`/platforms#platform-faq`**。最後一個是新錨點 → `PlatformFaq` 區段補 `id="platform-faq"`
>   ＋`scroll-mt-20`（比照 `#platform-types`）。實測兩個錨點都停在 sticky header 下方，未被遮住。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 三語 665 鍵／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠且
>   頁面維持 ● SSG。三語 × 桌機 1440／平板 834／手機 390 的 footer 截圖逐一看過，無溢出或斷行問題；
>   全站掃過已無任何 `/#mt5` 連結。
> - **🚩 同時發現、本輪刻意沒動的同類問題**（都在 footer／平台頁，列為下一棒候選，見下方「待業主」）。
> - 細節見下方「🟢 第五十三輪」。

> **✅ 第五十二輪（2026-10-11）完成：① 開戶連結正式進 CMS（並修掉「開戶按鈕指到客服連結」的語意錯誤）；
> ② 平台視覺照業主指示改走首頁那張圖的「概念」，交易端截圖全部重截成真正的手機螢幕。**
>
> 業主本輪兩句指示：「目前換的交易平台圖都很醜，不如你用首頁那張圖的概念」＋「開戶連結應該在 CMS 配置，
> 我可以先給你一條：`https://h5.hatcmarket.com/#/pages/auth/register/index`」。
> - **開戶連結**：新增 `SiteSettings.openAccountUrl`（Accounts 區塊）＋`openAccountHref(s)`＝
>   `openAccountUrl → primaryContactHref → null`。**原本全站十幾處「立即開戶」都呼叫 `primaryContactHref()`**
>   ＝開戶按鈕其實指向客服連結，現已全部改掉；`/products`、`/trading` 的 CTA band 同時有「開戶」與
>   「聯絡我們」兩顆，**兩個解析器各算一次**。URL 記入 FACTS（僅紀錄，UI 讀 CMS）。
>   ⚠ schema 變更 → migration `20261011_091538_add_open_account_url`（已 commit）。
> - **順修（第四十四輪漏掉的同類問題）**：首頁 `FinalCta` 的「免費模擬帳戶」硬編 `/register`，沒套用
>   「模擬連結未設定即不渲染」規則 → 已改讀 `demoAccountHref()`。另外本機 DB 的 `demo_account_url`
>   先前被填成**註冊頁**（測試殘留，不是業主提供的模擬入口）→ **已清空**；模擬入口仍待業主。
> - **平台視覺＝只換素材與呈現，架構沿用第五十一輪**（`resolvePlatformVisual()` ＋ `PlatformVisualPanel`）：
>   - **根因是素材形狀**：舊截圖是長截圖（860×830 近正方／860×1430），外框依素材比例算 → 長成矮胖方塊。
>     新腳本 **`scripts/capture-terminal.mjs`**（CDP；**必須先點「日K」**才有數據、依「賣出」列上緣裁掉
>     買賣價列）重截 → 手機檔＝一個手機螢幕（**860×1744，1:2.03**）。
>     **`terminal-home.png` 退役**：遊客首頁下半是第三方財經資訊流（A 股公告／國際新聞）。
>   - **呈現**：深藍景深漸層＋金色細線幾何（**不用**浮動 3D 金塊／發光金體——設計紅線）＋裝置外框
>     由面板寬度決定大小、**刻意切出面板下緣**（素材已在買賣價列上方裁過，切下緣不隱藏任何東西）。
> - **同輪追加（業主再指示）**：「MT5 圖用這張」＋「不要全部用同一張圖，網頁端跟 app 有點差異化」
>   → **三種裝置外框**（手機／瀏覽器視窗／螢幕）＋ **MT5 改用供應商官方畫面**，業主**明示放寬**
>   「不得呈現外匯/美股」**僅限該第三方示範圖**，並以新的 `platforms.types.vendorNote` 交代。
>   詳見下方「🟢 第五十二輪」第三、五節。
> - **🚩 沒有照抄業主給的「首頁那張圖」本體**：`public/figma/raw/raw_3.png` 是 Figma 的 AI 算圖
>   （假 MT5 畫面＋浮動金塊），搬到平台頁等於復活第五十一輪剛退役的假截圖。只借呈現概念。
>   ⚠ **該圖目前仍在首頁 `MT5Showcase`**（Figma 核可佔位）→ 與「站上不放假平台截圖」相衝，**待業主決定**
>   是否也換成真實截圖（詳見下方「待業主」）。
> - **文案順修**：`platforms.detail.bullets[0]`「專注黃金 / 白銀 CFD」→「專注貴金屬 CFD」並補人民幣公斤條
>   （三語，對齊 FACTS 三個 CFD 品種）。i18n 仍 **664 鍵**。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check` 664 鍵／
>   `migrate:check` 無漂移／`build` 綠且頁面維持 ● SSG。`npm start` 實測三語 `/platforms`、`/accounts`、
>   `/funding`、`/products`、`/trading` 皆 200；MT5 分頁以 CDP 點擊驗過；桌機 1440／平板 834／手機 390 截圖檢查；
>   另以 `DATABASE_URI=` 空值重建驗過降級路徑（0 個 h5 連結、8 個 `/register` fallback、模擬按鈕不渲染）。
> - 細節見下方「🟢 第五十二輪」。

> **✅ 第五十一輪（2026-10-11）完成：平台視覺全面統一 —— `/platforms` 與 `/accounts` 的平台圖現在
> 三語都有圖，且全部是「誠實可用」的素材（自家真實交易端截圖 ／ 官方 MT5 標誌），通用範本裝置圖全數退役。**
>
> 起因：業主反映「所有交易平台的圖都要有圖，現時 `/accounts`、`/platforms` 都沒有」，並給了一份 Figma
> （`uYnvWpHrVTx8POlR1eYxKT` node `146:63190`）說「如果真實截圖不好看，不如用這個來改」。
> - **🚩 那份 Figma 不能照抄**：它是**競品的行銷海報**——橘色品牌、競品 App logo，手機裡是**競品的外匯報價**
>   （EURUSD／GBPNZD／AUDNZD），文案寫「涵蓋外匯、貴金屬、股指、原油等**上百種**」。同時違反三條紅線
>   （冒用他家截圖、列外匯/股指/原油為 HATC 產品、未確認的「上百種」宣稱）。**只借呈現手法**＝
>   手機外框 ＋ 品牌漸層背景，框內放我們自己的真實截圖。
> - **業主兩項拍板**：① 真實交易端截圖**三語都顯示**（推翻第四十七輪的「只上簡中」——交易端 uni-app
>   專案**完全沒有 i18n 層**，等繁中版＝永不放圖）；② MT5 用 **MetaQuotes 官方素材**。
> - **MT5 用官方 logo 而非官方截圖**：`public/platforms/metatrader5-logo-white.png` 來自
>   **MetaQuotes Media Gallery**（明文授權券商網站免費使用）。**他們的 MT5 截圖一張都不能用**——
>   每一張都帶外匯 Market Watch。
> - **架構**：`terminalScreenshots.ts` → **`platformVisuals.ts`**，`resolveTerminalVisual(p, locale)` →
>   **`resolvePlatformVisual(p)`**，優先序 **CMS 上傳 → 真實截圖 → 官方品牌標誌 → `null`**；新增共用呈現
>   元件 **`PlatformVisualPanel.tsx`**（hero／tabs／accounts 卡**三處共用**）。**日後任何要畫平台的頁面
>   一律用這兩支。** 站上**已不存在「示意」平台圖**（`kind:'mockup'` 連同
>   `public/figma/platforms/*` 一併刪除）。
> - **i18n**：刪 `platforms.types.visualNote`／`platforms.hero.visualLabel`（三語）→ **664 鍵**。
> - **⚠ 新發現的部署雷（非本輪造成）**：`next build` 會重用 `.next/cache` 的 CMS 讀取結果 →
>   **CMS 改過後直接重建可能把舊值烤進 SSG**（實測 `demoAccountUrl` 已設定卻沒渲染，`rm -rf .next`
>   重建才正確）。本機驗 CMS 相關畫面前請先清 `.next`。
> - 細節見下方「🟢 第五十一輪」。

> **✅ 第五十輪（2026-10-11）完成：首頁／平台頁的文案紅線衝突清除、示意跑馬燈收斂成三個真實產品、
> `/accounts` 平台卡換上真實交易端截圖、落後的 commit 已 push。**
>
> 業主本輪選定三項：文案修正（方向 A）、`/accounts` 真實截圖、push。
> - **文案（三語同步）**：`home.goldServices` 的 `f2`「24小時雙向不間斷交易」→**「全球市場時段雙向交易」**、
>   `f3`「極速訂單執行通道」→**「MetaTrader 5 專業交易平台」**；`subheading`／`body` 補上**人民幣公斤條**
>   並改稱差價合約。追加（業主同輪核可）：`home.whyV2.cards.c2`「一流執行速度」→**「透明的交易條件」**、
>   `home.mt5.heading`「國際頂尖」→**「國際通用」**、`platforms.hero.subtitle` 移除「追求極速下單」。
>   業主**保留** `home.mt5.features.f1`「全天候多端自適應」（指多端可用，非交易時段）。
> - **🚨 本輪新發現並修掉的紅線**：首頁 hero 跑馬燈的**示意**列（`SAMPLE_TICKER`）仍含已退役的
>   **`XAU/HKD`** 與 **`USD/CNH`／`HKD/USD`／`XAU/EUR`** ——外匯／非 HATC 產品**即使標了「示意數據」
>   也不得列出**。已收斂為 `XAU/USD`／`XAG/USD`／`RKG/CNH` 三列（＝`MARKET_SYMBOLS`）。
>   閘道正常時跑馬燈本來就只顯示三個真實品種，所以這個違規**只在降級狀態出現**，很容易漏看。
> - **`/accounts` 平台卡**：`AccountPlatforms` 改用新的共用 helper
>   **`resolveTerminalVisual()`**（放在 `components/platforms/terminalScreenshots.ts`）＝
>   **CMS 上傳 → 真實交易端截圖 → `null`**；`null` 時各頁自備佔位（`/platforms` 用 Figma mockup＋「示意」，
>   `/accounts` 用金色漸層＋`panelLabel`，**不放任何假截圖**）。`/platforms` 原本重複的優先序邏輯已改呼叫它。
> - 卡片視覺高度 200→**260px**，portrait 截圖用 `object-cover object-top`＋**底部漸層淡入卡片**
>   （避免 K 線被硬切成破圖）；有截圖時區塊下方補一次 `platforms.types.screenshotNote`（跨 namespace 重用鍵）。
>   截圖只在 **zh-Hans**（交易端僅簡體介面）→ 繁中/英文仍是漸層卡，已實機確認降級正常。
> - 順手修掉 `/api/dev-revalidate` 只列 7 個 tag 的漏洞（改成 `Object.values(CACHE_TAGS)`）——
>   marketing global 的 tag 不在清單裡，改 `src/messages/*` 後 dev 看不到新文案就是這個原因。
> - **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
>   `i18n:check` 三語 **666 鍵**齊（本輪只改值不加鍵）／`migrate:check` 無漂移（未動 schema）／
>   `build` 綠且頁面維持 ● SSG、`/api/market/{quotes,bars}` 為 ƒ；`npm start` 實測即時報價仍為
>   三個真實品種＋「即時報價」標籤。`/accounts` 桌機 1440／平板 834／手機 390 三語截圖檢查過。
> - 細節見下方「🟢 第五十輪」。

> **✅ 第四十九輪（2026-10-11）完成：首頁服務區（gold-services）的 K 線由「Figma 示意蠟燭」
> 改為**自家 MT5 行情閘道的真實日 K**；示意蠟燭降級為「完全沒有行情時」才出現。**
>
> 業主本輪選定此項，並決定**閘道維持 UAT**（生產遊客交易組仍未配產品，那件事仍在業主側）。
> - **實測更正第四十六輪的紀錄**：`/v1/market/bars` 的 `1D`／`60`／`240` **全部可用**（當時判定
>   「回空」是 resolution 寫法問題）。`limit` 是**時間窗不是根數**（`limit=60` → 52 根日 K）；
>   回應**沒有** `result` 包裝；日 K 的 `time` 落在**香港午夜**。
> - **三狀態（紅線落地）**：有日 K →「日 K 線（MT5 行情）」＋綠點；完全沒行情 → 原示意蠟燭＋
>   「示意數據 (設計佔位)」；**有即時報價但日 K 取不到 → 一根都不畫**，只留格線＋
>   「圖表資料暫時無法取得」。三種狀態都已用 `npm start` 實機截圖驗過（桌機／平板／手機／英文）。
> - **順手修掉一個既有的誤導標籤**：K 線框原本**永遠**顯示綠點＋「實時交易中」，卻同時掛「示意數據」
>   → 鍵 `home.goldServices.live` 已刪（三語），改由上述三狀態標籤表達；報價卡真實時，區塊註記
>   也補上免責（`liveLabel · sourceNote`）。
> - **代理鎖品種**：閘道遊客白名單有 29 個代號（含 26 個外匯/指數），`/api/market/bars` 只接受
>   金／銀／公斤條，其餘回 `{ok:false}`。
> - **🚩 本輪發現、尚未處理（需業主定）**：`home.goldServices.features` 的
>   **「24小時雙向不間斷交易」**（與核可交易時段的每日休市牴觸）與**「極速訂單執行通道」**
>   （執行方式在 FACTS 明列「仍待業主提供」，且平台能力紅線禁止速度宣稱）。未擅自改文案。
> - 細節見下方「🟢 第四十九輪」。
>
> **✅ 第四十八輪（2026-10-11）完成：migration 基線上線 — 累積三輪的「正式站 migration」債一次清掉，
> 並加上防止再犯的漂移閘門。另結案業主兩項事實確認。**
>
> **診斷（比交棒 prompt 的描述更嚴重）**：原本以為是「第四十四／四十五／四十七輪少了三個增量
> migration」，實際是**本倉從第一張表開始就沒有任何 migration**（`src/migrations/` 不存在、
> `package.json` 無 migrate 指令），一直只靠 **dev-only 的 drizzle push**。而 **Payload 生產模式不 push、
> 只重播 `src/migrations/*`** → 正式站用正規流程**根本無法建庫**。業主確認「部署之後交給開發處理」
> ＝目前沒有任何正式站資料庫，因此走 **baseline** 而非增量遷移。
> - **`src/migrations/20261011_073413_initial.ts`＋ snapshot `.json` ＋ `index.ts`**＝依**現行 config**
>   產出的完整建表 SQL（39 張表）。現行 config 早已不含退役物件，所以 baseline 天然**不含**
>   `account_tiers`／`account_spreads`／`account_platforms`／`sample_trading_conditions*`，不含
>   `instruments` 的 `contract_size`／`spread`／`leverage`／`trading_hours`，且**含**
>   `site_settings.demo_account_url`。→ 正式站第一次建庫即正確 schema，**不可能**再有舊 27／30 資料。
> - **已實證驗過（非紙上推論）**：另建暫時空庫 → `payload migrate` → `pg_dump --schema-only` 與本機
>   dev 庫逐字比對 → **欄位集合完全一致、零缺漏**（兩份 dump 皆 2968 行；唯一差異是欄位**順序**，
>   dev 是逐輪 push 追加、migration 走 config 順序，對 Payload/drizzle 無影響）。暫時庫驗完已 DROP。
>   ⇒ 這也順便證明第四十四／四十五／四十七輪的手動 ALTER 沒有漏做。
> - **npm scripts**：`migrate`／`migrate:create`／`migrate:status`／`migrate:check`。
> - **防呆 `scripts/check-migrations.sh`（已掛 CI ＋ pre-commit）**：改了 schema 卻沒產 migration 就 fail。
>   原理＝`payload migrate:create` 的 diff 是比對 migrations 目錄最新 snapshot JSON、CLI 帶
>   `disableDBConnect` → **不需資料庫、不需 TTY**，CI 用空 `DATABASE_URI` 即可跑。兩個方向都實測過
>   （乾淨→exit 0；暫時加一個欄位→exit 1）。
> - **事實結案（業主 2026-10-11）**：① 人民幣公斤條合約規模單位＝**克**（已核可事實，非推定）；
>   ② **夏令／冬令切換日期不對外公布** → 只列兩組時段，不得標示轉換日、不得比照美國夏令時間推導。
>   前台與 `tradingConditions.ts` 本已符合，**無需改碼**。
> - 細節見下方「🟢 第四十八輪」。
>
> **✅ 第四十七輪（2026-10-11）完成：① `/products/all` 的退役值 P0 修復（架構層解掉）；
> ② 合約規模與交易時段升為已核可事實；③ 交易端真實截圖上站（簡中版）。**
>
> **① P0 修復 — 退役的 27／30 不可能再復活。** 原因是 `/products/all` 的整張表（含點差/槓桿）
> 由 CMS `instruments` 供應，而 DB 裡是第三十輪的舊種子。業主先選「只把點差槓桿改 code 注入」，
> 但接著又確認**合約規模與交易時段也是事實** → 依治理原則（事實不進 CMS）落地為：
> **表格的所有條件欄位全部來自 `tradingConditions.ts`**，`instruments` 集合**瘦身成純顯示層**
> （名稱／分類／排序／啟用）。
> - `lib/instruments.ts` 重寫＝**以 `CFD_PRODUCTS` 為基底、CMS 只做 overlay**（依 `symbol` 比對；
>   停用該列才會消失）。CMS 新增的未知代號＝沒有核可條件的產品，條件欄渲染「將另行公佈」。
>   名稱 fallback 改用共用的 `products.items.*`，`/products` 與 `/products/all` 不會再各走各的。
> - `Instruments` 集合**移除 4 個欄位** `contractSize`／`spread`／`leverage`／`tradingHours`。
> - `AllInstrumentsTable` **移除「示意數據」badge**（現在整張表都是事實），加「查看各帳戶類型點差」
>   連結與交易時段註腳；`productsAll.table.sampleNote` → **改名 `note`**、刪除 `productsAll.sample.rows`。
> - **`scripts/seed-instruments.ts` 已刪除**（它會把 27/30 再種回去，且表已由 code 產生）。
> - 順手把合約規模欄與交易時段列加進 `/products` 的交易條件表（事實齊全）。
> - ⚠ **DB 已手動處理（本機）**：`DELETE FROM instruments`（2 列舊種子）＋
>   `ALTER TABLE instruments DROP COLUMN contract_size, spread, leverage`＋
>   `ALTER TABLE instruments_locales DROP COLUMN trading_hours`（備份 `/tmp/hatc-instruments-backup.sql`）。
>   **正式站若種過第三十輪的資料，同樣中招 → 必須執行同一組清理＋ migration。**
>
> **② 新的已核可事實（業主 2026-10-11 第四十七輪提供）→ `HATC_FACTS.md`「Contract size & trading hours」**
> - 合約規模：黃金 **100 盎司**／白銀 **5,000 盎司**／人民幣公斤條 **1,000 克**（＝1 公斤）。
> - 交易時段（三品種相同，香港時間 GMT+8）：夏令 週一 06:00–週六 04:45、冬令 週一 07:00–週六 05:45；
>   週二至週五每日休市 夏令 05:00–06:00／冬令 06:00–07:00。**切換日期業主未提供，不得自行標示。**
> - ⚠ **白銀 5,000 是業主裁定值，刻意覆蓋行情閘道回報的 1000**（第四十六輪勘查值）。
>   日後**不得**依閘道「訂正」回 1000，FACTS 已記明。
> - ⚠ 公斤條業主只給「1000」沒給單位，依人民幣公斤金條定義記為**克**；若有誤請業主更正。
> - 程式端唯一來源＝`tradingConditions.ts`（新增 `contractSize`／`contractUnit`／`TRADING_HOURS`）。
> - FACTS「仍待業主提供」縮減為：**最低手數、手續費、執行方式**。
>
> **③ 交易端真實截圖（任務 B）— 已上站，但只在簡中版。**
> 業主拍板：用 **UAT** 先截、**只截遊客可見頁**（行情/K 線，不做需登入的下單/持倉/資金）、
> **繁中與英文版先維持通用裝置圖**（交易端目前只有簡體介面）。
> - 素材＝`public/platforms/terminal-{home,gold-chart,silver-chart}.png`，取自
>   `h5.666678910.com`（uni-app x H5 build＝網頁交易端，與 App 同一套 UI）。
> - 接線＝`src/components/platforms/terminalScreenshots.ts`（依非 localized 的 `panelLabel` 對應：
>   `HATC App`→金 K 線、`Web Trading`→銀 K 線；**MT5 沒有真實截圖，維持 Figma mockup ＋「示意」標籤**）。
>   優先序 **CMS 上傳 → 真實截圖 → Figma mockup**，`PlatformsHero` 與 `PlatformTypes`/`PlatformTabsClient`
>   共用同一套判斷，標籤隨之切換（mockup 才標「示意」）。
> - 新 i18n `platforms.types.screenshotNote`（3 語）＝「實際交易端畫面；圖中報價為截圖當時的市場價格，
>   僅供參考。」**真實截圖不標「示意」**，但誠實說明圖中報價是截圖當下的值。
> - 版面：真實截圖是手機比例 → 面板改 `h-[460px] sm:h-[620px]`（mockup 維持 360/440），說明文字移到
>   面板下方，避免蓋住 K 線。桌機/平板/手機皆已檢查。
> - **截圖治理紅線（已執行，重截時務必照做）**：① **裁掉底部買賣價列**——交易端遊客點差（金 32／銀 38）
>   與核可分級點差不符，不可清晰可辨讀；② 無瀏覽器外框 → UAT 網域不入鏡；③ 只用**數值自洽**的畫面
>   （分時頁曾出現今開 4616 對現價 4194，已棄用；日 K 頁的 OHLC 自洽才採用）。
> - 🚨 **重要發現（需業主處理）**：交易端的**遊客「交易」分頁**（`pages/guest/trade/index`）寫著
>   **「开户领$50奖励」「30分钟出入金」「5×24小时专属客服」「资金独立存取账户0风险」「4+热门贵金属产品」**
>   ——這些都**不是**已核可事實，正是官網被明令禁止宣稱的內容。該頁因此**不可截圖**，且建議業主
>   檢視 App 端文案與官網治理標準是否一致。
>
> **驗收**：`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`i18n:check` 三語 **665 鍵**齊／
> `build` 綠且 `/products/all`、`/platforms` 維持 ● SSG、`/api/market/quotes` 為 ƒ。
>
> **⏭️ 第四十七輪留下的待辦**
> - ~~**正式站**：清 `instruments` 舊資料 ＋ 刪 4 欄的 migration（連同第四十四／四十五輪未做的
>   migration）~~ → **第四十八輪以 baseline migration 結案**（正式站是全新空庫，直接
>   `npm run migrate` 即得正確 schema，無舊資料可清）。
> - ~~業主確認：公斤條合約規模的**單位**是否為克；夏令/冬令**切換日期**是否可公布~~ →
>   **第四十八輪結案**（單位＝克；切換日期不公布）。
> - 交易端截圖：(a) 生產遊客組配好產品後改用**生產**環境重截；(b) 交易端支援繁中/英文後補上另外兩語；
>   (c) 需登入的下單/持倉/資金頁仍需業主提供測試帳號；(d) MT5 仍無真實截圖。
> - `/accounts` 平台區仍用漸層色塊＋`panelLabel`（**無假圖，非紅線**），要不要也換成真實截圖待業主定。
> - 任務 C（閘道 `products[]` 帶出最小手數等規格）**本輪未做**——合約規模/時段已由業主直接提供，
>   閘道值僅作佐證；最小手數仍待業主正式提供，不得逕取閘道值當事實。

> **✅ 第四十四輪（2026-10-11）完成：真實交易條件上線（取代 27/30）＋ MT4 全站下架 ＋
> `/accounts` 由示意改為已核可事實。**
> 業主提供 **MT5 交易組設定表**（截圖）並拍板：新表取代 FACTS 舊的「黃金 27 點／白銀 30 點」、
> 點差對外用**「點」**、`/accounts` 四帳戶改真實分級且**移除「示意數據」標籤**、**人民幣公斤條**
> 加為第三個 CFD 產品、**公司不提供 MT4**、模擬帳戶按鈕改 **CMS 可設定（未填則隱藏）**。
> 事實寫入 `HATC_FACTS.md`「Account types & trading conditions」／「Trading platforms」，程式端唯一
> 來源＝`src/components/products/tradingConditions.ts`；據此**退役 3 個 CMS 集合**（帳戶/點差/平台
> ——事實不該能被後台改到）。詳見下方「🟢 第四十四輪」。
>
> **✅ 第四十五輪（2026-10-11）完成：`/trading` 也吃同一份事實。**
> 帳戶比較改成**真實四檔 Mini/Standard/Pro/VIP**（示意兩檔「標準/專業」與捏造的服務差異列已刪）；
> 「即時點差」區改成**核可條件表 ＋ 可用時才出現的即時報價欄**（接首頁同一套 `/api/market/quotes`，
> 拿不到就收回價格欄，不回退假數字，也不並列 bid/ask）；**CMS global `sample-trading-conditions`
> 連同 `sampleTradingData.ts` 一併退役**（事實不該能被後台改到）。`LiveQuotesProvider` 搬到
> `src/components/market/` 供首頁與 `/trading` 共用。詳見下方「🟢 第四十五輪」。
>
> **🔎 第四十六輪（2026-10-11）調查：交易產品頁 ＋ 交易端截圖的前置勘查（未改任何產品碼）。**
> 業主指定下一輪處理「交易產品頁」與「交易端截圖」，本輪先把兩邊現況查清楚：
>
> **🚨 P0 紅線違規（現正上線中）**：`/products/all` 的表格讀 CMS `instruments`，而 DB 裡那兩列
> 仍是第三十輪種的舊資料 → 前台現在顯示 **黃金點差 `27`／白銀 `30`**（第四十四輪已明令
> **退役**的舊平均值），且**缺人民幣公斤條**、合約規模寫 `100 oz / 5000 oz`、點差欄沒有單位。
> 第四十四／四十五輪只改了程式端事實，**沒回頭清這張 CMS 表**。下一棒請優先處理。
>
> **💡 合約規模／交易時段／最小手數「其實拿得到」**：交易端 App 的「合約屬性」分頁證實，
> 這些值來自 **`POST /v1/context/resolve` 回應的 `result.products[]`**——**官網已經在呼叫同一支 API**
> （`src/lib/marketQuotes.ts`），只是目前只取 `contextToken` 與 `allowedSymbols`，把 `products[]` 丟掉。
> UAT 實測（`node --env-file=.env /tmp/probe-context.mjs`）：
> `XAUUSD` contractSize **100**／digits 2；`XAGUSD` contractSize **1000**（⚠ 不是官網示意的 5000）／digits 3；
> 兩者 volumeMin **0.01**、volumeMax 20、volumeStep 0.01、stopsLevel 200、currencyProfit USD、含 swapLong/Short；
> `sessions` = 週一至週五 `openMinute 365`／`closeMinute 1735` → **06:05–次日 04:55（GMT+8，後端已換算）**。
> ⚠ **`RKGCNH` 不在 UAT guest context 的 `products[]`**（只有 2 檔），公斤條規格仍缺。
> ⚠ guest context 的 `spreadPoints` = **0**，與核可點差不符 → **點差一律沿用 `tradingConditions.ts`，不得取閘道值**。
> ⚠ 治理：閘道值＝公司自家 MT5 設定（權威），但**仍須業主確認後才能寫入 FACTS**，比照交易組設定表。
>
> **💡 `/v1/market/bars` 不是壞的，是 resolution 的問題**（修正第四十三／四十四輪的「回空」結論）：
> UAT 實測 `resolution=1D` → **status 200、9 根日 K**（`{time,open,high,low,close,tickVolume,spread}`）；
> `60`／`5` 才回 0 根。App 的對照表＝分時/1分`1`、5分`5`、15分`15`、30分`30`、1小時`60`、4小時`240`、
> 日K`1D`、週K`1W`，且必帶 `priceType=bid`＋`contextToken`。→ 首頁 `Services` 的 K 線**有機會接真日 K**
> （但只有 9 根、且生產遊客組仍未配產品）。
>
> **📸 交易端截圖來源勘查**（來源倉 `~/Desktop/mt5-web`）：
> - `mt5-uniappx`＝HATC App（uni-app x），其 **H5 build 就是「網頁交易端」**；
>   `front-ui-platform/system-platform`＝後台 Vue admin（**非**對外交易端，不要拿它截圖）。
> - **生產 `https://h5.hatcmarket.com`**：遊客可進，但行情頁是**「暂无产品」**（＝同一個生產遊客組沒配產品的阻塞）。
> - **UAT `https://h5.666678910.com`**：遊客**看得到真實行情**（黃金/白銀）與 **K 線詳情頁**
>   （`#/pages/market/detail/index?symbolCode=XAUUSD`，含 分時/5分/…/週K ＋ MA/BOLL/MACD/KDJ 等指標、
>   今開/昨收/最高/最低、買賣價）。路由表見 `mt5-uniappx/pages.json`。
> - 需登入才看得到：交易下單、持倉、我的／資金頁 → **要業主提供測試帳號**。
> - ⚠ 截圖紅線：UAT 網域 `666678910.com` 不得入鏡；UAT 數據會自相矛盾（曾見今開 4616 vs 現價 4194）；
>   詳情頁的點差數字（實測顯示 32）**與核可分級點差不符**，不可讓它可辨讀；介面目前**只有簡體中文**
>   （官網主語系繁中）；App 外殼在 WEB 被鎖 `max-width:500px`（見 `pages/market/detail/index.uvue` 註解）
>   → **沒有真正的桌機版交易端 UI**，截圖會是手機比例，`/platforms` 現有多裝置 mockup 版面需據此調整。
>
> **🛠 第四十六輪（2026-10-11）環境修復：`/admin` 無限 hang 已排除。**
> 症狀＝前台三語全 200、`/api/market/quotes` 正常，但 `/admin` 與所有 Payload REST
> （`/api/users/me`、`/api/instruments`）**永不回應**（非 500），dev 程序 CPU 0%。
> 成因＝退役 `sample-trading-conditions` 後，曾用**未清 `.next`** 的 dev 啟動（舊編譯的
> `payload.config` 仍引用已刪的 `SampleTradingConditions`，log 有 `ReferenceError`），drizzle push
> 把 4 張 `sample_trading_conditions*` 表與 `roles.can_sample_trading_conditions_update`
> **重建回 DB**；之後乾淨程式碼的 dev 偵測到這些幽靈物件要 DROP → 停在**互動式 DATA LOSS `y/N`**
> → Payload init 永不完成 → admin/REST 全 hang（前台靠 `unstable_cache`／fallback 仍 200，
> 所以「頁面 200」不代表 CMS 正常）。
> 處置：手動 `ALTER TABLE roles DROP COLUMN IF EXISTS can_sample_trading_conditions_update`
> ＋ `DROP TABLE IF EXISTS sample_trading_conditions* CASCADE`（四張表皆 **0 列**，無資料損失；
> 備份 `/tmp/hatc-sample-trading-backup.sql`）→ `rm -rf .next` → `npm run dev`。
> 驗證：schema pull 一次過、`/admin` 200（2.9s）、`/api/users/me` 200、三語 6 頁全 200。
> **慣例**：退役集合/global 後「清 `.next`」與「手動清 DB 殘留表/欄」**必須兩件一起做**；
> 懷疑 CMS 掛掉時先打帶 timeout 的 `/api/users/me`（hang＝卡在 push 提問），別只看前台狀態碼。
>
> **📦 第四十五輪已 commit＋push**（`3aaeaea`，origin/main，2026-10-11 第四十六輪推送）＝工作區乾淨、
> 與遠端同步，**無未 commit 清單**。第四十四輪（`f1f682b`）亦已在遠端。
> ⚠ 仍待辦：**正式站 DB migration**（第四十四輪的刪表/刪欄 ＋ 第四十五輪 drop `sample_trading_conditions`
> 四張表與 `roles.can_sample_trading_conditions_update`）。
>
> **⏭️ 下一棒（第四十六輪）候選，皆非阻塞：**
> - `/products/all` 的**合約規模與交易時段**仍是示意（點差/槓桿已真實），等業主給值。
> - `/trading` 的**合作夥伴／認證標誌區**仍是佔位框（第十八輪遺留）。
> - 全站**淺色 `--trd-gold #c9a84c` vs 深色 `#d4af37`** 是否統一，待業主定。
> - 行情仍卡在後端：**生產遊客交易組沒配產品**（UAT 正常）；`/v1/market/bars` 連 UAT 都回空 →
>   `Services` 的 K 線還是示意。碰行情前先 `curl` 複驗這兩項。

> **✅ 第四十三輪（2026-10-11）完成：首頁行情已接上自家 MT5 行情閘道（真實報價），拿不到時自動退回示意數據。**
> 架構＝**server 端 BFF**（`src/lib/marketQuotes.ts` ＋ `GET /api/market/quotes`）＋ client 共用輪詢
> （`LiveQuotes/LiveQuotesProvider`），首頁維持 **SSG**。品種＝金／銀／人民幣公斤條
> （`XAUUSD`／`XAGUSD`／`RKGCNH`，業主拍板）。
>
> **🚩 唯一阻塞（待業主推後端）**：**生產**遊客交易組 `demo\DirectCustomer\GUEST\DEFAULT\Standard`
> 在業務後台**沒配任何產品** → `allowedSymbols: []` → 報價 403。UAT 遊客組有 29 個白名單（含金銀公斤條），
> 證明鏈路本身是通的。**後端配好產品後，官網不需改任何程式碼就會自動顯示真實行情。**
> 本機 `.env` 現指 **UAT**（`https://node.666678910.com`）以便驗證；**正式站須換 prd URL ＋ prd 密鑰**。
> 詳見下方「🟢 第四十三輪」。
>
> **🔁 複驗（2026-10-11 第四十四輪，直接打閘道實測）**：生產遊客 `allowedSymbols` **仍為 `[]`**，
> 三品種 `symbol-detail` 全 **403** → 阻塞**未解除**。UAT 仍正常（29 個白名單；金 4194.49／銀 60.8／
> 公斤條 902.14）。**`/v1/market/bars` 連 UAT 都仍回空陣列**（`status 200, bars: []`）→ follow-up (c)
> 真 K 線同樣**還不能動**。下一位 agent 若要碰行情，**先用 `/tmp` 探針或 `curl` 複驗這兩項**，別直接改碼。
>
> **📦 第四十三輪已 commit＋push**（`10ada33`，origin/main）＝工作區乾淨，**無未 commit 清單**。
> 同時移除 `docs/HANDOFF.md` 內誤寫的 **prd 閘道明文密鑰**（倉庫會 push 到 GitHub）；慣例已寫進
> `.cursor/rules/hatc-website.mdc`：**密鑰值不得出現在本倉任何檔案**，只留「去閘道專案
> `deploy/env/*.env` 取」的指引。
>
> **✅ 第四十二輪（2026-09-01）完成：業主 GitBook 知識庫已搬入黃金學院 `/academy`（22 篇、三語）。**
> 來源＝**GitBook Content API**（業主提供 token＋space；存 `.env` `GITBOOK_API_TOKEN`/`GITBOOK_SPACE_ID`，
> 不進 git）。腳本 `scripts/seed-academy-from-gitbook.ts`（抓目錄樹→每頁 Markdown→Payload 內建
> `convertMarkdownToLexical`→upsert by slug）。學院現共 **49 篇**（既有 27＋GitBook 22）。詳見下方「🟢 第四十二輪」。
>
> **⏭️ 下一棒可選（非阻塞，皆待業主）：**
> - **/admin 校對機翻草稿**：22 篇的簡中/英文**標題/摘要/內文**為 Gemini 草稿，業主應在 `/admin` 校對。
> - **真實封面替換**：GitBook 頁面無內嵌圖，封面沿用 `public/figma/raw/raw_*.png` 佔位，業主可於後台替換。
> - **內部交叉連結**：GitBook「相關內容」內部相對連結目前**攤平為純文字**（因 `localePrefix:'always'`，
>   單一硬編 `/academy/x` 無法三語通用）。follow-up：加 locale-aware 自訂 RichText link converter。
> - **git commit/push**：本輪尚未 commit（見下方「未 commit 清單」）。
>
> **第四十一輪（2026-09-01）：學院第三批 4 篇原創長文上線＋LocaleSwitcher `router.refresh()`。**
> 接續第四十輪可選項「第三批文章」。`scripts/seed-academy-batch3.ts` 灌入 4 篇（order 23–26、
> publishedAt 較新故列表排前）：金市心理／實體黃金保管與驗證／黃金 ETF vs CFD／常見詐騙辨識。
> 仍 100% 原創、只做黃金/白銀、不入 FACTS、附「不構成投資建議」。標題/摘要三語齊；繁中長文 body
> 已用既有 Gemini 管線只填空機翻簡中/英文（`Filled 314`；診斷 **27/27** 兩語 body 到位）。
> `LocaleSwitcher` 在 `replace` 後加 `router.refresh()`，降低 Next Client Router Cache 造成切語系
> 需硬刷新的機會（第四十輪 follow-up e）。`lint` 0 error／`i18n:check` 741 鍵齊；三語列表＋詳情 200。
> 見下方「🟢 第四十一輪」。
>
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
> **第三十九輪追加（2026-08-31）：黃金學院文章已灌入 CMS（共 23 篇長文）＋ commit/push。**
> `scripts/seed-academy.ts` 遷移 i18n 種子 a1–a3；`scripts/seed-academy-batch.ts`（10 篇）＋
> `scripts/seed-academy-batch2.ts`（10 篇）新增**原創、中性黃金/白銀長文**（h2/h3＋清單＋舉例＋重點整理＋
> 免責；upsert 可重跑）。業主問「可否抄競品改寫」→ **已拒絕逐字抄/洗稿（仍屬侵權），改走合規＝競品只當選題地圖、
> 內容 100% 原創**。標題/摘要三語齊，**內文先繁中**（其餘語系走 Payload `localization.fallback` 顯示繁中，
> 待一鍵機翻補齊）。已 commit `427fc17`、push origin/main。
> **⏭️ 下一步：業主補**：(a) 逐步以正式文章／真實封面替換佔位（現為原創教育＋`raw_*.png` 佔位圖）；
> (b) 用一鍵機翻補齊簡中/英文**內文**再校對（現 body 走 fallback 顯示繁中）；(c) 電子報要接的 email 服務
> （現誠實佔位）；(d) `category` 是否改受控 `select`（需 schema migration）。
>
> **第四十輪（2026-08-31）：學院 23 篇 body 已機翻補齊簡中/英文（Gemini）＋MT provider 加重試。**
> 業主啟用一鍵機翻（項目 b）。**OpenAI 香港不可用 → 改用 Google Gemini 的 OpenAI 相容端點**
> （`MT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`、`MT_MODEL=gemini-3.6-flash`、
> `MT_PROVIDER=llm` 不變，**零程式改動即相容**）。Gemini **免費額度每日上限對長文太小**（跑到 14/23 撞 429），
> 業主於 Cloud 專案**開啟帳單（pay-as-you-go）**後一次跑完。`LlmProvider` 新增 **withRetry 指數退避重試**
> （處理長批次的 `UND_ERR_SOCKET`/`fetch failed` 暫時性斷線＋429/5xx；401/404 立即拋出）。
> 用 `scripts/translate-content.ts -- --only academy-articles`（只填空、可重跑）灌入，**23/23 簡中＋23/23 英文
> body 到位**（`Filled 425 field(s)`），抽查品質良好（簡體正確、英文流暢、術語/數字保留）。新增唯讀診斷
> `scripts/check-academy-i18n.ts`（回報各篇各語系 body 是否已填）。`lint` 0 error（僅 seed-* 2 個既有 warning）。
> ⚠ **dev 快取**：本機 next dev 的 `unstable_cache` 不會因 CLI 種子失效 → 在 `/admin` 存一次任一文章即刷新
> （正式站靠 `afterChange`→`revalidateTag`）。**待業主**：於 `/admin` 校對機翻草稿（＝草稿非事實）。
>
> **第四十輪追加（同日）：修 dev 快取造成的兩個學院症狀 ＋ 新增 dev-only revalidate 工具。**
> 症狀：`/academy` 清單在 **en/zh-Hans 只出 3 篇**（＝i18n fallback a1–a3），zh-Hant 正常（9/頁）；
> 詳情頁**切語系需強制刷新**才顯示對應語言。根因＝**清單 reader 的 `unstable_cache`（key 含 locale）在某次
> 冷啟動 DB 未 warm 時把 fallback（3 篇）快取住**，且清單快取 key（`academy-articles`）與詳情快取
> （`academy-article-by-slug`）不同 → 前一輪只驗證詳情頁沒察覺清單仍舊。**修法＝在 dev server 進程內
> `revalidateTag`**（CLI 腳本在別的進程，無法讓運行中的 dev 失效）。新增 **dev-only 路由
> `src/app/api/dev-revalidate/route.ts`**（GET 觸發 revalidate 全部 CMS reader tags；**production 回 404**；
> 放 `/api/*` 以繞過 next-intl proxy 的語系前綴）。觸發後三語清單皆回正常（9/頁、en 顯示真實批次 slug）。
> **用法**：CLI 種子/機翻後 `curl http://127.0.0.1:3000/api/dev-revalidate`（或照舊在 `/admin` 存一次任一文章）。
> 正式站不受影響（route 404；靠 `afterChange`→`revalidateTag`）。lint 0 error。切語系「需硬刷新」預期隨快取修正
> 消失（屬 Next client Router Cache＋當時 server 端 stale 疊加）。**第四十一輪已於 `LocaleSwitcher` 加
> `router.refresh()`**（防 Client Router Cache 殘留）。
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

## 🟢 第五十八輪（實作，2026-10-11）：移除「執行方式待公佈」佔位 ＋ 登入按鈕改 CMS 設定

業主指示：「去除其餘交易條件（執行方式等）。另外，先隱藏登入按鈕」。兩個方向級問題先問齊再動手。

### 業主決策

| 問題 | 業主選擇 |
| --- | --- |
| 「執行方式將另行公佈」抽到多乾淨？ | **四處全部移除，含 `/disclaimer` 那句**（我同步確認 `legal.updatedAt` 已是改動日） |
| 登入按鈕怎麼「先隱藏」？ | **改成 CMS 可設定（`SiteSettings` 新欄位），未填即不渲染** —— 不是直接刪按鈕 |

### 1) 移除「待公佈」佔位

四處：`products/TradingConditions` 的全寬列、`trading/AccountComparison` 的 `Row`、
`accounts.tiers.note` 的「執行方式將另行公佈。」、`legal.disclaimer.sections[3].body[2]`（三語）。
刪鍵 `products.conditions.pendingLabel`；**`pending`（將另行公佈）保留**——`/products/all` 用它填
「CMS 自建但無核可條件」的格子（`lib/instruments.ts`）。順手刪掉 `AccountComparison` 的 `Row muted`
prop（唯一使用者就是那一列，已成死碼）。

**🚩 紅線解讀**：移除「將另行公佈」**不代表執行方式變成事實**。FACTS 仍列它為「仍待業主提供
（不得虛構）」，只是不對外標示為待公佈；已在 FACTS 加註本輪決定，**不要再加回佔位列**。

### 2) 順手修掉一句與 FACTS 衝突的舊文案

`/trading` FAQ「HATC 的交易時間是？」原答「華安泰昌的**實際交易時段將另行公佈**」，但交易時段
早在第四十七輪就是已核可事實 → 與 `/products`、`/products/all` 列出的夏令／冬令時段直接矛盾。
已三語改寫為核可時段（香港時間 GMT+8；夏令 週一 06:00–週六 04:45、冬令 週一 07:00–週六 05:45，
週二至週五每日休市一小時），**依紅線不標轉換日期**。`faqs(category='trading')` DB 無列 → 走 i18n
fallback，改 messages 即生效。

**慣例**：日後任何條件由「待公佈」轉成「已核可」時，必須全站搜一次舊的「將另行公佈／to be
announced」句子，別讓同一條件在兩頁講相反的話。

### 3) 登入 ＝ 第四個 CMS 營運連結

新欄位 **`SiteSettings.memberLoginUrl`**（網站營運設定 → 帳戶入口 → 會員登入連結；
＋`NEXT_PUBLIC_MEMBER_LOGIN_URL` fallback）＋ 解析器 **`memberLoginHref()`**。`Header.tsx` 桌機
連結與 `HeaderMobileMenu.tsx` 抽屜連結**未設定即不渲染**（`loginLabel`／`loginHref` 改
`string | null`），比照第四十四輪的 `demoAccountHref()`。原先硬指 `/account`「即將推出」＝對真
客戶是死路。`/account` 佔位頁**保留但已無連結指向、也不在 sitemap**（檔頭已註明）。

⚠ **schema 變更** → migration `20261011_122325_add_member_login_url`（`.ts`＋`.json`＋`index.ts`
已一起 commit）。本機 dev 另手動 `ALTER TABLE site_settings ADD COLUMN member_login_url varchar`
——**`build` 會讀這個 global，欄位不存在會讓整個 build 掛掉，不是安靜走 fallback。**

### 驗收

`lint` 0 error（僅 `seed-academy.ts` 1 既有 warning）／`tsc --noEmit`／`i18n:check` 三語 **716 鍵**
（718 − `pendingLabel` − 免責那句）／`migrate:check` 無漂移／`rm -rf .next` 冷建綠且全頁 ● SSG。
實測 **CMS 填值→登入出現（桌機＋手機抽屜、zh-Hant／en）／清空→消失**；`/products`、`/trading`、
`/accounts`、`/products/all`、`/disclaimer` 渲染後 markup 已無「其餘交易條件」，殘留的「將另行公佈」
只有 `/accounts` FAQ 講模擬帳戶那句（仍屬實）。殘留的「執行方式」只在**學院文章**（中性 MT5 教學
解釋規格欄位）＝刻意保留。

### ⚠ 本輪踩到的環境雷

`lsof -ti:3000 | xargs kill` **只殺監聽程序，`npm start` 外層還活著**；緊接著
`rm -rf .next && npm run build` 會與它搶 `.next` → 冷建失敗並噴看似無關的
`next/font/google queries have exactly one entry`（Google Fonts 其實連得到，**不要去查網路**）。
**建置前請 `pkill -f "next start"; pkill -f "next-server"`**，失敗後要再 `rm -rf .next` 才恢復。
`npm start` 與 `chrome-headless-shell` 都必須以**背景 Shell 任務**執行（用 `&` 會被收掉，症狀是
curl 回 `000`、截圖變成錯誤頁）。

## 🟢 第五十七輪（實作，2026-10-11）：行銷文案補齊第三個 CFD 品種 ＋ Footer 交易服務欄生成式

### 業主決策（本輪開場三問，皆已拍板）

| 問題 | 業主決定 |
|---|---|
| Footer 交易服務欄怎麼重做 | **A 案**：4 格＝三個核可品種＋交易條件，全部 `/products` 錨點 |
| 關於我們欄要不要補 About 錨點並改掉「安全與監管」 | **本輪不動**（已記為下一棒候選） |
| `/platforms` FAQ 的 EA／自動化交易宣稱 | **先不改** —— MT5 伺服器確實允許 EA，業主稍後正式確認成核可事實 |

### 一、為什麼 (d) 與 (e) 是同一件事

第五十五輪留下兩組候選：(d) 七個「只講金銀、漏公斤條」的行銷文案鍵、(e) footer 交易服務欄缺人民幣
公斤條。兩者根因相同＝**FACTS 的 CFD 標的自 2026-10-11 起是三項（黃金／白銀／人民幣公斤條），但行銷
文案與 footer 連結表是在「只有金銀」年代寫的，之後沒人回頭對照**。因此合併為一輪處理。

稽核時另外確認了兩件事（都和交棒說明不同）：

- **`/products#gold`、`#silver` 本來就有效**：`ProductList` 的產品卡渲染 `id={p.key}`，所以
  `#kilobar` 直接可用，**不需新增錨點**。但 l3「市場交易細則」與 l4「合約保證金」**都指向同一個
  `#conditions`**，而「合約保證金／Contract margin」在站上沒有任何保證金內容 → 屬第五十三輪
  「footer 標籤不得承諾不存在的目的地」同一條紅線。
- **`/about` 完全沒有任何區段錨點**：第十三輪 About 改版後，舊的 `#milestones`／`#credentials`／
  `#office`／`#contact` 全部消失，全站也沒有任何連結指過去。所以關於我們欄的 l1–l3 其實都只是落在
  頁首。要修必須先替 About 區段補 `id`（本輪業主決定不動）。

### 二、六個活鍵改文案（三語）

| 鍵 | 原文問題 | 新寫法 |
|---|---|---|
| `home.heroV2.subtitle` | 「倫敦金銀交易通道…全球黃金市場」 | 三品種＋**全球貴金屬市場**（白銀不屬黃金市場） |
| `home.footerV2.brandDesc` | 「倫敦金銀交易服務」 | 三品種差價合約交易服務 |
| `accounts.cta.body` | 「黃金、白銀交易配置」 | 加入人民幣公斤條 |
| `funding.cta.body` | 同上 | 同上（⚠ 另需清 CMS，見第三節） |
| `platforms.faq.items[4].a` | 「倫敦金、倫敦銀**等**」—「等」還暗示未確認的其他產品 | 「**三項**貴金屬差價合約」把清單封閉（⚠ 另需改 CMS） |
| `nav.mega.banner.desc` | 「黃金/白銀投資配置之旅」 | **「貴金屬」**概括 —— mega 橫幅很窄，列三個會換行；貴金屬涵蓋全部三品種且不少講 |

英文沿用站上既有譯法 **`RMB kilobar`**（第五十五輪定下）。

**🚩 `home.hero.*` 整個區塊是死鍵，已刪除（6 鍵 × 3 語）。** 首頁 hero 實際渲染的是 `home.heroV2`
（`home/Hero.tsx` 讀 `home.heroV2`），`homeMarketing.ts` 的 CMS 覆寫也掛在 `heroV2` 上；`grep` 全倉
確認沒有任何東西讀 `home.hero.*`（第九輪 Figma 改版後的孤兒）。**第五十五輪稽核清單裡
「`home.hero.subtitle`〔⚠ 可被 CMS global 覆寫〕」指錯了對象**——可被覆寫的是 `heroV2.subtitle`，
而 `home.hero.subtitle` 改了也沒人看得到。死鍵留著只會讓下一棒再去「修」一次沒人看的文案。

**刻意沒改的近似項（別誤當漏修）**：`home.trust.grade.sub`「可經營倫敦金銀及實物黃金」與
`about.identity.p2`／`about.credentials.cards.c2.body`「倫敦金、倫敦銀**等**」講的是**交易所 AA 會員
的獲准經營範圍**（參與者證書 7 項，「等」在此準確），不是 HATC 的 CFD 產品清單。
`trading.services.items.londonGold` 旁邊就有獨立的 `kilobar` 卡，兩張合起來＝三品種（刻意分法）。

### 三、🚩 兩個「改了看不見」的陷阱（本輪最有價值的發現）

**(1) CMS marketing global 的影子副本。** `funding.cta.body` 改完前台沒變——因為 `funding_page` global
的**22 個欄位、三語全部是 i18n 預設值的逐字副本**（應是某輪在 `/admin` 測試或一鍵翻譯留下的），而
`pickText(cms, fallback)` 只要 CMS 值非空就贏。該 global 的欄位說明本來就寫「留空＝使用網站預設文案
（i18n）」，其餘四個 page global 的覆寫表也都是 **0 列** → `funding_page` 是唯一的異常。
**處置：把 `funding_page_locales` 全部文字欄位 UPDATE 成 NULL**，回到 i18n fallback。渲染輸出完全
不變（值本來逐字相同），圖片在父表 `funding_page` 的 `*_image_id` 不受影響。

> **慣例（已寫進規則）**：改任何可被 marketing global 覆寫的 i18n 文案前，先 `select` 對應的
> `*_page_locales`；若存的只是預設值副本就**清空**，不要把修正複製進 DB 變成兩份來源。

**(2) collection 不能用清空解決。** `faqs` 的 reader 是 **collection 級** DB→i18n fallback：只要該
分類有任何一列，整個 i18n 種子就不會被讀 → 無法靠「清空單列」退回預設。因此 CMS `faqs` id=13 的
三語 `answer` 直接 UPDATE 成新文案（備份 `/tmp/hatc-r57-backup.sql`）。
`scripts/seed-platforms.ts` 是 **seed-once**，所以**正式站空庫第一次種就會拿到新文案**，腳本不需改
（只修了檔頭一句過時的「Product/feature claims are already converged to gold/silver」）。

### 四、Footer 交易服務欄改為由 `CFD_PRODUCTS` 生成

比照第五十四輪學院欄的做法——**標籤讀正規來源，不複製進 footer 鍵**，這樣根本不可能再漂移：

```
三個品種  → /products#{gold,silver,kilobar}   標籤 = products.items.*.name
交易條件  → /products#conditions              標籤 = products.conditions.heading
```

`Footer.tsx` 的 `StaticCol` 改成 `Exclude<Col, 'trading' | 'academy'>`，交易服務欄走自己的分支；
`home.footerV2.cols.trading` 現在只剩 `title`（刪掉 `l1–l4`）。三語 **718 鍵**（728 − 6 − 4）。

渲染結果（三語實測）：黃金 CFD／白銀 CFD／人民幣公斤條 CFD／交易條件 ·
Gold CFD／Silver CFD／RMB Kilobar CFD／Trading conditions。

### 五、驗收

- `lint` 0 error（僅 `scripts/seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
  `i18n:check` 三語 **718 鍵**／`migrate:check` 無漂移（**未動 schema**，故無 migration）。
- `rm -rf .next` 後 `npm run build` 綠，全部頁面維持 **● SSG**；直接讀 `.next/server/app/**` 的靜態
  HTML 確認三語都含 `products#kilobar` 連結與新的 funding CTA 文案。
- `npm start`（port 3140）＋獨立 `chrome-headless-shell` ＋ CDP 實測：
  - 六個改動鍵三語皆渲染新文案；舊的「倫敦金銀交易／Loco London gold and silver」全站 0 筆。
  - footer 交易服務欄四個連結三語正確；`合約保證金／Contract margin／市場交易細則` 在 messages 中 0 筆。
  - `#gold`／`#silver`／`#kilobar`／`#conditions` 四個錨點量測 `top` 皆 ≥ `header` 的 `bottom`（80px），
    未被 sticky header 遮住。
  - mega 橫幅「立即開戶 — 開始您的專業級貴金屬投資配置之旅」單行不換行。
  - footer 截圖：桌機 1440／平板 834／手機 390 ＋英文桌機。平板上「人民幣公斤條 CFD」換成兩行，
    與鄰欄「行動與網頁交易端」行為一致，**非回歸**。
  - 首頁 hero（手機／桌機）與 `/accounts`、`/funding` 收尾 CTA（手機）版面無溢出。

### 六、下一棒候選（本輪新增／更新）

- **關於我們欄**（業主本輪選擇不動）：要做就得先替 About 區段補 `id`（`CompanyIdentity` →
  `#identity`、`Credentials` → `#credentials`、`CredentialsGallery` → `#gallery` 等），再決定
  「安全與監管 / Security & supervision」是否改掉——該標籤容易被讀成 HATC 自身受監管，而業主已定案
  CFD 業務不需 SFC 牌照；頁內既有的「監管與資產安全聲明」指的是交易所監管其行員（屬核可事實）。
- **EA／自動化交易**：業主會正式確認。確認後要同步更新 `HATC_FACTS.md`「Trading platforms」把
  【待業主確認】改成核可事實，才可在其他頁面使用相關文案。
- **Footer 仍完全沒有連到** `/trading`、`/products/all`、`/accounts`、`/funding`——這四頁只能從
  header mega 選單進入（本輪業主選 A 案，刻意維持 4 格）。
- `home.trust.field.title`「金銀業貿易場」與 `home.trust.member.sub`「資金安全受貿易場嚴格監管」
  用的是交易所**前身名稱**（FACTS：現為香港黃金交易所，前身香港金銀業貿易場）。不是錯誤陳述，
  但與站上其他地方的稱法不一致，可併入下一次文案稽核。

## 🟢 第五十六輪（實作，2026-10-11）：新交易條件事實 ＋ 外部連結同窗 ＋ 法律頁上線

### 業主決策（本輪開場四問，皆已拍板）

| 問題 | 業主決定 |
|---|---|
| 「手續費全免」涵蓋範圍 | **僅交易佣金／手續費**；隔夜利息（swap）與出入金費用**另計**，文案限定「交易手續費」 |
| 最低手數 0.01 適用範圍 | **三個品種都是 0.01**（金／銀／人民幣公斤條） |
| 法律頁內容來源 | **我依網站實況草擬保守版三語全文**，業主／法務審核後定稿 |
| 「不開新視窗」套用範圍 | **全站外部連結**（不只開戶） |

### 一、最低手數 0.01 ＋ 交易手續費全免（commit `303f9bc`）

**FACTS 變更**（「Account types & trading conditions」）：新增兩條已核可事實，並**取代**第四十四輪
「無佣金欄位 → 不得聲稱佣金金額或『零佣金』」的限制（當時原因是業主設定表沒有佣金欄位，現在業主
正式提供了）。**非零的佣金金額仍屬虛構**，不得出現。「仍待業主提供」**只剩「執行方式」**。

**⚠ 範圍限制是本輪最容易踩的雷**：業主只確認交易手續費，所以三處說明文字都加了同一句細則
（`products.conditions.note`／`accounts.tiers.note`／`productsAll.table.note`）：
「交易手續費全免僅指交易時不收取手續費或佣金，不包含隔夜利息及入金／出金相關費用。」
**不得**把它寫成「免任何費用」「零成本」，也不得暗示沒有隔夜利息。

**程式**：`src/components/products/tradingConditions.ts` 新增 `MIN_LOT = 0.01`。手續費**刻意不建常數**
（值是「不收取」，沒有數字可放，加個永遠為 true 的布林＝死碼）——**範圍限制寫在該檔檔頭的 ⚠ 區塊**，
與退役值警告並列，改這塊文案前一定會看到。事實照舊**留在程式、不進 CMS**。

**五處同源顯示**：

| 位置 | 做法 |
|---|---|
| `products/ProductList` | 產品卡的規格 `dl` 由 2 格變 **2×2**（點差／槓桿／最低手數／交易手續費） |
| `products/TradingConditions` | 新增兩列**全寬列**（比照交易時段列的 `colSpan={5}`），`pendingLabel` 收斂為「其餘交易條件（執行方式等）」 |
| `trading/AccountComparison` | 平台列後新增兩個 `Row`（四檔值相同），zebra 交錯維持 |
| `accounts/AccountTiers` | 卡片規格清單新增兩列 |
| `products/AllInstruments/AllInstrumentsTable` | 新增兩欄（7 欄），`min-w` 720→**920px**；CMS 自建列（無核可條件）仍渲染「將另行公佈」 |

**i18n**：`products.conditions` 新增 `colMinLot`／`colFee`／`minLotValue`／`feeFree` → 662→**666 鍵**。
**標籤刻意不另開 `accounts.tiers.specLabels.*` 鍵**，四個頁面共用 `products.conditions.col*`，
所以文字永遠不可能不一致（符合 i18n「相同文字不開新鍵」）。

### 二、外部連結全站同窗（commit `1202864`）

業主只提了開戶按鈕，但選擇**套用全站**。移除 **22 處** `target="_blank"` ＋
`rel="noopener noreferrer"`（21 個檔案）：開戶／模擬帳戶／客服／header mega 開戶橫幅／平台分頁 CTA／
外部消息卡。

- 兩個屬性**一起**移除：`noopener` 對同視窗導覽本來就沒有作用，而 `noreferrer` 會砍掉 referrer
  （對自家 `h5.hatcmarket.com` 沒必要）。
- 已寫進 `.cursor/rules/hatc-website.mdc`「Content governance」＋ `WEBSITE_STRUCTURE.md`「導覽與版面」，
  **新增 CTA 不得再加回去**。

### 三、`/privacy` ＋ `/disclaimer` 上線（本輪第三個 commit）

原本兩頁是 `ComingSoon` 佔位（footer 早就連過去了）。現在共用
**`src/components/legal/LegalPage.tsx`**：麵包屑 → navy/gold 標題帶（含「最後更新」）→
`max-w-[820px]` 編號章節 → 聯絡卡 → 互連另一頁。內文＝i18n
**`legal.{privacy,disclaimer}.{intro,sections[]}`**，`sections` 以 `t.raw` 讀（`heading` ＋ `body[]`）。

**🚩 法律頁內容紅線（新慣例，寫進 rules 與元件檔頭）**——這兩頁的文字**只能**來自兩個來源：

1. **網站實際行為**。本輪實地查證後的事實基礎：
   - **未啟用任何分析／廣告追蹤**（`components/Analytics/Analytics.tsx` 是回傳 `null` 的佔位，
     工具選型仍待定）；
   - **前台沒有任何會送出資料的表單**（`academy/AcademyNewsletter` 是 `preventDefault` 的誠實佔位，
     不發任何請求）；
   - **cookie 實測只有三個**：前台 `NEXT_LOCALE`（next-intl 語言偏好）、後台 `payload-lng`
     （proxy 注入的 admin 介面語言）與 Payload 登入 cookie。**政策裡逐一點名，沒有多寫。**
2. **`HATC_FACTS.md`** 的公司資料。

**刻意不寫（未經業主確認＝不得發明）**：資料保存期限、具名的資料處理者／主機商、
管轄法律／仲裁條款、任何「符合法規」保證。**不得用法律範本把版面填滿。**

**重用站上已核可文案**：風險提示與「不接受第三方付款」（`platforms.disclaimer` 原句）、
學院中性教育聲明（`academy.disclaimer`）、本輪新增的交易手續費範圍細則。免責聲明另載明
**供應商示範畫面**（第五十二輪放寬的 MT5 官方畫面）所示商品不代表 HATC 產品、HATC 的三個 CFD 品種，
以及 MetaTrader 5 為 MetaQuotes Ltd. 商標。

**聯絡卡**：電郵／電話讀 CMS `SiteSettings`（營運資料紅線），**未設定即不渲染該列**；
公司名稱／註冊地址改用**在地化**的 `common.brandFull`／`footer.address`
（⚠ 第一版誤用 `content/company.ts` 的繁中常數，英文頁出現中文地址，已修）。
**⚠ 上線前必須在後台填入電郵／電話**（FACTS 已核可：`info@hatchk.com`／`(852) 2322 2888`）；
本機 DB 已填入以驗證該兩列渲染。

**SEO**：新增 `metadata.{privacy,disclaimer}`（三語，title／description＋canonical／hreflang），
`sitemap.ts` 的 `staticPaths` 加入 `/privacy`、`/disclaimer`（三語共 24 條含 alternates）。
i18n 三語 **728 鍵**。`legal.updatedAt` 是**手動維護**的日期字串（`2026-10-11`）——
**改法律文字時必須同時更新。**

### 四、驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check` 三語
  **728 鍵**／`migrate:check` 無漂移（**未動 schema**，故無新 migration）／`rm -rf .next` 後 `build` 綠，
  `/privacy`、`/disclaimer` 三語皆 **● SSG**。
- 靜態 HTML 直接比對：四個交易條件頁都含 `0.01 手`／`0.01 lots` 與「交易手續費」，
  **全站已無舊的「最低手數、手續費、執行方式」待公佈字樣**。
- `npm start`（port 3130）＋獨立 headless Chrome：三語 `/privacy`、`/disclaimer` 全 200；
  `/products`（卡片＋條件表）、`/accounts`、`/trading`、`/products/all`、兩個法律頁與聯絡卡
  在 1440／834／390 逐一看過。`/products/all` 7 欄在 1440 不需捲動、手機沿用既有橫向捲動＋提示。

### 五、下一棒候選（本輪未動）

- **執行方式**＝FACTS 唯一剩下的待提供交易條件。
- 是否把「交易手續費全免」做成 `/accounts` 賣點卡（`account-benefits` 是 CMS 集合 → 要連
  `scripts/seed-accounts.ts` 與後台資料一起改）。本輪刻意只動事實表格，沒碰行銷區塊。
- 兩個法律頁**需業主／法務逐條審核**，並決定是否補管轄法律、保存期限、具名資料處理者等條款。
- 第五十五輪留下的行銷文案清單（「只講金銀、漏公斤條」7 個鍵）**仍未改**；
  `trading.services.items.mt5.desc` 的「支援快速下單」速度宣稱也還在。

## 🟢 第五十五輪（實作，2026-10-11）：三語 SEO 描述修正 —— 退役「平台視覺為示意」＋補齊三個 CFD 品種

### 業主決策

- 從第五十三／五十四輪留下的候選清單選定 **(b) `metadata.platforms.description` 已不實**。
- 同意本輪成果與落後的 `37ebeaa` 一起 push。

### 一、改了什麼

| 鍵 | 原文（繁中） | 問題 | 新文 |
|---|---|---|---|
| `metadata.platforms.description` | …交易黃金、白銀。**平台介面為示意，實際畫面以正式發佈為準。** | 第三十八輪寫的，當時平台圖還是 Figma mockup；第五十一／五十二輪換成真實交易端截圖＋MetaQuotes 官方示範畫面後**整句不實**。另缺人民幣公斤條 | …於桌面、網頁與行動裝置交易**黃金、白銀與人民幣公斤條差價合約**。 |
| `metadata.home.description` | …提供**黃金、白銀**貴金屬 CFD 交易。 | FACTS 的 CFD 標的自 2026-10-11 起是三項；第二十五輪清掉鉑金時只剩兩項，之後沒補 | …提供**黃金、白銀與人民幣公斤條**貴金屬 CFD 交易。 |
| `metadata.trading.description` | …提供**倫敦金與公斤條**交易… | **漏白銀**，且與 `/trading` 頁面內文（第四十五輪已改成三品種）不一致 | …提供**黃金、白銀與人民幣公斤條差價合約**、MT5 平台、交易帳戶與全面客戶支援。 |

三語九句同步。**只改值、沒有增減鍵** → `i18n:check` 仍 **662 鍵**。英文沿用站上既有譯法
**`RMB kilobar`**（en 檔內 19 處都是這個寫法；`src/lib/mt/glossary.ts` 登記的是正式品名
`RMB Kilo Gold`，兩者並存是既有狀態，本輪未動）。

另修 `src/app/(frontend)/[locale]/platforms/page.tsx` 的 JSDoc：原寫
「product/feature claims are converged to gold/silver」「Platform visuals are branded gradient
placeholders — the owner supplies real device screenshots later」，兩句都是同一批過時敘述，
已改成三品種＋指向 `platformVisuals.ts`（真實截圖／供應商官方畫面，never mockups）。

### 二、慣例（新增）

**`metadata.*.description` 與頁面內容受同一套事實紅線管轄。** 它是搜尋結果上對外的第一句話，
卻最容易在改版後被遺忘。兩條檢查：

1. 提到產品時**必須列齊三個核可 CFD 品種**（黃金／白銀／人民幣公斤條），不得只列其中兩個。
2. 「示意／illustrative」字樣**只有在該頁現在真的放示意內容時**才可保留。目前仍為真的：
   `metadata.funding.description`（出金渠道/時限/手續費確實仍是示意資料）、
   `home.mt5.screenshotAlt`（首頁 `raw_3.png` 仍是 AI 算圖＝待業主項 (d)）、
   `trading.hero.imageAlt`（`/trading` hero 仍是 Figma 佔位圖）。

已寫進 `.cursor/rules/hatc-seo.mdc`。

### 三、同時稽核出、本輪刻意沒改（下一棒候選）

> ✅ **第五十七輪已全部處理**（業主選定此候選）。下表保留供追溯；一處更正：`home.hero.subtitle`
> **不是**「可被 CMS 覆寫」的那個鍵，它根本是死鍵（全站無人讀，第五十七輪已刪整個 `home.hero`
> 區塊）；真正可被 `home-page` global 覆寫的是 `home.heroV2.subtitle`。另外 `funding.cta.body`
> 當時沒注意到 `funding_page` global 存了一份預設值副本，會把 i18n 修正吃掉（第五十七輪已清空）。

用腳本掃過三語訊息檔，找出「同時出現黃金與白銀、但沒有公斤條」的鍵。排除掉講**交易所名稱**
（金銀業貿易場／Gold & Silver Exchange）與**交易所獲准權限**（`about.identity.p2`、
`about.credentials.cards.c2`，原文有「及其他貴金屬」＝符合證書 7 項，正確）後，真正屬於
「對外承諾產品清單卻只講兩個」的有：

| 鍵 | 備註 |
|---|---|
| `home.hero.subtitle` | ⚠ 可被 CMS global `home-page` 覆寫，改 i18n 不一定生效 |
| `home.heroV2.subtitle`／`home.footerV2.brandDesc` | 「Loco London gold and silver trading」 |
| `nav.mega.banner.desc` | header mega 開戶橫幅 |
| `accounts.cta.body`／`funding.cta.body` | 收尾 CTA |
| `platforms.faq.items[4].a` | 「提供倫敦金、倫敦銀**等**貴金屬產品」——除了漏公斤條，「等」還暗示有未確認的其他產品。⚠ 這題的 i18n 只是種子，**正式內容在 CMS `faqs`(category=`platforms`)**，要連後台資料一起改 |

`trading.services.items.londonGold`（倫敦金銀 XAU/XAG）**不在清單內**：它旁邊就是獨立的
`kilobar` 卡，兩張卡合起來才是三品種，是刻意的分法。

### 四、驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check` 三語
  **662 鍵**／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠、全部頁面維持 ● SSG。
- 直接讀 `.next/server/app/{zh-Hant,zh-Hans,en}/{platforms,trading}.html` 與 `{locale}.html` 的
  `<meta name="description">`，九句逐一比對無誤。
- **沒有做響應式截圖**：本輪只改 `<meta>` 與程式註解，渲染輸出零變化。
- 既有未處理項（非本輪造成）：`metadata.trading.description` 英文版 213 字元，超過 Google 約 155
  字元的截斷長度（改之前是 218 字元，沒有變差）。要縮的話三語應一起重寫，屬獨立文案工作。

## 🟢 第五十四輪（實作，2026-10-11）：Footer「黃金學院」欄接上真實分類 ＋ `/academy` `?category=` 深連

### 業主決策

- 從第五十三輪留下的候選清單選定「黃金學院欄四個標籤對不上真實六分類、且無法深連」。
- 六個分類 vs footer 固定 4 格的版面問題，業主拍板**維持 4 格**＝全部文章 ＋ 前三個分類
  （黃金基礎／交易策略／技術分析）；其餘三類在 `/academy` 頁內篩選。

### 一、問題

| 原標籤 | 原連結 | 問題 |
|---|---|---|
| 基礎課程 | `/academy` | 六個真實分類裡沒有這一類 |
| 進階分析 | `/academy` | 同上 |
| 巨集觀基本面 | `/academy` | 同上 |
| 技術指標解讀 | `/academy` | 最接近「技術分析」但不同名 |

根因與第五十三輪相同：第十一輪依 Figma 填的佔位標籤從未對照站上真實內容。分類篩選又是純 client
state、沒有 URL 參數，所以即使標籤改對也無處可連。

本機 CMS 現有 **49 篇**文章（比第三十九／四十二輪紀錄的 27 篇多），六類都有內容：黃金基礎 19／
技術分析 7／交易策略 7／市場動態 6／風險管理 6／投資組合 4 —— 六類都是有效目的地。

### 二、分類 slug ＝ 新的單一來源

`src/lib/academyCategories.ts`：

- `ACADEMY_CATEGORY_SLUGS` = gold-basics／trading-strategy／technical-analysis／market-moves／
  risk-management／portfolio，**順序對齊三語 `academy.categories`**（index N 的 slug 對 index N
  的在地化標籤）。
- 為什麼不直接把中文分類名放網址：① 三語會各有一組連結；② 業主改一個字就斷連結。slug 是
  locale-independent 的穩定代號。
- `academyCategoryHref(slug)`／`parseCategorySlugs(values)`／`labelsFromSlugs`／`slugsFromLabels`。
  未知 slug 直接忽略 → 舊連結退化成「不篩選」，不會壞頁。
- **刻意不含 `server-only`**：Footer（server）與 AcademyExplorer（client）共用。
- ⚠ **增刪／重排分類時，三語 `academy.categories` 與這支檔必須同一次改動一起改**。`i18n:check`
  只保證三語之間一致，看不到這支檔；真的漏改也只是該類不可深連（頁內篩選仍正常）。

### 三、`/academy` 的 URL 同步（**新慣例：這樣做才不會弄丟 SSG**）

- `useSearchParams` 在預先渲染的路由上，會讓**最近的 `<Suspense>` 邊界以內**改成 client render。
  直接加在 `AcademyExplorer` 上 → 49 篇文章的卡片整批從靜態 HTML 消失＝SEO 回歸。
- 正解：抽出 **`CategoryQuerySync`**，`return null`、唯一職責是讀 `?category=` 並回報，外面單獨包
  `<Suspense fallback={null}>`。文章格留在邊界外 → 維持預先渲染。
  **日後任何「URL 狀態同步」都照這個做。**
- 兩向同步：
  - 進站／網址變動 → `applyFromQuery()` 設定 `draft`＋`applied`（側欄 checkbox 也會打勾）。
  - 頁內「套用篩選／重設篩選」→ `window.history.replaceState`（Next 原生支援，會同步進
    `useSearchParams`，不觸發導覽）。用 `replaceState` 而非 `pushState`，篩選微調不塞滿上一頁堆疊。
- **排序與頁碼刻意不進網址**（本輪只處理深連需求；要做的話同一套機制擴充即可）。
- 格式：`?category=<slug>`，支援逗號分隔多選與重複參數。
- 已知取捨：帶參數進站時，**首幀是完整清單、hydration 後才套用篩選**（這是維持 SSG 的代價）。
  另外 `/academy?category=x` 的靜態 HTML 與 `/academy` 完全相同＝重複內容，但 `generateMetadata`
  的 canonical 本來就指 `/{locale}/academy`，不必另外處理。

### 四、Footer

- **標籤直接讀 `academy.categories`**，不另開 footer 文案鍵 —— 符合 i18n「相同文字不開新鍵」，
  更重要的是**標籤永遠不可能與篩選選項不一致**。
- 因此刪除 `home.footerV2.cols.academy.{l2,l3,l4}`（三語），`l1` 由「基礎課程」改
  **全部文章／全部文章／All articles** → 三語 **662 鍵**。
- `Footer.tsx`：`FOOTER_LINKS` 縮成只涵蓋另外三欄（型別 `StaticCol`），學院欄由
  `FOOTER_ACADEMY_CATEGORIES = [0, 1, 2]` 生成；渲染改走預先組好的 `columns` 陣列。

### 五、驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check` 三語
  **662 鍵**／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠。
- **SSG 沒丟**：`/academy` 仍是 ●，且 `.next/server/app/{zh-Hant,zh-Hans,en}/academy.html` 裡仍有
  9 張文章卡（PAGE_SIZE）與「49 篇精選」計數，footer 三個分類連結帶正確 locale 前綴。
- `npm start`（port 3130）＋獨立 headless Chrome 以 CDP 實測：

  | 情境 | 結果 |
  |---|---|
  | `?category=technical-analysis` | 7 篇，側欄「技術分析」打勾 |
  | `?category=portfolio` | 4 篇 |
  | `?category=gold-basics,portfolio` | 23 篇，兩個都打勾 |
  | `?category=bogus` | 49 篇（忽略未知 slug） |
  | 簡中 `?category=market-moves`／英文 `?category=risk-management` | 6 篇／6 篇 |
  | 從 `/platforms` 點 footer 分類（SPA 導覽） | 正確套用 |
  | **已在 `/academy` 再點 footer 另一個分類**（元件不重掛） | 正確切換（靠 `useSearchParams` 反應） |
  | 頁內套用篩選 | 網址出現 `?category=risk-management` |
  | 重設篩選 | 網址回到 `/zh-Hant/academy`、49 篇 |
  | 瀏覽器上一頁 | 回到前一個分類狀態 |

- 三語 × 桌機 1440／平板 834／手機 390 的 footer 截圖逐一看過：四欄並排、英文平板換兩行
  （既有行為）、手機堆疊，無溢出。
- ⚠ **截圖工具筆記（補第五十二／五十三輪的互相矛盾說法）**：最穩的是**把 viewport 高度直接設成整頁
  高度**，`window.scrollTo(0,0)` 後用元素的 `getBoundingClientRect()` 當 clip、`captureBeyondViewport:false`
  ——這樣文件座標與視窗座標重合，不必捲動也不會拼錯。先捲動再 clip 的做法在頁面較長時會截到空白。

### 六、下一棒候選（本輪未動）

- 交易服務欄仍**缺人民幣公斤條**（4 格，補第三個產品要取捨），關於我們欄 l1–l3 仍無錨點。
- `/academy` 的**排序與頁碼未進網址**；若要讓「第 3 頁」也可分享，沿用本輪的
  `CategoryQuerySync` ＋ `replaceState` 機制擴充即可。
- 首頁深色三卡（`home/Academy`）的「瀏覽所有學堂內容」仍指未篩選的 `/academy`，本輪未動。

## 🟢 第五十三輪（實作，2026-10-11）：Footer「MT5平台」欄 → 「交易平台」並接上 `/platforms`

### 業主決策

- 從第五十／五十一／五十二輪留下的候選清單中選定「Footer『MT5平台』欄是否改名／改指 `/platforms`」。
- 同意先把落後的兩個 commit（`920a76c`、`25417e0`）push 上去 —— 已推，origin 現為 `25417e0`。

### 一、為什麼不只是改名

第三十八輪把 header 的 `nav.mt5`「MT5平台」改名 `nav.platforms`「交易平台」並改指 `/platforms` 時，
**footer 的同名欄位被留著沒動**（當時明寫「本輪未動，業主如要一併更名/改指再議」）。實際檢查該欄：

| 原標籤 | 原連結 | 問題 |
|---|---|---|
| MT5客戶端下載 | `/#mt5` | 站上**沒有**下載頁，也沒有任何核可的下載連結 |
| 移動平台操作 | `/#mt5` | 沒有這份操作指南 |
| EA程序化支持 | `/#mt5` | **紅線**：FACTS「Trading platforms」明列不得聲稱跟單／量化等未確認平台能力 |
| 操作常見指南 | `/#mt5` | 沒有這份指南（`/platforms` 的 FAQ 最接近，但當時沒有錨點可連） |

四個連結指向同一個首頁 teaser 區段，等於整欄都是佔位。**根因**＝第十一輪建 footer 時依 Figma 填的
標籤從未對照站上真實內容，之後每次新頁上線也沒回頭修這張表。

### 二、落地

- **i18n 鍵改名**：`home.footerV2.cols.mt5` → **`cols.platforms`**（三語同步；`Footer.tsx` 的
  `COLS` tuple ＋ `FOOTER_LINKS` key 一起改）。鍵數不變＝**665 鍵**。
- **新標籤／連結**：

  | 標籤（繁／簡／英） | 連結 |
  |---|---|
  | 平台總覽／平台总览／Platform overview | `/platforms` |
  | MetaTrader 5 | `/platforms#platform-types` |
  | 行動與網頁交易端／移动与网页交易端／Mobile & web terminal | `/platforms#platform-types` |
  | 平台常見問題／平台常见问题／Platform FAQ | `/platforms#platform-faq` |

  欄標題三語＝交易平台／交易平台／Trading platforms（與 `nav.platforms` 同字；footer cols 的
  title 一向是自己的鍵，`cols.academy.title` 與 `nav.goldAcademy` 也是如此，未改這個結構）。
- **新錨點**：`PlatformFaq` 區段補 `id="platform-faq"` ＋ `scroll-mt-20`（比照 `PlatformTypes` 的
  `#platform-types`）。header 是 sticky h-80，`scroll-mt-20`＝80px 剛好。
- 兩個連結共用 `#platform-types` 是刻意的：三個平台在該區段是 **client state 分頁**，沒有可深連的
  per-tab URL。要做 per-tab 深連得把分頁狀態放進 URL（`?platform=mt5` 之類），屬獨立工作。
  交易服務欄的 l3/l4 也早有同一個目的地，有前例。

### 三、驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／`i18n:check` 三語
  **665 鍵**／`migrate:check` 無漂移（未動 schema）／`rm -rf .next` 後 `build` 綠、頁面維持 ● SSG。
- 三語 `/platforms` 的 footer HTML 逐一比對連結與標籤；**全站掃過已無任何 `/#mt5` 連結**
  （首頁 `MT5Showcase` 的 `id="mt5"` 區段本身還在，那是第 (c) 項待業主的事）。
- 三語 × 桌機 1440／平板 834／手機 390 的 footer 截圖逐一看過：桌機四欄並排、平板標題換兩行
  （英文較長，既有行為）、手機堆疊，無溢出或壓字。
- 兩個錨點以 CDP 實測：`#platform-types` 與 `#platform-faq` 都停在 header 下方（`headerBottom` 80，
  `sectionTop` 160），未被 sticky header 遮住。
- ⚠ **截圖工具筆記**：IDE 內建瀏覽器的 `Emulation.setDeviceMetricsOverride` 與它的截圖管線對不上
  （版面吃到 1440，截出來卻是面板原寬，`captureBeyondViewport` 會拼出錯位的重複畫面）。改用獨立的
  headless Chrome（port 9444）＋**先把目標捲到視窗頂端、再用 viewport-relative clip ＋
  `captureBeyondViewport:false`**，一次就對。Chrome 必須用**背景 Shell 任務**啟動，指令內 `&` 起的
  會被收掉。另外 `npm run build` 與 `next dev` 共用 `.next`，驗證前先停 dev、build 完再重啟。

### 四、同時發現、本輪刻意沒動（下一棒候選）

footer 其餘三欄有同一個根因（Figma 佔位標籤沒對照真實內容），但各自是獨立的內容決策，沒有擅自改：

- ~~**交易服務欄缺人民幣公斤條**~~ → **第五十七輪已做**（業主選 A 案：改為由 `CFD_PRODUCTS` 生成
  三品種＋交易條件，維持 4 格；順便拿掉沒有目的地的「合約保證金」）。
- ~~**黃金學院欄**四個標籤對不上真實六分類~~ → **第五十四輪已做**（`?category=` 深連）。
- **關於我們欄** l1–l3 都指 `/about` 沒有錨點。
  ⚠ **第五十七輪更正**：本條原寫「About 有 `#milestones`／`#credentials`／`#office` 可用」是**錯的**
  —— 第十三輪 About 改版後那些區段 id 全部消失，`/about` 目前**完全沒有任何錨點**。要修必須先替
  About 區段補 `id`。業主第五十七輪決定該欄暫不處理。
- ~~**`metadata.platforms.description`（三語）仍寫「平台視覺為示意」**~~ → **第五十五輪已做**。
- **`platforms.types.items.mt5.desc` 與 `platforms.faq`** 提到 MT5「支援自動化（EA）交易」。
  → **第五十七輪業主已裁定**：先不改，因為 HATC 的 MT5 伺服器確實允許 EA，業主稍後會正式確認成
  核可事實。已在 `HATC_FACTS.md`「Trading platforms」記為**【待業主確認】**；在正式確認前**不得**
  據此在其他頁面新增 EA／量化／跟單文案。

## 🟢 第五十二輪（實作，2026-10-11）：開戶連結進 CMS ＋ 平台視覺改走首頁視覺概念

### 業主決策

- 「目前換的交易平台圖都很醜，不如你用首頁那張圖的概念。」
- 「開戶連結應該在 CMS 配置，我可以先給你一條：`https://h5.hatcmarket.com/#/pages/auth/register/index`」。

### 一、開戶連結（operational link 治理補完）

**發現的既有錯誤**：全站十幾處「立即開戶」CTA 都呼叫 `primaryContactHref()`，也就是**開戶按鈕實際指向
客服連結**（WhatsApp／線上客服／Email／電話），都沒設定時才退到 `/register` 佔位頁。業主給的註冊頁正好
補上這個缺口。

- `SiteSettings` → Accounts 區塊新增 **`openAccountUrl`**（`NEXT_PUBLIC_OPEN_ACCOUNT_URL` 為 env fallback）。
- `lib/siteSettings.ts` 新增 **`openAccountHref(s)`** ＝ `openAccountUrl → primaryContactHref(s) → null`
  （保留舊行為當 fallback，呼叫端仍自備 `/register`）。
- 改用 `openAccountHref()` 的 11 個元件：`Header`（按鈕＋mega banner）／`home/Hero`／`home/FinalCta`／
  `accounts/{AccountsHero,AccountTiers,AccountSteps,AccountsCta}`／`funding/{FundingHero,FundingIntro,FundingCta}`／
  `platforms/PlatformTypes`；`products/ProductsHero` 的唯一 CTA 亦是開戶。
- **同頁兩顆按鈕的頁面必須兩個解析器各算一次**：`products/ProductsCta`、`trading/TradingCta` 的「開戶」用
  `openAccountHref`、「聯絡我們」維持 `primaryContactHref`。純客服的 `ClientSupport`／`TradingHero`／
  `AboutCta` 不動。
- URL 寫入 `HATC_FACTS.md`「Official contact & website」，並註明**僅為紀錄、UI 一律讀 CMS**，且
  **不得拿註冊連結充當模擬帳戶入口**。
- ⚠ **schema 變更** → `npm run generate:types` ＋ migration **`20261011_091538_add_open_account_url`**
  （`.ts`＋`.json`＋`index.ts` 已一起 commit）。本機 DB 的 `open_account_url` 已用 psql 設好；
  **正式站要在 `/admin` 填一次**。

### 二、模擬帳戶按鈕的兩個漏洞（順修）

- `home/FinalCta` 的次要 CTA「免費模擬帳戶」**硬編 `/register`**，完全沒套用第四十四輪的
  「`demoAccountUrl` 未設定就不渲染」規則 → 已改讀 `demoAccountHref()`，未設定即不渲染
  （與 `/accounts`、`/platforms`、`/funding` 一致）。
- 本機 DB 的 `site_settings.demo_account_url` 先前被填成**註冊頁**（第五十一輪測試殘留，非業主提供）
  → **已清空**。否則「申請模擬帳戶」會把人送到開戶註冊頁，而 FACTS 明載模擬入口待業主提供。

### 三、平台視覺（素材 ＋ 呈現；架構沿用第五十一輪）

**「醜」的三個根因**（實機截圖比對後確認）：

| 根因 | 說明 |
|---|---|
| 素材形狀 | 舊檔是**長截圖**（`terminal-home` 860×830 近正方、chart 860×1430 ＝1:1.66），而外框**依素材比例**算 → 長成矮胖方塊，像平板不像手機 |
| 面板空洞 | 裝置置中且小，四周是大片深色＋細格線，構圖沒有重心 |
| 明暗衝突 | 交易端是**淺色 navy/白底**（業主 2026-09-22 拍板的交易端品牌色），塞進深色金色面板裡對比突兀 |

**落地**

- **`scripts/capture-terminal.mjs`（新增，進倉庫）**：CDP 驅動重截，重點三件事——
  (a) **必須先點「日K」**：預設「分時」常常「暂无图表数据」，而且開高低與現價互相矛盾
  （實測 今開 4616.50 對現價 4194.49）；切到日K後數字自洽。
  (b) **依「賣出」列上緣裁切**（找不到就直接拋錯，拒絕輸出未裁切的檔）——遊客點差 32 與核可分級點差不符。
  (c) **hash-only 導覽不會重掛 uni-app router** → 每張之間先 `about:blank`，否則三張都會是第一個品種；
  另外路由參數是 **`symbolCode`＋`symbolName`**（`symbol=` 只有黃金會動，因為它是預設值，很容易誤判成功）。
- **素材**：手機視窗 **430×932 @2x** → 手機檔＝一個手機螢幕 **860×1744（1:2.03）**；桌機視窗
  **1000×820 @2x** → 瀏覽器檔 **2000×1520**（見第五節）。
  **`terminal-home.png` 退役**：遊客首頁下半是第三方財經資訊流（A 股公告速遞／國際新聞），與 HATC 產品無關。
- **`PlatformVisualPanel` 改版**（三處共用，`/platforms` hero＋分頁、`/accounts` 卡片）：
  深藍景深漸層（gold wash ＋ navy radial）＋**金色細線幾何**（旋轉方框 outline，低透明度）＋細格線降到 0.07；
  裝置外框**由面板寬度決定大小**、**刻意切出面板下緣**。
  素材已在買賣價列上方裁過，所以切下緣**不隱藏任何東西**，純粹是 product-shot 構圖。
- **刻意沒做的事**：業主給的「首頁那張圖」＝`public/figma/raw/raw_3.png` 是 **Figma AI 算圖**
  （螢幕裡是假的 MT5 介面與假報價，畫面上還有**浮動金色立體塊**＝DESIGN_DIRECTION 避免清單）。
  搬到平台頁等於復活第五十一輪剛退役的假截圖 → **只借呈現概念**（深藍景深＋金色幾何＋立體裝置）。
- **沒做多裝置（laptop＋tablet＋phone）**：交易端 H5 在 WEB 鎖 `max-width:500px`，**不存在桌機版 UI**，
  筆電外框裡沒有誠實的內容可放。真要多裝置得等 MT5 桌機版真實截圖（需業主測試帳號）。

### 四、文案順修

- `platforms.detail.bullets[0]`「專注黃金 / 白銀 CFD」→「**專注貴金屬 CFD**」，desc 補**人民幣公斤條**
  （三語）。理由同第四十五輪 `/trading`：FACTS 的 CFD 標的是三個品種，列兩個屬資訊不全。

### 五、同輪追加：三種裝置外框 ＋ MT5 改用供應商官方畫面

業主看過上面的成果後再給兩句指示：「MT5 圖用 `~/Downloads/MT5.png`」＋「不要全部用同一張圖，你做一做
圖吧，網頁端跟 app 有點差異化」。

**① MT5：業主明示放寬一條紅線，範圍限定**

那張圖是 MetaQuotes 官網（metatrader5.com）的 MT5 桌機截圖，左側 Market Watch 與三個圖表視窗是**供應商
示範帳戶的外匯與美股**（EURUSD／GBPUSD／USDCHF／USDJPY／USDCNH／MSFT／AMD／INTC／NVDA／EURJPY），
下方成交紀錄也是外匯。這正是第五十一輪不採用 MetaQuotes 截圖的原因。

處理方式：**先把問題講清楚並附上「只留 XAUUSD 黃金視窗」的裁切版**（918×518，畫面乾淨）讓業主二選一，
**業主選用完整畫面**，即明示同意**就這張第三方平台示範圖**放寬「不得呈現外匯/美股」。

- **放寬只適用這張圖**。產品清單、條件表、跑馬燈、文案一律仍只有黃金／白銀／人民幣公斤條。
- **凡顯示該圖的版面必須印 `platforms.types.vendorNote`**（新鍵，三語）：說明這是平台供應商的示範帳戶
  畫面、並點明 HATC 提供的三個產品。該圖黃金價 **5086** 與現價 4194 差近 900 點，也靠這段說明交代。

**② 差異化＝不同裝置外框，不是不同濾鏡**

交易端 H5 鎖 `max-width:500px`，**沒有桌機版版面**（實測 1440 寬＝500px 欄置中、兩側全白），所以
「網頁端」唯一誠實的拍法就是把**桌機瀏覽器視窗的實況**截下來，再用**我們自己的瀏覽器外框**包起來
（紅綠燈點＋位址列印 `h5.hatcmarket.com`＝FACTS 已核可網域；**截圖本身不含任何網域**，所以來源網域
不可能外洩）。三種 kind 對三種外框：

| kind | 素材 | 外框 | 註記 |
|---|---|---|---|
| `phone` | `terminal-gold-chart.png`（手機・金） | 手機外框 | `screenshotNote` |
| `browser` | `terminal-web-silver.png`（桌機・銀） | 瀏覽器視窗 | `screenshotNote` |
| `combo`（hero） | `terminal-web-gold.png` ＋ `terminal-kilobar-chart.png` | 瀏覽器＋手機交疊 | `screenshotNote` |
| `vendor` | `mt5-desktop.png`（業主提供） | 螢幕薄邊（MT5 自帶視窗列，不加第二層標題列） | `vendorNote` |
| `upload` | CMS 上傳 | 無外框（比例未知） | 無 |

每個檔案在站上**只出現一次**，三個核可產品都露臉。**退役 `terminal-silver-chart.png`**（手機・銀，
已無使用者）與 **`metatrader5-logo-white.png`**（MT5 有截圖後 `brand` kind 成死碼，一併移除）。

**③ 程式變更**

- `platformVisuals.ts`：kind 由 `screenshot/brand/upload` 改為 **`phone`/`browser`/`combo`/`vendor`/`upload`**；
  新增 `PLATFORM_SCREENS`（per `panelLabel`，分 phone/desktop）、`VENDOR_SCREENS`、`TERMINAL_HERO`
  （`{desktop, phone}`）、**`visualNote()`**（決定印哪段註記）、`WEB_TERMINAL_HOST`。
- `PlatformVisualPanel.tsx`：抽出 `Screen`／`PhoneFrame`／`BrowserFrame`／`MonitorFrame`。
- `PlatformTabsClient` 收 `notes` 物件（兩段註記）而非單一字串；`AccountPlatforms` 依 `visualNote`
  收斂註記，**每段最多印一次**。
- `scripts/capture-terminal.mjs`：JOBS 帶 `view`（PHONE／DESKTOP），每張自己設 device metrics。
- i18n 新增 `platforms.types.vendorNote` → 三語 **665 鍵**。

**④ 被我否決的素材（下一棒別再試）**

- 遊客**「自選／行情」清單**：剛好只有黃金/白銀、沒有外匯，看起來很適合，但**點差 38／32 直接印在
  欄位裡**，與核可的分級點差衝突，且無法只裁掉中間那一欄。
- 遊客**「合約屬性」分頁**：手數 0.01-20、最小掛單距離 200點、交易時段 06:05-24:00、隔夜利息——
  **都不是核可事實**（FACTS 的時段是 06:00–次日 04:45，手數仍「將另行公佈」）。
- **公斤條的桌機 K 線**只有 7 根蠟燭（資料稀疏），當 hero 主圖太空，所以 hero 瀏覽器用黃金。

### 驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning；新腳本的 `no-unused-expressions` 已修）／
  `tsc --noEmit` 乾淨／`i18n:check` 三語 **665 鍵**／`migrate:check` 無漂移／`build` 綠、頁面 ● SSG。
- `npm start`（port 3120）：三語 `/platforms`、`/accounts`、`/funding`、`/products`、`/trading` 全 200；
  三語 `/accounts` 皆含開戶連結；**MT5 分頁以 CDP 點擊驗過**（`[role=tab]` → `aria-selected` ＋ `img src`
  依序為 gold／silver／MT5 logo）。⚠ 用 CDP 截區塊時要先 `scrollIntoView`，`clip` 超出 viewport 會截到白底。
- 桌機 1440／平板 834／手機 390 × 三語截圖逐一看過；三個分頁（App／網頁端／MT5）各自的外框與註記
  都以 CDP 點擊驗過（`aria-selected` ＋ `img src` 逐一比對）。
  ⚠ 截元素區塊請用**文件絕對座標 ＋ `captureBeyondViewport:true`**；「scrollIntoView ＋ viewport clip」
  會截到錯位的空白畫面。
- **降級路徑**：`DATABASE_URI=` 空值重建 → `/accounts` HTML **0 個 h5 連結、8 個 `/register` fallback、
  模擬按鈕不渲染**（「申請模擬帳戶」只出現在 FAQ 文案與 RSC payload，不是按鈕）。

### 待業主 / 下一棒

- **模擬帳戶申請入口**：給了才會出現模擬按鈕（目前三頁都不渲染，首頁收尾 CTA 也因此只剩一顆按鈕）。
- **登入連結**：Header「登入」仍指 `/account`「即將推出」佔位頁。交易端有登入頁
  （`#/pages/auth/login/index`），但這屬 operational 連結＝**業主提供後**比照開戶加 CMS 欄位，不自行推導。
- **首頁 `MT5Showcase` 的 `raw_3.png`**：AI 算圖假 MT5 畫面＋浮動金塊，與「站上不放假平台截圖」紅線相衝。
  要換成真實截圖嗎？（換法：改用 `PlatformVisualPanel`，但首頁該卡是橫式 584×380，版型要調。）
- **HATC MT5 伺服器測試帳號** → 把供應商示範畫面換成**HATC 自家 MT5 的真實截圖**（只放三個核可產品的
  Market Watch），屆時 `vendorNote` 即可退役、`vendor` kind 可改回 `browser`/`phone` 之外的 desktop 截圖。
- 生產遊客交易組配好產品後，**改用生產環境重截**交易端截圖（現素材來自 UAT；畫面本身不含網域）。
- 第五十／五十一輪留下的候選仍在：~~Footer「MT5平台」欄是否改名／改指 `/platforms`~~（第五十三輪已做）、
  `/trading` 合作夥伴標誌佔位、`--trd-gold #c9a84c` 是否統一成 `#d4af37`、`/products/all` 的最低手數／
  手續費／執行方式、上線前檢查 CMS global `home-page` 是否存有舊文案。

## 🟢 第五十一輪（實作，2026-10-11）：平台視覺統一（真實截圖三語 ＋ 官方 MT5 標誌 ＋ 裝置外框）

### 業主決策

- 起點是業主的一句話：「所有交易平台的圖，都要有圖。現時都沒有圖，包括 `/account`, `/platforms`。
  如果真實截圖不好看，不如你用 〔Figma 連結〕來改」。
- **讀完 Figma 後回報並擋下**：`uYnvWpHrVTx8POlR1eYxKT` node `146:63190` 是**競品行銷海報**
  （橘色品牌＋競品 App logo＋競品外匯報價 EURUSD/GBPNZD/AUDNZD＋「涵蓋外匯、貴金屬、股指、原油等
  上百種」）。不可照抄；**只借版面手法**（手機外框＋品牌漸層＋立體陰影）。
- **AskQuestion 兩題，業主拍板**：
  1. 真實交易端截圖 → **三語都顯示**（推翻第四十七輪「只上簡中版」）。依據：交易端
     `~/Desktop/mt5-web/mt5-uniappx` **沒有任何 i18n／locale 檔**，只有簡體介面 → 「等它支援繁中」
     等於永遠不放真圖；它是 HATC 的真實產品，配 `platforms.types.screenshotNote` 即為誠實呈現。
  2. MT5 → **用 MetaQuotes 官方素材**。

### 現況診斷（業主說「沒有圖」的真正成因）

| 位置 | 改前 |
|---|---|
| `/platforms` 繁中／英文 | Figma 範本的**通用裝置渲染圖**＋「示意」標；`detail-phone.png` 裡還是**美股代號 AAPL/GOOGL/TSLA** |
| `/platforms` 簡中 | 有真實截圖，但白底長方形直接浮在深色框裡（業主說的「不好看」） |
| `/accounts` 三語 | 三張卡全是金色漸層＋文字，**完全沒有圖** |
| MT5（任何語系、任何頁） | 沒有任何圖 |

### MT5 素材的取得與取捨

- 來源＝**MetaQuotes Media Gallery**（`https://www.metaquotes.com/en/media-gallery`），頁面明文：
  免費提供給券商網站／文章使用。使用條款要求**不得改色、不得改字體、不得改變版面比例、不得在標誌上
  加元素** → 因此採用**未經任何修改的白色原檔**，只是置中放在我們自己的深色面板上。
- 落地檔案：`public/platforms/metatrader5-logo-white.png`（官方 `MetaTrader 5/Logo/metatrader5-white.png`，
  1024×176）。
- **🚩 刻意不用 MetaQuotes 的 MT5 截圖**：下載並逐張檢視了 Desktop／Laptop／Screenshots／iOS／Android
  全套，**每一張都帶著外匯 Market Watch（EURUSD、GBPUSD…）**，放上官網等於把外匯呈現為 HATC 產品
  （紅線）。標誌沒有這個問題。
- 真正的 MT5 真實截圖**需要 HATC MT5 伺服器的測試帳號**（登入 MetaTrader 5 網頁版截自家伺服器）→
  已列為待業主項。

### 落地

- **`src/components/platforms/terminalScreenshots.ts` → `platformVisuals.ts`**
  （`resolveTerminalVisual(platform, locale)` → **`resolvePlatformVisual(platform)`**，不再吃 locale）。
  優先序 **CMS 上傳 → 真實截圖 → 官方品牌標誌 → `null`**；`null` ＝「沒有誠實可用的圖」。
  截圖現在帶 `width`/`height`（`ImageAsset`），供外框算比例。原有的截圖治理註解全數保留。
- **新元件 `src/components/platforms/PlatformVisualPanel.tsx`**（純展示、server/client 皆可用）＝
  深色金漸層＋格線底，依 `kind` 渲染：`screenshot`→**裝置外框**／`brand`→置中標誌／`upload`→
  `object-contain`／`null`→品牌面板顯示 `panelLabel`。**`/platforms` hero＋tabs 與 `/accounts` 卡片
  三處共用同一個元件**，版式不會再各走各的。
- **裝置外框刻意依截圖的原始比例**，而非固定手機比例：這些截圖已經在交易端買賣價列上方裁切過
  （見 `platformVisuals.ts` 檔頭紅線），再 `object-cover` 裁一次會切掉底部指標列。
- **退役**：`public/figma/platforms/{hero-devices,detail-phone}.png`、`kind:'mockup'`、
  i18n `platforms.types.visualNote`＋`platforms.hero.visualLabel`（三語）。**站上已不存在標「示意」
  的平台圖**——要嘛真實截圖（標 `screenshotNote`），要嘛官方標誌，要嘛自家品牌面板。
- `AccountPlatforms` 視覺區 260→**340px**；`/platforms` hero 320/400→**380/460px**。

### ⚠ 實作踩到的坑（下一棒照抄）

- **百分比高度在 flex 項目上會算成 `auto`**：外框第一版用 `h-full` + flex-column + `flex-1`，
  `<Image className="h-full w-auto">` 的 `height:100%` 無法解析 → 圖片以原生 **860px 寬**溢出卡片，
  變成一條橫帶（截圖留在 git 歷史外，但現象很像「破圖」）。正解＝外層 sizer
  `style={{aspectRatio: w/h}}` + `h-full`，bezel `absolute inset-0`，螢幕 `object-contain`。
- **`next dev` + 無頭瀏覽器點不動分頁**（client chunk ERR_ABORTED，第四十五／四十九輪已記）→
  MT5 分頁是用 `npm start` ＋ CDP `Runtime.evaluate` 點擊後再查 `aria-selected` 驗的；
  ⚠ `.click()` 之後要**另一次 evaluate** 才讀得到更新後的狀態（React setState 非同步）。
- **🚩 `next build` 會重用 `.next/cache` 的 CMS 讀取結果**（本輪意外發現，非本輪造成）：
  DB 的 `site_settings.demo_account_url` 明明有值，build 出來的 `/platforms` 卻沒有模擬帳戶 CTA；
  `rm -rf .next` 重建後正確。⇒ **CMS 改過後在本機驗畫面，先清 `.next`**；CI 全新 runner 無此問題，
  但正式站若用有快取的增量建置要留意。

### 驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
  `i18n:check` 三語 **664 鍵**（刪 2 鍵）／`migrate:check` 無漂移（未動 schema）／`build` 綠且
  `/platforms`、`/accounts` 維持 ● SSG。
- `npm start`（port 3110）實測：三語 `/platforms`、`/accounts` 皆 200；桌機 1440／平板 834／
  手機 390 截圖逐一檢查；MT5 分頁以 CDP 點擊驗過（官方標誌置中、無 caption）。

### 待業主 / 下一棒

- **HATC MT5 伺服器的測試／模擬帳號** → 用 MetaTrader 5 網頁版截自家伺服器的真實畫面，取代官方標誌。
- 交易端若日後支援繁中／英文，重截對應語系（截圖紅線見 `platformVisuals.ts` 檔頭，必照做）。
- 英文站目前顯示**簡體介面**的截圖＝業主已知並同意；若日後覺得不妥，解法是交易端做 i18n，不是放假圖。
- 第五十輪留下的候選仍在：`/trading` 合作夥伴標誌佔位、淺色 `--trd-gold #c9a84c` 與深色 `#d4af37`
  是否統一、Footer「MT5平台」欄是否改名／改指 `/platforms`、`/products/all` 的最低手數／手續費／
  執行方式、正式站上線前檢查 CMS global `home-page` 是否存有舊文案。

## 🟢 第五十輪（實作，2026-10-11）：文案紅線清除 ＋ `/accounts` 真實截圖

### 業主決策

- 本輪做三項：**① 文案紅線修正（方向 A）② `/accounts` 平台區換真實交易端截圖 ③ push 落後的 commit**。
  未選：`/trading` 合作夥伴佔位與 `--trd-gold` 統一、交易端繁中/英文截圖、`/products/all` 待業主值。
- 文案方向 A ＝ 移除違規宣稱後改用**已核可事實**替代，並把產品敘述補齊成三個 CFD 品種。
- 同輪追加核可：`home.whyV2.cards.c2`、`home.mt5.heading`、`platforms.hero.subtitle` 三處一併改；
  **`home.mt5.features.f1`「全天候多端自適應」業主決定保留**（語意是多端隨時可用，非聲稱 24 小時交易）。

### 文案改動（三語同步，鍵數不變）

| 鍵 | 原文（違規點） | 新文 |
|---|---|---|
| `home.goldServices.features.f2.title` | 24小時雙向不間斷交易（與核可時段每日休市牴觸） | 全球市場時段雙向交易 |
| `home.goldServices.features.f2.sub` | 配合全球市場時段，靈活把握行情。 | 可做多亦可做空；交易時段為香港時間，詳見交易條件。 |
| `home.goldServices.features.f3.title` | 極速訂單執行通道（執行方式待業主提供＋禁速度宣稱） | MetaTrader 5 專業交易平台 |
| `home.goldServices.features.f3.sub` | 穩定的下單與訂單執行體驗。 | 黃金、白銀與人民幣公斤條均於 MT5 平台交易。 |
| `home.goldServices.subheading`／`body` | 只提倫敦金/銀 | 黃金、白銀與人民幣公斤條（差價合約） |
| `home.whyV2.cards.c2` | 一流執行速度／穩定的交易系統與訂單執行通道。 | 透明的交易條件／四個帳戶類型的點差與最高槓桿公開列示… |
| `home.mt5.heading` | 國際頂尖 MT5 交易平台 | 國際通用 MT5 交易平台 |
| `platforms.hero.subtitle` | 追求極速下單的專業交易者…掌握市場先機 | 經驗豐富的專業交易者…檢視行情 |

- 替代文案全部落在**已核可事實**上：MT5 為唯一平台（FACTS「Trading platforms」）、
  四帳戶點差/槓桿公開（FACTS「Account types & trading conditions」）、三個 CFD 品種（FACTS「CFD business」）。
- ⚠ `home.goldServices.{subheading,body}` 與 `home.mt5.heading` **可被 CMS global `home-page` 覆寫**
  （`servicesSubheading`／`servicesBody`／`mt5Heading`）。本機 `home_page_locales` 為 0 列＝走 i18n，
  但**正式站若業主在後台填過舊文案，仍會蓋掉這次修正** → 上線前需檢查該 global。
  `features.*`／`whyV2.cards.*`／`platforms.hero.*` 純 i18n，不受 CMS 影響。

### 🚨 示意跑馬燈的紅線（本輪發現並修掉）

- `src/components/home/sampleMarketData.ts` 的 `SAMPLE_TICKER` 原有 6 列，含**已退役的 `XAU/HKD`**
  與 `USD/CNH`／`HKD/USD`／`XAU/EUR`。紅線「不得列外匯/指數為 HATC 產品」**不因標了「示意數據」而豁免**。
- 已收斂為三列（`XAU/USD` 2,342.80／`XAG/USD` 28.45／`RKG/CNH` 546.10，示意值彼此量級自洽），
  與 `MARKET_SYMBOLS` 一致；檔頭加註「這四個代號已退役」以免日後照 Figma 復原。
- **為何之前沒被發現**：閘道正常時跑馬燈顯示的是三個真實品種，示意列只在**降級狀態**（無閘道／取不到）
  才出現。⇒ 日後審示意資料時，請**刻意跑一次降級狀態**（`QUOTE_GATEWAY_URL=` 空值 `npm start`）。

### `/accounts` 平台卡 → 真實交易端截圖

- 新共用 helper **`resolveTerminalVisual(platform, locale)`**（`components/platforms/terminalScreenshots.ts`）
  ＝ **CMS 上傳 → 真實截圖（僅 zh-Hans）→ `null`**。回 `null` 代表「沒有誠實可用的圖」，
  由各頁自行決定佔位：`/platforms` → Figma device mockup＋「示意」標籤；`/accounts` → 金色漸層＋`panelLabel`。
  `/platforms` 原本 inline 的同一套優先序已改呼叫 helper（兩頁不會再走岔）。
- `AccountPlatforms.tsx`：視覺區 200→**260px**；截圖用 `object-cover object-top`（保留品種名／價格／OHLC），
  底部加 `to-[var(--fig-light)]` 漸層讓裁切邊**淡入卡片**，避免 K 線硬切像破圖；
  有任一張截圖時，區塊下方顯示**一次** `platforms.types.screenshotNote`（圖中報價為截圖當時價格）。
- 對應關係沿用 `panelLabel`：`HATC App`→金日 K、`Web Trading`→銀日 K、**MT5 無真實截圖 → 漸層卡**
  （`/accounts` 從未放假截圖，維持此原則）。
- 實機檢查：zh-Hans 桌機/平板/手機皆正常（平板因卡片較窄反而露出更多 K 線）；
  zh-Hant／en 正確降級為漸層卡且不顯示截圖註記。

### 順手修掉的既有隱患

- `src/app/api/dev-revalidate/route.ts` 原本硬列 7 個 tag，**漏掉所有 marketing global**
  （`home-page`／`trading-page`／…）→ 改 `src/messages/*` 後 dev 看不到新文案。
  已改成 `Object.values(CACHE_TAGS)`，新增 tag 自動納入。

### 待業主 / 下一棒

- **正式站上線前**：檢查 CMS global `home-page` 是否存有舊的 services／mt5 文案（會覆寫本輪修正）。
- 其他未選候選仍在：`/trading` 合作夥伴標誌佔位、淺色 `--trd-gold #c9a84c` 與深色 `#d4af37` 是否統一、
  交易端繁中/英文截圖（現僅簡中）、`/products/all` 的最低手數／手續費／執行方式、
  Footer「MT5平台」欄是否改名／改指 `/platforms`（第三十八輪起的 follow-up，連結仍為 `/#mt5` 類錨點）。
- 生產遊客交易組配好產品後：`QUOTE_GATEWAY_URL`／`QUOTE_HTTP_CRYPT_SECRET` 換 prd（官網不需改碼）。

## 🟢 第四十九輪（實作，2026-10-11）：首頁 K 線接真實日 K

### 業主決策

- 本輪做「首頁 Services 的 K 線接真實日 K」；其餘候選（`/accounts` 平台區換真實截圖、
  `/trading` 合作夥伴佔位與金色統一、push 落後 commit）**未選**。
- 行情閘道**維持 UAT**（`QUOTE_GATEWAY_URL`＝UAT）；生產遊客交易組配好產品後再切，官網不需改碼。

### 閘道實測（更正第四十六輪的紀錄）

- **`/v1/market/bars` 三種 resolution 都正常**：`1D`／`60`／`240` 皆回 200 且有資料
  （第四十六輪判定的「回空」是 resolution 寫法問題）。合法值 `1/5/15/30/60/240/1D/1W`，
  必帶 `priceType=bid` ＋ `contextToken`。
- 回應＝`{ts, env, symbol, resolution, priceType, bucketMs, bars[], currentBar,
  previousCompletedBar, meta}`，**沒有 `result` 包裝**（與 `symbol-detail` 相同；只有
  `context/resolve` 包在 `result` 裡）。bar 欄位＝`{time,open,high,low,close,volume,
  tickVolume,spread}`。
- **`limit` 界定的是時間窗、不是根數**：`limit=20`→18 根、`30`→26、`45`→39、`60`→**52**、
  `200`→171（UAT 日 K 最多 218 根，自 2026-01-28 起）。本實作用 `limit=60` 再取最後 30 根。
- **日 K 的 `time` 落在香港午夜**（`meta.chartTimeOffsetHours:-3` 正規化後），所以日期標籤
  用 `timeZone:'Asia/Hong_Kong'` 格式化才不會差一天。
- `meta.currentBarCompleted` / `currentBar` 可判斷當日 bar 是否還在跑（週末為 `null`＋`true`）。
- **⚠ 冷啟動降級**：第一次請求可能落到**tick 推導**來源，只回 1–2 根且 `open=high=low=close`
  （數值與 `official_chart_get_bid` 不同）。→ client 以 **`MIN_BARS = 5`** 擋掉。
  **不要**改用 `meta.source` 字串判斷（耦合閘道內部實作）。
- **🚩 遊客白名單有 29 個代號**，其中 26 個是外匯／指數（EURUSD、HK50、TECH100…）。
  因此代理端**必須**鎖定品種，否則官網會變成外匯/指數行情代理（違反「不得列外匯/指數為
  HATC 產品」）。`getDailyBars` 只接受 `MARKET_SYMBOLS`。

### 實作

- **`src/lib/marketQuotes.ts`**（server-only）新增 **`getDailyBars(symbol)`**：複用既有
  `resolveGuestContext`／`gatewayFetch`（含 AES 信封解封），`resolution=1D`＋`priceType=bid`＋
  `limit=60`，取最後 **`BAR_COUNT = 30`** 根；**60 秒**快取、per-symbol inflight 去重、
  非 `MARKET_SYMBOLS` 直接 null、失敗 `console.warn` → null。
- **`src/lib/marketQuoteTypes.ts`**：新增 `MarketBar` 型別（**刻意不含 server-only**，供 client 共用）。
- **`src/app/api/market/bars/route.ts`**：`force-dynamic`，`{ok:false}` 是正常答案
  （無閘道／取不到／非首頁品種都走這條）。
- **`src/components/market/useDailyBars.ts`**：client hook，**60 秒**輪詢（日 K 只有當根會動，
  不需跟著 5 秒報價走）、`document.hidden` 暫停、`visibilitychange` 立即補抓、`MIN_BARS=5`。
- **`src/components/home/Services/ServiceChart.tsx`**：純渲染＋幾何計算
  （`buildCandles` 把 OHLC 映到 300×160 viewBox，`barAxisLabels` 產 6 個日期刻度；
  平盤序列走中線、doji 保留 1px 實體）。
- **`src/components/home/Services/ServiceMarketPanel.tsx`**（client）：K 線＋報價卡＋**單一**
  來源標籤（兩個元件吃同一個閘道，標籤只該出現一次）。
- **`ServicePriceCards.tsx`** 退為純展示元件（quotes 由 panel 傳入，hooks 上移）；
  `Services.tsx` 右欄由 70 行 inline SVG 變成一個 `<ServiceMarketPanel>`。

### 標籤與治理

- **三狀態**：① 有日 K →「日 K 線（MT5 行情）」＋綠點；② 完全沒行情 → Figma 示意蠟燭＋
  「示意數據 (設計佔位)」（無綠點）；③ **有即時報價但日 K 取不到 → 不畫任何蠟燭**，
  只留格線＋「圖表資料暫時無法取得」。
  ③ 是紅線「真價格旁不放假走勢／假 K 線」的直接落地（與 hero sparkline 的 `MIN_SPARKLINE_POINTS`
  同一原則）。
- **刪掉一個既有誤導**：K 線框原本**永遠**顯示綠點＋「實時交易中」，同時又標「示意數據」
  → `home.goldServices.live` 三語**刪除**；新增 `chartDaily`／`chartUnavailable`（三語 **666 鍵**）。
- 報價卡真實時，區塊底部註記由單純「即時報價」改為 **`liveLabel · sourceNote`**（補上免責，
  與 hero 卡、`/trading` 條件表一致）。
- **真實報價／K 線仍不是已核可事實**：未寫入 `HATC_FACTS.md`、與交易條件無關
  （核可點差／槓桿仍只在 `products/tradingConditions.ts`）。
- `docs/FIGMA_HOMEPAGE_SPEC.md` 已加注記：該檔的「示意 K 線」規格現在只適用於降級狀態。

### 驗證

- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`tsc --noEmit` 乾淨／
  `i18n:check` 三語 **666 鍵**齊／`migrate:check` 無漂移（本輪未動 schema）／
  `build` 綠且頁面維持 **● SSG**、`/api/market/{quotes,bars}` 為 **ƒ**。
- **三狀態都用 `npm start` 實機截圖驗過**（桌機 1440／平板 834／手機 390／英文版）：
  真實日 K（30 根、日期軸 9/7–10/10）、無閘道的示意蠟燭（10:00–15:00 軸）、
  有報價無 K 線的空圖＋說明（版面高度不塌）。
- API 閘門實測：`XAUUSD`→30 根、`XAGUSD`→30 根、`EURUSD`／`HK50`／空字串→`{ok:false}`。

### ⚠ 驗證環境踩到的坑（下一棒照抄）

- `chrome-headless-shell` 必須加 **`--no-sandbox`** 與 **`--run-all-compositor-stages-before-draw`**，
  否則 `--dump-dom` 只回 `<html><head></head><body></body></html>`、截圖一片白
  （`--window-size` 仍要排最前面）。`--virtual-time-budget` 無法取代等待，但加著無害。
- `nohup npm start &` 起的 server 會在該次 Shell 呼叫結束後被收掉 → 要用**背景 Shell 任務**跑。
- `pkill -f next-server` 會**連 dev server 一起殺**（本輪已重啟）。
- 驗 client 行為一律 `npm run build && npm start`（`next dev` ＋ 無頭瀏覽器會 ERR_ABORTED）。

### 待業主 / 下一棒

- **🚩 文案紅線衝突（本輪未改，等業主定）**：`home.goldServices.features`
  - `f2`「24小時雙向不間斷交易」— 與核可交易時段（週二至週五每日休市 1 小時、週末收市）牴觸。
  - `f3`「極速訂單執行通道」— 執行方式在 FACTS 明列「仍待業主提供」，且平台能力紅線禁止速度宣稱。
  - 另 `body`／`subheading` 仍只提倫敦金/銀，未含**人民幣公斤條**（已是第三個 CFD 產品）。
- 生產遊客交易組配好產品後：把 `QUOTE_GATEWAY_URL`／`QUOTE_HTTP_CRYPT_SECRET` 換成 **prd**
  （密鑰只能在主機環境變數設，不得進本倉）。官網不需改碼。
- 其他未選的候選仍在：`/accounts` 平台區真實截圖、`/trading` 合作夥伴佔位與 `--trd-gold` 統一、
  交易端繁中/英文截圖、`/products/all` 的最低手數／手續費／執行方式。
- `origin/main` 仍落後（`28ec3bb`、`9eb4201`，加上本輪的 commit）。

## 🟢 第四十八輪（實作，2026-10-11）：migration 基線 ＋ 漂移防呆

### 問題的真實樣貌

交棒 prompt 把它寫成「累積三輪未做的正式站 migration」，實際更根本：

- `src/migrations/` **不存在**、`package.json` **沒有任何 migrate 指令**——本倉自第一張表起
  從未產生過 migration，全靠 **Payload 的 Drizzle push**（`push` 預設只在 `NODE_ENV !== production`
  啟用）同步本機資料庫。
- **生產模式不 push，只重播 `src/migrations/*`**。因此正式站不是「schema 會舊三輪」，而是
  **連建庫都做不到**。
- 業主回覆「部署之後會交給開發處理」＝**目前沒有任何正式站／託管資料庫**
  （與本檔長期開放項「託管 Postgres 由誰開」一致）。→ 不需要保留資料的增量遷移，走 **baseline**。

### 落地

- **`src/migrations/20261011_073413_initial.{ts,json}` ＋ `index.ts`**＝依現行 config 產出的完整
  建表 SQL（**39 張表**）。產生方式：另建一個暫時空庫、把 `DATABASE_URI` 指過去再
  `payload migrate:create initial`（在空庫上產生才會是完整建表，而非對已同步的本機庫 diff 出空檔）。
- 因為現行 config 早已移除退役物件，baseline **天然乾淨**：
  - 不含 `account_tiers`／`account_spreads`／`account_platforms`（第四十四輪退役）
  - 不含 `sample_trading_conditions*`（第四十五輪退役）
  - 不含 `instruments` 的 `contract_size`／`spread`／`leverage`／`trading_hours`（第四十七輪退役）
  - **含** `site_settings.demo_account_url`（第四十四輪新增）
  - ⇒ 正式站第一次建庫就是正確 schema，**不存在**被種回黃金 27／白銀 30 的可能。
- **npm scripts**：`migrate`（套用）／`migrate:create`（產生，不需 DB）／`migrate:status`／
  `migrate:check`（漂移閘門）。
- **`scripts/check-migrations.sh`**＝漂移閘門，已掛 **CI**（lint → i18n:check → **migrate:check** → build）
  與 **pre-commit**（僅當 `src/collections/`、`src/globals/`、`src/payload/`、`src/payload.config.ts`
  有 staged 異動時才跑，約 2 秒）。
- **eslint 新增 ignore `src/migrations/**`**：Payload 產生的 migration 帶 4 個 unused-vars warning，
  且每次重新產生都會回來，不該手改。lint 維持 0 error／1 個既有 warning。
- **README 新增「資料庫 schema 與 migration」章節**：改 schema 必產 migration、部署步驟
  （空庫 → `migrate` → `build` → `start`，首次進 `/admin` 由 `onInit` 建 full-access Administrator）、
  serverless 選項（把 `migrate` 併進 build command，或 `postgresAdapter({prodMigrations})`——本倉
  刻意未啟用，避免執行期自動改 schema）。

### 為什麼漂移閘門不需要資料庫（關鍵機制，日後沿用）

讀 `node_modules/@payloadcms/drizzle/dist/utilities/buildCreateMigration.js` 確認：

- `migrate:create` 的 diff **是比對 migrations 目錄中最新的 snapshot `.json`**，不是比對線上 DB；
  `payload/dist/bin/migrate.js` 對 `migrate:create` 帶 **`disableDBConnect: true`**。
  → 空 `DATABASE_URI` 也能跑（CI 現有 env 直接可用）。
- 無變更時會問「No schema changes detected. Would you like to create a blank migration file?」，
  **無 TTY／`< /dev/null` 時 prompts 走 onCancel → `process.exit(0)` 且不寫檔**。
- ⚠ **這版 Payload 的 `--skipEmpty` 旗標實際無效**：`bin/migrate.js` 傳 `skipEmpty`，但
  `buildCreateMigration` 解構的是 `ln`。所以閘門靠 `< /dev/null`，不要依賴該旗標。
- ⚠ **產 migration 會重寫 `src/migrations/index.ts`**。閘門用探測名產檔判定漂移，因此
  **cleanup 必須同時還原 `index.ts`**，否則只刪探測檔會留下指向已刪檔案的 import 而弄壞 build
  （本輪第一版就踩到，已修）。

### 驗證

- **schema 等價性（實測）**：暫時空庫 `hatc_migrate` → `payload migrate` → 與本機 dev 庫各做
  `pg_dump --schema-only --no-owner --no-acl` 比對：兩份皆 **2968 行**，正規化後 diff **完全為空**；
  逐字 diff 僅剩**欄位順序**（dev 逐輪 push 追加 vs migration 走 config 順序）與 pg_dump 的
  restrict token。⇒ 前三輪的手動 ALTER **沒有漏**。暫時庫驗完已 `DROP DATABASE`。
- **閘門雙向實測**：乾淨狀態 → `No schema drift`／exit 0；暫時替 `Instruments` 加一個欄位 →
  `Schema drift` ／exit 1，且 `index.ts` 完好、無殘留探測檔。
- `lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning）／`i18n:check` 三語 **665 鍵**齊／
  `build` 綠且頁面維持 ● SSG、`/api/market/quotes` 為 ƒ／dev server 三頁 200、`/api/users/me` 200
  （無 drizzle push 卡住）。
- **本輪未改任何 collection/global 欄位**，故 `generate:types`／`generate:importmap` 無需重跑。

### 🚨 順手修掉：pre-commit hook 其實從未生效

本輪要掛閘門時發現 `git config core.hooksPath` 是**空的** → 第三十五輪寫的 **i18n pre-commit 閘門
一直沒有真正跑過**。原因：`package.json` 的 `prepare`（`git config core.hooksPath .githooks`）只在
`npm install` 時執行，而第三十五輪當時本倉**還沒 `git init`**（當時即記為 no-op），之後也沒再跑過
`npm install`。本輪已手動 `git config core.hooksPath .githooks` 啟用，並驗證檔案比對規則：
`src/collections/`、`src/globals/`、`src/payload/`、`src/payload.config.ts` 會觸發 `migrate:check`，
`src/components/*`、`src/messages/*.json` 不會（messages 走原本的 i18n 閘門）。
⚠ **hooksPath 是 local git config，不隨 commit 走** → 新 clone 的人要 `npm install`（或手動
`git config core.hooksPath .githooks`）才會有 hook；CI 的閘門才是真正的保險。

### 本機維持 push（刻意不改）

本機開發仍走 push，流程與過去各輪一致。⚠ **不要**把 `npm run migrate` 指向既有的、由 push 建出來的
本機庫——表已存在，migration 會在 `CREATE TABLE` 失敗。本機若要改走 migration 流程，砍掉資料庫重建即可
（本機內容皆為可重跑的種子腳本產物）。本機 dev 庫**沒有** `payload_migrations` 記錄，屬預期。

### 事實結案（業主 2026-10-11）

- 人民幣公斤條合約規模單位＝**克**（1,000 克＝1 公斤）→ FACTS 由「依定義推定」改為**已核可事實**。
- **夏令／冬令切換日期不對外公布** → FACTS 由「業主未提供」改為**業主決定不公布**，並明文禁止
  自行推導（例如比照美國夏令時間）。前台與 `tradingConditions.ts` 本已符合，無需改碼。

### 待業主 / 下一棒

- 部署平台與託管 Postgres（業主：交給開發處理）。開發接手時只需：空庫 → `DATABASE_URI`／
  `PAYLOAD_SECRET` → `npm run migrate`。
- 若開發已經用 dev push 建過某個環境的庫，**不要**在上面跑 baseline migration；砍掉重建，或
  自行 baseline（建 `payload_migrations` 表並插入 `20261011_073413_initial` 一列）。

## 🟢 第四十五輪（實作，2026-10-11）：`/trading` 接上真實條件 ＋ 即時報價，示意表退役

**起點**：第四十四輪（A）把真實交易條件寫進 FACTS 並改造 `/accounts`；本輪（B）＝把同一份事實
擴散到 `/trading`。原狀況：帳戶比較是**示意兩檔「標準 Standard／專業 Professional」**（8 列中 4 列
「待確認」，另有捏造的服務差異列），與真實 Standard／Pro **同名不同值**；「即時點差」區是**假 bid/ask**
（`2,342.80`），其中一列還是**不存在的 XAU/HKD「公斤條港幣」**。

### 業主拍板（AskQuestion）

| 問題 | 決定 |
|---|---|
| 「即時點差」區方向 | **即時報價 ＋ 核可條件**：品種／即時價／漲跌幅／點差「X 點起」／槓桿／平台；接首頁同一套 `/api/market/quotes`，**拿不到就隱藏價格欄**（不退回假數字）。**不並列 bid/ask**——`ask − bid` 會與分級點差互相矛盾 |
| 帳戶比較表 | **換成真實四檔 Mini／Standard／Pro／VIP**；刪捏造服務差異列（優先支援／教育資源／專屬客戶經理）與「推薦」徽章；同步**退役 CMS 覆蓋** |

### 實作

- **`AccountComparison`**（`trading/AccountComparison/`）＝四檔對照表，數值全來自
  `products/tradingConditions.ts`（與 `/accounts` 同源）：最低入金／最高槓桿／交易平台 ＋
  **點差（點）群組**（金/銀/公斤條 × 四檔）＋ 未確認條件列顯示「將另行公佈」。徽章只有**事實衍生**的
  `入金門檻最低`／`點差最低`；highlight 落在 VIP（＝點差最低），不是行銷式「推薦」。CTA → `/accounts`。
- **`PricingConditions` ＋ 新 client `ConditionsTable.tsx`**：server 永遠輸出「條件表」（SSG、無
  hydration mismatch），client 取到報價才**長出「即時價格／漲跌幅」兩欄**並顯示「即時報價 ·
  報價由 MT5 行情服務提供…」；報價中斷則欄位收回。點差欄固定是核可的「20／30／35 點起」。
- **`LiveQuotesProvider` 搬到 `src/components/market/`**（首頁與 `/trading` 共用；首頁 4 個 importer 已更新）。
- **退役 CMS global `sample-trading-conditions`**（＋`lib/sampleTradingConditions.ts`、
  `components/trading/sampleTradingData.ts`、payload.config／registry／cacheTags／revalidate 條目）。
  admin 儀表板那張「示意交易條件表」入口卡改指 **`instruments`**（`/products/all` 仍是唯一有示意值的表）。
- **順手對齊 FACTS 的 `/trading` 文案**（三語）：hero 補上白銀與公斤條；服務卡
  「倫敦金銀 (XAU/USD、XAG/USD)」「人民幣公斤條 (RKG/CNH)」（移除未確認的實物結算／提存／「保證」純度）；
  FAQ q2 改成三個 CFD 產品、q6 不再把「近 24 小時」寫成 HATC 的交易時段（改「將另行公佈」）；
  信任卡「實物黃金託管與存付」→ **客戶資金隔離存放**（＝FACTS「Client fund custody」核可句）。

### ⚠ DB

drop `sample_trading_conditions`／`_pricing_rows`／`_account_rows`／`_account_rows_locales` 四張表
＋`roles.can_sample_trading_conditions_update`。本機已手動 `ALTER TABLE` / `DROP TABLE`（繞開
drizzle push 對 roles 刪欄的互動確認）；**正式站須寫 migration**。

### 驗證

`lint` 0 error（唯 `seed-academy.ts` 1 個既有 warning）／`i18n:check` 三語 **680 鍵**齊／`build` 綠
（`/trading` 三語 ● SSG、`/api/market/quotes` ƒ）。三語 `/trading` 200；退役值掃描（1:500／1:1000／
RAW ECN／TradingView／MT4／27 點／示意數據／待確認／2,342／公斤條港幣）在可見 markup 全無
（僅剩 footer 風險聲明中解釋「示意數據」標籤的那句）。即時欄位用 **production server ＋ headless CDP**
實測：金 4,194.49／銀 60.800／公斤條 902.14 ＋ 漲跌幅，點差仍顯示 20／30／35 點起；首頁 ticker
搬檔後照常顯示「即時報價」。桌機 1440／平板 834／手機 390 截圖通過（表格橫向捲動＋提示）。
> ⚠ 驗證陷阱：**`next dev` ＋ 無頭瀏覽器**會有 client chunk `ERR_ABORTED`，client effect 不執行 →
> 即時欄位永遠不出現（首頁亦然，與本輪改動無關）。要驗即時行為請用 `npm run build && npm start`。

### 待業主

(a) 最低手數／手續費／執行方式／交易時段／公斤條合約規模（頁面顯示「將另行公佈」）；
(b) `/products/all` 的合約規模與交易時段仍為示意；(c) `/trading` 的合作夥伴標誌區仍是佔位框；
(d) `--trd-gold #c9a84c` 與深色系 `#d4af37` 是否統一。

## 🟢 第四十四輪（實作，2026-10-11）：真實交易條件 ＋ MT4 下架 ＋ `/accounts` 轉為事實

**起點**：業主「下一輪我想處理內容：① 目前公司不會提供 MT4；② 點差等內容」，並提供一張
**MT5 交易組設定表**截圖（真實/模擬/遊客交易組 × DEFAULT/CN 區，含槓桿、入金門檻、三品種點差）。

### 業主拍板（AskQuestion）

| 問題 | 決定 |
|---|---|
| FACTS 舊的「金 27／銀 30 點」與新表不符 | **以新表為準，取代 27/30**（舊值全站停用） |
| 點差單位 | **用「點」**（非價格單位） |
| `/accounts` 四帳戶 | **換成真實分級，並當已核可事實呈現（移除「示意數據」）** |
| 人民幣公斤條 | **加為第三個可交易產品** |
| 不分帳戶頁面的單一點差欄 | **顯示最低值並標「起」**（＝VIP 條件） |
| 模擬帳戶按鈕 | **CMS 可設定連結，未填則隱藏** |

### 換算（寫入 FACTS 前已實測確認）

閘道回報 digits：`XAUUSD` 2、`XAGUSD` 3、`RKGCNH` 2 → 1 點 ＝ 0.01／0.001／0.01。
業主表以**價格單位**記錄（金 0.3 等），換算成「點」後：

| 帳戶 | 最低入金 | 槓桿 | 金 | 銀 | 公斤條 |
|---|---|---|---|---|---|
| Mini | 100 USD | 1:100 | 33 | 44 | 42 |
| Standard | 300 USD | 1:100 | 30 | 40 | 40 |
| Pro | 1,000 USD | 1:100 | 28 | 38 | 40 |
| VIP | 5,000 USD | 1:100 | 20 | 30 | 35 |

> 已提醒業主：**對外數字會比原本「看起來差」**（金 27→Standard 30／VIP 20；銀 30→Standard 40），
> 業主確認要公布真實值。CN 區交易組條件與預設組相同 → 屬地區路由，前台不區分。

### 落地

- **FACTS**（`docs/HATC_FACTS.md`）：`CFD business` 節改寫——標的＝金/銀/**公斤條**三項、平台＝MT5
  且**不提供 MT4**、新增 **`### Account types & trading conditions`** 事實表（含「點」定義、
  「最低值＋起」呈現規則、**無佣金欄位**、CN 組說明、模擬組說明）＋新增 **`### Trading platforms`**
  （MT5／HATC App／網頁交易端；MT4 不提供）。
- **程式端唯一事實來源**＝`src/components/products/tradingConditions.ts`：`CFD_PRODUCTS`
  （key/symbol/gatewaySymbol/digits/`spreadFrom`/leverage）＋`ACCOUNT_TIERS`
  （code/minDepositUsd/leverage/`spreads{gold,silver,kilobar}`/badge）＋`MAX_LEVERAGE`。
  註解明列**退役值**（27/30、1:500、1:1000、每手佣金）不得復活。
- **退役 3 個 CMS 集合**（事實不該能被後台改到）：`account-tiers`／`account-spreads`／
  `account-platforms` ＋ `lib/account{Tiers,Spreads,Platforms}.ts`，並同步清
  `payload.config`／`permissions/registry`／`cacheTags`／`revalidateContent`／`api/dev-revalidate`。
  **保留** `account-benefits`（行銷文案）與 `faqs(accounts)`＝業主仍可編輯。
- **`/accounts` 元件**：`AccountTiers` 改讀 code（四卡＋卡內「點差（點）」三品種小表；badge 只有
  **事實衍生**的 `lowestDeposit`／`lowestSpread`，刻意不做「最受歡迎」這類捏造宣稱）；
  **`AccountSpreads` 由假 bid/ask 報價表改為「產品 × 帳戶分級」點差對照表**（視覺改動已向業主說明：
  Figma 62:200 的 bid/ask 在靜態頁只能是假數字，真 bid/ask 屬首頁即時報價元件）；
  `AccountPlatforms` 改讀**共用 `trading-platforms`**（與 `/platforms` 同源，MT4 不會再從 DB 冒出來）。
- **`/products`**：加入**人民幣公斤條**（卡片 3 欄）；點差改「X 點起」並新增連結
  `/accounts#spreads`（`products.conditions.tiersLink`）；`/products/all` 種子列改真實點差/槓桿
  ＋新增公斤條列，note 改寫為「點差與槓桿＝已確認條件；合約規模與交易時段＝示意」。
- **模擬帳戶**：`SiteSettings.demoAccountUrl`（＋`NEXT_PUBLIC_DEMO_ACCOUNT_URL` fallback）
  ＋`demoAccountHref()`；`/accounts`、`/platforms`、`/funding` 的 demo CTA **未設定即不渲染**
  （原本指向 `/register`／`/accounts` ＝死連結體驗）。
- **i18n**：`accounts.*` 全面重寫、刪 `accounts.{tiersSample,spreadsSample,platforms.items}`；
  新增 `products.items.kilobar`／`products.conditions.{spreadFrom,tiersLink}`；三語 **704 鍵**齊
  （原 743，淨減因刪除示意陣列）。`metadata.{products,productsAll,accounts}.description` 一併更新。
- **種子腳本** `scripts/seed-accounts.ts` 改為 **replace（非 seed-once）**，只灌 benefits＋faqs(accounts)，
  以清掉 DB 內退役的 MT4／佣金文案；本機已跑（benefits 4→4、faqs 5→5）。

### ⚠ DB 遷移（本機已做，正式站須寫 migration）

```
DROP TABLE account_tiers(_locales), account_spreads(_locales), account_platforms(_locales) CASCADE;
ALTER TABLE payload_locked_documents_rels DROP COLUMN account_{tiers,spreads,platforms}_id;
ALTER TABLE roles DROP COLUMN can_account_{tiers,spreads,platforms}_{create,update,delete},
                  DROP COLUMN fld_account_{tiers,spreads,platforms}_enabled_update;  -- 12 欄
-- 新增：site_settings.demo_account_url（dev push 自動加）
```

**雷**：drizzle push 對 `roles` 的欄位刪除會停在 **互動式 DATA LOSS 確認**（`y/N`），CLI 腳本因此卡住
且 `| tail` 會把提示吞掉看不到 → 先手動 `ALTER TABLE roles DROP COLUMN ...` 再跑腳本。
刪除 collection 檔案後 **dev 需清 `.next` 重啟**，否則 payload.config 仍解析舊 import 而整頁 500。

### 驗證

`tsc --noEmit` 無錯／`lint` 0 error（僅 `seed-academy.ts` 1 個既有 warning；`seed-accounts.ts` 原本那個
unused `LOCALES` warning 隨改寫消失）／`i18n:check` 三語 704 鍵齊／三語 `/accounts`、`/products`、
`/products/all`、`/platforms`、`/funding` 皆 **200**；全站 HTML 掃描確認 **`1:500`／`1:1000`／`RAW ECN`／
`TradingView` 已完全消失**，`MetaTrader 4` 只剩「不提供」的說明文案（next-intl 會把整包 messages 送到
client，故字串會出現在每頁 payload，屬預期）。桌機 1440／手機 390 截圖檢視 `/accounts`、`/products` 通過。

### 待業主

- (a) **最低手數／手續費／執行方式／交易時段／公斤條合約規模**（前台顯示「將另行公佈」，不得虛構）。
- (b) **模擬帳戶申請連結**（填入 `/admin` → 網站營運設定 → 帳戶入口即生效，三處按鈕自動出現）。
- (c) `/trading` 的示意兩檔帳戶表與假 bid/ask 報價表**尚未對齊**（下一輪首要；其「標準/專業」與真實
  Standard/Pro 同名但數值不同，最容易誤導）。
- (d) `/products/all` 的合約規模與交易時段仍為示意。

## 🟢 第四十三輪（實作，2026-10-11）：首頁行情接上 MT5 真實報價（BFF 代理＋示意降級）

**任務**：業主指「首頁的行情需要接上」，來源＝同機 `~/Desktop/mt5-web`（自家 MT5 後端全家桶）的
**Node 行情閘道** `mt5-tcp-quote-gateway-node`。業主拍板：① **現在就把接線做完，拿不到真資料時自動
退回示意數據**（業主自行去推後端配遊客組）；② 首頁品種收斂為 **金／銀／人民幣公斤條**（`XAUUSD`／
`XAGUSD`／`RKGCNH`），**不把外匯/指數列為 HATC 產品**。

### 鏈路事實（實測，非推測）

| 項目 | 值 |
|---|---|
| 生產閘道 | `https://node.hatcmarket.com`（`/health` 200，appEnv=prd，接 `mt5.hatcmarket.com`） |
| UAT 閘道 | `https://node.666678910.com` |
| 遊客通道 | `POST /v1/context/resolve {"scene":"guest"}` → `contextToken`（閘道自己去業務後端 `/api/customer/guest/login` 換交易組） |
| 報價讀取 | `GET /v1/market/symbol-detail?symbol=&contextToken=` → `latestTick{bid,ask,digits}` ＋ `tickStat{BidHigh,BidLow,PriceClose}` |
| 漲跌算法 | `change = bid − tickStat.PriceClose`；高低 = `BidHigh`／`BidLow`（與 h5 `normalizeSnapshotPriceClose` 一致） |
| 回應加密 | **AES-256-GCM 信封**（`{codec,iv,tag,data}`），key = `SHA-256(secret)`。**prd secret ≠ uat secret** |
| CORS | 閘道只放行 `h5.hatcmarket.com`／`admin.hatcmarket.com` |

> ⚠️ h5 的 `services/config/env.prd.uts` 裡 `QUOTE_HTTP_CRYPT_SECRET` 仍寫著 **UAT 的值**，與閘道
> `deploy/env/prd.env` 不一致（那是 mt5-web 側的既有 bug，本倉不受影響，但對接時別拿錯密鑰）。

### 🚩 阻塞點（**業主待推後端**，不是本倉的 bug）

**生產遊客交易組 `demo\DirectCustomer\GUEST\DEFAULT\Standard` 在業務後台沒有配任何產品** →
`allowedSymbols: []` → 取 `XAUUSD` 回 **403 `SYMBOL_NOT_ALLOWED`**。對照 UAT 遊客組
`demo\HATC\HK\Guest\Standard` 有 29 個白名單（含金/銀/`RKGCNH`）＝**設計上通，只是生產沒配**。
→ 請後端在管理後台給**遊客交易組**加上黃金/白銀（＋公斤條）產品，官網無須改碼即自動變真實行情。

### 架構決策（為何做 server 端 BFF，而非瀏覽器直連）

1. 閘道 CORS 不含官網域名 → 瀏覽器直連必被擋。
2. 回應加密密鑰是**靜態共享密鑰** → 放進前端 bundle 等於公開（閘道 README 自己也說這只是混淆層）。
3. WS 握手需要 server-only 的 `contextToken`，且每訪客一條常駐 socket 不適合 serverless。
→ 結論：**輪詢 + server 代理 + server 端快取**。

### 落地

- **`src/lib/marketQuotes.ts`（server-only）**：`getLiveQuotes()`＝遊客 context 快取（提前 60s 續期、
  併發合流）＋ `symbol-detail` 併發讀 ＋ AES-GCM 解封 ＋ **2 秒 server 快取**（訪客再多，上游負載不變）。
  白名單為空時**直接不發請求**（省掉必然 403）。任何失敗 → `console.warn` 一行 ＋ 回 `null`。
- **`src/lib/marketQuoteTypes.ts`**：`LiveQuote` 型別、`MARKET_SYMBOLS`、`formatPrice/formatChange/
  formatChangePercent`。**獨立於 server-only 模組**，故 client 元件可共用而不會把憑證/crypto 拉進 bundle。
- **`src/app/api/market/quotes/route.ts`**：`force-dynamic`、`no-store`。`{ok:false}` 是**正常答案**
  （＝前端維持示意），不是錯誤。
- **`src/components/home/LiveQuotes/LiveQuotesProvider.tsx`（client）**：單一輪詢（5s）供三個元件共用；
  `document.hidden` 時跳過、切回可見立即刷新；per-symbol 累積最多 48 點價格序列供 sparkline。
  feed 消失時**清回 null**（不凍結最後價格，避免悄悄變成陳舊報價）。
- **改接的元件**：`Hero/MarketTicker.tsx`（改 client）、新 `Hero/HeroPriceCard.tsx`、新
  `Services/ServicePriceCards.tsx`；`Hero.tsx`／`Services.tsx` 改傳翻譯字串進 client 元件。
  `page.tsx` 用 `LiveQuotesProvider` 包住 `Hero`＋`TrustStrip`＋`Services`。
- **SSG 不變**：server 永遠輸出**示意數據**，client 拿到真資料才替換 → 無 hydration mismatch、
  無 gateway 也能 build（已用空 `DATABASE_URI`＋空 `QUOTE_GATEWAY_URL` 實測 build 綠、首頁三語仍 `●` SSG）。
- **i18n**：新增 `home.market.{liveLabel,sourceNote}`（3 語）。**`home.footerV2.risk` 三語改寫**——
  原文寫「本網站所示行情、圖表與數字均為示意數據」，行情轉真後該句即不實；改為「即時報價僅供參考、
  可能與實際成交價有差異；標示『示意數據』的圖表與數字僅供設計展示」。
- **env**（`.env.example` 已補）：`QUOTE_GATEWAY_URL`／`QUOTE_HTTP_CRYPT_SECRET`（**SERVER-ONLY，
  不得 `NEXT_PUBLIC_`**）。留空＝停用，首頁照常顯示示意數據。
  **本機 `.env` 目前指 UAT**（因生產白名單空，指 UAT 才驗得到真實路徑）；**正式站須改 prd URL ＋ prd 密鑰**。

### 治理紅線（本輪確立）

- **真實報價 ≠ 事實**：不入 `HATC_FACTS.md`、不是交易條件。核可的金 27／銀 30／1:100 仍只在
  `products/tradingConditions.ts`。
- **標籤隨資料來源切換**：真資料 → 「即時報價」＋ 來源/免責說明；拿不到 → 「示意數據」（原標籤）。
  **不得**真價格配示意標籤，也不得示意數字掛「即時報價」。
- **真價格旁不放假走勢**：hero sparkline 改畫**本次工作階段實際觀測到的價格點**，不足 3 點就不畫線；
  降級時才用示意曲線。（`Services` 的 K 線仍是示意並保留標籤，見下。）

### 驗證

`lint` 0 error（唯 2 個既有 warning）／`i18n:check` **743 鍵三語齊**／`tsc` 無新錯／build 綠（首頁三語 SSG、
`/api/market/quotes` 為 ƒ）。實測 API 三品種真實值（金 4,194.49／銀 60.800／公斤條 902.14、含高低與漲跌）；
瀏覽器 DOM 確認 ticker／hero 卡／服務卡三處都換成真實數字且標籤為「即時報價」；**降級路徑亦實測**
（切到生產閘道 → `{ok:false}` → 頁面完整回到示意數據與「示意數據」標籤）。

### 順修

`src/app/api/dev-revalidate/route.ts` 的 `revalidateTag(t)` 缺第二參數（Next 16 需要），**既有已提交
的型別錯誤會讓 `npm run build`／CI 直接失敗**；依專案慣例補為 `revalidateTag(t, 'max')`。

### 待業主 / follow-ups

- (a) **推後端給生產遊客交易組配金銀產品**（唯一阻塞；配好官網不用改碼）。
- (b) 正式部署時把 `QUOTE_GATEWAY_URL` 換成 `https://node.hatcmarket.com` ＋ **prd** 密鑰。
  密鑰值**不寫進本倉**（含文件）：到閘道專案 `mt5-tcp-quote-gateway-node/deploy/env/prd.env`
  的 `QUOTE_HTTP_CRYPT_SECRET` 取，直接填進主機環境變數；若後端輪替密鑰需同步更新。
  ⚠ **prd 與 uat 密鑰不同**，且 h5 的 `services/config/env.prd.uts` 誤填 uat 值，別從那裡取。
- (c) **`/v1/market/bars` 目前回空陣列**（UAT 實測 `bars: []`）→ 故 `Services` 的 K 線圖**仍是示意**
  並保留「示意數據 (設計佔位)」標籤。待後端確認 bars 可用後可接真 K 線。
- (d) 其他頁面（`/products`、`/accounts`、`/trading`、`/products/all`）的示意點差/報價表**本輪未動**，
  仍是示意；是否改接真實行情由業主決定（注意這些是「交易條件」，與即時報價的治理層級不同）。
- (e) 若未來要秒級更新，可評估在官網 server 端開一條常駐 WS（需非 serverless 主機）。

## 🟢 第四十二輪（實作，2026-09-01）：GitBook 知識庫 → 黃金學院 `/academy`（22 篇、三語）

**任務**：業主在 GitBook 上有自有知識庫，遷入官網**黃金學院**（沿用既有 `academy-articles` CMS，
**未新建頁面/集合**）。前台 `/academy` 列表（分類篩選/排序/分頁）與 `/academy/[slug]` 詳情已就緒，
匯入後自動出卡。學院現共 **49 篇**（既有 27＋GitBook 22）。

### 實作結果（業主已定案）

**業主定案（AskQuestion）**：來源＝**GitBook API**；對應＝**1 頁＝1 篇**；分類＝**agent 依主題判定**；
封面＝**agent 依主題挑既有 `raw_*` 佔位**；「關於 HATC」6 頁＝**全部匯入**；聯絡資訊＝**逐字保留**於內文
（反詐/查證需要，且 space 本就公開）；新公司事實＝**同步登錄 `HATC_FACTS.md`**。

**來源與腳本**
- 來源＝**GitBook Content API**：`GET /v1/spaces/{id}/content`（目錄樹）＋
  `GET /v1/spaces/{id}/content/page/{id}?format=markdown`（單頁 Markdown）。
- token/space 存 **`.env`**：`GITBOOK_API_TOKEN` / `GITBOOK_SPACE_ID`（**server-only、不進 git**）。
- 腳本 **`scripts/seed-academy-from-gitbook.ts`**：抓樹→flatten（**跳過純目錄 root index**）→每頁 Markdown
  →**Payload 內建 `convertMarkdownToLexical`＋`editorConfigFactory`**（節點與編輯器一致，非自寫 builder）
  →**upsert by slug**（保留既有封面）。冪等可重跑。
  - 執行：`npm run payload -- run scripts/seed-academy-from-gitbook.ts`（`-- --dry` 乾跑）。

**匯入 22 篇分佈**：MT5 操作中心 10＋認識黃金市場 6＋關於 HATC 6。`order` 27–48、`publishedAt=2026-09-01`、
`enabled=true`。分類已 map 到固定 6 類（見腳本 `PAGE_MAP`）；封面沿用 `public/figma/raw/raw_*.png` 佔位。

**Markdown 前處理（進 Lexical 前）**
- **剝 frontmatter＋首個 H1**（標題另存欄位、詳情頁自帶 H1）。
- **表格→項目清單**：學院 Lexical 編輯器/渲染器**無表格**功能（詳情頁只 style h2/h3/p/ul/ol/li/a/blockquote），
  故 2 欄 key/value→`**key**：value`、多欄比較表→`**列**｜表頭＝值；…`（不失資訊）。
- **內部相對連結攤平為純文字**：`localePrefix:'always'` 下單一硬編 `/academy/x` 無法三語通用；
  保留 `http/https/mailto/tel/#` 外部與錨點連結。**follow-up**：locale-aware 自訂 RichText link converter。

**三語（既有 Gemini 管線；本輪修復其穩定性）**
- 標題/摘要/內文＝繁中來源；簡中/英文用 `scripts/translate-content.ts --only academy-articles` **只填空**補譯，
  業主於 `/admin` 校對。診斷 `scripts/check-academy-i18n.ts`。
- **分類三語鎖定＝三步流程**（避開 Payload「localized 欄位寫入需該語系已有 title」驗證）：
  ① 跑 seed（灌繁中＋封面）→② 跑 translate-content 補齊簡中/英文 title→③ **再跑一次 seed** 把 `category`
  鎖成各語系 canonical 值（篩選才對得上；seed 內對簡中/英文以 `fallbackLocale:false` 判斷有 title 才寫 category）。
- **MT 穩定性修復（`src/lib/mt/provider.ts`）**：長文一次送數百字串會被上游（Gemini）斷 socket／回非 JSON／
  陣列長度不符 → 加 **`MAX_BATCH=10` 分塊**（`translateChunk`）＋`stripJsonFences`（剝 ```json fence）＋
  非 JSON/長度不符改丟 `RetryableHttpError` 走 `withRetry` 退避。`scripts/translate-content.ts` 加
  **per-doc try/catch**（單篇失敗不中止整批、可重跑補完）。

**紅線落地**：GitBook 內容經審查**全屬黃金/白銀**（無外匯/原油/指數/加密/股票需剔除）；聯絡資訊逐字保留
（業主決定）；新公司事實（公司編號 2608603／BR 68493300-000／官網 hatchk.com／客服電話／地址／008 沿革）
**已登錄 `HATC_FACTS.md`**（見該檔「Official company identity／Official contact & website／Exchange membership」）；
學院＝中性教育；示意數字為假設性範例；**內容未入 FACTS 冒充事實**（事實只登在 FACTS.md）。

**驗證（全綠）**：`lint` 0 error（改動檔 provider.ts／translate-content.ts／seed 腳本皆過）；`i18n:check` 三語齊；
三語 `/academy` 列表＋多篇詳情 **200**；抽查 en `what-is-hatc`（H1/分類 chip/內文 H2 全英譯）、
簡中 margin 篇（H1 簡體、chip「风险管理」）、最頑固的 margin en（H1 英譯、320 li）皆正確。清單頁 GitBook 文章領先。
**未動 collection schema 欄位＝免 `generate:types`／`generate:importmap`。**

**⚠ 未 commit 清單（本輪尚未 git commit）**：`scripts/seed-academy-from-gitbook.ts`（新）、
`src/lib/mt/provider.ts`（MT 分塊/容錯）、`scripts/translate-content.ts`（per-doc 容錯）、
`docs/HATC_FACTS.md`（新事實）、`docs/HANDOFF.md`（本段）、`.env.example`（GitBook 變數說明）。
`.env`（真實 token）**勿 commit**。

**待業主 follow-up**：(a) `/admin` 校對 22 篇機翻草稿；(b) 真實封面替換 `raw_*` 佔位；
(c) 內部交叉連結改 locale-aware（現攤平為純文字）；(d) `category` 是否改受控 `select`（需 migration）。

---

### 原規劃（第四十一輪末，保留參考）

**業主已定（第四十一輪末 AskQuestion）**
- 目的地＝**`/academy`**（學院教育文章）。
- 內容性質＝**教育＋操作教學混合**（gold/silver 教育、how-to 都可能有）。
- 執行者＝**下一個 agent**（本輪只規劃＋寫 kickoff，未動內容）。
- 取得來源＝**業主待定**，需 agent 教學後選擇（見下「來源方式」）。

**來源方式（業主擇一；kickoff 對三種都適用）**
1. **貼上**：業主把文章文字貼給 agent（適合少量；圖片/連結需人工補）。
2. **Git Sync 匯出 Markdown（建議）**：GitBook Space → Settings → Integrations → **Git Sync** 同步成
   GitHub repo 的 `.md`（含 `SUMMARY.md` 目錄、圖片相對路徑）。業主把 `.md` 放進 **`content/gitbook/`**
   或給匯出 repo，agent 寫 Markdown→Lexical seed 批次轉入。
3. **GitBook API**：`developer.gitbook.com` token → `GET /v1/spaces/{id}/content`（回自有 block JSON，
   需轉換器；token server-only、不進 git）。

**技術做法（沿用既有學院管線，勿另造）**
- 新 seed 腳本（建議 `scripts/seed-academy-from-gitbook.ts`）：讀來源 → 轉 **Lexical**（沿用
  `seed-academy-batch*.ts` 的 `heading/paragraph/listNode/richtext` builder；Markdown 來源需再支援
  **粗體/連結/圖片**節點）→ **upsert by slug**（保留既有封面）。每篇需：`slug`(ASCII)／`title`／
  `excerpt`／`category`(固定 6 類之一：黃金基礎/交易策略/技術分析/市場動態/風險管理/投資組合)／
  `publishedAt`／`order`（接在 27 之後，或依 GitBook 目錄排序）／封面（有圖用之，無則沿用 `raw_*` 佔位）。
- **標題/摘要**：來源多為繁中 → 其餘語系用既有 Gemini 管線只填空：
  `npm run payload -- run scripts/translate-content.ts -- --only academy-articles`；診斷
  `scripts/check-academy-i18n.ts`。dev 看結果 `curl http://127.0.0.1:3000/api/dev-revalidate`。
- **圖片**：Markdown 圖片可匯入 `media`（比照 batch 腳本 `importCover`），或先放 `public/` 引用。

**治理紅線（業主自有內容也要守）**
- **只做黃金/白銀**：GitBook 若含外匯/原油/指數/加密/股票，**不得**列為 HATC 產品，遷入時剔除或改寫為中性說明。
- **操作教學（how-to：開戶/入金/出金/平台登入）**：可作教育說明，但**具體 operational 連結（客服/開戶/入金
  入口）一律走 CMS `siteSettings`（`primaryContactHref` 等），不得硬編**；不得寫死未確認的到賬時限/渠道/手續費。
- **交易條件/公司事實**：GitBook 若含點差/槓桿/手數/牌照/會員等，**屬事實層** → 只有 `HATC_FACTS.md`
  已核可者可當事實呈現（金27/銀30/1:100 仍只在 `products/tradingConditions.ts`）；未核可者**先問業主、不自動登**。
- 學院定位＝中性教育，保留/附「不構成投資建議」；示意值標清楚；**內容不入 FACTS**。
- CMS reader 一律 DB→i18n fallback；SSG＋afterChange revalidateTag（勿改此架構）。

**驗證**：`npm run lint`／`npm run i18n:check`（741 鍵基準，若新增 UI 字串要三語齊）；三語 `/academy` 與
新詳情頁 200。**未動 collection 欄位＝免 `generate:types`**；若因圖片/欄位需求動 schema 才 `generate:types`
（＋動 admin 元件才 `generate:importmap`）。

**開放問題（下一棒開工前向業主確認）**
- (a) 最終用哪種來源方式（貼上／Git Sync／API）；(b) GitBook 目錄結構是否 1 頁＝1 篇，或需合併/拆分；
- (c) 每篇歸到哪個固定分類；(d) 封面策略（沿用佔位 or 業主提供）；(e) 內含 how-to/事實段落如何處理（依上紅線）。

## 🟢 第四十一輪（2026-09-01）：學院第三批 4 篇原創長文＋切語系 `router.refresh()`

**背景**：第四十輪 kickoff 待業主項多為校對／素材／電子報／category select；可獨立推進的是可選
「第三批文章」＋ follow-up (e) 切語系硬刷新。

**文章（`scripts/seed-academy-batch3.ts`，upsert 可重跑）**
- `gold-market-psychology`（交易策略）：恐懼／貪婪、FOMO、損失厭惡、確認／近因／錨定偏誤、連贏加碼與報復交易、計畫與日誌。
- `physical-gold-custody-and-authentication`（黃金基礎）：自行保管 vs 金庫、已分配／未分配、序號與成色、查驗步驟、紅旗；**與 FACTS「客戶資金託管」分開說明**（現金隔離 ≠ 家裡有金條）。
- `gold-etf-vs-cfd`（投資組合）：結構／成本／槓桿／最壞情況比較；**不列外匯／原油／指數／股票為 HATC 產品**、不寫核可點差槓桿數字（條件仍只在 `tradingConditions.ts`）、不暗示 HATC 提供 ETF。
- `spotting-gold-investment-scams`（風險管理）：保證收益／假平台／假客服／實金調包紅旗與查核步驟；不虛構受害人。
- 封面重用 `public/figma/raw/raw_{12,13,16,1}.png`（佔位，業主後台替換）。CMS 現共 **27 篇**。
- 執行：`npm run payload -- run scripts/seed-academy-batch3.ts`；機翻：
  `npm run payload -- run scripts/translate-content.ts -- --only academy-articles`（只填空）。
  本輪 `Created 4`、`Filled 314`；`check-academy-i18n.ts` → **27/27** zh-Hans + en body。

**LocaleSwitcher**：`router.replace(..., {locale})` 之後呼叫 `router.refresh()`，讓 Client Router Cache
  跟著語系換新 RSC payload（動態 `[slug]` 仍傳 `params`）。無法用 curl 模擬 client 導航；server 端三語
  詳情已確認各語內文到位（簡體用詞、英文 disclaimer）。

**驗證**：`lint` 0 error（既有 seed-* 2 warning）／`i18n:check` 741 鍵；三語 `/academy` 與四篇詳情 200。
  種子後已 `curl http://127.0.0.1:3000/api/dev-revalidate`。**未動 CMS schema**，免 `generate:types`。

**待業主**：(a) `/admin` 校對機翻草稿（含本批 4 篇）；(b) 正式文章／真實封面替換 `raw_*.png`；
  (c) 電子報 email 服務；(d) `category` 是否改受控 `select`（需 migration）。

## 📋 kickoff（下一棒，可直接複製貼給下一個 agent）

```
任務：把業主 GitBook 上的自有知識搬進 HATC 官網「黃金學院」/academy（沿用既有 academy-articles CMS，
不新建頁面/集合）。Next.js 16 + Payload CMS + next-intl；繁中為主、簡中/英文並存。

必讀（動工前）：AGENTS.md、docs/HATC_PROJECT_BRIEF.md、docs/HATC_FACTS.md、docs/WEBSITE_STRUCTURE.md、
docs/DESIGN_DIRECTION.md、docs/HANDOFF.md（尤其「🟢 第四十二輪（規劃）」＋「🟢 第四十一輪」＋頂部
「▶ 下一步」）、.cursor/rules/hatc-website.mdc（自動載入）。

開工前先向業主確認（開放問題）：
- 來源方式：貼上／Git Sync 匯出 Markdown（建議，放 content/gitbook/）／GitBook API token；
- 目錄如何對應文章（1 頁=1 篇 or 合併拆分）；每篇歸哪個固定分類；封面策略；how-to/事實段落如何處理。

現況（第四十一輪）：
- 學院 CMS 已有 27 篇長文（seed-academy.ts a1–a3 + seed-academy-batch{,2,3}.ts）。前台 /academy 列表
  （分類篩選/排序/分頁，client 端做維持 SSG）＋ /academy/[slug] 詳情（Lexical body）皆就緒；新資料自動出卡。
- 學院欄位：slug/title/excerpt/category/publishedAt/order/cover/enabled/body(Lexical)。分類＝固定 6 類
  academy.categories（黃金基礎/交易策略/技術分析/市場動態/風險管理/投資組合），篩選才對得上。
- 翻譯：Google Gemini（OpenAI 相容端點）。env MT_PROVIDER=llm、
  MT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai、MT_MODEL=gemini-3.6-flash、
  MT_API_KEY=<server-only，勿 commit>。批次補譯：
  npm run payload -- run scripts/translate-content.ts -- --only academy-articles（只填空、可重跑）；
  診斷 scripts/check-academy-i18n.ts。dev 看結果：curl http://127.0.0.1:3000/api/dev-revalidate。

做法（沿用既有管線，勿另造架構）：
- 寫 seed（建議 scripts/seed-academy-from-gitbook.ts）：來源 → Lexical（沿用 batch 腳本的
  heading/paragraph/listNode/richtext builder；Markdown 來源要再支援粗體/連結/圖片節點）→ upsert by slug
  （保留既有封面）。圖片可比照 batch importCover 匯入 media。order 接在 27 之後或依 GitBook 目錄。
- 標題/摘要通常繁中 → 其餘語系用上面 translate-content 只填空補齊，業主再於 /admin 校對。

紅線（業主自有內容也要守）：
- 只做黃金/白銀：GitBook 若含外匯/原油/指數/加密/股票，不得列為 HATC 產品，剔除或改中性說明。
- how-to（開戶/入金/出金/平台）：operational 連結一律走 CMS siteSettings（primaryContactHref 等），
  不硬編；不得寫死未確認的到賬時限/渠道/手續費。
- 交易條件/公司事實：只有 HATC_FACTS.md 已核可者可當事實（金27/銀30/1:100 只在 products/tradingConditions.ts）；
  未核可先問業主、不自動登。學院＝中性教育＋「不構成投資建議」；示意值標清楚；內容不入 FACTS。
- CMS reader 一律 DB→i18n fallback；SSG＋afterChange revalidateTag。金鑰 server-only。

驗證：npm run lint、npm run i18n:check（新增 UI 字串要三語齊）；三語 /academy 與新詳情 200。
未動欄位＝免 generate:types；動 schema 才 generate:types（動 admin 元件才 generate:importmap）。

仍待業主（非本任務主線，記錄）：/admin 校對機翻草稿；正式封面替換 raw_*.png；電子報接 email 服務；
category 是否改受控 select（需 migration）。

每次交棒：更新 docs/HANDOFF.md 並在對話輸出可貼 kickoff。
```

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
4. 本機 Postgres＝Docker 容器 `hatc-postgres`（對外 **5433**）。重開機後需
   `open -a Docker` → `docker start hatc-postgres` → `npm run dev`；略過則前台走 i18n fallback、`/admin` 不可用
5. 首頁即時行情：設 `QUOTE_GATEWAY_URL` ＋ `QUOTE_HTTP_CRYPT_SECRET`（見 `.env.example`）。
   留空＝停用並顯示示意數據。本機建議指 UAT（生產遊客組尚未配產品，見「🟢 第四十三輪」）

## 過程中已解決的坑（避免重踩）

- 專案資料夾含大寫 → 以暫存夾建立再合併至根目錄
- Next 16 `middleware` 已棄用 → 改用 `src/proxy.ts`
- Node 22 + Payload lexical top-level await 錯誤 → 設 `"type": "module"`
- `@payloadcms/next/routes` 無 `GRAPHQL_OPTIONS` → graphql route 的 OPTIONS 用 `REST_OPTIONS`
