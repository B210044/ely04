import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useMember } from '../context/MemberContext';
import { sounds } from '../utils/audio';
import { TIER_CONFIGS, AVAILABLE_REWARDS, RewardCoupon, MemberProfile } from '../types/member';
import { CartItem, SalesOrder } from '../types/pos';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Gift,
  Coins,
  History,
  QrCode,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  Award,
  CreditCard,
  TicketPercent,
  CupSoda,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface MemberManagementTabProps {
  onReorderDrinks?: (items: CartItem[]) => void;
  onNavigateToCashier?: () => void;
}

export const MemberManagementTab: React.FC<MemberManagementTabProps> = ({
  onReorderDrinks,
  onNavigateToCashier,
}) => {
  const {
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
    clearAuthError,
  } = useMember();

  // Tab view within Member Center
  const [activeSubTab, setActiveSubTab] = useState<
    'card' | 'rewards' | 'history' | 'register' | 'cashier_lookup' | 'admin_approval'
  >('card');

  // Admin manual approval state
  const [adminMemberList, setAdminMemberList] = useState<MemberProfile[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(false);
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'verified'>('all');

  // Standalone Member Application QR Code
  const [standaloneQr, setStandaloneQr] = useState<string>('');
  const [showStandaloneModal, setShowStandaloneModal] = useState<boolean>(false);

  useEffect(() => {
    const joinUrl = `${window.location.origin}${window.location.pathname}?page=join`;
    QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 220,
      color: { dark: '#14161E', light: '#FFFFFF' },
    }).then(setStandaloneQr).catch(() => {});
  }, []);

  const loadAdminMembers = async () => {
    setIsAdminLoading(true);
    const list = await getAllMembers();
    setAdminMemberList(list);
    setIsAdminLoading(false);
  };

  useEffect(() => {
    if (activeSubTab === 'admin_approval') {
      loadAdminMembers();
    }
  }, [activeSubTab]);

  // Auth form states
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formFavoriteDrink, setFormFavoriteDrink] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Cashier search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Verification refresh state
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const currentTier = memberProfile ? TIER_CONFIGS[memberProfile.tier] : TIER_CONFIGS.bronze;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (authMode === 'register') {
      if (!formName.trim() || !formPhone.trim()) {
        alert('請填寫會員姓名與連絡手機。');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        alert('兩次密碼輸入不一致，請重新檢查。');
        return;
      }
      if (formPassword.length < 6) {
        alert('密碼長度至少需要 6 個字元。');
        return;
      }
    }

    setFormSubmitting(true);
    sounds.playClick();

    try {
      if (authMode === 'register') {
        await registerMember({
          email: formEmail.trim(),
          password: formPassword,
          displayName: formName.trim(),
          phone: formPhone.trim(),
          birthday: formBirthday || undefined,
          favoriteDrink: formFavoriteDrink || undefined,
        });
        setSuccessNotice('🎉 恭喜！會員帳號申請成功，已寄送驗證信至您的電子信箱，並已獲得新人入會禮 10 點！');
        setActiveSubTab('card');
      } else {
        await loginMember(formEmail.trim(), formPassword);
        setSuccessNotice('歡迎回來！已成功登入會員。');
        setActiveSubTab('card');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    sounds.playClick();
    setFormSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessNotice('Google 帳號快速登入成功！');
      setActiveSubTab('card');
    } catch (err: any) {
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown) return;
    sounds.playClick();
    setResendCooldown(true);
    const sent = await resendVerificationEmail();
    if (sent) {
      setSuccessNotice('已重新發送電子郵件驗證信！請至您的收件匣或垃圾郵件匣確認。');
    }
    setTimeout(() => setResendCooldown(false), 15000);
  };

  const handleCheckVerification = async () => {
    sounds.playClick();
    setIsCheckingVerify(true);
    const verified = await refreshVerificationStatus();
    setIsCheckingVerify(false);
    if (verified) {
      sounds.playRegister();
      setSuccessNotice('太棒了！電子郵件已完成驗證，您的會員帳號已享有完整特權！');
    } else {
      alert('尚未偵測到信箱完成驗證。請確認已點擊驗證信中的連結，若未收到可點擊「重新發送驗證信」。');
    }
  };

  const handleRedeem = async (coupon: RewardCoupon) => {
    sounds.playClick();
    if (!memberProfile) {
      alert('請先登入或申請會員後再進行點數兌換。');
      setActiveSubTab('register');
      return;
    }
    if (confirm(`確定要消耗 ${coupon.pointsCost} 點兌換「${coupon.title}」嗎？`)) {
      const ok = await redeemCoupon(coupon);
      if (ok) {
        sounds.playRegister();
        setSuccessNotice(`🎉 成功兌換「${coupon.title}」！已扣除 ${coupon.pointsCost} 點。`);
      }
    }
  };

  const handleSearchCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    sounds.playClick();
    const results = await searchMembers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleBindMemberToCart = (member: any) => {
    sounds.playRegister();
    setActivePosMember(member);
    alert(`已將會員【${member.displayName} (${member.phone})】綁定至當前收銀購物車！結帳時將自動累積點數並可抵用折抵。`);
    if (onNavigateToCashier) {
      onNavigateToCashier();
    }
  };

  return (
    <div className="flex-1 bg-[#0F1014] text-stone-200 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Cloud Status Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15171E] border border-[#262934] p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white font-display">
                  茶研所 VIP 會員俱樂部
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  會員集點 · 購買紀錄 · 雲端同步
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                結合 Google 雲端資料庫 (Cloud Firestore) 與 Firebase Auth 郵件認證體系
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Database indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1D2029] border border-[#2D313F] text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-300 font-mono text-[11px]">
                Google Cloud Firestore
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* User status */}
            {currentUser && memberProfile ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-200 font-medium">
                  {memberProfile.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    logoutMember();
                  }}
                  title="登出帳號"
                  className="ml-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveSubTab('register');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>申請註冊 / 登入</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notice Banner */}
        {successNotice && (
          <div className="flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-stone-400 hover:text-white text-xs underline cursor-pointer ml-3"
            >
              關閉
            </button>
          </div>
        )}

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-[#242733] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('card');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'card'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>我的會員卡與帳號</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('rewards');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'rewards'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>集點規則與兌換商城</span>
            {memberProfile && (
              <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-mono">
                {memberProfile.points} 點
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('history');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>雲端購買歷史記錄</span>
            {orderHistory.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-mono">
                {orderHistory.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('cashier_lookup');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'cashier_lookup'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>門市收銀會員快查</span>
            {activePosMember && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                已綁定
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('admin_approval');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'admin_approval'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>管理者手動審核中心</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStandaloneModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
            title="查看個人會員申請的獨立網頁與 QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>獨立申請網頁 QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('register');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ml-auto ${
              activeSubTab === 'register'
                ? 'bg-stone-200 text-black font-bold'
                : 'text-stone-400 hover:text-white hover:bg-[#1E212B]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{currentUser ? '切換 / 註冊新帳號' : '註冊與郵件驗證'}</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* SUBTAB 1: MEMBER CARD & OVERVIEW */}
        {/* ============================================================ */}
        {activeSubTab === 'card' && (
          <div className="space-y-6">
            {currentUser && memberProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual VIP Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${currentTier.gradient} border border-amber-500/30 shadow-2xl overflow-hidden`}
                  >
                    {/* Background tea leaf ornament */}
                    <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />

                    {/* Card Top */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-lg font-display">
                          茶
                        </div>
                        <div>
                          <div className="font-bold text-white tracking-wider text-sm font-display">
                            茶研所 VIP 會員
                          </div>
                          <div className="text-[10px] text-amber-400/80 font-mono tracking-widest uppercase">
                            ARTISANAL TEA LAB
                          </div>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${currentTier.badgeColor}`}
                      >
                        {currentTier.name}
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-3 mb-8">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-mono">
                          MEMBER NAME
                        </span>
                        <div className="text-xl font-bold text-white tracking-wide">
                          {memberProfile.displayName}
                        </div>
                      </div>

                      <div className="flex items-center justify-between font-mono text-xs text-stone-300">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">
                            MEMBER ID
                          </span>
                          <span>{memberProfile.id.slice(0, 10).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">
                            PHONE
                          </span>
                          <span>{memberProfile.phone || '未登記手機'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom / Barcode simulation */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-stone-300">現有點數：</span>
                          <span className="text-lg font-extrabold text-amber-300 font-mono">
                            {memberProfile.points}
                          </span>
                          <span className="text-xs text-amber-400/80">PTS</span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          享消費滿 $30 累積 {currentTier.multiplier} 倍積點回饋
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <QrCode className="w-9 h-9 text-white/80" />
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">條碼出示</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Cashier Binding Status */}
                  <div className="p-4 rounded-2xl bg-[#161821] border border-[#272B38] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">收銀結帳快速綁定</div>
                      <p className="text-[11px] text-stone-400">
                        點擊後在前台 POS 結帳將自動連結此會員並享點數折抵
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBindMemberToCart(memberProfile)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md"
                    >
                      綁定至購物車
                    </button>
                  </div>
                </div>

                {/* Account Details & Email Verification Status */}
                <div className="lg:col-span-7 space-y-5">
                  {/* EMAIL / MANUAL VERIFICATION STATUS CARD */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      memberProfile.verifiedByAdmin || memberProfile.emailVerified
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-amber-950/20 border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            memberProfile.verifiedByAdmin || memberProfile.emailVerified
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {memberProfile.verifiedByAdmin || memberProfile.emailVerified ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <ShieldAlert className="w-5 h-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">
                              會員驗證狀態：
                              {memberProfile.verifiedByAdmin ? (
                                <span className="text-emerald-400 ml-1">✓ 管理者已手動審核核准</span>
                              ) : memberProfile.emailVerified ? (
                                <span className="text-emerald-400 ml-1">✓ 電子信箱已認證</span>
                              ) : (
                                <span className="text-amber-400 ml-1">待管理者手動確認審核</span>
                              )}
                            </h3>
                          </div>
                          <p className="text-xs text-stone-300">
                            會員信箱：<span className="font-mono text-white">{memberProfile.email}</span> · 報號手機：<span className="font-mono text-amber-300">{memberProfile.phone}</span>
                          </p>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            {memberProfile.verifiedByAdmin
                              ? `已由門市管理者（${memberProfile.verifiedBy || '店長 陳品研'}）手動審核確認通過，享有正式會員完整權益與折抵特權。`
                              : memberProfile.emailVerified
                              ? '您的電子郵件已通過安全認證，保障點數兌換與線上消費紀錄安全。'
                              : '免收驗證信！門市管理人員可於後台直接一鍵手動確認審核，或於前台結帳報電話時現場核准。'}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {!memberProfile.verifiedByAdmin && (
                          <button
                            type="button"
                            onClick={async () => {
                              sounds.playRegister();
                              await manuallyVerifyMember(memberProfile.id, true, '店長 陳品研 (後台審核)');
                              setSuccessNotice('🎉 已成功手動完成該會員的驗證審核！');
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>管理者手動確認驗證</span>
                          </button>
                        )}

                        {memberProfile.verifiedByAdmin && (
                          <button
                            type="button"
                            onClick={async () => {
                              sounds.playClick();
                              await manuallyVerifyMember(memberProfile.id, false);
                              setSuccessNotice('已重設為待審核狀態。');
                            }}
                            className="px-3 py-1.5 bg-[#252834] hover:bg-[#2F3342] text-stone-400 hover:text-rose-400 text-xs rounded-lg transition-all cursor-pointer"
                          >
                            重設審核狀態
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-[#151720] border border-[#252834]">
                      <span className="text-[11px] text-stone-400 block font-mono">現有可用點數</span>
                      <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                        {memberProfile.points}
                      </div>
                      <span className="text-[10px] text-stone-500">可於結帳時折抵現金</span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#151720] border border-[#252834]">
                      <span className="text-[11px] text-stone-400 block font-mono">累計獲得點數</span>
                      <div className="text-2xl font-bold font-mono text-stone-200 mt-1">
                        {memberProfile.lifetimePoints}
                      </div>
                      <span className="text-[10px] text-stone-500">決定會員升等門檻</span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#151720] border border-[#252834]">
                      <span className="text-[11px] text-stone-400 block font-mono">累計消費總額</span>
                      <div className="text-2xl font-bold font-mono text-stone-200 mt-1">
                        NT$ {memberProfile.totalSpentTwd}
                      </div>
                      <span className="text-[10px] text-stone-500">雲端累計消費金額</span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#151720] border border-[#252834]">
                      <span className="text-[11px] text-stone-400 block font-mono">消費總次數</span>
                      <div className="text-2xl font-bold font-mono text-stone-200 mt-1">
                        {orderHistory.length || memberProfile.orderCount}
                      </div>
                      <span className="text-[10px] text-stone-500">門市點杯訂單數</span>
                    </div>
                  </div>

                  {/* Member Profile Details card */}
                  <div className="p-5 rounded-2xl bg-[#161821] border border-[#262A36] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        會員登記資料 (Google 雲端同步中)
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          refreshMemberData();
                        }}
                        className="text-stone-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>同步最新資料</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1C1F2A] border border-[#292D3B]">
                        <User className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-400">會員稱呼：</span>
                        <span className="text-white font-medium">{memberProfile.displayName}</span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1C1F2A] border border-[#292D3B]">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-400">手機號碼：</span>
                        <span className="text-white font-mono">{memberProfile.phone || '未登記'}</span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1C1F2A] border border-[#292D3B]">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-400">壽星生日：</span>
                        <span className="text-white font-mono">{memberProfile.birthday || '未填寫'}</span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1C1F2A] border border-[#292D3B]">
                        <CupSoda className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-400">偏好茶飲：</span>
                        <span className="text-amber-300">{memberProfile.favoriteDrink || '炭焙重烏龍厚奶'}</span>
                      </div>
                    </div>

                    {/* Quick navigation to rewards */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setActiveSubTab('rewards');
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>查看集點規則與可兌換獎勵商城</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setActiveSubTab('history');
                        }}
                        className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>查看歷史購買清單 ({orderHistory.length} 筆)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If not logged in, prompt to register or log in */
              <div className="text-center py-16 px-4 bg-[#14161D] border border-[#242733] rounded-3xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-2xl font-bold text-white font-display">
                    立即加入茶研所 VIP 會員
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    申請帳號即可獲贈 <span className="text-amber-400 font-bold">10 點入會禮</span>，消費滿 $30 累積 1 點起，提供電子郵件安全驗證，購買紀錄即時存入 Google 雲端資料庫！
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAuthMode('register');
                      setActiveSubTab('register');
                    }}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    申請會員帳號 (含郵件認證)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAuthMode('login');
                      setActiveSubTab('register');
                    }}
                    className="px-6 py-3 rounded-xl bg-[#20232E] hover:bg-[#2A2E3D] text-stone-200 font-semibold text-sm transition-all cursor-pointer border border-[#2F3342]"
                  >
                    已有帳號？登入
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBTAB 2: POINTS REWARDS & TIERS */}
        {/* ============================================================ */}
        {activeSubTab === 'rewards' && (
          <div className="space-y-6">
            {/* Tiers explanation table */}
            <div className="p-6 rounded-2xl bg-[#151720] border border-[#252834] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    茶研所會員等級與集點回饋機制
                  </h3>
                  <p className="text-xs text-stone-400">
                    每消費滿 NT$ 30 即可累積點數，依據會員等級享有加倍積點與專屬會員福利
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-[#1F222D] text-xs font-mono text-amber-400">
                  當前您擁有：{memberProfile ? memberProfile.points : 0} 點
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(TIER_CONFIGS) as (keyof typeof TIER_CONFIGS)[]).map((key) => {
                  const t = TIER_CONFIGS[key];
                  const isCurrent = memberProfile?.tier === key;
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
                          : 'bg-[#181B24] border-[#272B38]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${t.badgeColor}`}>
                          {t.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                            目前等級
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 font-mono mb-3">
                        門檻：{t.minPoints === 0 ? '入會即享' : `累計滿 ${t.minPoints} 點`} · {t.multiplier}x 點數
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-300">
                        {t.perks.map((perk, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-amber-400 font-bold mt-0.5">•</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward Coupons Store */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <span>點數兌換專區 (Redeem Rewards)</span>
                </h3>
                <span className="text-xs text-stone-400">
                  兌換後於前台收銀出示或直接折抵消費
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_REWARDS.map((coupon) => {
                  const canAfford = memberProfile ? memberProfile.points >= coupon.pointsCost : false;
                  return (
                    <div
                      key={coupon.id}
                      className="p-5 rounded-2xl bg-[#161821] border border-[#252936] hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-lg"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                            {coupon.category === 'discount' && <TicketPercent className="w-5 h-5" />}
                            {coupon.category === 'topping' && <Sparkles className="w-5 h-5" />}
                            {coupon.category === 'drink' && <CupSoda className="w-5 h-5" />}
                            {coupon.category === 'merch' && <Gift className="w-5 h-5" />}
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {coupon.pointsCost} 點
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {coupon.title}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5">{coupon.subtitle}</p>
                          <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                            {coupon.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#232734] flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-mono">
                          有效期限：兌換起 {coupon.validDays} 天
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRedeem(coupon)}
                          disabled={!canAfford}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                              : 'bg-[#222530] text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '立即兌換' : `尚缺 ${coupon.pointsCost - (memberProfile?.points || 0)} 點`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Point Transaction History Log */}
            {memberProfile && (
              <div className="p-5 rounded-2xl bg-[#151720] border border-[#252834] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>點數流向紀錄 (Google 雲端實時日誌)</span>
                  </h4>
                  <span className="text-[11px] text-stone-400 font-mono">
                    共 {pointTransactions.length} 筆點數異動
                  </span>
                </div>

                {pointTransactions.length > 0 ? (
                  <div className="divide-y divide-[#222532] max-h-64 overflow-y-auto">
                    {pointTransactions.map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="text-stone-200 font-medium">{tx.description}</div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            {new Date(tx.timestamp).toLocaleString('zh-TW')} · ID: {tx.id.slice(-8)}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span
                            className={`font-bold ${
                              tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.points > 0 ? `+${tx.points}` : tx.points} 點
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            結餘: {tx.balanceAfter} 點
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-500 text-xs">
                    尚無點數異動紀錄，完成訂單消費即可獲得積點！
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBTAB 3: MEMBER PURCHASE ORDER HISTORY (GOOGLE CLOUD PERSISTED) */}
        {/* ============================================================ */}
        {activeSubTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#151720] border border-[#252834] p-4 rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>會員個人購買與點餐歷史記錄</span>
                </h3>
                <p className="text-xs text-stone-400">
                  所有訂單明細已同步儲存於 Google Cloud Firestore 雲端資料庫
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  refreshMemberData();
                }}
                className="px-3 py-1.5 bg-[#21242F] hover:bg-[#2C303E] text-stone-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重新整理雲端記錄</span>
              </button>
            </div>

            {orderHistory.length > 0 ? (
              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <div
                    key={order.orderId}
                    className="p-5 rounded-2xl bg-[#161821] border border-[#252834] hover:border-amber-500/30 transition-all space-y-4 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">
                            {new Date(order.timestamp).toLocaleString('zh-TW')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#222530] text-stone-300">
                            {order.orderType === 'takeout' ? '外帶' : order.orderType === 'dinein' ? '內用' : '外送'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          發票號碼: {order.invoiceNumber} (驗證碼 {order.randomCode}) · 付款方式: {order.paymentMethod}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-amber-400">
                          NT$ {order.totalTwd}
                        </div>
                        {order.pointsEarned !== undefined && (
                          <div className="text-[11px] text-emerald-400 font-mono">
                            獲得積點: +{order.pointsEarned} 點
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ordered Drinks List */}
                    <div className="divide-y divide-[#20232E] bg-[#12131A] rounded-xl p-3 border border-[#232632]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#20232E] text-stone-300 flex items-center justify-center font-mono text-[10px]">
                              {item.quantity}
                            </span>
                            <div>
                              <div className="text-stone-200 font-medium">
                                {item.chineseName} ({item.size})
                              </div>
                              <div className="text-[11px] text-stone-400">
                                {item.sweetness} · {item.ice}
                                {item.toppings && item.toppings.length > 0 && ` · 加料: ${item.toppings.map(t => t.name).join(', ')}`}
                              </div>
                            </div>
                          </div>
                          <div className="font-mono text-stone-300">
                            NT$ {item.subtotal}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-500 font-mono">
                        雲端訂單 ID: {order.orderId}
                      </span>

                      {onReorderDrinks && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playRegister();
                            onReorderDrinks(order.items);
                            alert(`已將【${order.orderNumber}】的所有飲品加入收銀購物車！`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>再點一次 (加回購物車)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#14161D] border border-[#242733] rounded-2xl space-y-3">
                <History className="w-12 h-12 text-stone-600 mx-auto" />
                <h4 className="text-stone-300 font-medium text-sm">尚無購買歷史記錄</h4>
                <p className="text-stone-500 text-xs max-w-sm mx-auto">
                  在前台 POS 結帳時綁定會員，完成的所有訂單將自動記錄並儲存於 Google Cloud Firestore！
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBTAB 4: CASHIER LOOKUP & QUICK BINDING (FOR STORE STAFF) */}
        {/* ============================================================ */}
        {activeSubTab === 'cashier_lookup' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#151720] border border-[#252834] space-y-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-400" />
                  <span>門市前台收銀：會員快速搜尋與折抵綁定</span>
                </h3>
                <p className="text-xs text-stone-400">
                  顧客於櫃台報手機號碼、電子郵件或姓名，立即查詢點數結餘並綁定收銀單
                </p>
              </div>

              {/* Search input form */}
              <form onSubmit={handleSearchCashier} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="輸入手機號碼 (如 0912)、電子信箱或會員姓名..."
                    className="w-full bg-[#1B1E27] border border-[#2B2F3D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400 placeholder:text-stone-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearching ? '搜尋中...' : '查詢會員'}</span>
                </button>
              </form>
            </div>

            {/* Currently Active POS Member */}
            {activePosMember && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      當前收銀單已綁定會員：{activePosMember.displayName} ({activePosMember.phone})
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      可用點數：{activePosMember.points} 點 · 會員等級：{TIER_CONFIGS[activePosMember.tier]?.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActivePosMember(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-medium cursor-pointer"
                >
                  解除綁定
                </button>
              </div>
            )}

            {/* Search Results Display */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-[#161821] border border-[#252834] space-y-4 hover:border-amber-500/30 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{member.displayName}</h4>
                        <p className="text-xs text-stone-400 font-mono">{member.phone || '未留手機'}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{member.email}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {TIER_CONFIGS[member.tier as keyof typeof TIER_CONFIGS]?.name || '茶友'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#111319] p-2.5 rounded-xl border border-[#20232E]">
                      <div>
                        <span className="text-[10px] text-stone-400 block">現有點數</span>
                        <span className="text-base font-bold text-amber-400">{member.points} 點</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">累計消費</span>
                        <span className="text-stone-200">NT$ {member.totalSpentTwd}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBindMemberToCart(member)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      綁定此會員至當前收銀單
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBTAB: ADMIN MANUAL APPROVAL CENTER */}
        {/* ============================================================ */}
        {activeSubTab === 'admin_approval' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#151720] border border-[#252834]">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>門市管理者後台：會員名冊與手動確認審核</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  顧客於獨立網頁或現場註冊後，管理者可於此一鍵手動核准會員資格，資料即時同步 Google 雲端資料庫
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    loadAdminMembers();
                  }}
                  className="px-3.5 py-2 bg-[#21242F] hover:bg-[#2C303E] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAdminLoading ? 'animate-spin' : ''}`} />
                  <span>重新整理清單</span>
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApprovalFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  approvalFilter === 'all'
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-[#181B24] text-stone-400 hover:text-white border border-[#262A36]'
                }`}
              >
                全部會員 ({adminMemberList.length})
              </button>

              <button
                type="button"
                onClick={() => setApprovalFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  approvalFilter === 'pending'
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-[#181B24] text-stone-400 hover:text-white border border-[#262A36]'
                }`}
              >
                待管理者審核 ({adminMemberList.filter((m) => !m.verifiedByAdmin && !m.emailVerified).length})
              </button>

              <button
                type="button"
                onClick={() => setApprovalFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  approvalFilter === 'verified'
                    ? 'bg-amber-500 text-black shadow'
                    : 'bg-[#181B24] text-stone-400 hover:text-white border border-[#262A36]'
                }`}
              >
                已審核通過 ({adminMemberList.filter((m) => m.verifiedByAdmin || m.emailVerified).length})
              </button>
            </div>

            {/* Members table */}
            <div className="rounded-2xl bg-[#161821] border border-[#252834] overflow-hidden shadow-xl">
              {isAdminLoading ? (
                <div className="py-16 text-center text-stone-400 text-xs">
                  從 Google Cloud Firestore 讀取會員資料中...
                </div>
              ) : adminMemberList.length === 0 ? (
                <div className="py-16 text-center text-stone-500 text-xs">
                  目前資料庫中尚無會員紀錄，顧客可至獨立網頁或前台註冊
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#121319] text-stone-400 border-b border-[#252834] uppercase font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-4">會員姓名 / 稱呼</th>
                        <th className="py-3 px-4">行動電話 (結帳報號)</th>
                        <th className="py-3 px-4">電子郵件 (Email)</th>
                        <th className="py-3 px-4">累積點數</th>
                        <th className="py-3 px-4">審核驗證狀態</th>
                        <th className="py-3 px-4 text-right">管理者操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222530] text-stone-200">
                      {adminMemberList
                        .filter((m) => {
                          if (approvalFilter === 'pending') return !m.verifiedByAdmin && !m.emailVerified;
                          if (approvalFilter === 'verified') return m.verifiedByAdmin || m.emailVerified;
                          return true;
                        })
                        .map((m) => {
                          const isVerified = m.verifiedByAdmin || m.emailVerified;
                          return (
                            <tr key={m.id} className="hover:bg-[#1A1D27] transition-colors">
                              <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                                  {m.displayName.slice(0, 1)}
                                </div>
                                <div>
                                  <span>{m.displayName}</span>
                                  <span className="text-[10px] text-stone-500 block font-mono">
                                    ID: {m.id.slice(0, 8)}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                                {m.phone || '未填寫'}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-stone-300">
                                {m.email}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                                {m.points} 點
                              </td>

                              <td className="py-3.5 px-4">
                                {m.verifiedByAdmin ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>管理者已核准</span>
                                  </span>
                                ) : m.emailVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>信箱已驗證</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>待手動審核</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {!isVerified ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      sounds.playRegister();
                                      const ok = await manuallyVerifyMember(m.id, true, '店長 陳品研 (後台核准)');
                                      if (ok) {
                                        setSuccessNotice(`✓ 已成功手動審核核准會員【${m.displayName}】！`);
                                        await loadAdminMembers();
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all shadow cursor-pointer"
                                  >
                                    手動確認審核通過
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      sounds.playClick();
                                      const ok = await manuallyVerifyMember(m.id, false);
                                      if (ok) {
                                        setSuccessNotice(`已重設【${m.displayName}】為待審核狀態。`);
                                        await loadAdminMembers();
                                      }
                                    }}
                                    className="px-2.5 py-1 text-stone-400 hover:text-rose-400 text-xs rounded transition-colors cursor-pointer"
                                  >
                                    撤銷/重設
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBTAB 5: REGISTER OR LOGIN FORM */}
        {/* ============================================================ */}
        {activeSubTab === 'register' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151720] border border-[#272A36] shadow-2xl space-y-6">
              {/* Header Mode Switch */}
              <div className="flex items-center justify-between border-b border-[#242733] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-white font-display">
                    {authMode === 'register' ? '申請會員帳號 (提供郵件驗證)' : '會員帳號登入'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {authMode === 'register'
                      ? '送出後自動寄送安全驗證信，資料持久儲存於 Google Cloud'
                      : '登入後可查看個人點數、歷史訂單並享有會員專屬權益'}
                  </p>
                </div>

                <div className="flex items-center p-1 bg-[#1A1C25] rounded-xl border border-[#2B2F3D]">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAuthMode('register');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      authMode === 'register'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    註冊申請
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAuthMode('login');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      authMode === 'login'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    登入
                  </button>
                </div>
              </div>

              {/* Welcome Bonus Notice for registration */}
              {authMode === 'register' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    新入會好禮：完成註冊立即贈送 <strong className="text-amber-300">10 點會員積分</strong>，可直接折抵現金 NT$ 10！
                  </span>
                </div>
              )}

              {/* Error message */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* The Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5">
                        會員姓名 / 稱呼 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="例：林品茶"
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5">
                        手機號碼 (門市報電話集點) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="例：0912-345-678"
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1.5">
                    電子郵件信箱 (Email，用於接收驗證信) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1.5">
                      設定密碼 (最少 6 碼) *
                    </label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5">
                        確認密碼 *
                      </label>
                      <input
                        type="password"
                        required
                        value={formConfirmPassword}
                        onChange={(e) => setFormConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-stone-400 block mb-1.5">
                        生日 (選填，享當月壽星特調禮)
                      </label>
                      <input
                        type="date"
                        value={formBirthday}
                        onChange={(e) => setFormBirthday(e.target.value)}
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-400 block mb-1.5">
                        最愛手搖茶 (選填)
                      </label>
                      <input
                        type="text"
                        value={formFavoriteDrink}
                        onChange={(e) => setFormFavoriteDrink(e.target.value)}
                        placeholder="例：炭焙鐵觀音厚奶"
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {formSubmitting
                    ? '處理中...'
                    : authMode === 'register'
                    ? '送出申請並寄發驗證信'
                    : '立即登入會員'}
                </button>
              </form>

              {/* Google Sign-in alternative */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#252834] w-full" />
                <span className="bg-[#151720] px-3 text-[11px] text-stone-500 uppercase tracking-widest absolute">
                  或使用第三方登入
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={formSubmitting}
                className="w-full py-2.5 bg-[#1E212B] hover:bg-[#282C3A] text-stone-200 border border-[#2E3242] rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google 帳號快速登入 / 授權</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Standalone Member Application QR Code Modal */}
      {showStandaloneModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowStandaloneModal(false)}
        >
          <div
            className="bg-[#181A22] border border-[#2B2F3D] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                茶研所 VIP 獨立申請網頁立牌
              </span>
              <button
                type="button"
                onClick={() => setShowStandaloneModal(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg bg-[#20232E]"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-bold text-white font-display">
              顧客專屬會員申請獨立網頁
            </h3>
            <p className="text-xs text-stone-400">
              可將此 QR 碼印製放置於門市吧台立牌，讓顧客用手機相機直接掃碼申請
            </p>

            {standaloneQr ? (
              <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl">
                <img src={standaloneQr} alt="Standalone Signup QR" className="w-52 h-52 mx-auto" />
              </div>
            ) : (
              <div className="w-52 h-52 bg-stone-800 rounded-2xl mx-auto flex items-center justify-center">
                <QrCode className="w-12 h-12 text-stone-500" />
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#13141B] border border-[#242735] text-left text-xs space-y-1">
              <span className="text-[10px] text-stone-500 font-mono block">獨立網頁專屬連結 URL：</span>
              <div className="font-mono text-amber-300 text-[11px] break-all select-all">
                {window.location.origin}{window.location.pathname}?page=join
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?page=join`);
                  alert('已複製獨立會員申請網頁連結至剪貼簿！');
                }}
                className="flex-1 py-2.5 bg-[#20232E] hover:bg-[#2A2E3D] text-stone-200 text-xs font-semibold rounded-xl border border-[#2F3445] transition-all cursor-pointer"
              >
                複製專屬連結
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowStandaloneModal(false);
                  window.open(`${window.location.origin}${window.location.pathname}?page=join`, '_blank');
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <span>立即開啟獨立頁</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
