import { SalesOrder } from './pos';

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MemberTierInfo {
  id: MemberTier;
  name: string;
  nameEn: string;
  badgeColor: string;
  gradient: string;
  minPoints: number;
  multiplier: number; // e.g. 1.0, 1.2, 1.5, 2.0
  perks: string[];
}

export interface MemberProfile {
  id: string; // Document ID (UID)
  uid: string;
  email: string;
  emailVerified: boolean;
  verifiedByAdmin?: boolean; // 是否已由門市管理者手動審核確認
  verifiedAt?: number; // 管理者確認時間
  verifiedBy?: string; // 審核管理者姓名/店員編號
  displayName: string;
  phone: string;
  birthday?: string; // YYYY-MM-DD
  tier: MemberTier;
  points: number; // Current spendable points
  lifetimePoints: number; // Total points ever accumulated
  totalSpentTwd: number; // Total spending in TWD
  orderCount: number;
  favoriteDrink?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PointTransaction {
  id: string;
  memberId: string;
  type: 'earn' | 'redeem' | 'bonus' | 'adjustment';
  points: number; // Positive for earn/bonus, negative for redeem
  balanceAfter: number;
  description: string;
  orderId?: string;
  timestamp: number;
}

export interface RewardCoupon {
  id: string;
  title: string;
  subtitle: string;
  pointsCost: number;
  discountTwd?: number;
  category: 'discount' | 'topping' | 'drink' | 'merch';
  icon: string;
  validDays: number;
  description: string;
}

export const TIER_CONFIGS: Record<MemberTier, MemberTierInfo> = {
  bronze: {
    id: 'bronze',
    name: '銅卡茶客',
    nameEn: 'Bronze Tea Sipper',
    badgeColor: 'text-amber-600 bg-amber-600/15 border-amber-600/30',
    gradient: 'from-[#2A1D13] to-[#1F1712]',
    minPoints: 0,
    multiplier: 1.0,
    perks: ['單筆滿 $30 累積 1 點', '入會贈禮 10 點', '門市消費電子發票歸戶載具'],
  },
  silver: {
    id: 'silver',
    name: '銀卡茶人',
    nameEn: 'Silver Tea Enthusiast',
    badgeColor: 'text-slate-300 bg-slate-300/15 border-slate-300/30',
    gradient: 'from-[#202532] to-[#151922]',
    minPoints: 100,
    multiplier: 1.2,
    perks: ['單筆滿 $30 累積 1.2 點', '每月 15 號會員日飲品現折 $5', '生日當月專屬壽星茶飲 8 折券'],
  },
  gold: {
    id: 'gold',
    name: '金卡茶宗',
    nameEn: 'Gold Tea Master',
    badgeColor: 'text-amber-400 bg-amber-400/15 border-amber-400/30',
    gradient: 'from-[#332408] to-[#1F1605]',
    minPoints: 300,
    multiplier: 1.5,
    perks: ['單筆滿 $30 累積 1.5 點', '每週任選免費加料 1 次', '壽星生日免費特調中杯 1 杯', '新品私密搶先試飲'],
  },
  platinum: {
    id: 'platinum',
    name: '尊榮黑金大師',
    nameEn: 'Platinum Grandmaster',
    badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
    gradient: 'from-[#271536] to-[#160B1E]',
    minPoints: 600,
    multiplier: 2.0,
    perks: ['單筆滿 $30 累積 2.0 點', '吧台優先調飲極速通道', '每年贈送茶研所客製環保隨行保溫瓶', '年度茶會 VIP 貴賓席'],
  },
};

export const AVAILABLE_REWARDS: RewardCoupon[] = [
  {
    id: 'reward-10-off',
    title: '現金折抵 NT$ 10',
    subtitle: '結帳無低消門檻即可折抵',
    pointsCost: 10,
    discountTwd: 10,
    category: 'discount',
    icon: 'TicketPercent',
    validDays: 30,
    description: '兌換後於前台收銀點餐時出示或結帳時直接抵用 10 元。',
  },
  {
    id: 'reward-free-topping',
    title: '特選加料免費券',
    subtitle: '黑糖琥珀珍珠 / 招牌奶蓋 / 白玉椰果任選',
    pointsCost: 20,
    category: 'topping',
    icon: 'Sparkles',
    validDays: 30,
    description: '可折抵任一手搖飲品加料一項（價值 NT$ 10~15）。',
  },
  {
    id: 'reward-30-off',
    title: '現金折抵 NT$ 30',
    subtitle: '滿百即可直接折抵 30 元',
    pointsCost: 28,
    discountTwd: 30,
    category: 'discount',
    icon: 'BadgePercent',
    validDays: 30,
    description: '全品項消費滿 NT$ 100 即可折抵 NT$ 30，超值集點回饋。',
  },
  {
    id: 'reward-free-pure-tea',
    title: '經典純原葉單品茶 (M) 免費兌換',
    subtitle: '炭焙重烏龍 / 茉莉香片 / 蜜香金萱任選',
    pointsCost: 45,
    category: 'drink',
    icon: 'Coffee',
    validDays: 60,
    description: '兌換單品純茶系列中杯乙杯，甜度冰塊任選。',
  },
  {
    id: 'reward-free-signature',
    title: '招牌厚雲頂奶蓋系列 (L) 免費兌換',
    subtitle: '宇治抹茶厚雲頂 / 炭焙鐵觀音厚奶任選',
    pointsCost: 75,
    category: 'drink',
    icon: 'CupSoda',
    validDays: 60,
    description: '大杯招牌飲品免費享用，極致茶香與醇厚雲頂奶沫。',
  },
  {
    id: 'reward-eco-bottle',
    title: '茶研所客製金屬雷雕隨行保溫杯',
    subtitle: '500ml 雙層真空保溫 / 附粗吸管與提袋',
    pointsCost: 150,
    category: 'merch',
    icon: 'Gift',
    validDays: 90,
    description: '持杯至門市點飲品享每次折抵 NT$ 5 環保自備杯獎勵！',
  },
];
