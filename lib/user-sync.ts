import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function syncCurrentClerkUser(clerkId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error('找不到登入帳號的 Email，請重新登入後再試一次');
  }

  const name = clerkUser?.fullName || email;
  const avatarUrl = clerkUser?.imageUrl ?? null;
  const existingByClerkId = await prisma.user.findUnique({ where: { clerkId } });

  if (existingByClerkId) {
    const emailBelongsToAnotherUser = await prisma.user.findUnique({ where: { email } });
    const isDevSwitchedMockUser =
      process.env.NODE_ENV === 'development' &&
      existingByClerkId.email !== email &&
      emailBelongsToAnotherUser &&
      emailBelongsToAnotherUser.id !== existingByClerkId.id;

    if (isDevSwitchedMockUser) {
      return existingByClerkId;
    }

    return prisma.user.update({
      where: { id: existingByClerkId.id },
      data: {
        email,
        name: existingByClerkId.name || name,
        avatarUrl,
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId,
        name: existingByEmail.name || name,
        avatarUrl,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      avatarUrl,
    },
  });
}
