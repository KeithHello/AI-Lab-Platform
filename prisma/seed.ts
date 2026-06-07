import { PrismaClient, UserRole, UserStatus, ProjectStatus, Currency, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// 專案模板池，用來產生 100 個逼真的案件
const projectTemplates = [
  {
    categoryName: '網站開發',
    templates: [
      {
        title: '響應式電商網站前端開發',
        background: '我們是一家傳統的零售品牌，需要將線下銷售轉移至線上。',
        description: '開發一個響應式的電商網站前端，包含商品列表、購物車、結帳流程及會員中心。',
        deliverables: 'React/Next.js 前端原始碼、響應式測試報告、部署文件',
        acceptanceCriteria: '1. 所有主流行動裝置與瀏覽器皆能正常顯示\n2. 購物流程流暢無錯誤\n3. 載入速度符合優良標準',
        minBudget: 60000,
        maxBudget: 150000,
        skills: ['React', 'Next.js', 'TypeScript', 'HTML/CSS'],
      },
      {
        title: 'SaaS 管理後台與 API 開發',
        background: '新創公司的核心服務需要一個數據統計後台供企業客戶使用。',
        description: '開發 SaaS 後台系統，整合權限控制（RBAC）、數據圖表展示、匯出 Excel 報表，以及與主系統 API 的串接。',
        deliverables: 'Node.js/Express 專案原始碼、RESTful API 文件、資料庫 migration 腳本',
        acceptanceCriteria: '1. 報表生成與匯出功能正確無誤\n2. API 回應時間小於 200ms\n3. 具備完整的身份驗證與授權機制',
        minBudget: 80000,
        maxBudget: 250000,
        skills: ['Node.js', 'TypeScript', 'API 開發', 'SQL'],
      },
      {
        title: 'WordPress 品牌形象官網架設',
        background: '一家新型態的設計事務所需要精美的官網來展示過往的作品集。',
        description: '使用 WordPress 架設形象官網，套用客製化版型，優化 SEO 表現與頁面載入速度。',
        deliverables: 'WordPress 備份檔（包含資料庫）、客製化 Theme 原始碼、SEO 設定報告',
        acceptanceCriteria: '1. 具備後台編輯器供非技術人員更新內容\n2. 行動端完全相容\n3. PageSpeed score 達 85 分以上',
        minBudget: 20000,
        maxBudget: 50000,
        skills: ['WordPress', 'HTML/CSS', 'PHP', 'JavaScript'],
      },
    ],
  },
  {
    categoryName: 'App 開發',
    templates: [
      {
        title: '美食外送平台 App (Flutter)',
        background: '本地外送餐飲聯盟計畫推出專屬的雙平台手機 App，提升用戶下單體驗。',
        description: '使用 Flutter 開發跨平台 App，包含定位與地圖導航、即時推播、購物車及藍牙列印發票功能。',
        deliverables: 'Flutter 專案原始碼、iOS/Android 測試包、第三方套件清單與架構說明書',
        acceptanceCriteria: '1. 能夠在 iOS 與 Android 上順暢執行\n2. 地圖定位精準度符合規格\n3. 整合 Clerk / Firebase Auth 行動端登入',
        minBudget: 120000,
        maxBudget: 350000,
        skills: ['Flutter', 'React Native', 'API 開發', 'TypeScript'],
      },
      {
        title: '智慧家居物聯網控制 iOS App',
        background: '物聯網新創硬體廠牌開發出新一代智慧插座與燈具，需要專屬 iOS App。',
        description: '開發原生 iOS App，利用 CoreBluetooth 進行設備配對，並以 WebSocket 進行即時狀態更新。',
        deliverables: 'Swift 原生原始碼、TestFlight 測試邀請、BLE 協議對接文檔',
        acceptanceCriteria: '1. 設備配對成功率達 95% 以上\n2. 設備狀態開關延遲小於 100ms\n3. 通過 App Store 審核標準',
        minBudget: 100000,
        maxBudget: 300000,
        skills: ['iOS', 'Swift', 'API 開發'],
      },
    ],
  },
  {
    categoryName: '設計',
    templates: [
      {
        title: '新創 Fintech 平台 UI/UX 設計',
        background: '我們即將推出一款記帳與理財工具 App，需要設計出吸引年輕人且好上手的介面。',
        description: '設計完整的 App 介面，包括 Wireframe、Mockup、互動 Prototype，並建立 Design System 元件庫。',
        deliverables: 'Figma 專案連結、互動 Prototype、切圖資源與設計規範文件',
        acceptanceCriteria: '1. UI 設計風格符合現代、簡潔的 Fintech 調性\n2. 提供完整的 UX 易用性流程測試報告\n3. 規格標註清晰，工程師可直接開發',
        minBudget: 40000,
        maxBudget: 120000,
        skills: ['UI/UX', 'Figma', '平面設計'],
      },
      {
        title: '3D 智慧音響產品建模與宣傳渲染',
        background: '公司研發的藍牙智慧喇叭即將上市，需要高品質的 3D 產品渲染圖做為宣傳海報及官網背景。',
        description: '依據提供的 2D CAD 圖面進行 3D 建模，調整材質與燈光，渲染出多視角、多配色的高品質去背圖。',
        deliverables: 'Blender/C4D 模型檔、5 張 4K 高解析度宣傳渲染圖、動態旋轉展示短片',
        acceptanceCriteria: '1. 模型細節及尺寸比例需 100% 精準\n2. 材質表現（金屬與塑料網格）逼真度高\n3. 渲染圖解析度符合大圖輸出規格',
        minBudget: 25000,
        maxBudget: 70000,
        skills: ['3D 設計', '平面設計', 'Figma'],
      },
    ],
  },
  {
    categoryName: '文案',
    templates: [
      {
        title: '技術產品白皮書及 SEO 內容寫作',
        background: '為推廣我們的雲端雲監控服務，需要撰寫吸引架構師的技術型白皮書。',
        description: '撰寫 5000 字的雲端高可用架構白皮書，並製作 3 篇相關的部落格 SEO 推廣文章。',
        deliverables: '技術白皮書 PDF/Word 檔、SEO 文章 markdown 檔、關鍵字佈局規劃報告',
        acceptanceCriteria: '1. 文字流暢、技術術語準確無誤\n2. 關鍵字自然嵌入，SEO 分數達標\n3. 原創度 95% 以上，無抄襲疑慮',
        minBudget: 10000,
        maxBudget: 35000,
        skills: ['中文寫作', '技術文件', 'SEO 文案'],
      },
      {
        title: '英文電子商務網站繁體中文在地化翻譯',
        background: '歐美知名服飾電商準備開拓台灣市場，需要將現有的官網與產品說明翻譯為在地化的中文。',
        description: '翻譯 300 項主力商品的詳細描述、網站常用介面字串、及交易條款聲明。',
        deliverables: '中英對照 Excel 表格、介面字串 JSON 檔',
        acceptanceCriteria: '1. 語氣符合台灣消費者購物習慣，避免生硬直譯\n2. 技術名詞與規格正確對應\n3. 介面字串長度限制符合前端開發規格',
        minBudget: 15000,
        maxBudget: 45000,
        skills: ['英文寫作', '翻譯', '中文寫作'],
      },
    ],
  },
  {
    categoryName: '行銷',
    templates: [
      {
        title: '電商年終慶 Facebook & Google 廣告投放專案',
        background: '年終促銷檔期即將到來，需要專業廣告優化師進行行銷預算操作，提升 ROAS。',
        description: '制定為期一個月的廣告策略，包含素材文案撰寫建議、受眾精準規劃、每日預算監控與雙平台廣告代操。',
        deliverables: '廣告投放規劃書、每週成效優化報告、結案成效分析與建議簡報',
        acceptanceCriteria: '1. 平均 ROAS 達到 3.5 以上\n2. 每日廣告花費在預算範圍內\n3. 至少建立 A/B 測試 3 組以上進行優化',
        minBudget: 20000,
        maxBudget: 60000,
        skills: ['廣告投放', 'SEO', '社群媒體', '電子商務'],
      },
    ],
  },
  {
    categoryName: '資料分析',
    templates: [
      {
        title: '零售銷售數據分析與 Python 視覺化看板',
        background: '實體超市欲導入數據化營運，需彙整過去三年的銷售明細以發掘潛在的交叉銷售機會。',
        description: '使用 Python (Pandas/Plotly) 進行數據清洗，分析熱銷組合與顧客流失率，並搭建即時的 Streamlit 看板。',
        deliverables: 'Python 原始碼 (Jupyter Notebook)、資料分析洞察報告、看板伺服器架設文件',
        acceptanceCriteria: '1. 看板能流暢加載百萬筆測試數據\n2. 圖表互動功能正常\n3. 分析結論具備商業決策的具體指引',
        minBudget: 30000,
        maxBudget: 90000,
        skills: ['Python', '數據視覺化', '機器學習', 'SQL'],
      },
    ],
  },
];

async function main() {
  console.log('Starting custom data seeding...');

  // 1. 取得或創建分類 (Categories)
  const categoriesMap: Record<string, any> = {};
  const categories = [
    { name: '網站開發', description: '各類網站與 Web 應用開發', sortOrder: 1 },
    { name: 'App 開發', description: '行動應用程式開發', sortOrder: 2 },
    { name: '設計', description: '視覺與 UI/UX 設計', sortOrder: 3 },
    { name: '文案', description: '各類文字內容創作', sortOrder: 4 },
    { name: '行銷', description: '數位行銷與推廣', sortOrder: 5 },
    { name: '資料分析', description: '數據處理與分析', sortOrder: 6 },
  ];

  for (const cat of categories) {
    const upserted = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoriesMap[cat.name] = upserted;
  }

  // 2. 取得或創建技能標籤 (Skill Tags)
  const skillTagsMap: Record<string, any> = {};
  const skillTags = [
    { name: 'React', categoryName: '網站開發' },
    { name: 'Vue', categoryName: '網站開發' },
    { name: 'Angular', categoryName: '網站開發' },
    { name: 'Next.js', categoryName: '網站開發' },
    { name: 'Node.js', categoryName: '網站開發' },
    { name: 'TypeScript', categoryName: '網站開發' },
    { name: 'JavaScript', categoryName: '網站開發' },
    { name: 'HTML/CSS', categoryName: '網站開發' },
    { name: 'PHP', categoryName: '網站開發' },
    { name: 'Laravel', categoryName: '網站開發' },
    { name: 'Django', categoryName: '網站開發' },
    { name: 'WordPress', categoryName: '網站開發' },
    { name: 'API 開發', categoryName: '網站開發' },
    { name: 'iOS', categoryName: 'App 開發' },
    { name: 'Android', categoryName: 'App 開發' },
    { name: 'Flutter', categoryName: 'App 開發' },
    { name: 'React Native', categoryName: 'App 開發' },
    { name: 'Swift', categoryName: 'App 開發' },
    { name: 'Kotlin', categoryName: 'App 開發' },
    { name: 'App Store 上架', categoryName: 'App 開發' },
    { name: 'UI/UX', categoryName: '設計' },
    { name: 'Figma', categoryName: '設計' },
    { name: '平面設計', categoryName: '設計' },
    { name: 'Logo 設計', categoryName: '設計' },
    { name: '插畫', categoryName: '設計' },
    { name: '3D 設計', categoryName: '設計' },
    { name: '影片剪輯', categoryName: '設計' },
    { name: '中文寫作', categoryName: '文案' },
    { name: '英文寫作', categoryName: '文案' },
    { name: '技術文件', categoryName: '文案' },
    { name: '翻譯', categoryName: '文案' },
    { name: 'SEO 文案', categoryName: '文案' },
    { name: 'SEO', categoryName: '行銷' },
    { name: '社群媒體', categoryName: '行銷' },
    { name: '廣告投放', categoryName: '行銷' },
    { name: '內容行銷', categoryName: '行銷' },
    { name: '電子商務', categoryName: '行銷' },
    { name: 'Python', categoryName: '資料分析' },
    { name: '數據視覺化', categoryName: '資料分析' },
    { name: '機器學習', categoryName: '資料分析' },
    { name: 'SQL', categoryName: '資料分析' },
  ];

  for (const tag of skillTags) {
    const cat = categoriesMap[tag.categoryName];
    const upserted = await prisma.skillTag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name, categoryId: cat.id },
    });
    skillTagsMap[tag.name] = upserted;
  }

  // 3. 取得或創建審核設定
  await prisma.reviewSetting.upsert({
    where: { reviewType: 'USER_ONBOARDING' },
    update: {},
    create: { reviewType: 'USER_ONBOARDING', isEnabled: false },
  });
  await prisma.reviewSetting.upsert({
    where: { reviewType: 'PROJECT_PUBLISH' },
    update: {},
    create: { reviewType: 'PROJECT_PUBLISH', isEnabled: false },
  });

  // 4. 建立 10 個發案方 (Clients)
  const clientUsers = [];
  for (let i = 1; i <= 10; i++) {
    const client = await prisma.user.upsert({
      where: { clerkId: `mock_client_${i}` },
      update: {},
      create: {
        clerkId: `mock_client_${i}`,
        email: `client_${i}@example.com`,
        name: `林發案 ${i} (Client)`,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=client_${i}`,
        bio: `我是第 ${i} 位註冊的發案方，主要尋求技術與設計外包。`,
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        isAdmin: false,
        onboardingCompleted: true,
      },
    });
    clientUsers.push(client);
  }

  // 5. 建立 10 個接案者 (Freelancers)
  const freelancerUsers = [];
  const skillTagsList = Object.values(skillTagsMap);
  for (let i = 1; i <= 10; i++) {
    const freelancer = await prisma.user.upsert({
      where: { clerkId: `mock_freelancer_${i}` },
      update: {},
      create: {
        clerkId: `mock_freelancer_${i}`,
        email: `freelancer_${i}@example.com`,
        name: `陳接案 ${i} (Freelancer)`,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=freelancer_${i}`,
        bio: `我是第 ${i} 位接案專家。精通我所屬分類之各項核心技術，具備優秀的交付品質與準時合約完成率。`,
        role: UserRole.FREELANCER,
        status: UserStatus.ACTIVE,
        isAdmin: false,
        onboardingCompleted: true,
      },
    });
    freelancerUsers.push(freelancer);

    // 為接案者綁定 3 到 5 個隨機技能標籤
    const numSkills = Math.floor(Math.random() * 3) + 3; // 3~5
    const shuffledSkills = [...skillTagsList].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, numSkills);

    for (const skill of selectedSkills) {
      await prisma.userSkill.upsert({
        where: { userId_skillTagId: { userId: freelancer.id, skillTagId: skill.id } },
        update: {},
        create: { userId: freelancer.id, skillTagId: skill.id },
      });
    }
  }

  // 6. 建立 3 個平台管理者 (Admins)
  const adminUsers = [];
  for (let i = 1; i <= 3; i++) {
    const admin = await prisma.user.upsert({
      where: { clerkId: `mock_admin_${i}` },
      update: {},
      create: {
        clerkId: `mock_admin_${i}`,
        email: `admin_${i}@example.com`,
        name: `管理員 ${i} (Admin)`,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=admin_${i}`,
        bio: `系統管理員編號 ${i}。負責全平台案件品質把關、申訴案件覆核與帳號權限管理。`,
        role: UserRole.BOTH,
        status: UserStatus.ACTIVE,
        isAdmin: true,
        onboardingCompleted: true,
      },
    });
    adminUsers.push(admin);
  }

  // 7. 建立 100 個案件 (Projects)
  console.log('Generating 100 projects with detailed variations...');

  const statuses = [
    { status: ProjectStatus.DRAFT, weight: 10 },
    { status: ProjectStatus.OPEN, weight: 40 },
    { status: ProjectStatus.IN_PROGRESS, weight: 20 },
    { status: ProjectStatus.SUBMITTED, weight: 10 },
    { status: ProjectStatus.REVISION_REQUESTED, weight: 10 },
    { status: ProjectStatus.COMPLETED, weight: 8 },
    { status: ProjectStatus.CANCELLED, weight: 2 },
  ];

  // 打散狀態池以模擬隨機分佈
  const statusPool: ProjectStatus[] = [];
  for (const s of statuses) {
    for (let k = 0; k < s.weight; k++) {
      statusPool.push(s.status);
    }
  }
  // 洗牌 statusPool
  statusPool.sort(() => 0.5 - Math.random());

  let projectCounter = 0;

  for (let i = 0; i < 100; i++) {
    const client = clientUsers[i % clientUsers.length];
    const status = statusPool[i];

    // 隨機挑選分類模板分類
    const categoryTemplates = projectTemplates[i % projectTemplates.length];
    const catObj = categoriesMap[categoryTemplates.categoryName];

    // 隨機挑選該分類下的一個模板
    const tplIdx = Math.floor(Math.random() * categoryTemplates.templates.length);
    const tpl = categoryTemplates.templates[tplIdx];

    // 隨機計算預算與截止期限
    const budgetVal = Math.floor(Math.random() * (tpl.maxBudget - tpl.minBudget + 1)) + tpl.minBudget;
    const deadlineDays = Math.floor(Math.random() * 90) + 15; // 15 to 105 天後
    const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

    // 決定接案者
    let freelancerId: string | null = null;
    if (
      status === ProjectStatus.IN_PROGRESS ||
      status === ProjectStatus.SUBMITTED ||
      status === ProjectStatus.REVISION_REQUESTED ||
      status === ProjectStatus.COMPLETED
    ) {
      const freelancer = freelancerUsers[(i + 3) % freelancerUsers.length];
      freelancerId = freelancer.id;
    }

    // 創建案件
    const project = await prisma.project.create({
      data: {
        title: `${tpl.title} (No. ${i + 1})`,
        categoryId: catObj.id,
        background: tpl.background,
        description: `${tpl.description}。此案為平台產出之模擬接案資料，主要用於驗收排版及功能完整性。`,
        deliverables: tpl.deliverables,
        acceptanceCriteria: tpl.acceptanceCriteria,
        budget: budgetVal,
        currency: i % 15 === 0 ? Currency.USD : Currency.TWD, // 部分使用美金以擴大覆蓋範圍
        deadline,
        status,
        clientId: client.id,
        selectedFreelancerId: freelancerId,
        confidentialityRequired: i % 7 === 0,
        isApproved: true,
        createdAt: new Date(Date.now() - (100 - i) * 6 * 60 * 60 * 1000), // 時間遞增排列
      },
    });

    // 綁定案件技能
    for (const skillName of tpl.skills) {
      const tag = skillTagsMap[skillName];
      if (tag) {
        await prisma.projectSkill.create({
          data: {
            projectId: project.id,
            skillTagId: tag.id,
          },
        });
      }
    }

    // 若有指定的接案者，補上對應的 Application、Submission 與評價
    if (freelancerId) {
      // 創建已接受的申請
      await prisma.application.create({
        data: {
          projectId: project.id,
          freelancerId,
          description: '我有豐富的相關開發經驗，看過您的背景描述後非常感興趣，希望能與您合作！',
          approach: '我預計會先在 Figma 上對齊 UI Flow，接著使用 Next.js/Flutter 進行切版與串接 RESTful APIs。',
          estimatedDays: Math.floor(Math.random() * 20) + 10,
          status: ApplicationStatus.ACCEPTED,
        },
      });

      // 隨機增加 1~2 個未被錄取的申請者做襯托
      const otherFreelancers = freelancerUsers.filter((f) => f.id !== freelancerId);
      const otherFree = otherFreelancers[i % otherFreelancers.length];
      await prisma.application.create({
        data: {
          projectId: project.id,
          freelancerId: otherFree.id,
          description: '您好，我有超過五年的相關經驗，希望能聊聊合作細節。',
          approach: '採用標準敏捷開發流程，每週回報進度。',
          estimatedDays: Math.floor(Math.random() * 15) + 15,
          status: ApplicationStatus.REJECTED,
        },
      });
    } else if (status === ProjectStatus.OPEN) {
      // 開放申請中的案件隨機放入 1~3 個 Pending 申請案
      const numApplicants = (i % 3) + 1; // 1~3 applicants
      const shuffledFreelancers = [...freelancerUsers].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numApplicants; j++) {
        const applicant = shuffledFreelancers[j];
        await prisma.application.create({
          data: {
            projectId: project.id,
            freelancerId: applicant.id,
            description: `您好，我是 ${applicant.name}。這份工作非常適合我的技能，希望能獲得此機會。`,
            approach: '提供全天候的在線支持與最快速度開發。',
            estimatedDays: 14 + j * 3,
            status: ApplicationStatus.PENDING,
          },
        });
      }
    }

    // 若已提交或已完成，創建 Submission
    if (
      status === ProjectStatus.SUBMITTED ||
      status === ProjectStatus.REVISION_REQUESTED ||
      status === ProjectStatus.COMPLETED
    ) {
      await prisma.submission.create({
        data: {
          projectId: project.id,
          freelancerId: freelancerId!,
          description: '所有交付物已全部上傳且完成自我功能測試，請發案方進行驗收，謝謝！',
          demoUrl: 'https://demo-freelancer-platform.vercel.app',
          githubUrl: 'https://github.com/KeithHello/freelancer-platform-demo-submission',
          fileUrls: 'https://example.com/downloads/submission-bundle.zip',
        },
      });
    }

    // 若已完成，創建雙盲 Review (給予雙向評價)
    if (status === ProjectStatus.COMPLETED) {
      // 1. 發案方給接案者的評價
      await prisma.review.create({
        data: {
          projectId: project.id,
          reviewerId: client.id,
          revieweeId: freelancerId!,
          rating: 4 + (i % 2), // 4 或 5 星
          comment: '合作過程愉快，溝通順暢，產出物精細且完全符合驗收標準！推薦此接案方！',
          wouldCollaborateAgain: true,
        },
      });

      // 2. 接案者給發案方的評價
      await prisma.review.create({
        data: {
          projectId: project.id,
          reviewerId: freelancerId!,
          revieweeId: client.id,
          rating: 5,
          comment: '發案方的需求文件描述非常明確，回覆訊息即時，付款爽快，非常開心的合作經驗！',
          wouldCollaborateAgain: true,
        },
      });
    }

    projectCounter++;
  }

  console.log('Seed execution completed successfully!');
  console.log(`- Created/Verified ${categories.length} Categories`);
  console.log(`- Created/Verified ${skillTags.length} Skill Tags`);
  console.log(`- Created/Verified ${clientUsers.length} Clients (發案方)`);
  console.log(`- Created/Verified ${freelancerUsers.length} Freelancers (接案者)`);
  console.log(`- Created/Verified ${adminUsers.length} Platform Admins (平台管理員)`);
  console.log(`- Created ${projectCounter} Projects (案件) with custom workflow relational records.`);
}

main()
  .catch((e) => {
    console.error('Error during data seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
