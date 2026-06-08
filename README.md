# Freelancer Platform MVP

這是一個以 `Next.js App Router`、`Prisma`、`PostgreSQL`、`Clerk` 和 `OpenAI API` 建構的接案平台 MVP。

它不只是「發布案件」的工具，而是把接案合作中常見的溝通、驗收、修改、回饋與爭議處理，整理成一條完整且可追蹤的工作流。

## 這個平台解決什麼問題

### 對發案方
- 案件需求常常寫得太簡略，導致接案者理解不一致
- 從申請、成果提交到驗收，缺少一個明確的判斷標準
- 修改要求與最終驗收容易流於訊息往來，難以追蹤
- 一旦發生爭議，缺少可管理的舉報與糾紛入口

### 對接案者
- 很難快速判斷一個案件是否值得申請
- 申請時不知道該如何寫出更有說服力的提案
- 提交成果後，常常不清楚對方是「已看到」還是「卡在哪裡」
- 驗收結果與合作回饋如果沒有結構化，會影響後續接案信任度

### 對平台管理者
- 需要一套後台機制來審核使用者、案件與內容
- 舉報與糾紛必須可集中管理，而不是散落在對話中
- 需要一些自動化流程，降低人工整理案件內容的成本

## 平台如何解決這些痛點

- 用 `Onboarding` 建立使用者角色、能力與技能標籤，讓平台知道他是發案方、接案者或兩者皆可
- 用結構化案件表單，把背景、交付成果、驗收標準拆開，避免需求只寫一句話
- 用 `AI 審核工作區` 幫助發案方整理案件內容，提升可讀性與可驗收性
- 用明確的案件狀態機制串起申請、提交、驗收、修改與完成
- 用通知系統把重要事件從聊天訊息中抽離出來
- 用舉報與糾紛模組，讓平台可以處理風險事件

## 主要功能

### 案件管理
- 建立、編輯、草稿儲存與發布案件
- 案件包含分類、技能標籤、預算、幣別、截止日期與保密需求
- 公開案件列表支援搜尋、篩選與分頁
- 案件卡片可顯示預算、截止日期、申請數、分類與狀態

### 申請與提案
- 接案者可以針對案件送出申請
- 申請內容包含自我介紹、執行方式、預計天數與作品連結
- 這能讓發案方更容易比較提案品質，而不是只看簡短訊息

### 成果提交與驗收
- 接案者可提交 Demo、GitHub、文件與其他檔案連結
- 發案方可直接通過驗收或要求修改
- 驗收完成後案件進入完成狀態，並可進行評價

### 評價與回饋
- 支援星等評價、文字回饋與是否願意再次合作
- 幫助建立合作紀錄與信任基礎

### AI 輔助提案與案件整理
- AI 會針對案件標題、背景、敘述、交付成果、驗收標準進行審核
- 會輸出整體分數、亮點、風險、逐欄建議與建議稿
- 可以直接把 AI 建議套回案件編輯區
- 支援草稿保存，避免編輯內容中斷

### 通知系統
- 申請收到
- 申請錄取 / 拒絕
- 成果提交
- 要求修改
- 案件完成
- 收到評價
- 案件取消

### 舉報與糾紛
- 使用者可以提交舉報與案件糾紛
- 管理員可在後台集中處理、駁回、解決或停用帳號

### 後台管理
- 使用者管理
- 案件管理
- 分類與技能標籤管理
- 公告管理
- 舉報管理
- 糾紛管理
- 設定管理

## 核心流程圖

### 1. 案件生命週期

```mermaid
flowchart LR
  A[建立草稿 DRAFT] --> B[發布案件 OPEN]
  B --> C[接案者申請]
  C --> D[選定合作對象 IN_PROGRESS]
  D --> E[接案者提交成果 SUBMITTED]
  E --> F{發案方驗收}
  F -->|通過| G[案件完成 COMPLETED]
  F -->|要求修改| H[修改要求 REVISION_REQUESTED]
  H --> E
  G --> I[雙方評價]
  B --> J[取消案件 CANCELLED]
  A --> K[後台停用 DISABLED]
```

### 2. 驗收機制

```mermaid
sequenceDiagram
  participant F as 發案方
  participant P as 平台
  participant W as 接案者

  W->>P: 提交成果（Demo / GitHub / 文件 / 檔案）
  P->>F: 顯示案件驗收頁
  F->>P: 選擇通過驗收
  P->>P: 將案件狀態改為 COMPLETED
  P->>W: 通知案件完成，可進入評價

  alt 驗收不通過
    F->>P: 提出修改要求
    P->>P: 將案件狀態改為 REVISION_REQUESTED
    P->>W: 通知修改內容
  end
```

### 3. AI 輔助提案 / 案件整理

```mermaid
flowchart TD
  A[使用者輸入案件資料] --> B[AI 審核工作區]
  B --> C[分析標題 / 背景 / 敘述 / 交付成果 / 驗收標準]
  C --> D[產生分數、亮點、風險與建議稿]
  D --> E[使用者逐欄修改]
  E --> F[一鍵套用 AI 建議]
  F --> G[保存草稿或返回案件表單]
```

## 技術棧

- `Next.js 14` App Router
- `React 18`
- `TypeScript`
- `Prisma ORM`
- `PostgreSQL`
- `Clerk`
- `OpenAI API`
- `Tailwind CSS`
- `Radix UI`
- `shadcn/ui`
- `Lucide React`
- `Vitest`

## 專案結構

```text
freelancer_platform_mvp/
├── actions/         # Server Actions：案件、申請、提交、評價、通知、舉報、糾紛、後台
├── app/             # Next.js App Router 頁面與 API routes
├── components/      # 可重用 UI 與頁面元件
├── hooks/           # React hooks
├── lib/             # Prisma、OpenAI、權限、驗證、通知與 AI 審核工具
├── prisma/          # Schema 與 seed 資料
├── types/           # 與 Prisma 對應的前端型別
└── __tests__/       # Vitest 測試
```

## 核心資料型別

- `User`
- `Category`
- `SkillTag`
- `Project`
- `Application`
- `Submission`
- `Review`
- `Notification`
- `Report`
- `Dispute`
- `Announcement`

## 案件狀態

- `DRAFT`
- `OPEN`
- `IN_PROGRESS`
- `SUBMITTED`
- `REVISION_REQUESTED`
- `COMPLETED`
- `CANCELLED`
- `DISABLED`

## 開發環境需求

- Node.js 18+
- PostgreSQL
- npm

## 安裝與啟動

### 1. 安裝套件

```bash
npm install
```

### 2. 設定環境變數

建立 `.env.local`，可參考 `.env.example`。

```env
DATABASE_URL="postgresql://username:password@host:port/database"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

OPENAI_API_KEY="sk-proj-..."
OPENAI_MODEL="gpt-4o-mini"
```

### 3. 初始化資料庫

```bash
npx prisma db push
npx prisma generate
```

### 4. 匯入種子資料

```bash
npx prisma db seed
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

預設會啟動在 `http://localhost:3000`

## 測試

```bash
npm run test
```

## 建置

```bash
npm run build
```

## 既有測試覆蓋

- currency
- permissions
- types
- validations

## 備註

- 專案內已有 Prisma seed 與 mock data，可用來快速建立開發環境。
- AI 輔助功能會呼叫 OpenAI API；若未設定 `OPENAI_API_KEY`，相關功能將無法使用。
- 後台功能目前已涵蓋使用者、案件、分類、技能標籤、公告、舉報、糾紛與設定等管理頁面。

