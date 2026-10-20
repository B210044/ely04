import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useMember } from '../context/MemberContext';
import { sounds } from '../utils/audio';
import { TIER_CONFIGS } from '../types/member';
import {
  Award,
  Sparkles,
  Phone,
  Mail,
  User,
  Calendar,
  CupSoda,
  CheckCircle2,
  ShieldCheck,
  Clock,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  Store,
  CreditCard,
  Gift,
  Coins,
  History,
  Lock,
  Smartphone,
} from 'lucide-react';

interface StandaloneMemberPageProps {
  onBackToPos?: () => void;
}

export const StandaloneMemberPage: React.FC<StandaloneMemberPageProps> = ({ onBackToPos }) => {
  const {
    currentUser,
    memberProfile,
    isLoading,
    authError,
    registerMember,
    loginMember,
    loginWithGoogle,
    logoutMember,
    clearAuthError,
  } = useMember();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formFavoriteDrink, setFormFavoriteDrink] = useState('炭焙鐵觀音厚奶');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Barcode / QR generation for virtual card
  const [cardQrUrl, setCardQrUrl] = useState<string>('');

  useEffect(() => {
    if (memberProfile) {
      const qrPayload = JSON.stringify({
        type: 'boba_vip',
        id: memberProfile.id,
        phone: memberProfile.phone,
        name: memberProfile.displayName,
      });
      QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 180,
        color: { dark: '#1B1C22', light: '#FFFFFF' },
      }).then(setCardQrUrl).catch(() => {});
    }
  }, [memberProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (mode === 'register') {
      if (!formName.trim() || !formPhone.trim()) {
        alert('請完整填寫姓名與行動電話（門市報號集點用）。');
        return;
      }
      if (formPassword.length < 6) {
        alert('密碼長度至少需 6 碼。');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        alert('兩次密碼輸入不一致，請確認。');
        return;
      }
    }

    setIsSubmitting(true);
    sounds.playClick();

    try {
      if (mode === 'register') {
        await registerMember({
          email: formEmail.trim(),
          password: formPassword,
          displayName: formName.trim(),
          phone: formPhone.trim(),
          birthday: formBirthday || undefined,
          favoriteDrink: formFavoriteDrink || undefined,
        });
        sounds.playRegister();
        setJustRegistered(true);
      } else {
        await loginMember(formEmail.trim(), formPassword);
        sounds.playRegister();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    sounds.playClick();
    try {
      await loginWithGoogle();
      sounds.playRegister();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tier = memberProfile ? TIER_CONFIGS[memberProfile.tier] : TIER_CONFIGS.bronze;

  return (
    <div className="min-h-screen bg-[#0D0E12] text-stone-200 selection:bg-amber-500/30 selection:text-amber-200 flex flex-col font-sans">
      {/* Top Standalone Header */}
      <header className="sticky top-0 z-30 bg-[#14161E]/95 backdrop-blur-md border-b border-[#252835] px-4 py-3.5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-display text-lg shadow-inner">
              茶
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-bold text-white tracking-wider font-display">
                  茶研所 VIP 會員申請中心
                </h1>
                <span className="hidden sm:inline text-[10px] text-amber-400 font-mono tracking-widest uppercase">
                  MEMBER PORTAL
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                專屬手機集點 · 門市報號立享折抵 · Google 雲端同步
              </p>
            </div>
          </div>

          {onBackToPos && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onBackToPos();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20232E] hover:bg-[#2B2F3D] border border-[#2D3242] text-xs font-semibold text-stone-300 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>切換回前台 POS</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* If member is logged in, show their Member Card and Profile Status */}
        {currentUser && memberProfile ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {justRegistered && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3.5 text-emerald-200 shadow-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">
                    恭喜您！會員帳號已成功建立並存入 Google 雲端資料庫！
                  </h3>
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    您已獲得 <strong className="text-amber-300">10 點入會禮積分</strong>！往後到茶研所門市消費結帳時，只需向店員<strong>報您的手機號碼【{memberProfile.phone}】</strong>，即可自動累積積點與兌換折抵！
                  </p>
                </div>
              </div>
            )}

            {/* Standalone Digital VIP Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${tier.gradient} border border-amber-500/40 shadow-2xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold font-display text-xl">
                    茶
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-display tracking-wider">
                      茶研所 VIP 尊榮會員卡
                    </h2>
                    <span className="text-[10px] text-amber-400 font-mono tracking-widest">
                      TEA RESEARCH LAB PASS
                    </span>
                  </div>
                </div>

                <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${tier.badgeColor}`}>
                  {tier.name}
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-mono">
                      MEMBER NAME
                    </span>
                    <span className="text-2xl font-bold text-white tracking-wide">
                      {memberProfile.displayName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-mono">
                      REGISTERED PHONE (結帳報號專用)
                    </span>
                    <span className="text-lg font-bold font-mono text-amber-300 tracking-wider">
                      {memberProfile.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-mono">
                      EMAIL ADDRESS
                    </span>
                    <span className="text-xs text-stone-300 font-mono">
                      {memberProfile.email}
                    </span>
                  </div>
                </div>

                {/* QR Code and verification tag */}
                <div className="flex flex-col items-center justify-center sm:items-end space-y-2">
                  {cardQrUrl ? (
                    <div className="bg-white p-2.5 rounded-2xl shadow-xl">
                      <img src={cardQrUrl} alt="Member Barcode QR" className="w-28 h-28" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-[#181A22] rounded-2xl border border-stone-700 flex items-center justify-center text-stone-500">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                  <span className="text-[10px] text-stone-400 font-mono">
                    門市出示感應掃描 · ID: {memberProfile.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Card Bottom Stats */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-xs text-stone-300">目前累積點數：</span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {memberProfile.points}
                    </span>
                    <span className="text-xs text-amber-400/80">點</span>
                  </div>

                  <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                    (每點可折抵現金 NT$ 1)
                  </span>
                </div>

                <div className="text-xs text-stone-300">
                  {memberProfile.verifiedByAdmin ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>管理者已手動審核驗證通過</span>
                    </span>
                  ) : memberProfile.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>電子信箱已認證</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>待管理者手動確認審核 (可直接向店員報電話現場核准)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Notice Card */}
            <div className="p-5 rounded-2xl bg-[#151720] border border-[#262A36] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>會員驗證與門市消費指南</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#1A1D27] border border-[#282C3A] space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>1. 報手機號碼確認</span>
                  </div>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    至門市點餐收銀時，直接告訴店員您的手機號碼，即可一秒自動完成會員確認與點數累積。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#1A1D27] border border-[#282C3A] space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-sky-400" />
                    <span>2. 管理者手動審核</span>
                  </div>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    免繁瑣電子郵件點擊，門市店長與系統管理者可於後台直接一鍵手動確認您的會員資格。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#1A1D27] border border-[#282C3A] space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>3. 現金折抵無上限</span>
                  </div>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    現有 <strong className="text-amber-300 font-mono">{memberProfile.points} 點</strong>，結帳時每 1 點可現抵 NT$ 1 元，喝好茶更省荷包！
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    logoutMember();
                  }}
                  className="text-xs text-stone-400 hover:text-rose-400 underline cursor-pointer"
                >
                  登出目前帳號
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Standalone Application Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Brand & Benefits Presentation */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 inline-block">
                  入會即贈 10 點現金抵用金
                </span>
                <h2 className="text-3xl font-extrabold text-white font-display tracking-tight leading-snug">
                  加入茶研所 VIP <br />
                  尊享手搖茶飲專屬禮遇
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  免下載繁重 App，填寫基本資料即可完成個人會員申請！資料全數加密持久儲存於 Google Cloud Firestore 雲端資料庫。
                </p>
              </div>

              {/* Perks list */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#151720] border border-[#252834]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">新人入會禮</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      完成申請立即獲得 10 點會員點數，無低消門檻，首杯飲品即可折抵 NT$ 10！
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#151720] border border-[#252834]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">報手機號碼快速集點</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      門市點餐不需出示卡片，直接報手機號碼即可累積點數，消費滿 $30 累 1 點起。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#151720] border border-[#252834]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">管理者手動確認驗證</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      由門市店長與管理員直接手動審核核准，簡化流程，權益即刻生效。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Independent Registration / Login Form */}
            <div className="lg:col-span-7 bg-[#151720] border border-[#272B38] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Form Tab switcher */}
              <div className="flex items-center justify-between border-b border-[#242733] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {mode === 'register' ? '申請專屬會員帳號' : '會員帳號登入'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {mode === 'register' ? '請填寫真實行動電話以利門市結帳報號' : '登入查看您的點數餘額與專屬條碼'}
                  </p>
                </div>

                <div className="flex p-1 bg-[#1A1C25] rounded-xl border border-[#2B2F3D]">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setMode('register');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      mode === 'register'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    申請入會
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setMode('login');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      mode === 'login'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    登入
                  </button>
                </div>
              </div>

              {/* Auth error notice */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
                  {authError}
                </div>
              )}

              {/* Standalone Application Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5">
                        會員真實姓名 / 稱呼 *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="例：王小明"
                          className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-300 block mb-1.5">
                        行動電話 (結帳報號專用) *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="例：0912-345-678"
                          className="w-full bg-[#1B1E28] border border-amber-500/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1.5">
                    電子郵件信箱 (Email) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    帳號憑證與管理者手動審核依據
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1.5">
                      登入密碼 (至少 6 碼) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1.5">
                        確認密碼 *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={formConfirmPassword}
                          onChange={(e) => setFormConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1B1E28] border border-[#2B2F3D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-stone-400 block mb-1.5">
                        壽星生日 (選填，享專屬生日禮)
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
                        偏好招牌茶飲 (選填)
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
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:bg-stone-800 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>處理中，請稍候...</span>
                  ) : mode === 'register' ? (
                    <>
                      <span>送出申請 · 領取 10 點入會金</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <span>立即登入會員中心</span>
                  )}
                </button>
              </form>

              {/* Google Fast Sign-in */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#252834] w-full" />
                <span className="bg-[#151720] px-3 text-[11px] text-stone-500 uppercase tracking-widest absolute">
                  或快速登入
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
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
                <span>Google 帳號授權快速申請</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#20232E] py-6 text-center text-xs text-stone-500 font-mono">
        茶研所 TEA RESEARCH LAB · 顧客會員服務條款 · Google Cloud Firestore 雲端資料庫防護
      </footer>
    </div>
  );
};
