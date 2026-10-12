# HATC 官網 — 部署交接文件（給開發／維運團隊）

> 本檔是**交給開發團隊部署到伺服器**的操作說明。
> 想了解網站內容決策與設計史，請看 `docs/HANDOFF.md`；公司事實一律以
> `docs/HATC_FACTS.md` 為準。
> 最後更新：2026-10-11（第五十八輪）

---

## 0. 一句話摘要

Next.js 16（App Router）＋ Payload CMS 同倉的三語網站，頁面全部 **SSG ＋ 按需
revalidate**。部署三步：**空的 PostgreSQL → `npm run migrate` → `build` → `start`**。
**本專案從未部署過，這是第一次上線。**

---

## 1. 環境需求

| 項目 | 版本／說明 |
| --- | --- |
| Node.js | **22.x LTS**（開發用 22.22.3 驗證；Next 16 最低 20.9） |
| npm | 10.x（倉內有 `package-lock.json`，請用 `npm ci`） |
| PostgreSQL | 14 以上（開發用 16）。**必須是一個全新的空資料庫** |
| 記憶體 | build 階段建議 ≥ 2 GB |

本專案**不是** serverless-only 設計，預期跑在一般 Node 伺服器（PM2／systemd／Docker 皆可）。
`/api/market/*` 兩支路由是 `force-dynamic`，其餘頁面為靜態產物。

---

## 2. 環境變數

複製 `.env.example` 成 `.env`（或改用主機的環境變數機制）。

### 2.1 必填

```bash
NEXT_PUBLIC_SITE_URL=https://www.hatchk.com   # 影響 canonical / hreflang / sitemap / robots
PAYLOAD_SECRET=<openssl rand -base64 32>      # 請自行產生，勿沿用任何範例值
DATABASE_URI=postgres://user:password@host:5432/hatc
```

> `NEXT_PUBLIC_SITE_URL` 未設定時會 fallback 到 `http://localhost:3000`，**正式站一定要設**，
> 否則 SEO 的 canonical 與 sitemap 會指到 localhost。

### 2.2 選填（留空＝該功能停用，網站照常運作）

| 變數 | 用途 | 留空的行為 |
| --- | --- | --- |
| `QUOTE_GATEWAY_URL` | MT5 行情閘道位址 | 首頁／`/trading` 顯示標示清楚的「示意數據」 |
| `QUOTE_HTTP_CRYPT_SECRET` | 閘道回應解密共享密鑰 | 同上 |
| `NEXT_PUBLIC_CONTACT_*` | 客服聯絡方式的環境變數後備 | 改由 CMS 讀（建議走 CMS） |
| `NEXT_PUBLIC_OPEN_ACCOUNT_URL` / `_DEMO_ACCOUNT_URL` / `_MEMBER_LOGIN_URL` | 帳戶入口連結的後備 | 同上 |
| `MT_*` | 後台「一鍵機器翻譯」按鈕 | 按鈕 disabled、API 回 501 |
| `GITBOOK_*` | 學院文章匯入腳本 | 腳本不可用 |

> **營運連結請一律在 `/admin` 的「網站營運設定」填寫**，環境變數只是沒有資料庫時的後備。

### 2.3 🚩 密鑰紅線

- **`QUOTE_GATEWAY_URL` / `QUOTE_HTTP_CRYPT_SECRET` 是 server-only，絕對不可改名成
  `NEXT_PUBLIC_*`。** 它們會被打進瀏覽器 bundle，等於公開共享密鑰。
- **閘道密鑰的實際值不得寫進本倉任何檔案**（含 `docs/*`、`.env.example`、程式註解）。
  請到行情閘道專案的 `deploy/env/*.env` 取值，填進主機環境變數。
- **生產與 UAT 的密鑰不同**。（已知地雷：交易端 H5 的 `env.prd.uts` 把生產值寫成了 UAT 值，
  不要照抄那份。）

---

## 3. 首次部署步驟

```bash
# 1. 取得程式碼（目前以 zip 快照交付，解開後進入 hatc-web/）
unzip hatc-web-<日期>-<sha>.zip && cd hatc-web
npm ci

# 2. 設定環境變數（見第 2 節）
cp .env.example .env && vi .env

# 3. 建立 schema —— 務必對「全新空資料庫」執行
npm run migrate

# 4. 建置與啟動
npm run build
npm run start          # 預設 3000 埠；請用反向代理掛上 TLS
```

### 3.1 ⚠ 關於 migration（最重要的一點）

- 本機開發靠 Payload 的 Drizzle **push** 自動同步 schema，**生產模式不 push，只重播
  `src/migrations/*`**。所以生產環境**一定要跑 `npm run migrate`**，不會自動建表。
- **不要**把 `npm run migrate` 指向一個已經由 push 建好表的資料庫 —— 表已存在，
  `CREATE TABLE` 會失敗。要用 migration 流程就砍掉重建。
