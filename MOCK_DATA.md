# 接案平台 MVP — 模擬測試數據說明文件

為便於驗收平台功能，資料庫中已透過 Prisma Seed 腳本生成了豐富的模擬數據，涵蓋 **23 個使用者帳號** 與 **100 個包含完整生命週期歷史的案件**。

---

## 一、 測試使用者帳號列表 (Total: 23)

這些帳號已寫入資料庫的 `users` 資料表中。由於系統採用 **Clerk** 進行身份驗證，在本地開發環境中：
- **公共展示與後台管理**：這些 mock 帳號已具備完整的關聯評價、技能與案件歷史，用於展示平台的多人協作生態。
- **登入測試**：若您需要模擬特定角色進行操作，可在 Clerk 註冊一個新帳號，登入平台完成 Onboarding 流程，接著在資料庫或管理員後台將該帳號的 `role` 調整為 `CLIENT` 或 `FREELANCER`，或者將 `isAdmin` 設為 `true` 即可獲得對應的管理權限。

### 1. 平台管理員 (Admins) — 共 3 位
管理員具備訪問 `/admin` 後台的權限，可進行使用者停用、案件審核通過/退回/停用等操作。
* **管理員 1**: 
  * Clerk ID: `mock_admin_1` | Email: `admin_1@example.com` | Name: `管理員 1 (Admin)`
* **管理員 2**: 
  * Clerk ID: `mock_admin_2` | Email: `admin_2@example.com` | Name: `管理員 2 (Admin)`
* **管理員 3**: 
  * Clerk ID: `mock_admin_3` | Email: `admin_3@example.com` | Name: `管理員 3 (Admin)`

### 2. 發案方 (Clients) — 共 10 位
發案方可以發布案件、進行 AI 輔助審核、錄用接案者、驗收提交的成果，並進行雙盲評價。
* **發案方 1 ~ 10**:
  * Clerk ID: `mock_client_1` 至 `mock_client_10`
  * Email: `client_1@example.com` 至 `client_10@example.com`
  * 姓名: `林發案 1 (Client)` 至 `林發案 10 (Client)`

### 3. 接案者 (Freelancers) — 共 10 位
接案者可以瀏覽案件、收藏/追蹤案件、提交申請（估時與方案描述）、提交成果（代碼倉庫、Demo 連結），並進行雙盲評價。每位接案者均隨機綁定了 3~5 個技能標籤。
* **接案者 1 ~ 10**:
  * Clerk ID: `mock_freelancer_1` 至 `mock_freelancer_10`
  * Email: `freelancer_1@example.com` 至 `freelancer_10@example.com`
  * 姓名: `陳接案 1 (Freelancer)` 至 `陳接案 10 (Freelancer)`

---

## 二、 模擬案件數據 (Total: 100)

為了完整測試平台在不同交易階段的表現，100 個案件平均分佈在不同狀態中，並已建立了豐富的關聯申請（Applications）、提交成果（Submissions）與雙盲評價（Reviews）。

### 1. 狀態分佈與驗收要點
* **DRAFT (草稿狀態) — 10 個**
  * 僅發案方本人在 Dashboard 可見，適合測試編輯與正式發布。
* **OPEN (招募中狀態) — 40 個**
  * 前台案件列表可見。每個招募中的案件已**隨機生成了 1~3 個 Pending (審核中) 的申請案**，可用於測試發案方的錄用流程。
* **IN_PROGRESS (進行中狀態) — 20 個**
  * 案件已鎖定指定的接案者。每個案件已包含一個 `ACCEPTED` 申請記錄。
* **SUBMITTED (已提交待驗收狀態) — 10 個**
  * 接案者已提交成果。每個案件皆關聯了一份**包含 Demo URL、GitHub 連結及交付說明**的 `Submission` 記錄，可用於測試發案方的驗收與退回修改功能。
* **REVISION_REQUESTED (退回修改中狀態) — 10 個**
  * 案件已被發案方要求修改。
* **COMPLETED (已完成狀態) — 8 個**
  * 交易已圓滿結束。這些案件均**已生成雙方互評的 Review 記錄（評星與評語）**。您可以在接案者的個人公開頁面（如 `/users/[userId]`）看到這些累積的真實星星數與合作留言。
* **CANCELLED (已取消狀態) — 2 個**

### 2. 分類與技術覆蓋範圍
案件隨機分佈於以下 6 大主要分類，且其必填技能標籤與分類高度吻合：
1. **網站開發**（推薦標籤：React, Next.js, Node.js, TypeScript, HTML/CSS 等）
2. **App 開發**（推薦標籤：Flutter, React Native, Swift, Kotlin, iOS, Android 等）
3. **設計**（推薦標籤：UI/UX, Figma, 平面設計, Logo 設計, 3D 設計等）
4. **文案**（推薦標籤：中文寫作, 技術文件, SEO 文案, 翻譯等）
5. **行銷**（推薦標籤：SEO, 社群媒體, 廣告投放, 電子商務等）
6. **資料分析**（推薦標籤：Python, 數據視覺化, 機器學習, SQL 等）

---

## 三、 如何在本地進行功能確認？

1. **搜尋、篩選與分頁**：
   - 瀏覽前台案件列表 [http://localhost:3001/projects](http://localhost:3001/projects)。
   - 輸入預算範圍（如最小 50,000）、截止日期，或使用下拉選單排序（最新發布、預算高到低、截止日期最近），觀察 100 個案件的即時篩選與底部 `<Pagination>` 分頁功能。
2. **公開履歷與評價展示**：
   - 點擊任意案件中的接案者名稱，或直接造訪 `http://localhost:3001/users/[freelancer_user_id]`。
   - 頁面會展示該接案者的個人資訊、擁有的技能標籤，以及他在這 100 個案件中積累的 **已完成案件雙盲評價**（只有雙方都評價過才會顯示，符合平台雙盲隱私邏輯）。
3. **後台管理者介面**：
   - 管理員登入後訪問 `/admin/users` 或 `/admin/projects`，可以分頁瀏覽所有模擬帳號與 100 個案件，測試停用及審核流轉。
