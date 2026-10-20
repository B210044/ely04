import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MemberProfile, MemberTier, PointTransaction } from '../types/member';
import { SalesOrder } from '../types/pos';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Skill Error Handler specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Compute Member Tier based on cumulative lifetime points
export function calculateTier(lifetimePoints: number): MemberTier {
  if (lifetimePoints >= 600) return 'platinum';
  if (lifetimePoints >= 300) return 'gold';
  if (lifetimePoints >= 100) return 'silver';
  return 'bronze';
}

// Member Firestore Operations
export async function saveMemberProfile(profile: MemberProfile): Promise<void> {
  const path = `members/${profile.id}`;
  try {
    await setDoc(doc(db, 'members', profile.id), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchMemberProfile(uid: string): Promise<MemberProfile | null> {
  const path = `members/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'members', uid));
    if (snap.exists()) {
      return snap.data() as MemberProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateMemberPoints(
  uid: string,
  pointsDelta: number,
  additionalSpent: number = 0,
  orderIncrement: number = 0
): Promise<MemberProfile | null> {
  const path = `members/${uid}`;
  try {
    const memberDoc = await getDoc(doc(db, 'members', uid));
    if (!memberDoc.exists()) return null;

    const current = memberDoc.data() as MemberProfile;
    const newPoints = Math.max(0, (current.points || 0) + pointsDelta);
    const newLifetime = pointsDelta > 0 ? (current.lifetimePoints || 0) + pointsDelta : current.lifetimePoints || 0;
    const newSpent = (current.totalSpentTwd || 0) + additionalSpent;
    const newOrderCount = (current.orderCount || 0) + orderIncrement;
    const newTier = calculateTier(newLifetime);

    const updatedData: Partial<MemberProfile> = {
      points: newPoints,
      lifetimePoints: newLifetime,
      totalSpentTwd: newSpent,
      orderCount: newOrderCount,
      tier: newTier,
      updatedAt: Date.now(),
    };

    await updateDoc(doc(db, 'members', uid), updatedData);
    return { ...current, ...updatedData };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addPointTransaction(
  memberId: string,
  tx: Omit<PointTransaction, 'id' | 'memberId' | 'timestamp'>
): Promise<PointTransaction> {
  const path = `members/${memberId}/pointTransactions`;
  const txId = `PTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record: PointTransaction = {
    ...tx,
    id: txId,
    memberId,
    timestamp: Date.now(),
  };

  try {
    await setDoc(doc(db, 'members', memberId, 'pointTransactions', txId), record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${txId}`);
  }
}

export async function saveMemberPurchaseOrder(
  memberId: string,
  order: SalesOrder,
  pointsEarned: number,
  pointsRedeemed: number = 0,
  pointsDiscount: number = 0
): Promise<void> {
  const orderDocPath = `members/${memberId}/orders/${order.orderId}`;
  const storeOrderPath = `orders/${order.orderId}`;

  const enrichedOrder = {
    ...order,
    memberId,
    pointsEarned,
    pointsRedeemed,
    pointsDiscount,
  };

  try {
    // 1. Save to member's personal purchase history subcollection
    await setDoc(doc(db, 'members', memberId, 'orders', order.orderId), enrichedOrder);

    // 2. Save to global orders collection in Google Cloud Firestore
    try {
      await setDoc(doc(db, 'orders', order.orderId), enrichedOrder);
    } catch (e) {
      console.warn('Global order save warning:', e);
    }

    // 3. Update member points and total spent
    const netPoints = pointsEarned - pointsRedeemed;
    await updateMemberPoints(memberId, netPoints, order.totalTwd, 1);

    // 4. Record point transaction log
    if (pointsEarned > 0) {
      const snap = await getDoc(doc(db, 'members', memberId));
      const currentPoints = snap.exists() ? (snap.data() as MemberProfile).points : 0;
      await addPointTransaction(memberId, {
        type: 'earn',
        points: pointsEarned,
        balanceAfter: currentPoints,
        description: `門市消費 ${order.orderNumber} (金額 NT$${order.totalTwd}) 獲得積點`,
        orderId: order.orderId,
      });
    }

    if (pointsRedeemed > 0) {
      const snap = await getDoc(doc(db, 'members', memberId));
      const currentPoints = snap.exists() ? (snap.data() as MemberProfile).points : 0;
      await addPointTransaction(memberId, {
        type: 'redeem',
        points: -pointsRedeemed,
        balanceAfter: currentPoints,
        description: `訂單 ${order.orderNumber} 兌換點數折抵現金 NT$${pointsDiscount}`,
        orderId: order.orderId,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, orderDocPath);
  }
}

export async function fetchMemberOrders(memberId: string): Promise<SalesOrder[]> {
  const path = `members/${memberId}/orders`;
  try {
    const q = query(collection(db, 'members', memberId, 'orders'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SalesOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchMemberPointTransactions(memberId: string): Promise<PointTransaction[]> {
  const path = `members/${memberId}/pointTransactions`;
  try {
    const q = query(
      collection(db, 'members', memberId, 'pointTransactions'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PointTransaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function searchMembersByKeyword(keyword: string): Promise<MemberProfile[]> {
  const clean = keyword.trim().toLowerCase();
  const digitsOnly = keyword.replace(/\D/g, '');
  if (!clean && !digitsOnly) return [];
  const path = 'members';
  try {
    const q = query(collection(db, 'members'), limit(100));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as MemberProfile);
    return list.filter((m) => {
      const memberPhoneDigits = (m.phone || '').replace(/\D/g, '');
      const matchPhone = digitsOnly && (memberPhoneDigits.includes(digitsOnly) || digitsOnly.includes(memberPhoneDigits));
      const matchEmail = m.email?.toLowerCase().includes(clean);
      const matchName = m.displayName?.toLowerCase().includes(clean);
      const matchId = m.id?.toLowerCase().includes(clean);
      return Boolean(matchPhone || matchEmail || matchName || matchId);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function searchMemberByPhone(phoneQuery: string): Promise<MemberProfile | null> {
  const digits = phoneQuery.replace(/\D/g, '');
  if (!digits) return null;
  const path = 'members';
  try {
    const q = query(collection(db, 'members'), limit(100));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as MemberProfile);
    const exact = list.find((m) => (m.phone || '').replace(/\D/g, '') === digits);
    if (exact) return exact;
    return list.find((m) => (m.phone || '').replace(/\D/g, '').endsWith(digits) || (m.phone || '').includes(digits)) || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function setMemberManualVerification(
  memberId: string,
  verified: boolean,
  operatorName: string = '店長 陳品研'
): Promise<MemberProfile | null> {
  const path = `members/${memberId}`;
  try {
    const ref = doc(db, 'members', memberId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const current = snap.data() as MemberProfile;
    const updatedFields: Partial<MemberProfile> = {
      emailVerified: verified,
      verifiedByAdmin: verified,
      verifiedAt: verified ? Date.now() : undefined,
      verifiedBy: verified ? operatorName : undefined,
      updatedAt: Date.now(),
    };

    await updateDoc(ref, updatedFields);
    return { ...current, ...updatedFields };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchAllMembers(): Promise<MemberProfile[]> {
  const path = 'members';
  try {
    const q = query(collection(db, 'members'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MemberProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

