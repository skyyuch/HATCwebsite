# HATC 官網 — 部署交接文件（給開發／維運團隊）

> 本檔是**交給開發團隊部署到伺服器**的操作說明。
> 想了解網站內容決策與設計史，請看 `docs/HANDOFF.md`；公司事實一律以
> `docs/HATC_FACTS.md` 為準。
> 最後更新：2026-10-12（第六十二輪：新增 **local / uat / prd 分環境配置檔**
> `config/env/*.env` 與 `build:*`／`start:*` 指令，見 §2.0；**7 個營運連結環境變數已改名**，
> 去掉了 `NEXT_PUBLIC_` 前綴，見 §2.2。第五十九輪：資料庫由 PostgreSQL 改為 **MongoDB**，
> 庫名 `hatc-cms`；migration 機制隨之退役）

---

## 0. 一句話摘要

Next.js 16（App Router）＋ Payload CMS 同倉的三語網站，頁面全部 **SSG ＋ 按需
revalidate**。部署兩步：**備好 MongoDB → `build` → `start`**（Mongo 是 schemaless 的，
**不需要建表、不需要跑 migration**）。**本專案從未部署過，這是第一次上線。**

> ⚠ 如果你拿到的是 2026-10-12 之前的舊快照或舊說明：那版用 PostgreSQL 並要求執行
> `npm run migrate`。**現在不需要，也沒有這個指令了。**

---

## 1. 環境需求

| 項目 | 版本／說明 |
| --- | --- |
| Node.js | **22.x LTS**（開發用 22.22.3 驗證；Next 16 最低 20.9） |
| npm | 10.x（倉內有 `package-lock.json`，請用 `npm ci`） |
| MongoDB | 6 以上（開發用 7）。單機 standalone 即可；若是 replica set，Payload 會自動啟用交易 |
| 記憶體 | build 階段建議 ≥ 2 GB |

本專案**不是** serverless-only 設計，預期跑在一般 Node 伺服器（PM2／systemd／Docker 皆可）。
`/api/market/*` 兩支路由是 `force-dynamic`，其餘頁面為靜態產物。

---

## 2. 環境變數與分環境配置

### 2.0 三個環境各一份配置檔（第六十二輪新增）

公開的分環境值（站台網域、開戶等營運連結的後備、行情閘道位址）放在**已 commit** 的
配置檔，切換環境**不需要改任何程式碼**：

```
config/env/local.env     # 本機開發
config/env/uat.env       # UAT / 驗收
config/env/prd.env       # 生產（www.hatcmarket.com）
```

用對應的 npm script 套用：

```bash
npm run build:prd && npm run start:prd     # 生產
npm run build:uat && npm run start:uat     # UAT
npm run dev                                # 本機（自動套 local）
```

也可以**完全不用這些 script**：直接在主機／CI 設環境變數再跑 `npm run build`、
`npm run start` —— 原本的指令行為完全沒變。

> ⚠ **`build:*` 與 `start:*` 要用同一個環境名。** 大部分變數在 build 時就被寫進靜態
> HTML（§2.1a），`start` 階段才注入是來不及的。

兩種方式可以混用，優先序如下（高→低）：

1. 主機／CI 上真的設定的環境變數
2. 倉內的 `.env.local` / `.env`（git-ignored，開發者自己的機器）
3. `config/env/<環境>.env`（已 commit 的公開預設值）

> 載入器＝`scripts/with-env.mjs`。它**只補上尚未設定的鍵**：某個鍵只要出現在主機環境變數
> 或你的 `.env`，它就不碰（執行時會印出 `kept existing …`）。Next 自己不認識 `uat` 這種
> 環境名（`NODE_ENV` 只接受 `production`/`development`/`test`），所以這一層必須自己做。

**🚩 `config/env/*.env` 是公開檔案，只放公開值。** `PAYLOAD_SECRET`、`DATABASE_URI`
帳密、`QUOTE_HTTP_CRYPT_SECRET`、`MT_API_KEY` 一律只放主機環境變數（見 §2.3）。
這條有機器把關：`npm run env:check`（CI 會跑，`build:*` 也會順手檢查當前環境檔）會擋下
任何名稱像憑證的鍵（`SECRET`／`TOKEN`／`PASSWORD`／`*_KEY`／`DATABASE_URI`）。

