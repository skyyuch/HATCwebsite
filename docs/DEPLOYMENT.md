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

### 2.0 每個環境各一份配置檔（第六十二輪新增；第六十五輪加入 stg）

公開的分環境值（站台網域、開戶等營運連結的後備、行情閘道位址）放在**已 commit** 的
配置檔，切換環境**不需要改任何程式碼**：

```
config/env/local.env     # 本機開發
config/env/uat.env       # UAT / 驗收（www.666678910.com）
config/env/stg.env       # 上線前預覽（web.hatcmarket.com，不可索引）
config/env/prd.env       # 生產（www.hatcmarket.com）
```

用對應的 npm script 套用：

```bash
npm run build:prd && npm run start:prd     # 生產
npm run build:stg && npm run start:stg     # 上線前預覽
npm run build:uat && npm run start:uat     # UAT
npm run dev                                # 本機（自動套 local）
```

> 新增環境只要在 `config/env/` 放一份 `<名稱>.env` 並加上對應的 npm script；
> `with-env.mjs` 與 `env:check` 會自動認得它。

也可以**完全不用這些 script**：直接在主機／CI 設環境變數再跑 `npm run build`、
`npm run start` —— 原本的指令行為完全沒變。

> ⚠ **`build:*` 與 `start:*` 要用同一個環境名。** 大部分變數在 build 時就被寫進靜態
> HTML（§2.1a），`start` 階段才注入是來不及的。

兩種方式可以混用，優先序如下（高→低）：

1. 主機／CI 上真的設定的環境變數
2. `config/env/<環境>.secrets.env`（git-ignored，**按環境**的密鑰；§2.3a）
3. 倉內的 `.env.local` / `.env`（git-ignored，**整台機器通用**）
4. `config/env/<環境>.env`（已 commit 的公開預設值）

> 載入器＝`scripts/with-env.mjs`。第 4 層**只補上尚未設定的鍵**：某個鍵只要出現在主機環境
> 變數或你的 `.env`，它就不碰（執行時會印出 `kept existing …`）。第 2 層相反，會蓋掉通用的
> `.env`（為單一環境特別寫的值該贏過整機通用值）。Next 自己不認識 `uat` 這種環境名
> （`NODE_ENV` 只接受 `production`/`development`/`test`），所以這一層必須自己做。

**🚩 `config/env/*.env` 是公開檔案，只放公開值。** `PAYLOAD_SECRET`、`DATABASE_URI`
帳密、`QUOTE_HTTP_CRYPT_SECRET`、`MT_API_KEY` 一律只放主機環境變數或 git-ignored 的
`config/env/<環境>.secrets.env`（見 §2.3 / §2.3a）。
這條有機器把關：`npm run env:check`（CI 會跑，`build:*` 也會順手檢查當前環境檔）會擋下
任何名稱像憑證的鍵（`SECRET`／`TOKEN`／`PASSWORD`／`*_KEY`／`DATABASE_URI`）。

> ⚠ **被擋下來不只是「警告」——`build:*` 會 exit 1，整個建置不會開始。** 2026-10-13
> 開發端把 `DATABASE_URI` 寫進全部三份檔案，結果 `build:prd`／`build:uat`／`build:local`
> 與 CI 的 `env:check` 全部中止。錯誤訊息本身會列出該放哪裡
> （`config/env/<環境>.secrets.env` 或主機環境變數），照著做即可。

### 2.0a `stg`＝上線前預覽，為什麼不能直接用 `build:prd`（第六十五輪新增）

正式站還沒切換時，生產建置被部署到 **`web.hatcmarket.com`**，而
`www.hatcmarket.com` 當時仍服務**另一個既有站**。用 `build:prd` 跑在這個網域上會同時
造成兩件事，而且**頁面上完全看不出來**：

- `robots.txt` 變成 `Allow: /`、每頁 `index, follow` → **預覽站被搜尋引擎收錄**；
- canonical、`hreflang`、`sitemap.xml` 全部指向 `https://www.hatcmarket.com`
  → 指到一個**內容不同**的網址；
