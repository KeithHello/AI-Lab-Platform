# 接案平台 MVP (Freelancer Platform MVP)

這是一個基於 **Next.js (App Router)**、**Prisma ORM** 與 **PostgreSQL (Supabase)** 構建的高效接案媒合平台 MVP。平台旨在提供一個安全、透明的交易閉環，涵蓋從案件發布、媒合、成果提交、雙盲評價到後台管理的完整流程，並整合了 GPT-5.4 作為 AI 輔助審核工具。

---

## 🚀 技術棧 (Tech Stack)

* **核心框架**: Next.js 14 (App Router, React 18)
* **資料庫 ORM**: Prisma Client & Migrate
* **資料庫服務**: PostgreSQL (搭配 Supabase 連結池)
* **身份驗證與安全**: Clerk Auth
* **樣式與 UI 元件**: Tailwind CSS, Radix UI, Lucide Icons, Shadcn UI
* **AI 審核技術**: OpenAI GPT-5.4 REST API
* **單元與整合測試**: Vitest
* **程式碼檢查與格式化**: ESLint, TypeScript Type Checker

---

## 🌟 核心功能特性

### 1. AI 輔助審核 (REQ-25)
* 整合 OpenAI GPT-5.4。當發案方填寫案件描述時，可一鍵點擊「AI 輔助審核」獲取描述的完整性、清晰度打分及具體的優化建議。
* 當 `OPENAI_API_KEY` 未設置時，系統會自動流暢降級（Fallback）為基於關鍵字的本地離線規則審核。

### 2. 使用者個人公開頁面 (REQ-20)
* 每位發案方與接案者均擁有專屬的公開個人頁面（`/users/[userId]`），展示基本簡介、專業技能標籤。
* 展示**雙盲評價歷史**：僅在發案方與接案者雙方皆完成評價後，該案評價內容與星級才會公開展示，保護交易隱私。

### 3. 案件收藏與追蹤 (REQ-21)
* 接案者可以在首頁或案件詳情頁面一鍵點擊收藏案件（Bookmark）。
* 收藏狀態即時 toggle，且已收藏的案件會在使用者 Dashboard 的「我的收藏」區塊中集中展示，便於快速追蹤。

### 4. 進階搜尋與篩選 (REQ-23)
* 前台案件列表支持複雜篩選條件：
  * 預算區間篩選（最小金額與最大金額）
  * 截止日期區間篩選（起訖日期限制）
  * 彈性排序：最新發布、預算由高到低、截止日期最近

### 5. 全站系統分頁 (REQ-24)
* 開發了高度可複用的通用 `<Pagination>` 元件。
* 已應用於**前台案件列表頁面**以及**管理員後台**的「使用者管理頁面」與「案件管理頁面」，採用資料庫層級的 Server-side Skip/Take 查詢，性能優異。

### 6. 站內通知系統 (REQ-22)
* 全站核心業務事件均會觸發站內通知：
  * 接案者申請案件 ➔ 發案方收到通知
  * 發案方錄用接案者 ➔ 接案者收到通知
  * 接案者提交成果 ➔ 發案方收到通知
  * 發案方退回要求修改 ➔ 接案者收到通知
  * 驗收完成/專案結束 ➔ 雙方收到通知
* 頂部 Navbar 整合了通知鈴鐺與未讀計數 Badges，點擊即可展開下拉面板查閱通知，並支持標記單筆或全部已讀。

---

## 📂 專案目錄結構

```text
freelancer_platform_mvp/
├── actions/                  # Next.js Server Actions (業務邏輯與資料庫操作)
│   ├── admin.actions.ts      # 管理後台操作 (停用/啟用、審核、分頁查詢)
│   ├── ai-review.actions.ts  # GPT-5.4 案件審核邏輯
│   ├── bookmark.actions.ts   # 案件收藏 toggle
│   └── notification.actions.ts# 站內通知獲取與狀態標記
├── app/                      # App Router 路由頁面
│   ├── (auth)/               # 需登入之路由群組 (Dashboard, Onboarding, Admin)
│   ├── (public)/             # 免登入公開路由群組 (Projects, Users)
│   └── api/                  # API 路由 (如 Clerk Webhooks)
├── components/               # UI 與 Layout 元件
│   ├── admin/                # 管理後台專用表格與排版
│   ├── layout/               # Navbar (含通知鈴鐺), Footer
│   ├── project/              # 案件卡片、搜尋列、篩選器、收藏按鈕
│   ├── ui/                   # 通用底層 UI 元件 (Shadcn UI, Pagination)
│   └── user/                 # 個人公開履歷卡片
├── hooks/                    # 客製化 React Hooks (包含 useFilterParams)
├── lib/                      # 全域共用工具與客戶端配置 (Prisma, OpenAI)
├── prisma/                   # 資料庫 Schema 與 Seed 腳本
└── __tests__/                # 單元與整合測試用例 (Vitest)
```

---

## 🛠 本地開發設定與運行步驟

### 1. 安裝依賴
請在專案根目錄執行：
```bash
npm install
```

### 2. 環境變數配置 (.env)
在專案根目錄下創建 `.env` 與 `.env.local` 檔案，配置以下關鍵變數（請參考 `.env.example`）：
```env
# 資料庫連線
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk 驗證配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# OpenAI API 金鑰 (用於 GPT-5.4 審核)
OPENAI_API_KEY="sk-proj-..."
```

### 3. 資料庫結構推送與客戶端生成
執行以下指令將 Prisma Schema 同步至 PostgreSQL 並生成 TypeScript 型別客戶端：
```bash
npx prisma db push
npx prisma generate
```

### 4. 數據庫 Seeding (導入 23 個用戶與 100 個專案)
執行 Prisma Seed 腳本以導入豐富的模擬測試數據（詳情請參考 `MOCK_DATA.md`）：
```bash
npx prisma db seed
```

### 5. 啟動開發伺服器
運行本地開發伺服器：
```bash
npm run dev
```
瀏覽器打開 **[http://localhost:3000](http://localhost:3000)** (若 3000 埠被佔用，請查看終端輸出的埠號，如 3001) 即可開始體驗平台。

### 6. 運行測試
執行專案的單元與整合測試：
```bash
npm run test
```