### 2.1 必填（只能放主機環境變數或 git-ignored 的 `.env`）

```bash
PAYLOAD_SECRET=<openssl rand -base64 32>      # 請自行產生，勿沿用任何範例值
DATABASE_URI=mongodb://user:password@host:27017/hatc-cms?authSource=admin
```

> **資料庫名稱固定用 `hatc-cms`**（業主指定）。名稱含連字號，寫進 shell 指令或
> `mongosh` 參數時記得加引號：`mongosh "mongodb://…/hatc-cms?authSource=admin"`。
> 資料庫**不需要事先建立**，Mongo 會在第一次寫入時自動建立；但帳號要先有該庫的讀寫權限。

### 2.1a 建置期變數（寫進靜態 HTML，**換值必須重新 build**）

| 變數 | 用途 | 現況 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical / hreflang / sitemap / robots | prd 已填 `https://www.hatcmarket.com`（業主確認 2026-10-13）；**UAT 業主未提供網域，`uat.env` 留空，請在 UAT 主機自行設定** |
| `SITE_INDEXABLE` | `false` ＝ `robots.txt` 全站 disallow ＋ 每頁 `noindex` | `local`/`uat` 為 `false`、`prd` 為 `true`。未設定時預設可索引 |
| `NEXT_PUBLIC_ANALYTICS_ID` | 追蹤 ID（工具待定，目前佔位不輸出任何標籤） | 留空 |
| `CONTACT_WHATSAPP` / `_PHONE` / `_EMAIL` / `_LIVECHAT` | 客服聯絡方式的**後備** | prd 帶已核可的電話／電郵；UAT 刻意留空 |
| `OPEN_ACCOUNT_URL` / `DEMO_ACCOUNT_URL` / `MEMBER_LOGIN_URL` | 帳戶入口連結的**後備** | prd 帶已核可的開戶連結；其餘留空 |

> `NEXT_PUBLIC_SITE_URL` 未設定時會 fallback 到 `http://localhost:3000`，**正式站一定要設**，
> 否則 canonical 與 sitemap 會指到 localhost。
> ⚠ **UAT 一定要 `SITE_INDEXABLE=false`**，否則會和生產站搶同一批內容的排名。
>
> ⚠ **後面 7 個營運連結後備也屬於建置期**（第六十二輪實測）。它們沒有 `NEXT_PUBLIC_`
> 前綴，但頁面是 SSG：`getSiteSettings()` 在 **prerender 時**就被讀掉並寫進靜態 HTML，
> 所以「改環境變數再重啟」不會改變按鈕的連結 —— 實測 `start:prd` 注入
> `OPEN_ACCOUNT_URL` 之後，用無變數建置出來的頁面仍然指向 `/register`。
> **要在不重新部署的情況下改連結，請改 CMS**（見下一段），那條路徑是真的 runtime。

> ⚠ **這 7 個變數在第六十二輪改名了**（2026-10-12）：
> `NEXT_PUBLIC_CONTACT_*` → `CONTACT_*`、`NEXT_PUBLIC_OPEN_ACCOUNT_URL` →
> `OPEN_ACCOUNT_URL`，`DEMO_ACCOUNT_URL`／`MEMBER_LOGIN_URL` 亦同。
> **舊名已完全失效，不再被讀取。若你手上的 `.env` 還是舊名，請改名。**
> 原因：讀它們的 `src/lib/siteSettings.ts` 是 server-only，`NEXT_PUBLIC_` 前綴只是
> 白白把客服電話、電郵等 7 個字串塞進每個瀏覽器 bundle。