- 社群分享卡的 `og:image` 也是絕對網址，同樣會指向 `www.hatcmarket.com`
  → 在 WhatsApp／Telegram 貼預覽站的連結**抓不到圖**（圖在那個網域上不存在）。

`stg.env` 就是為此存在：**除了「站台自己的網址」與「可不可以被索引」之外，其餘與
`prd.env` 完全相同**（同樣的營運連結、同樣的生產行情閘道）。正式切換當天把那台主機
改回 `build:prd` / `start:prd` 即可，不需要改其他東西。

```bash
# 預覽主機（上線前）
npm run build:stg && npm run start:stg
```

驗收（在預覽主機上跑，三條都要對）：

```bash
curl -s https://web.hatcmarket.com/robots.txt                     # 應為 Disallow: /
curl -s https://web.hatcmarket.com/zh-Hant | grep -o 'rel="canonical"[^>]*'   # 應指 web.hatcmarket.com
curl -s https://web.hatcmarket.com/zh-Hant | grep -o 'name="robots"[^>]*'     # 應為 noindex, nofollow
```

> ⚠ 密鑰是**按環境名**載入的：`build:stg` 讀的是 `config/env/stg.secrets.env`，
> **不會**讀 `prd.secrets.env`。改用 `stg` 之後若行情消失，先確認生產的
> `QUOTE_HTTP_CRYPT_SECRET` 在主機環境變數裡，或已複製一份到 `stg.secrets.env`。

### 2.1 必填（只能放主機環境變數或 git-ignored 的 `.env`）

```bash
PAYLOAD_SECRET=<openssl rand -base64 32>      # 請自行產生，勿沿用任何範例值
DATABASE_URI=mongodb://user:password@host:27017/hatc-cms?authSource=admin
```

> **資料庫名稱固定用 `hatc-cms`**（業主指定）。名稱含連字號，寫進 shell 指令或
> `mongosh` 參數時記得加引號：`mongosh "mongodb://…/hatc-cms?authSource=admin"`。
> 資料庫**不需要事先建立**，Mongo 會在第一次寫入時自動建立；但帳號要先有該庫的讀寫權限。

### 2.1b 那 local / uat / prd 的 MongoDB 路徑要怎麼「區分」？

分兩種情境，而**兩種都不需要在打包前改任何連線字串**。

#### 情境 A：同一台機器要建置多個環境 → `config/env/<環境>.secrets.env`

一次把各環境配好，之後只靠指令切換：

```bash
cp config/env/secrets.env.example config/env/uat.secrets.env   # 填 UAT 的連線字串
cp config/env/secrets.env.example config/env/prd.secrets.env   # 填生產的連線字串

npm run build:uat && npm run start:uat   # 自動載入 uat.secrets.env
npm run build:prd && npm run start:prd   # 自動載入 prd.secrets.env
```

`scripts/with-env.mjs` 會依環境名載入對應的 `.secrets.env`，所以**一套程式碼、一台機器、
零手動改檔**。這些檔案是 **git-ignored**（規格與防呆見 §2.3a），因此密鑰不會進倉。

#### 情境 B：一台機器只跑一個環境 → 直接用主機環境變數

生產主機只跑生產、UAT 主機只跑 UAT 時，這是更好的做法——密鑰由機器本身持有，
**UAT 主機上根本不存在生產資料庫的憑證**：

| 機器 | 怎麼設 | 怎麼建置 |
| --- | --- | --- |
| 開發者本機 | 自己的 `.env`：`DATABASE_URI=mongodb://…@127.0.0.1:27017/hatc-cms?authSource=admin` | `npm run dev` |
| UAT 主機 | 主機環境變數（或該機的 `.env`）指向 **UAT 的 Mongo** | `npm run build:uat && npm run start:uat` |
| 生產主機 | 主機環境變數（或該機的 `.env`）指向 **生產的 Mongo** | `npm run build:prd && npm run start:prd` |

**不論用哪種情境，都不要把連線字串寫進 `config/env/*.env`**（那三份是 commit 的，
`with-env.mjs` 與 `env:check` 會直接 exit 1）。把三個環境的連線字串放進倉裡，等於每一台
機器、每個能 clone 的人都持有全部環境的資料庫密碼 —— 那是 2026-10-13 被擋下來的做法。

