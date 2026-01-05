/**
 * Referral Program Tests
 * Tests referral code generation and usage
 */

import { prisma } from '../lib/db';
import {
  generateReferralCode,
  useReferralCode,
  getUserReferralCode,
  getUserReferralStats,
  getReferralCodeDetails,
  useReferralReward,
} from '../lib/referral';

describe('Referral Program', () => {
  let referrerUserId: string;
  let refereeUserId: string;

  beforeAll(async () => {
    // Create referrer user
    const referrer = await prisma.user.create({
      data: {
        email: `referrer-${Date.now()}@example.com`,
        name: 'Referrer User',
      },
    });
    referrerUserId = referrer.id;

    // Create referee user
    const referee = await prisma.user.create({
      data: {
        email: `referee-${Date.now()}@example.com`,
        name: 'Referee User',
      },
    });
    refereeUserId = referee.id;
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.referralReward.deleteMany({
        where: { userId: { in: [referrerUserId, refereeUserId] } },
      });
      await prisma.referral.deleteMany({
        where: { OR: [{ code: { referrerId: referrerUserId } }] },
      });
      await prisma.referralCode.deleteMany({
        where: { referrerId: referrerUserId },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [referrerUserId, refereeUserId] } },
      });
    } catch (error) {
      console.log('Cleanup error (can be ignored)');
    }
  });

  describe('generateReferralCode', () => {
    it('should generate unique referral code', async () => {
      const code = await generateReferralCode(referrerUserId);

      expect(code).toBeDefined();
      expect(code.code).toBeDefined();
      expect(code.referrerId).toBe(referrerUserId);
      expect(code.isActive).toBe(true);
    });

    it('should include discount percentage', async () => {
      const code = await generateReferralCode(referrerUserId, 15);

      expect(code.discountPercentage).toBe(15);
    });

    it('should set expiration date', async () => {
      const code = await generateReferralCode(referrerUserId);

      expect(code.expiresAt).toBeDefined();
      expect(code.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should include max usage limit', async () => {
      const code = await generateReferralCode(referrerUserId, 10, 100);

      expect(code.maxUses).toBe(100);
    });

    it('should generate unique codes for different users', async () => {
      const user2 = await prisma.user.create({
        data: { email: `user2-${Date.now()}@example.com` },
      });

      const code1 = await generateReferralCode(referrerUserId);
      const code2 = await generateReferralCode(user2.id);

      expect(code1.code).not.toBe(code2.code);

      await prisma.referralCode.deleteMany({
        where: { referrerId: user2.id },
      });
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('useReferralCode', () => {
    let testCode: string;

    beforeEach(async () => {
      const code = await generateReferralCode(referrerUserId, 10);
      testCode = code.code;
    });

    it('should validate and use referral code', async () => {
      const referral = await useReferralCode(
        testCode,
        'new@example.com',
        refereeUserId
      );

      expect(referral).toBeDefined();
      expect(referral.status).toBe('COMPLETED');
      expect(referral.referredUserId).toBe(refereeUserId);
    });

    it('should throw error for invalid code', async () => {
      await expect(useReferralCode('INVALID', 'test@example.com'))
        .rejects
        .toThrow('Invalid referral code');
    });

    it('should throw error if code is inactive', async () => {
      const code = await generateReferralCode(referrerUserId);
      await prisma.referralCode.update({
        where: { id: code.id },
        data: { isActive: false },
      });

      await expect(useReferralCode(code.code, 'test@example.com'))
        .rejects
        .toThrow('Referral code is inactive');
    });

    it('should increment usage count', async () => {
      const code = await prisma.referralCode.findFirst({
        where: { code: testCode },
      });
      const before = code?.usageCount || 0;

      await useReferralCode(testCode, `email-${Date.now()}@example.com`);

      const updated = await prisma.referralCode.findFirst({
        where: { code: testCode },
      });

      expect(updated!.usageCount).toBeGreaterThan(before);
    });

    it('should create rewards for completed referral', async () => {
      await useReferralCode(testCode, `email-${Date.now()}@example.com`, refereeUserId);

      const rewards = await prisma.referralReward.findMany({
        where: { userId: { in: [referrerUserId, refereeUserId] } },
      });

      expect(rewards.length).toBeGreaterThan(0);
    });
  });

  describe('getUserReferralCode', () => {
    it('should get user referral code', async () => {
      const code = await generateReferralCode(referrerUserId);
      const retrieved = await getUserReferralCode(referrerUserId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.code).toBe(code.code);
    });

    it('should return only active code', async () => {
      const code = await generateReferralCode(referrerUserId);
      await prisma.referralCode.update({
        where: { id: code.id },
        data: { isActive: false },
      });

      const retrieved = await getUserReferralCode(referrerUserId);

      expect(retrieved).toBeNull();
    });
  });

  describe('getUserReferralStats', () => {
    beforeEach(async () => {
      // Clear existing data
      await prisma.referralReward.deleteMany({
        where: { userId: referrerUserId },
      });
      await prisma.referral.deleteMany({});
      await prisma.referralCode.deleteMany({
        where: { referrerId: referrerUserId },
      });

      // Create new code and use it
      const code = await generateReferralCode(referrerUserId);
      await useReferralCode(code.code, `ref1-${Date.now()}@example.com`, refereeUserId);
    });

    it('should return referral statistics', async () => {
      const stats = await getUserReferralStats(referrerUserId);

      expect(stats).toBeDefined();
      expect(stats.referralCode).toBeDefined();
      expect(stats.totalReferrals).toBeGreaterThanOrEqual(0);
      expect(stats.totalRewards).toBeDefined();
    });

    it('should count completed referrals', async () => {
      const stats = await getUserReferralStats(referrerUserId);

      expect(stats.completedReferrals).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getReferralCodeDetails', () => {
    it('should get code details', async () => {
      const code = await generateReferralCode(referrerUserId);
      const details = await getReferralCodeDetails(code.code);

      expect(details).toBeDefined();
      expect(details.code).toBe(code.code);
      expect(details.referrer).toBeDefined();
      expect(details.referrer.id).toBe(referrerUserId);
    });

    it('should throw error for invalid code', async () => {
      await expect(getReferralCodeDetails('INVALID'))
        .rejects
        .toThrow('Referral code not found');
    });
  });

  describe('useReferralReward', () => {
    it('should mark reward as used', async () => {
      const reward = await prisma.referralReward.create({
        data: {
          user: { connect: { id: referrerUserId } },
          type: 'REFERRER_BONUS',
          amount: 1000,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });

      const used = await useReferralReward(reward.id);

      expect(used.isUsed).toBe(true);
      expect(used.usedAt).toBeDefined();
    });
  });

  describe('Referral Flow', () => {
    it('should complete full referral flow', async () => {
      // 1. Generate code
      const code = await generateReferralCode(referrerUserId, 10, 1000);
      expect(code.code).toBeDefined();

      // 2. Use referral code
      const referral = await useReferralCode(
        code.code,
        `flow-test-${Date.now()}@example.com`,
        refereeUserId
      );
      expect(referral.status).toBe('COMPLETED');

      // 3. Check rewards created
      const referrerRewards = await prisma.referralReward.findMany({
        where: { userId: referrerUserId },
      });
      const refereeRewards = await prisma.referralReward.findMany({
        where: { userId: refereeUserId },
      });

      expect(referrerRewards.length).toBeGreaterThan(0);
      expect(refereeRewards.length).toBeGreaterThan(0);

      // 4. Get stats
      const stats = await getUserReferralStats(referrerUserId);
      expect(stats.totalReferrals).toBeGreaterThan(0);
      expect(stats.totalRewards).toBeGreaterThan(0);
    });
  });
});