> **營運連結請一律在 `/admin` 的「網站營運設定」填寫**（業主 2026-10-12 確認維持
> **CMS 優先**）。環境變數與 `config/env/*.env` 只是「CMS 還沒填」時的後備，CMS 一有值
> 就以 CMS 為準。**CMS 改完存檔，前台重新整理一次就生效**（§6），不必重新 build ——
> 這是唯一能在不重建的前提下改連結的方式。每個環境本來就有自己的 Mongo，
> 所以 CMS 的值天生就是分環境的。

### 2.2 Runtime 變數（改值只要重啟，不必重新 build）

留空＝該功能停用，網站照常運作。

| 變數 | 用途 | 留空的行為 |
| --- | --- | --- |
| `DATABASE_URI` / `PAYLOAD_SECRET` | CMS 與 `/admin` | 前台走內建三語文案，無 `/admin` |
| `QUOTE_GATEWAY_URL` | MT5 行情閘道位址（`uat.env`／`prd.env` 已填） | 首頁／`/trading` 顯示標示清楚的「示意數據」 |
| `QUOTE_HTTP_CRYPT_SECRET` | 閘道回應解密共享密鑰（**只放主機**） | 同上 |
| `MT_*` | 後台「一鍵機器翻譯」按鈕 | 按鈕 disabled、API 回 501 |
| `GITBOOK_*` | 學院文章匯入腳本 | 腳本不可用 |

> 這些之所以是真 runtime：行情走 `force-dynamic` 的 `/api/market/*`、翻譯走後台 API、
> CMS 走資料庫連線 —— 都不經過預先產生的靜態 HTML。

### 2.3 🚩 密鑰紅線

- **密鑰不得寫進倉內任何檔案**，包含新增的 `config/env/*.env`（它們是 commit 進倉的）、
  `docs/*`、`.env.example` 與程式註解。可以 commit 的只有**公開網域**與**範本**。
- **`QUOTE_GATEWAY_URL` / `QUOTE_HTTP_CRYPT_SECRET` 是 server-only，絕對不可改名成
  `NEXT_PUBLIC_*`。** 它們會被打進瀏覽器 bundle，等於公開共享密鑰。
- **閘道密鑰的實際值**請到行情閘道專案的 `deploy/env/*.env` 取值，填進主機環境變數。
- **生產與 UAT 的密鑰不同**。（已知地雷：交易端 H5 的 `env.prd.uts` 把生產值寫成了 UAT 值，
  不要照抄那份。）
- **`WEB_TERMINAL_HOST`（`src/components/platforms/platformVisuals.ts`）刻意不跟著環境變。**
  它是平台截圖外框位址列印出來的字，紅線是**UAT 網域不得出現在官網任何畫面**，
  所以永遠是生產網域 `h5.hatcmarket.com`（`HATC_FACTS.md` 已核可）。

### 2.4 🚩 不要 commit `.env` 檔，也不要建 `.env.uat` / `.env.prd`

> 這一節是 2026-10-13（第六十三輪）實際發生過的事故紀錄。開發端在 Gitee 上把
> `.gitignore` 的 `.env*` 忽略整段刪除，並 commit 了 `.env.local`、`.env.uat`、
> `.env.prd` 三份檔案。那三份檔案已在同步時移除，`.env*` 的忽略規則不要再動。

**① 憑證不能進 git。** 那三份檔案裡有生產 MongoDB 的 root 連線字串（含密碼）與
`PAYLOAD_SECRET`。`PAYLOAD_SECRET` 是 Payload 簽發後台登入 JWT 的金鑰，洩漏等於
可以偽造任何管理員的登入 token。git 歷史無法事後收回，而本專案的 GitHub remote
是**公開倉**。密鑰請放主機環境變數，或放在 git-ignored 的 `.env`（部署時手動建立、
不要 commit）。

**② `.env.uat` 與 `.env.prd` 這兩個檔名不會生效。** Next 只載入
`.env`、`.env.local`、`.env.$(NODE_ENV)` 與 `.env.$(NODE_ENV).local`，而
**`NODE_ENV` 只接受 `production` / `development` / `test`** —— 沒有 `uat`、也沒有
`prd` 這種合法值（這正是本倉要自己寫 `scripts/with-env.mjs` 的原因，見 §2.0）。
所以那兩個檔案從頭到尾不會被讀取，分環境值請改用 `config/env/<環境>.env`。