**本機請連自己的 Mongo，不要連 UAT。** `config/env/local.env` 是所有人共用的檔案，
在那裡填遠端位址會讓每個開發者的 `npm run dev` 都讀寫同一個資料庫，本機隨手測試就會
污染 UAT 資料。

#### CI runner

CI 不適合放檔案（每次都是全新 runner），改把密鑰存在 CI 的 secret store 裡用不同名稱，
再於各自的 job 映射成 `DATABASE_URI`（名稱只在 CI 設定裡出現，不進倉）：

```yaml
# 範例：同一個 workflow 的兩個 job
build-uat:
  env:
    DATABASE_URI: ${{ secrets.UAT_DATABASE_URI }}
    PAYLOAD_SECRET: ${{ secrets.UAT_PAYLOAD_SECRET }}
  run: npm run build:uat

build-prd:
  env:
    DATABASE_URI: ${{ secrets.PRD_DATABASE_URI }}
    PAYLOAD_SECRET: ${{ secrets.PRD_PAYLOAD_SECRET }}
  run: npm run build:prd
```

主機環境變數的優先序最高（§2.0），所以這樣注入一定會贏過任何檔案。

> ⚠ **`DATABASE_URI` 在 `build` 階段也會被讀取**，不只是 `start`。頁面是 SSG，
> CMS 內容在 prerender 時就被讀進靜態 HTML，所以建置時就必須連得到正確的資料庫。
> 換資料庫之後要 `rm -rf .next` 重新 build，單純重啟不會更新已經產生的頁面。

### 2.1a 建置期變數（寫進靜態 HTML，**換值必須重新 build**）

| 變數 | 用途 | 現況 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical / hreflang / sitemap / robots | prd＝`https://www.hatcmarket.com`、uat＝`https://www.666678910.com`（均 2026-10-13 業主確認） |
| `SITE_INDEXABLE` | `false` ＝ `robots.txt` 全站 disallow ＋ 每頁 `noindex` | `local`/`uat` 為 `false`、`prd` 為 `true`。未設定時預設可索引 |
| `NEXT_PUBLIC_ANALYTICS_ID` | 追蹤 ID（工具待定，目前佔位不輸出任何標籤） | 留空 |
| `CONTACT_WHATSAPP` / `_PHONE` / `_EMAIL` / `_LIVECHAT` | 客服聯絡方式的**後備** | prd 帶已核可的電話／電郵；UAT 刻意留空 |
| `OPEN_ACCOUNT_URL` / `DEMO_ACCOUNT_URL` / `MEMBER_LOGIN_URL` | 帳戶入口連結的**後備** | prd 帶已核可的開戶連結；其餘留空 |

> `NEXT_PUBLIC_SITE_URL` 未設定時會 fallback 到 `http://localhost:3000`，**正式站一定要設**，
> 否則 canonical 與 sitemap 會指到 localhost。
> ⚠ **UAT 一定要 `SITE_INDEXABLE=false`**，否則會和生產站搶同一批內容的排名。
> ⚠ **UAT 網域只能出現在 `uat.env`**：`666678910.com` 不得進入生產建置，也不得出現在任何
> 頁面內容裡（同一條紅線讓 `platformVisuals.ts` 的 `WEB_TERMINAL_HOST` 永遠寫生產網域）。
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
>
> ⚠ **`DATABASE_URI` 只有「連線」這件事是 runtime。** `/admin`、REST API 與
> `/api/market/*` 會立即吃到新值，但**前台頁面的 CMS 內容是 SSG，在 build 時就被讀進
> 靜態 HTML** —— 換資料庫之後必須 `rm -rf .next` 重新 build，頁面才會顯示新庫的內容
> （單純重啟只會讓 `/admin` 換庫、前台還是舊資料，很容易誤判成「快取沒清」）。
> 同一個資料庫內的**內容修改**不受此限：`/admin` 存檔會觸發 `revalidateTag`，
> 前台重新整理一次就生效（§6）。

