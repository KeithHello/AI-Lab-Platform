import { describe, it, expect, vi, beforeEach } from 'vitest';

// We must mock before importing the module that uses them
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
  },
}));

import {
  validateStateTransition,
  PROJECT_STATE_GUARD,
  getCurrentUser,
  requireAdmin,
  requireProjectOwner,
  requireAssignedFreelancer,
} from '@/lib/permissions';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// ═══════════════════════════════════════════
// PROJECT_STATE_GUARD
// ═══════════════════════════════════════════
describe('PROJECT_STATE_GUARD', () => {
  it('defines allowed transitions for all states', () => {
    const states = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED', 'CANCELLED', 'DISABLED'];
    for (const state of states) {
      expect(PROJECT_STATE_GUARD).toHaveProperty(state);
      expect(Array.isArray(PROJECT_STATE_GUARD[state])).toBe(true);
    }
  });

  it('DRAFT allows OPEN and CANCELLED', () => {
    expect(PROJECT_STATE_GUARD['DRAFT']).toEqual(['OPEN', 'CANCELLED']);
  });

  it('OPEN allows IN_PROGRESS and CANCELLED', () => {
    expect(PROJECT_STATE_GUARD['OPEN']).toEqual(['IN_PROGRESS', 'CANCELLED']);
  });

  it('IN_PROGRESS allows SUBMITTED and CANCELLED', () => {
    expect(PROJECT_STATE_GUARD['IN_PROGRESS']).toEqual(['SUBMITTED', 'CANCELLED']);
  });

  it('SUBMITTED allows COMPLETED and REVISION_REQUESTED', () => {
    expect(PROJECT_STATE_GUARD['SUBMITTED']).toEqual(['COMPLETED', 'REVISION_REQUESTED']);
  });

  it('REVISION_REQUESTED allows SUBMITTED and CANCELLED', () => {
    expect(PROJECT_STATE_GUARD['REVISION_REQUESTED']).toEqual(['SUBMITTED', 'CANCELLED']);
  });

  it('COMPLETED allows no transitions', () => {
    expect(PROJECT_STATE_GUARD['COMPLETED']).toEqual([]);
  });

  it('CANCELLED allows no transitions', () => {
    expect(PROJECT_STATE_GUARD['CANCELLED']).toEqual([]);
  });

  it('DISABLED allows no transitions', () => {
    expect(PROJECT_STATE_GUARD['DISABLED']).toEqual([]);
  });
});