**③ `.env.local` 會悄悄蓋掉 `config/env/prd.env`，把生產站打成 localhost ＋ noindex。**
這是三個問題裡最嚴重的，因為它不會報錯：

- `.env.local` 在 `NODE_ENV=production` 時**也會**被 Next 載入，而且優先於 `.env`。
- `scripts/with-env.mjs` 刻意對「已出現在 `.env.local` / `.env` 的鍵」讓路（§2.0），
  所以即使跑 `npm run build:prd`，`config/env/prd.env` 的值也**不會**覆蓋它。
- 開發端那份 `.env.local` 寫的是 `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 與
  `SITE_INDEXABLE=false` → 生產站的 canonical、`hreflang`、`sitemap.xml` 全部指向
  `http://localhost:3000`，`robots.txt` 變成 `Disallow: /`，每一頁再補一個
  `noindex, nofollow`。**結果是官網完全不會被搜尋引擎收錄**，而頁面看起來一切正常。

**部署機上的正確狀態**：沒有 `.env.local`；`.env` 只放 `PAYLOAD_SECRET` 與
`DATABASE_URI`（或連 `.env` 都不要，直接用主機環境變數）；其餘跑 `npm run build:prd`
由 `config/env/prd.env` 提供。驗收方式：

```bash
curl -s https://<站台>/robots.txt                      # 必須是 Allow: /，host 為正式網域
curl -s https://<站台>/zh-Hant | grep -o 'rel="canonical"[^>]*'   # 必須是正式網域
curl -s https://<站台>/zh-Hant | grep -o 'name="robots" content="[^"]*"'  # 必須是 index, follow
```

---

## 3. 首次部署步驟

```bash
# 1. 取得程式碼（從 Gitee master，見 §9）
git clone git@gitee.com:spingpeng/homeindex.git && cd homeindex
npm ci

# 2. 設定密鑰（公開的分環境值已在 config/env/*.env，見第 2 節）
#    至少要有 PAYLOAD_SECRET 與 DATABASE_URI
cp .env.example .env && vi .env

# 3. 建置與啟動（Mongo 不需要建表，也沒有 migration 步驟）
npm run build:prd      # UAT 用 build:uat；或自行注入環境變數後跑 npm run build
npm run start:prd      # 預設 3000 埠；請用反向代理掛上 TLS
```

> **升版／重新部署**：`git pull` →（必要時 `npm ci`）→ `rm -rf .next` →
> `npm run build:prd` → 重啟。`rm -rf .next` 的原因見 §6 最後一條。

### 3.1 ⚠ 關於 schema（最重要的一點）

- **沒有 migration。** Payload 的 MongoDB adapter 在連線時自行建立 collection 與索引
  （`autoIndex`），所以新增集合／欄位都不需要任何部署步驟，空庫第一次啟動就會長出
  正確結構。倉內**沒有** `src/migrations/`，`package.json` 也**沒有** `migrate*` 指令。
- 開發者改了 `src/collections/*`、`src/globals/*`、`src/payload.config.ts` 或
  `src/payload/permissions/registry.ts` 之後，**只需要**跑 `npm run generate:types` 並
  commit `src/payload-types.ts`。
- 退役欄位不會造成錯誤：Payload 預設忽略 schema 以外的鍵。要真的清掉舊資料就對該
  collection 下 `$unset`。
- 若日後需要**資料**搬遷（不是 schema），可用 `npx payload migrate:create <名稱>` 產生空白
  up/down 腳本再 `npx payload migrate` 執行。目前完全沒有用到。
- 🚩 **單機 vs replica set**：Payload 偵測到連線不是 replica set 時會自動停用交易
  （`transactionOptions=false`），功能照常。若要交易保證，請把 Mongo 設成 replica set，
  程式端不用改。

### 3.2 首次進後台

1. 開 `https://<domain>/admin`。
2. 建立第一個管理者帳號 —— `onInit` 會自動建立 full-access 的 `Administrator` 角色並指派給它。
3. 之後可在「角色」自建權限較小的角色給編輯人員（欄位級權限，`Roles` 只有全權角色能管）。