### 2.3 🚩 密鑰紅線

- **密鑰不得寫進任何會被 commit 的檔案**，包含 `config/env/*.env`（它們是 commit 進倉的）、
  `docs/*`、`.env.example` 與程式註解。可以 commit 的只有**公開網域**與**範本**。
  密鑰只有三個合法位置：主機環境變數、git-ignored 的 `.env`、
  git-ignored 的 `config/env/<環境>.secrets.env`（§2.3a）。
- **`QUOTE_GATEWAY_URL` / `QUOTE_HTTP_CRYPT_SECRET` 是 server-only，絕對不可改名成
  `NEXT_PUBLIC_*`。** 它們會被打進瀏覽器 bundle，等於公開共享密鑰。
- **閘道密鑰的實際值**請到行情閘道專案的 `deploy/env/*.env` 取值，填進主機環境變數。
- **生產與 UAT 的密鑰不同**。（已知地雷：交易端 H5 的 `env.prd.uts` 把生產值寫成了 UAT 值，
  不要照抄那份。）
- **`WEB_TERMINAL_HOST`（`src/components/platforms/platformVisuals.ts`）刻意不跟著環境變。**
  它是平台截圖外框位址列印出來的字，紅線是**UAT 網域不得出現在官網任何畫面**，
  所以永遠是生產網域 `h5.hatcmarket.com`（`HATC_FACTS.md` 已核可）。

### 2.3a `config/env/<環境>.secrets.env`（git-ignored，第六十三輪新增）

讓**一台機器同時持有多個環境的密鑰**、只靠 `build:uat` / `build:prd` 切換的機制。
每個環境一份，從範本複製：

```bash
cp config/env/secrets.env.example config/env/prd.secrets.env
```

`scripts/with-env.mjs` 的優先序（高→低）：

| 層 | 來源 | 性質 |
| --- | --- | --- |
| 1 | 主機／CI 已 export 的環境變數 | 最高，永遠贏 |
| 2 | `config/env/<環境>.secrets.env` | **git-ignored，按環境**的密鑰 |
| 3 | 倉內 `.env.local` / `.env` | git-ignored，**整台機器通用** |
| 4 | `config/env/<環境>.env` | **commit 進倉**，只放公開值 |

- **第 2 層刻意會蓋掉第 3 層。** 為某個環境特別寫的值，應該贏過整台機器通用的 `.env`，
  與 Next 自己的 `.env.production.local` 勝過 `.env.local` 同理。第 4 層則相反——
  公開預設值**依鍵名讓路**給 `.env`，不會蓋掉開發者自己的設定。
- `build:*` / `start:*` 的 log 會印出「哪些鍵來自 `<環境>.secrets.env`」（只印鍵名，
  不印值），方便確認真的套用到了。
- **防呆**：`config/env/*.secrets.env` 在 `.gitignore` 裡；若該忽略規則被移除（2026-10-13
  發生過一次），只要對應的 `.secrets.env` 存在，`env:check` 與每個 `build:*` / `start:*`
  **都會 exit 1**，而不是默默把密鑰 commit 出去。
- 檔名 `*.secrets.env` 不會被當成環境名（`with-env.mjs` 只認 `<name>.env`），
  `secrets.env.example` 是範本、不含真實值，刻意 commit。
- **CI runner 不要用這個機制**（每次都是全新 runner，檔案不會留下），改用 §2.1b 的
  secret store 做法。

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
所以那兩個檔案從頭到尾不會被讀取。**要分環境的值請改放**：公開值→
`config/env/<環境>.env`（commit）；密鑰→`config/env/<環境>.secrets.env`（git-ignored，
§2.3a）。後者就是「同一台機器預先配好多個環境、只靠指令切換」的正規做法，
`.env.uat` / `.env.prd` 想達成的目的由它承擔。

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
npm run build:prd      # UAT 用 build:uat、上線前預覽用 build:stg（§2.0a）；
                       # 或自行注入環境變數後跑 npm run build
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

- 架構：**瀏覽器 → 本站 `/api/market/*`（server BFF）→ 行情閘道**。
  **瀏覽器絕對不可直連閘道**（閘道 CORS 不放行本站、回應是 AES-256-GCM 信封、
  握手需要 server-only 的 contextToken）。