// ═══════════════════════════════════════════
// validateStateTransition
// ═══════════════════════════════════════════
describe('validateStateTransition', () => {
  // ── DRAFT transitions ──
  it('allows DRAFT → OPEN', () => {
    expect(validateStateTransition('DRAFT', 'OPEN', PROJECT_STATE_GUARD['DRAFT'].map(t => ['DRAFT', t] as [string, string]))).toBe(true);
  });

  it('allows DRAFT → CANCELLED', () => {
    expect(validateStateTransition('DRAFT', 'CANCELLED', PROJECT_STATE_GUARD['DRAFT'].map(t => ['DRAFT', t] as [string, string]))).toBe(true);
  });

  it('rejects DRAFT → IN_PROGRESS', () => {
    expect(validateStateTransition('DRAFT', 'IN_PROGRESS', PROJECT_STATE_GUARD['DRAFT'].map(t => ['DRAFT', t] as [string, string]))).toBe(false);
  });

  it('rejects DRAFT → COMPLETED', () => {
    expect(validateStateTransition('DRAFT', 'COMPLETED', PROJECT_STATE_GUARD['DRAFT'].map(t => ['DRAFT', t] as [string, string]))).toBe(false);
  });

  // ── OPEN transitions ──
  it('allows OPEN → IN_PROGRESS', () => {
    expect(validateStateTransition('OPEN', 'IN_PROGRESS', PROJECT_STATE_GUARD['OPEN'].map(t => ['OPEN', t] as [string, string]))).toBe(true);
  });

  it('allows OPEN → CANCELLED', () => {
    expect(validateStateTransition('OPEN', 'CANCELLED', PROJECT_STATE_GUARD['OPEN'].map(t => ['OPEN', t] as [string, string]))).toBe(true);
  });

  it('rejects OPEN → SUBMITTED', () => {
    expect(validateStateTransition('OPEN', 'SUBMITTED', PROJECT_STATE_GUARD['OPEN'].map(t => ['OPEN', t] as [string, string]))).toBe(false);
  });

  it('rejects OPEN → COMPLETED', () => {
    expect(validateStateTransition('OPEN', 'COMPLETED', PROJECT_STATE_GUARD['OPEN'].map(t => ['OPEN', t] as [string, string]))).toBe(false);
  });

  // ── IN_PROGRESS transitions ──
  it('allows IN_PROGRESS → SUBMITTED', () => {
    expect(validateStateTransition('IN_PROGRESS', 'SUBMITTED', PROJECT_STATE_GUARD['IN_PROGRESS'].map(t => ['IN_PROGRESS', t] as [string, string]))).toBe(true);
  });

  it('allows IN_PROGRESS → CANCELLED', () => {
    expect(validateStateTransition('IN_PROGRESS', 'CANCELLED', PROJECT_STATE_GUARD['IN_PROGRESS'].map(t => ['IN_PROGRESS', t] as [string, string]))).toBe(true);
  });

  it('rejects IN_PROGRESS → COMPLETED', () => {
    expect(validateStateTransition('IN_PROGRESS', 'COMPLETED', PROJECT_STATE_GUARD['IN_PROGRESS'].map(t => ['IN_PROGRESS', t] as [string, string]))).toBe(false);
  });

  // ── SUBMITTED transitions ──
  it('allows SUBMITTED → COMPLETED', () => {
    expect(validateStateTransition('SUBMITTED', 'COMPLETED', PROJECT_STATE_GUARD['SUBMITTED'].map(t => ['SUBMITTED', t] as [string, string]))).toBe(true);
  });

  it('allows SUBMITTED → REVISION_REQUESTED', () => {
    expect(validateStateTransition('SUBMITTED', 'REVISION_REQUESTED', PROJECT_STATE_GUARD['SUBMITTED'].map(t => ['SUBMITTED', t] as [string, string]))).toBe(true);
  });

  it('rejects SUBMITTED → CANCELLED', () => {
    expect(validateStateTransition('SUBMITTED', 'CANCELLED', PROJECT_STATE_GUARD['SUBMITTED'].map(t => ['SUBMITTED', t] as [string, string]))).toBe(false);
  });

  it('rejects SUBMITTED → DRAFT', () => {
    expect(validateStateTransition('SUBMITTED', 'DRAFT', PROJECT_STATE_GUARD['SUBMITTED'].map(t => ['SUBMITTED', t] as [string, string]))).toBe(false);
  });

  // ── REVISION_REQUESTED transitions ──
  it('allows REVISION_REQUESTED → SUBMITTED', () => {
    expect(validateStateTransition('REVISION_REQUESTED', 'SUBMITTED', PROJECT_STATE_GUARD['REVISION_REQUESTED'].map(t => ['REVISION_REQUESTED', t] as [string, string]))).toBe(true);
  });

  it('allows REVISION_REQUESTED → CANCELLED', () => {
    expect(validateStateTransition('REVISION_REQUESTED', 'CANCELLED', PROJECT_STATE_GUARD['REVISION_REQUESTED'].map(t => ['REVISION_REQUESTED', t] as [string, string]))).toBe(true);
  });

  it('rejects REVISION_REQUESTED → COMPLETED', () => {
    expect(validateStateTransition('REVISION_REQUESTED', 'COMPLETED', PROJECT_STATE_GUARD['REVISION_REQUESTED'].map(t => ['REVISION_REQUESTED', t] as [string, string]))).toBe(false);
  });

  // ── Terminal states ──
  it('rejects COMPLETED → anything', () => {
    const transitions = PROJECT_STATE_GUARD['COMPLETED'].map(t => ['COMPLETED', t] as [string, string]);
    expect(validateStateTransition('COMPLETED', 'DRAFT', transitions)).toBe(false);
    expect(validateStateTransition('COMPLETED', 'OPEN', transitions)).toBe(false);
    expect(validateStateTransition('COMPLETED', 'SUBMITTED', transitions)).toBe(false);
  });

  it('rejects CANCELLED → anything', () => {
    const transitions = PROJECT_STATE_GUARD['CANCELLED'].map(t => ['CANCELLED', t] as [string, string]);
    expect(validateStateTransition('CANCELLED', 'DRAFT', transitions)).toBe(false);
    expect(validateStateTransition('CANCELLED', 'OPEN', transitions)).toBe(false);
    expect(validateStateTransition('CANCELLED', 'SUBMITTED', transitions)).toBe(false);
  });

  it('rejects DISABLED → anything', () => {
    const transitions = PROJECT_STATE_GUARD['DISABLED'].map(t => ['DISABLED', t] as [string, string]);
    expect(validateStateTransition('DISABLED', 'DRAFT', transitions)).toBe(false);
    expect(validateStateTransition('DISABLED', 'OPEN', transitions)).toBe(false);
  });

  // ── Full workflow: validate all valid transitions using the actual guard ──
  it('validates the complete happy path workflow using actual guard', () => {
    const allTransitions: [string, string][] = [];
    for (const [from, toList] of Object.entries(PROJECT_STATE_GUARD)) {
      for (const to of toList) {
        allTransitions.push([from, to]);
      }
    }

    expect(validateStateTransition('DRAFT', 'OPEN', allTransitions)).toBe(true);
    expect(validateStateTransition('OPEN', 'IN_PROGRESS', allTransitions)).toBe(true);
    expect(validateStateTransition('IN_PROGRESS', 'SUBMITTED', allTransitions)).toBe(true);
    expect(validateStateTransition('SUBMITTED', 'COMPLETED', allTransitions)).toBe(true);
  });

  it('validates the revision path', () => {
    const allTransitions: [string, string][] = [];
    for (const [from, toList] of Object.entries(PROJECT_STATE_GUARD)) {
      for (const to of toList) {
        allTransitions.push([from, to]);
      }
    }

    expect(validateStateTransition('SUBMITTED', 'REVISION_REQUESTED', allTransitions)).toBe(true);
    expect(validateStateTransition('REVISION_REQUESTED', 'SUBMITTED', allTransitions)).toBe(true);
  });

  it('validates the cancellation path', () => {
    const allTransitions: [string, string][] = [];
    for (const [from, toList] of Object.entries(PROJECT_STATE_GUARD)) {
      for (const to of toList) {
        allTransitions.push([from, to]);
      }
    }

    expect(validateStateTransition('DRAFT', 'CANCELLED', allTransitions)).toBe(true);
    expect(validateStateTransition('OPEN', 'CANCELLED', allTransitions)).toBe(true);
    expect(validateStateTransition('IN_PROGRESS', 'CANCELLED', allTransitions)).toBe(true);
    expect(validateStateTransition('REVISION_REQUESTED', 'CANCELLED', allTransitions)).toBe(true);
  });

  // ── Edge cases ──
  it('returns false for non-existent states', () => {
    expect(validateStateTransition('NON_EXISTENT', 'OPEN', [['DRAFT', 'OPEN']])).toBe(false);
  });

  it('returns false for empty transitions array', () => {
    expect(validateStateTransition('DRAFT', 'OPEN', [])).toBe(false);
  });
});