---

## 4. 上線前後台必填清單

到 `/admin` →「網站營運設定」：

| 欄位 | 現況 | 備註 |
| --- | --- | --- |
| 客戶服務電話 | `(852) 2322 2888` | 已核可事實（`HATC_FACTS.md`） |
| 電郵 | `info@hatchk.com` | 同上。**法律頁的資料查閱窗口讀這兩欄** |
| 線上客服連結 | 業主未提供 | 留空＝回退用電郵／電話 |
| 開戶（註冊）連結 | `https://h5.hatcmarket.com/#/pages/auth/register/index` | 業主已提供 |
| 模擬帳戶連結 | **業主未提供** | 留空＝全站隱藏模擬按鈕（**這是設計行為，不是 bug**） |
| 會員登入連結 | **業主未提供** | 留空＝頁首「登入」不顯示（同上） |

> **生產環境即使後台還沒填也不會開天窗**：`config/env/prd.env` 帶了電話、電郵與開戶連結
> 作為後備（三者皆為 `HATC_FACTS.md` 已核可事實）。但後台填的值永遠優先，所以上線前還是
> 請照上表填進 `/admin` —— 之後要改連結就不必重新部署。**UAT 的這些值刻意全部留空**
> （業主 2026-10-12 決定：HATC 沒有 UAT 版的開戶／登入／客服入口，也不得把生產入口放進
> UAT，避免測試人員在 UAT 開到真帳戶）。

> ⚠ **「頁面文案」類的 global（首頁／關於／產品／交易／入金出金）請保持留空。**
> 留空＝使用程式內建的三語文案；一旦填入值就會永久覆蓋該字串，日後的文案修正會「看不見」。
> 只有業主真的要改寫某一段時才填。

### 4.1 內容種子（選用）

正式站空庫時，學院文章等集合會自動回退到程式內建的三語種子，前台照常顯示。
若要把種子實際寫進資料庫以便後台編輯：

```bash
npm run payload -- run scripts/seed-academy.ts          # 學院文章（3 篇原始種子）
npm run payload -- run scripts/seed-academy-batch.ts    # 原創長文第一批
npm run payload -- run scripts/seed-academy-batch2.ts   # 第二批
npm run payload -- run scripts/seed-academy-batch3.ts   # 第三批
npm run payload -- run scripts/seed-academy-from-gitbook.ts  # 業主 GitBook 知識庫（需 GITBOOK_*）
npm run payload -- run scripts/seed-accounts.ts         # 帳戶賣點 + FAQ
npm run payload -- run scripts/seed-platforms.ts        # 平台 + FAQ
npm run payload -- run scripts/seed-funding.ts          # 出入金渠道（示意資料）＋版面佔位圖
npm run payload -- run scripts/seed-announcements.ts    # 公告分類（重要公告／交易安排）
```

這些腳本都是冪等的，需要 `DATABASE_URI`。全部跑完的結果＝學院 49 篇、媒體 53 筆、
出入金 14 筆、FAQ 12 筆、帳戶賣點 4 筆、平台 3 筆、公告分類 2 筆。

> **公告（`/announcements`）**：`seed-announcements.ts` 只建立業主指定的兩個**分類**
> （重要公告／交易安排），**不會建立任何公告**——公告是公司對外聲明，不得由程式捏造。
> 沒有公告時前台顯示中性的「目前尚無公告」。業主可在後台自行新增分類，新增後會自動
> 出現在前台的分類篩選；分類的「網址代稱」會用在 `/announcements?category=…` 連結上。

> 🚩 **種子腳本不會、也不得寫入「頁面文案」類 global 的文字欄位。**（`seed-funding.ts`
> 以前會，等於把內建文案複製進覆寫層，日後的文案修正就被吃掉了 —— 第五十九輪已移除。）
> 它只會把版面佔位圖掛進 `funding-page` 的圖片欄位，方便業主在後台換圖。

---