- **即時報價走推送（第六十七輪）**：本站伺服器對閘道開**一條** WebSocket
  （`/ws?contextToken=…`），收到 tick 後以 **SSE `/api/market/stream`** 分送給所有線上訪客，
  價格變動約 0.2–0.3 秒內上畫面。**閘道負載與訪客人數無關**（一個 Node 程序一條上游連線，
  最後一位訪客離開 30 秒後自動斷開）。
  `/api/market/quotes` 與 `/api/market/bars` **保留不變**：前者是瀏覽器無法維持 SSE 時的
  後備（payload 完全相同），後者是首頁日 K。
  - ⚠ **SSE 最容易被反向代理的緩衝打壞**：nginx 預設 `proxy_buffering on` 會把每一筆
    tick 累積起來、變成每隔幾十秒一次爆發。本站已在回應送出 **`X-Accel-Buffering: no`**
    ＋`Cache-Control: no-transform`，nginx 會據此對這個回應關閉緩衝，**正常情況不需要改
    nginx 設定**。若經過的是其他代理（Cloudflare、ALB、寶塔的自訂設定）而行情變成一陣一陣，
    就要替 `/api/market/stream` 關閉 buffering 並把讀取逾時調大於 15 秒
    （本站每 15 秒送一次心跳註解）。
  - 驗收（任何環境都可直接跑，**不需要登入**）：
    ```bash
    curl -sN --max-time 20 https://<站台>/api/market/stream | grep -c '^data:'
    ```
    有行情時 20 秒內應有**數十筆**（實測 UAT 約 40–50 筆）；只有 1–2 筆且都是
    `{"ok":false}` ＝沒有行情，照 §5.1 查；筆數正常但**全部擠在最後一次送達**＝代理在緩衝。
- 代理**只接受黃金／白銀／人民幣公斤條**三個代號。閘道的訪客白名單另有 26 個外匯／指數代號，
  本站刻意不代理它們（紅線：不得把外匯／指數呈現為 HATC 產品）。
- `{ok:false}` 是**正常回應**，不是錯誤 —— 前台會自動顯示標示清楚的示意數據。
- ✅ **兩個閘道都已驗證可用**：`node.666678910.com`（UAT，2026-10-13 第六十四輪）與
  **`node.hatcmarket.com`（生產，2026-10-14 第六十五輪）** 的遊客交易組都有 **29 個白名單
  代號**，含金／銀／人民幣公斤條，三個都取得到即時報價與日 K。
  **「生產遊客交易組沒配產品」這個從第四十三輪記錄到第六十四輪的阻塞已經解除**，
  後端已把產品配好 —— 日後排查不要再預設是這個原因。
- 因此**站台沒有行情＝部署主機自己的設定問題**，照 §5.1 查。

### 5.1 沒有行情時的排查順序

`{ok:false}` 本身不帶原因（契約是「沒有真資料，前台維持示意」），所以站台自己備了一支
**需要管理員登入**的自我檢測端點（第六十四輪新增）：

1. 用管理員帳號登入 `/admin`（同一個瀏覽器）。
2. 開 `https://<站台>/api/market/diagnostics`。

它會直接給出結論（`verdict`），並列出：連到哪一個閘道（`gateway.host`）、密鑰有沒有設
（`gateway.secretConfigured`，**不會印出密鑰本身**）、遊客白名單有幾個代號
（`guestContext.allowedSymbolCount`）、三個產品各自取不取得到報價（`symbols[]`），
以及推送狀態（`stream`）：`mode` ＝ `push`（WebSocket 正常）／`polled`（socket 連不上，
已退回每 2 秒輪詢，畫面仍會更新但較慢）／`idle`（目前沒有訪客，正常）。
它會跳過報價快取，所以看到的是當下狀態。未登入回 401、非全權角色回 403 ——
這些是營運細節，不對匿名訪客公開。