// ═══════════════════════════════════════════
// getCurrentUser
// ═══════════════════════════════════════════
describe('getCurrentUser', () => {
  const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
  const mockFindUnique = (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when authenticated and active', async () => {
    const mockUser = { id: 'user1', clerkId: 'clerk1', status: 'ACTIVE', isAdmin: false };
    mockAuth.mockReturnValue({ userId: 'clerk1', protect: () => ({ userId: 'clerk1' }) });
    mockFindUnique.mockResolvedValue(mockUser);

    const user = await getCurrentUser();
    expect(user).toEqual(mockUser);
  });

  it('throws when user not found in DB', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk1', protect: () => ({ userId: 'clerk1' }) });
    mockFindUnique.mockResolvedValue(null);

    await expect(getCurrentUser()).rejects.toThrow('使用者不存在或已被停用');
  });

  it('throws when user is DISABLED', async () => {
    const mockUser = { id: 'user1', clerkId: 'clerk1', status: 'DISABLED', isAdmin: false };
    mockAuth.mockReturnValue({ userId: 'clerk1', protect: () => ({ userId: 'clerk1' }) });
    mockFindUnique.mockResolvedValue(mockUser);

    await expect(getCurrentUser()).rejects.toThrow('使用者不存在或已被停用');
  });
});