## 5. 行情（MT5 報價）接線

- 架構：**瀏覽器 → 本站 `/api/market/quotes`、`/api/market/bars`（server BFF）→ 行情閘道**。
  **瀏覽器絕對不可直連閘道**（閘道 CORS 不放行本站、回應是 AES-256-GCM 信封、
  握手需要 server-only 的 contextToken）。
- 代理**只接受黃金／白銀／人民幣公斤條**三個代號。閘道的訪客白名單另有 26 個外匯／指數代號，
  本站刻意不代理它們（紅線：不得把外匯／指數呈現為 HATC 產品）。
- `{ok:false}` 是**正常回應**，不是錯誤 —— 前台會自動顯示標示清楚的示意數據。
- 🚩 **已知阻塞（非本倉 bug）**：生產環境的訪客交易組
  `demo\DirectCustomer\GUEST\DEFAULT\Standard` 在業務後台**沒有配置產品**，
  因此回 403 `SYMBOL_NOT_ALLOWED`，首頁會停在示意數據。
  **後端把產品配好後，官網不需改任何程式碼就會自動變成真實報價。**

---

## 6. 更新內容後如何生效

- 在 `/admin` 編輯內容 → Payload 的 `afterChange` hook 會自動 `revalidateTag` /
  `revalidatePath`，**不需要重新部署或重啟**，前台**重新整理一次就會看到新內容**。
- ⚠ 失效用的是 `revalidateTag(tag, {expire: 0})`（立即過期），**不是** Next 建議的
  `'max'`。`'max'` 是 stale-while-revalidate：存檔後第一次造訪仍會看到舊值、只在背景更新，
  等於每次編輯都要重新整理兩次（第六十一輪業主回報）。`updateTag()` 只能在 Server Action 用，
  Payload 的存檔走 REST route handler，所以用 `{expire: 0}`。改 `src/lib/revalidateContent.ts`
  時不要改回 `'max'`。代價是存檔後的那一個請求會是一次真實的資料庫讀取（略慢），之後照常走快取。
- 改了 `src/messages/*`（程式內建文案）或任何程式碼 → **需要重新 build 並重啟**。
- ⚠ **重新 build 前請先 `rm -rf .next`。** `next build` 會重用 `.next/cache` 裡的 CMS 讀取
  結果，可能把舊值烤進靜態頁面。CI 用全新 runner 沒這問題，但在同一台伺服器上重複建置會。

---

## 7. 常見陷阱（實際踩過的）

1. **建置前要先停掉正在跑的伺服器。** 只用 `lsof -ti:3000 | xargs kill` 會留下 `npm start`
   外層程序繼續佔用 `.next`，接著冷建會失敗並噴出看似無關的
   `next/font/google queries have exactly one entry`（字體其實連得到，不要去查網路）。
   請用 `pkill -f "next start"; pkill -f "next-server"`，失敗後再 `rm -rf .next`。
2. **前台 200 不等於 CMS 正常。** 前台有 SSG ＋ 內建文案後備，即使 Payload 連不上資料庫也會回
   200。懷疑後台有問題時，請打 `/api/users/me` 並加 timeout（連不上 Mongo 時這支會失敗，
   前台卻依然正常）。
   ＊這條在 PostgreSQL 時代更嚴重：舊版會卡在 Drizzle 的互動式 schema 確認而無限 hang。
   改用 Mongo 後沒有這個同步步驟，但「前台綠燈 ≠ CMS 活著」的判斷原則不變。
3. **退役集合／欄位後**，清 `.next` 重建；資料庫端不需要處理（Mongo 會忽略多餘欄位，
   要清就下 `$unset`）。
4. **CI**：`.github/workflows/ci.yml` 跑 lint → i18n:check → build（用空的 `DATABASE_URI`
   走後備路徑）。pre-commit hook 需要 `npm install` 後才會掛上（`core.hooksPath=.githooks`）。