| `verdict` 開頭 | 意思 | 怎麼修 |
| --- | --- | --- |
| `QUOTE_GATEWAY_URL is not set…` | 伺服器啟動時沒有這個變數 | 多半是**用裸 `npm start` 啟動**。這是 runtime 變數，只有 `npm run start:uat` / `start:prd` 會帶進去，而且 `build:*` 與 `start:*` 必須用同一個環境名。 |
| `QUOTE_HTTP_CRYPT_SECRET is not set…` | 有閘道位址、沒有密鑰 | 放進 `config/env/<環境>.secrets.env`（§2.3a）或主機環境變數。 |
| `Cannot resolve a guest context…` | 連得到但解不開，或連不到 | 密鑰與該閘道不符（⚠ **UAT 與生產是不同的值**，去閘道專案 `deploy/env/*.env` 取；交易端 H5 的 `env.prd.uts` 把生產值寫錯成 UAT 值，不要照抄那份），或主機對外網路不通。 |
| `…none of them are HATC products` | 閘道活著，但該閘道的遊客交易組沒配產品 | 業務後台把金／銀／人民幣公斤條配進遊客交易組，官網不需改碼。（兩個閘道目前都已配好，見 §5。） |
| `Live quotes are working…` | 後端沒問題 | 前台若仍是示意，問題在瀏覽器到本站這一段（CDN／WAF 擋掉或快取了 `/api/market/*`）。 |

### 5.2 🚩 最常見的實際原因：密鑰那一行是空的（2026-10-14 第六十五輪）

生產站第一次上線時沒有行情，真正的原因是 `config/env/prd.secrets.env` 裡
**`QUOTE_HTTP_CRYPT_SECRET=` 這一行有鍵名、但沒有值**（其餘三個密鑰都填了）。
空字串會讓解密直接失敗，症狀與「密鑰填錯」一模一樣。

**`grep` 只看鍵名會被騙**（鍵名確實在），要這樣查：

```bash
cd /project/hatc-web
grep -c '^QUOTE_HTTP_CRYPT_SECRET=..' config/env/prd.secrets.env   # 1=有值，0=空的
grep -vE '^\s*(#|$)' config/env/prd.secrets.env | wc -l            # 行數＝密鑰個數（編輯後被折行會多出來）
```

**檢查「正在跑的程序」實際拿到什麼**（鍵名安全，不會印出值）：

```bash
PID=$(pgrep -f "next-server" | head -1)
sudo cat /proc/$PID/environ | tr '\0' '\n' | grep -E '^(NODE_ENV|NEXT_PUBLIC_SITE_URL|SITE_INDEXABLE|QUOTE_GATEWAY_URL)='
sudo cat /proc/$PID/environ | tr '\0' '\n' | grep -oE '^(DATABASE_URI|PAYLOAD_SECRET|QUOTE_HTTP_CRYPT_SECRET|MT_API_KEY)='
```

> ⚠ 要用 `sudo cat … | tr`，**不要** `sudo tr … < /proc/…` —— `<` 這個重導向是由你自己的
> shell（非 root）執行的，會 `Permission denied`，而且看起來像「變數沒設定」。
> 同理 `sudo -E` 在多數系統被忽略，取 node 路徑請用 `sudo readlink -f /proc/$PID/exe`。

**修法**：把值補進 `config/env/<環境>.secrets.env`（檔案多半是 root 擁有 → `sudo nano`），
然後**重啟即可，不需要重新 build**（`QUOTE_HTTP_CRYPT_SECRET` 是 runtime 變數）。
驗證＝`curl -s https://<站台>/api/market/quotes | head -c 200` 應回 `{"ok":true,…}`。

伺服器 log 會印同一批訊息（前綴 `[marketQuotes]`），而且**只在狀態改變時印一次**：
故障與恢復都看得到，但不會洗版。恢復時是 `live quotes active from <host>: …`。

需要從主機手動確認對外網路與閘道時：

```bash
curl -s -m 10 -X POST "$QUOTE_GATEWAY_URL/v1/context/resolve" \
  -H 'Content-Type: application/json' -d '{"scene":"guest"}'
```

回 `{"codec":"aes-256-gcm",…}` 的信封＝閘道正常。

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