// ═══════════════════════════════════════════
// requireAdmin
// ═══════════════════════════════════════════
describe('requireAdmin', () => {
  const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
  const mockFindUnique = (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns admin user', async () => {
    const mockUser = { id: 'admin1', clerkId: 'clerk1', status: 'ACTIVE', isAdmin: true };
    mockAuth.mockReturnValue({ userId: 'clerk1', protect: () => ({ userId: 'clerk1' }) });
    mockFindUnique.mockResolvedValue(mockUser);

    const user = await requireAdmin();
    expect(user).toEqual(mockUser);
  });

  it('throws when user is not admin', async () => {
    const mockUser = { id: 'user1', clerkId: 'clerk1', status: 'ACTIVE', isAdmin: false };
    mockAuth.mockReturnValue({ userId: 'clerk1', protect: () => ({ userId: 'clerk1' }) });
    mockFindUnique.mockResolvedValue(mockUser);

    await expect(requireAdmin()).rejects.toThrow('需要管理員權限');
  });
});

// ═══════════════════════════════════════════
// requireProjectOwner
// ═══════════════════════════════════════════
describe('requireProjectOwner', () => {
  const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
  const mockFindUniqueUser = (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>);
  const mockFindUniqueProject = (prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user and project when user is owner', async () => {
    const mockUser = { id: 'client1', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    const mockProject = { id: 'proj1', clientId: 'client1' };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });

    // We need to handle two findUnique calls: one for user, one for project
    mockFindUniqueUser.mockResolvedValueOnce(mockUser);
    // prisma.project.findUnique
    const spy = vi.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(mockProject as never);

    const result = await requireProjectOwner('proj1');
    expect(result.user).toEqual(mockUser);
    expect(result.project).toEqual(mockProject);

    spy.mockRestore();
  });

  it('throws when project does not exist', async () => {
    const mockUser = { id: 'client1', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });
    mockFindUniqueUser.mockResolvedValue(mockUser);
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    await expect(requireProjectOwner('proj1')).rejects.toThrow('案件不存在');
  });

  it('throws when user is not the project owner', async () => {
    const mockUser = { id: 'other1', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    const mockProject = { id: 'proj1', clientId: 'client1' };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });
    mockFindUniqueUser.mockResolvedValue(mockUser);
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);

    await expect(requireProjectOwner('proj1')).rejects.toThrow('只有案件發案方可執行此操作');
  });
});

// ═══════════════════════════════════════════
// requireAssignedFreelancer
// ═══════════════════════════════════════════
describe('requireAssignedFreelancer', () => {
  const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
  const mockFindUniqueUser = (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user and project when user is assigned freelancer', async () => {
    const mockUser = { id: 'free1', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    const mockProject = { id: 'proj1', selectedFreelancerId: 'free1' };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });
    mockFindUniqueUser.mockResolvedValue(mockUser);
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);

    const result = await requireAssignedFreelancer('proj1');
    expect(result.user).toEqual(mockUser);
    expect(result.project).toEqual(mockProject);
  });

  it('throws when project does not exist', async () => {
    const mockUser = { id: 'free1', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });
    mockFindUniqueUser.mockResolvedValue(mockUser);
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

    await expect(requireAssignedFreelancer('proj1')).rejects.toThrow('案件不存在');
  });

  it('throws when user is not the assigned freelancer', async () => {
    const mockUser = { id: 'free2', clerkId: 'ck1', status: 'ACTIVE', isAdmin: false };
    const mockProject = { id: 'proj1', selectedFreelancerId: 'free1' };
    mockAuth.mockReturnValue({ userId: 'ck1', protect: () => ({ userId: 'ck1' }) });
    mockFindUniqueUser.mockResolvedValue(mockUser);
    vi.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);

    await expect(requireAssignedFreelancer('proj1')).rejects.toThrow('只有被指派的接案者可執行此操作');
  });
});