5. **改了 `config/env/*.env` 之後要不要重建？** 看改的是哪一類（§2.1a vs §2.2）：
   - 站台網域、`SITE_INDEXABLE`、追蹤 ID、**營運連結後備** →
     **必須 `rm -rf .next` 重新 build**（這些值在 prerender 時就被寫進靜態 HTML）。
   - `QUOTE_GATEWAY_URL`／`QUOTE_HTTP_CRYPT_SECRET`／`MT_*`／`DATABASE_URI` →
     **只要重啟**（走的是動態路由或資料庫連線）。
6. **`npm run build` / `npm run start`（不帶 `:prd`）不會讀 `config/env/*`。** 這是刻意保留的，
   給「自行注入環境變數」的 CI 用。用錯的症狀＝canonical 指向 localhost、開戶按鈕退回客服連結。

---

## 8. 內容治理紅線（部署與維運也適用）

這個網站面對真實客戶，內容受嚴格規範。**維運時請勿自行「補齊」看起來缺漏的內容。**

- **公司事實只能來自 `docs/HATC_FACTS.md`**。不得發明牌照、統計、客戶見證、獎項、交易條件。
- **已核可的交易條件寫在程式裡**（`src/components/products/tradingConditions.ts`），
  **刻意不開放後台編輯** —— 這是治理設計，不是遺漏。帳戶分級、點差、槓桿、合約規模、
  交易時段、最低手數、手續費全部由它產生。
- **不得把外匯／指數／原油／股票呈現為 HATC 的產品。** 唯一例外是 `/platforms` 的
  MetaQuotes 官方示範截圖（業主明示放寬），且顯示它的版面一定要帶供應商說明文字。
- **示意數據必須保留「示意數據」標籤**；真實資料才可標「即時報價」。兩者不可互換。
- **按鈕沒有目的地時就不要顯示**（模擬帳戶、會員登入都是這個設計），不要為了「版面完整」
  指去佔位頁。
- 兩個法律頁（`/privacy`、`/disclaimer`）是**保守版草稿，尚待業主／法務審核**，
  不得自行加入管轄法律、資料保存期限或合規保證。

有疑問請回報業主確認，不要自行填寫。

---

## 9. 程式碼如何交付（給業主／維護者看）

**開發團隊從 Gitee `master` 取得程式碼**：`git@gitee.com:spingpeng/homeindex.git`
（網頁：`https://gitee.com/spingpeng/homeindex`）。開發端照常 `git pull` 即可，
不再需要重發 zip。

更新方式**只有一個指令**（在本倉、工作區乾淨的狀態下執行）：

```bash
sh scripts/sync-gitee.sh
```

- 它會 `git fetch gitee`，然後以 `gitee/master` 為基礎加上**一個** commit，其內容
  等於本地 `HEAD`，再推上去。**刻意排除 `lp.zip`**（4 MB 設計素材，部署用不到）。
- 樹沒有變化時會直接結束；工作區髒的話會拒絕執行；推送前會印出預估上傳量。

### 9.1 為什麼不是 `git push gitee main`

GitHub `origin/main` 保有完整歷史（33+ commits，約 **39.6 MiB** 物件，體積幾乎都在最初幾個
commit 的圖片素材）。業主端上行只有 3–13 KiB/s，整包塞不進 Gitee 的 receive-pack 時限——
實際失敗兩次：第一次 69 分鐘連線中斷，第二次加了 SSH 保活仍在 57 分鐘被伺服器端砍掉
（`Grpc Receive Pack error: DeadlineExceeded`）。分段推送或壓縮歷史都沒用。

因此 **Gitee 是一條獨立血統的部署鏡像**：開發端當初用 zip 匯入成單一 commit，之後每次同步
只疊一個 commit，**只傳異動的物件**（首次同步實測 18 KiB、5 秒）。**完整歷史在 GitHub。**

> 另一個可行方案（目前未啟用）：Gitee 網頁「倉庫鏡像管理 → 拉取」從 GitHub 自動同步
> （`https://github.com/skyyuch/HATCwebsite.git`，公開倉、免憑證），機房對機房、完全不經過
> 本地上行。若改走這條，就會變成 Gitee 完整複製 GitHub 歷史，上面的腳本即可退役。