- 目前有三個 migration：`20261011_073413_initial`（39 張表的基線）、
  `20261011_091538_add_open_account_url`、`20261011_122325_add_member_login_url`。
  按順序重播即可得到正確 schema。
- 之後若有人改了 `src/collections/*`、`src/globals/*`、`src/payload.config.ts` 或
  `src/payload/permissions/registry.ts`，**同一次改動必須**跑
  `npm run migrate:create -- <名稱>` 並把 `.ts` ＋ `.json` ＋ `index.ts` 一起 commit。
  `npm run migrate:check`（CI 與 pre-commit 都有掛）會把漏掉的攔下來。
- 查狀態：`npm run migrate:status`。

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

> ⚠ **「頁面文案」類的 global（首頁／關於／產品／交易／入金出金）請保持留空。**
> 留空＝使用程式內建的三語文案；一旦填入值就會永久覆蓋該字串，日後的文案修正會「看不見」。
> 只有業主真的要改寫某一段時才填。

### 4.1 內容種子（選用）

正式站空庫時，學院文章等集合會自動回退到程式內建的三語種子，前台照常顯示。
若要把種子實際寫進資料庫以便後台編輯：

```bash
npm run payload -- run scripts/seed-academy.ts         # 學院文章
npm run payload -- run scripts/seed-academy-batch.ts   # 第一批長文（共三批）
npm run payload -- run scripts/seed-accounts.ts        # 帳戶賣點 + FAQ
npm run payload -- run scripts/seed-platforms.ts       # 平台 + FAQ
npm run payload -- run scripts/seed-funding.ts         # 出入金渠道（示意資料）
```

這些腳本都是冪等的，需要 `DATABASE_URI`。

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
  `revalidatePath`，**不需要重新部署或重啟**。
- 改了 `src/messages/*`（程式內建文案）或任何程式碼 → **需要重新 build 並重啟**。
- ⚠ **重新 build 前請先 `rm -rf .next`。** `next build` 會重用 `.next/cache` 裡的 CMS 讀取
  結果，可能把舊值烤進靜態頁面。CI 用全新 runner 沒這問題，但在同一台伺服器上重複建置會。

---

## 7. 常見陷阱（實際踩過的）

1. **建置前要先停掉正在跑的伺服器。** 只用 `lsof -ti:3000 | xargs kill` 會留下 `npm start`
   外層程序繼續佔用 `.next`，接著冷建會失敗並噴出看似無關的
   `next/font/google queries have exactly one entry`（字體其實連得到，不要去查網路）。
   請用 `pkill -f "next start"; pkill -f "next-server"`，失敗後再 `rm -rf .next`。
2. **前台 200 不等於 CMS 正常。** 前台有 SSG ＋ 內建文案後備，即使 Payload 初始化卡住也會回
   200。懷疑後台有問題時，請打 `/api/users/me` 並加 timeout；**無限 hang** 代表 Payload 卡在
   schema 同步的互動式確認（通常是資料庫殘留了已退役的表或欄位）。
3. **退役集合／欄位後**，必須「清 `.next`」＋「手動清掉資料庫殘留物件」兩件一起做。
4. **CI**：`.github/workflows/ci.yml` 跑 lint → i18n:check → build（用空的 `DATABASE_URI`
   走後備路徑）。pre-commit hook 需要 `npm install` 後才會掛上（`core.hooksPath=.githooks`）。

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

目前以 **zip 快照**交付給開發團隊：

```bash
git archive --format=zip -9 --prefix=hatc-web/ \
  -o ~/Desktop/hatc-web-$(date +%Y%m%d)-$(git rev-parse --short HEAD).zip \
  HEAD -- . ':!lp.zip'
```

- 內容＝版控在 `HEAD` 的檔案，**自動排除** `node_modules`、`.next`、本機 `.env` 與 `.git`；
  另外刻意排除 `lp.zip`（4 MB 設計素材，部署不需要）。約 33 MB／435 個檔案。
- 產生後請用 `unzip -tq <檔名>` 驗證完整性。
- ⚠ 快照**不含 `.git`**，開發端無法 `git pull`。**每次有更新都要重新產包並重發。**

**為什麼不用 Gitee：** 曾嘗試推到 `git@gitee.com:spingpeng/homeindex.git` 兩次都失敗——
第一次 69 分鐘後連線中斷，第二次加了 SSH 保活仍在 57 分鐘被 Gitee 伺服器端時限砍掉
（`Grpc Receive Pack error: DeadlineExceeded`）。原因是 **39 MiB 的 pack 搭配 3–13 KiB/s
的上行頻寬**，塞不進 Gitee 的 receive-pack 時限；而體積集中在圖片素材，分段推送或壓縮歷史
都無法改善。

若日後要恢復 git 交付，建議走 **Gitee 網頁「倉庫鏡像管理 → 拉取」直接從 GitHub 同步**
（`https://github.com/skyyuch/HATCwebsite.git`，公開倉、免憑證），由 Gitee 伺服器對 GitHub
拉取，完全不經過本地上行頻寬。
