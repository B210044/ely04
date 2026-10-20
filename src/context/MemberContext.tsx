import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  auth,
  testConnection,
  fetchMemberProfile,
  saveMemberProfile,
  fetchMemberOrders,
  fetchMemberPointTransactions,
  addPointTransaction,
  updateMemberPoints,
  calculateTier,
  searchMembersByKeyword,
  searchMemberByPhone,
  setMemberManualVerification,
  fetchAllMembers,
} from '../lib/firebase';
import { MemberProfile, PointTransaction, RewardCoupon, TIER_CONFIGS } from '../types/member';
import { SalesOrder } from '../types/pos';

interface MemberContextType {
  currentUser: User | null;
  memberProfile: MemberProfile | null;
  isLoading: boolean;
  isFirestoreConnected: boolean;
  authError: string | null;
  verificationSent: boolean;
  orderHistory: SalesOrder[];
  pointTransactions: PointTransaction[];
  // POS Cashier selected member for checkout
  activePosMember: MemberProfile | null;
  setActivePosMember: (member: MemberProfile | null) => void;
  // Actions
  registerMember: (data: {
    email: string;
    password: string;
    displayName: string;
    phone: string;
    birthday?: string;
    favoriteDrink?: string;
  }) => Promise<MemberProfile>;
  loginMember: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutMember: () => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshVerificationStatus: () => Promise<boolean>;
  refreshMemberData: () => Promise<void>;
  redeemCoupon: (coupon: RewardCoupon) => Promise<boolean>;
  searchMembers: (keyword: string) => Promise<MemberProfile[]>;
  findMemberByPhone: (phone: string) => Promise<MemberProfile | null>;
  manuallyVerifyMember: (memberId: string, verified: boolean, operatorName?: string) => Promise<boolean>;
  getAllMembers: () => Promise<MemberProfile[]>;
  recordOrderForMember: (order: SalesOrder, pointsRedeemed?: number, pointsDiscount?: number) => Promise<number>;
  clearAuthError: () => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [activePosMember, setActivePosMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [orderHistory, setOrderHistory] = useState<SalesOrder[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });
  }, []);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadMemberData(user.uid, user);
      } else {
        setMemberProfile(null);
        setOrderHistory([]);
        setPointTransactions([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadMemberData = async (uid: string, user?: User) => {
    try {
      const profile = await fetchMemberProfile(uid);
      const isVerified = user ? user.emailVerified : auth.currentUser?.emailVerified || false;

      if (profile) {
        // If email verification status changed, update profile
        if (profile.emailVerified !== isVerified) {
          profile.emailVerified = isVerified;
          await saveMemberProfile(profile);
        }
        setMemberProfile(profile);
      } else if (user) {
        // Profile does not exist yet (e.g., initial Google sign-in)
        const newProfile: MemberProfile = {
          id: user.uid,
          uid: user.uid,
          email: user.email || '',
          emailVerified: user.emailVerified,
          displayName: user.displayName || user.email?.split('@')[0] || '茶友',
          phone: '',
          tier: 'bronze',
          points: 10, // 10 points bonus on signup!
          lifetimePoints: 10,
          totalSpentTwd: 0,
          orderCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveMemberProfile(newProfile);
        setMemberProfile(newProfile);

        // Add welcome bonus point transaction
        await addPointTransaction(user.uid, {
          type: 'bonus',
          points: 10,
          balanceAfter: 10,
          description: '新人註冊入會禮贈送 10 點',
        });
      }

      // Load subcollections: orders & point transactions
      const [orders, points] = await Promise.all([
        fetchMemberOrders(uid).catch(() => []),
        fetchMemberPointTransactions(uid).catch(() => []),
      ]);
      setOrderHistory(orders);
      setPointTransactions(points);
    } catch (err) {
      console.error('Error loading member data from Firestore:', err);
    }
  };

  const refreshMemberData = async () => {
    if (currentUser) {
      await loadMemberData(currentUser.uid, currentUser);
    }
  };

  // 1. Register Member with Email Verification
  const registerMember = async (data: {
    email: string;
    password: string;
    displayName: string;
    phone: string;
    birthday?: string;
    favoriteDrink?: string;
  }): Promise<MemberProfile> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth user display name
      await updateProfile(user, {
        displayName: data.displayName,
      });

      // Send Email Verification
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (emailErr) {
        console.warn('Failed to send verification email automatically:', emailErr);
      }

      // Create Member profile in Google Cloud Firestore
      const newProfile: MemberProfile = {
        id: user.uid,
        uid: user.uid,
        email: data.email,
        emailVerified: user.emailVerified,
        displayName: data.displayName,
        phone: data.phone,
        birthday: data.birthday,
        favoriteDrink: data.favoriteDrink,
        tier: 'bronze',
        points: 10, // 10 points welcome bonus!
        lifetimePoints: 10,
        totalSpentTwd: 0,
        orderCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveMemberProfile(newProfile);

      // Record welcome point bonus
      await addPointTransaction(user.uid, {
        type: 'bonus',
        points: 10,
        balanceAfter: 10,
        description: '茶研所會員註冊入會禮贈送 10 點',
      });

      setMemberProfile(newProfile);
      setCurrentUser(user);
      return newProfile;
    } catch (err: any) {
      const msg = err?.message || '註冊會員失敗，請確認資料是否正確。';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Login Member
  const loginMember = async (email: string, password: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await loadMemberData(cred.user.uid, cred.user);
    } catch (err: any) {
      let msg = '登入失敗，請檢查帳號密碼。';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = '帳號或密碼輸入錯誤，請重新確認。';
      } else if (err.code === 'auth/user-not-found') {
        msg = '查無此會員電子郵件，請先申請註冊。';
      }
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Login with Google
  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await loadMemberData(cred.user.uid, cred.user);
    } catch (err: any) {
      setAuthError(err?.message || 'Google 登入失敗');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Logout
  const logoutMember = async () => {
    try {
      await fbSignOut(auth);
      setMemberProfile(null);
      setCurrentUser(null);
      setOrderHistory([]);
      setPointTransactions([]);
      if (activePosMember?.uid === memberProfile?.uid) {
        setActivePosMember(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 5. Resend Verification Email
  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      return true;
    } catch (err: any) {
      console.error('Resend verification email failed:', err);
      setAuthError('重發驗證信失敗，請稍後再試。');
      return false;
    }
  };

  // 6. Refresh Verification Status
  const refreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      if (memberProfile) {
        const updated = { ...memberProfile, emailVerified: verified, updatedAt: Date.now() };
        await saveMemberProfile(updated);
        setMemberProfile(updated);
      }
      return verified;
    } catch (err) {
      console.error('Failed to reload user verification status:', err);
      return false;
    }
  };

  // 7. Redeem Points for Coupon/Reward
  const redeemCoupon = async (coupon: RewardCoupon): Promise<boolean> => {
    if (!memberProfile || !currentUser) return false;
    if (memberProfile.points < coupon.pointsCost) {
      alert(`點數不足！您目前有 ${memberProfile.points} 點，需要 ${coupon.pointsCost} 點。`);
      return false;
    }

    try {
      const updated = await updateMemberPoints(memberProfile.id, -coupon.pointsCost);
      if (updated) {
        await addPointTransaction(memberProfile.id, {
          type: 'redeem',
          points: -coupon.pointsCost,
          balanceAfter: updated.points,
          description: `兌換「${coupon.title}」（消耗 ${coupon.pointsCost} 點）`,
        });

        await loadMemberData(memberProfile.id, currentUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Redeem coupon failed:', err);
      return false;
    }
  };

  // 8. Search members for cashier
  const searchMembers = async (keyword: string): Promise<MemberProfile[]> => {
    return await searchMembersByKeyword(keyword);
  };

  const findMemberByPhone = async (phone: string): Promise<MemberProfile | null> => {
    return await searchMemberByPhone(phone);
  };

  const manuallyVerifyMember = async (
    memberId: string,
    verified: boolean,
    operatorName: string = '店長 陳品研'
  ): Promise<boolean> => {
    try {
      const updated = await setMemberManualVerification(memberId, verified, operatorName);
      if (updated) {
        if (memberProfile && memberProfile.id === memberId) {
          setMemberProfile(updated);
        }
        if (activePosMember && activePosMember.id === memberId) {
          setActivePosMember(updated);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Manual verification failed:', err);
      return false;
    }
  };

  const getAllMembers = async (): Promise<MemberProfile[]> => {
    return await fetchAllMembers();
  };

  // 9. Record order points
  const recordOrderForMember = async (
    order: SalesOrder,
    pointsRedeemed: number = 0,
    pointsDiscount: number = 0
  ): Promise<number> => {
    const targetMember = activePosMember || memberProfile;
    if (!targetMember) return 0;

    const tierInfo = TIER_CONFIGS[targetMember.tier] || TIER_CONFIGS.bronze;
    // Calculate points: $30 per point, times tier multiplier
    const rawPoints = Math.floor((order.totalTwd / 30) * tierInfo.multiplier);
    const earnedPoints = Math.max(1, rawPoints);

    try {
      const netPoints = earnedPoints - pointsRedeemed;
      const updated = await updateMemberPoints(targetMember.id, netPoints, order.totalTwd, 1);

      if (updated) {
        if (earnedPoints > 0) {
          await addPointTransaction(targetMember.id, {
            type: 'earn',
            points: earnedPoints,
            balanceAfter: updated.points,
            description: `門市消費訂單 ${order.orderNumber} 獲得點數（消費 NT$${order.totalTwd}）`,
            orderId: order.orderId,
          });
        }

        if (pointsRedeemed > 0) {
          await addPointTransaction(targetMember.id, {
            type: 'redeem',
            points: -pointsRedeemed,
            balanceAfter: updated.points,
            description: `訂單 ${order.orderNumber} 點數折抵現金 NT$${pointsDiscount}`,
            orderId: order.orderId,
          });
        }

        if (currentUser && currentUser.uid === targetMember.id) {
          await loadMemberData(targetMember.id, currentUser);
        }

        if (activePosMember && activePosMember.id === targetMember.id) {
          setActivePosMember(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update member points on order:', err);
    }

    return earnedPoints;
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <MemberContext.Provider
      value={{
        currentUser,
        memberProfile,
        isLoading,
        isFirestoreConnected,
        authError,
        verificationSent,
        orderHistory,
        pointTransactions,
        activePosMember,
        setActivePosMember,
        registerMember,
        loginMember,
        loginWithGoogle,
        logoutMember,
        resendVerificationEmail,
        refreshVerificationStatus,
        refreshMemberData,
        redeemCoupon,
        searchMembers,
        findMemberByPhone,
        manuallyVerifyMember,
        getAllMembers,
        recordOrderForMember,
        clearAuthError,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
};
