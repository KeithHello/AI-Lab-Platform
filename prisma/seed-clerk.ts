import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// 手動加載 .env.local 檔案中的環境變數
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim();
        const cleanVal = val.replace(/^["']|["']$/g, '');
        process.env[key] = cleanVal;
      }
    });
  }
}

loadEnv();

const prisma = new PrismaClient();
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

const mockUsers = [
  // Admins
  ...Array.from({ length: 3 }, (_, i) => ({
    email: `admin_${i + 1}@example.com`,
    firstName: `管理員 ${i + 1}`,
    lastName: '(Admin)',
  })),
  // Clients
  ...Array.from({ length: 10 }, (_, i) => ({
    email: `client_${i + 1}@example.com`,
    firstName: `林發案 ${i + 1}`,
    lastName: '(Client)',
  })),
  // Freelancers
  ...Array.from({ length: 10 }, (_, i) => ({
    email: `freelancer_${i + 1}@example.com`,
    firstName: `陳接案 ${i + 1}`,
    lastName: '(Freelancer)',
  })),
];

const DEFAULT_PASSWORD = 'Password123!';

async function fetchClerk(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.clerk.com/v1${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Clerk API error (${response.status}): ${errText}`);
  }

  return response.json();
}

async function main() {
  console.log('Starting Clerk mock user seeding via raw REST API...');
  if (!CLERK_SECRET_KEY) {
    console.error('Error: CLERK_SECRET_KEY is not configured in .env.local');
    process.exit(1);
  }

  let successCount = 0;
  let skippedCount = 0;

  for (const item of mockUsers) {
    try {
      // 1. 檢查使用者在 DB 中是否存在
      const dbUser = await prisma.user.findUnique({
        where: { email: item.email },
      });

      if (!dbUser) {
        console.log(`⚠️ Database record for ${item.email} not found. Skipping.`);
        continue;
      }

      let clerkUserId = '';

      // 2. 檢查是否已存在於 Clerk 中
      const queryResult = await fetchClerk(`/users?email_address=${encodeURIComponent(item.email)}`);

      if (Array.isArray(queryResult) && queryResult.length > 0) {
        clerkUserId = queryResult[0].id;
        console.log(`ℹ️ User ${item.email} already exists in Clerk with ID: ${clerkUserId}`);
        skippedCount++;
      } else {
        // 3. 不存在則在 Clerk 中創建該使用者
        const createdUser = await fetchClerk('/users', {
          method: 'POST',
          body: JSON.stringify({
            email_address: [item.email],
            password: DEFAULT_PASSWORD,
            first_name: item.firstName,
            last_name: item.lastName,
            skip_password_checks: true,
          }),
        });
        clerkUserId = createdUser.id;
        console.log(`✨ Created user ${item.email} in Clerk with ID: ${clerkUserId}`);
        successCount++;
      }

      // 4. 更新 DB 中的 clerkId 映射
      if (dbUser.clerkId !== clerkUserId) {
        await prisma.user.update({
          where: { email: item.email },
          data: { clerkId: clerkUserId },
        });
        console.log(`🔗 Updated clerkId mapping for ${item.email} in DB.`);
      }
    } catch (error) {
      console.error(`❌ Error seeding user ${item.email}:`, error);
    }
  }

  console.log('\nClerk seeding completed successfully!');
  console.log(`- Created in Clerk: ${successCount}`);
  console.log(`- Already existed (Skipped creation): ${skippedCount}`);
  console.log(`- Database records mapped successfully.`);
  console.log(`\n🔑 測試登入密碼均為: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('Error running Clerk seeding script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
