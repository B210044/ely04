import React, { useState, useEffect } from 'react';
import { CartItem, OrderType, PaymentMethod, SalesOrder } from '../types/pos';
import { sounds } from '../utils/audio';
import { useMember } from '../context/MemberContext';
import { TIER_CONFIGS } from '../types/member';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Check,
  Receipt,
  Sparkles,
  Award,
  Search,
  CheckCircle2,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Phone,
  QrCode as QrIcon,
} from 'lucide-react';
import QRCode from 'qrcode';

interface CheckoutModalProps {
  items: CartItem[];
  orderType: OrderType;
  hasEcoCup: boolean;
  onClose: () => void;
  onCompleteCheckout: (order: SalesOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  orderType,
  hasEcoCup,
  onClose,
  onCompleteCheckout,
}) => {
  const {
    memberProfile,
    activePosMember,
    setActivePosMember,
    searchMembers,
    findMemberByPhone,
    manuallyVerifyMember,
    recordOrderForMember,
  } = useMember();

  const targetMember = activePosMember || memberProfile;

  const totalCups = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const ecoDiscount = hasEcoCup && totalCups > 0 ? totalCups * 5 : 0;

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const maxRedeemablePoints = targetMember
    ? Math.min(targetMember.points, Math.max(0, subtotal - ecoDiscount))
    : 0;
  const pointsDiscount = Math.min(pointsToRedeem, maxRedeemablePoints);

  const totalDue = Math.max(0, subtotal - ecoDiscount - pointsDiscount);

  // Points to earn
  const tierMultiplier = targetMember ? TIER_CONFIGS[targetMember.tier]?.multiplier || 1 : 1;
  const estimatedPointsEarned = targetMember ? Math.max(1, Math.floor((totalDue / 30) * tierMultiplier)) : 0;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totalDue);
  const [invoiceType, setInvoiceType] = useState<'paper' | 'carrier' | 'taxId'>('paper');
  const [carrierCode, setCarrierCode] = useState<string>('');
  const [taxIdNumber, setTaxIdNumber] = useState<string>('');

  // Inline member lookup in modal
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [showJoinQr, setShowJoinQr] = useState<boolean>(false);
  const [joinQrUrl, setJoinQrUrl] = useState<string>('');

  const changeTwd = Math.max(0, cashTendered - totalDue);
  const isCashInsufficient = paymentMethod === 'cash' && cashTendered < totalDue;

  // Generate QR for standalone member signup
  useEffect(() => {
    const signupUrl = `${window.location.origin}${window.location.pathname}?page=join`;
    QRCode.toDataURL(signupUrl, {
      margin: 1,
      width: 220,
      color: { dark: '#111217', light: '#FFFFFF' },
    }).then(setJoinQrUrl).catch(() => {});
  }, []);

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'cash', label: '現金支付', icon: <Banknote className="w-4 h-4 text-emerald-400" /> },
    { id: 'linepay', label: 'LINE Pay', icon: <QrCode className="w-4 h-4 text-emerald-500" /> },
    { id: 'jko', label: '街口支付', icon: <Smartphone className="w-4 h-4 text-rose-400" /> },
    { id: 'credit', label: '信用卡', icon: <CreditCard className="w-4 h-4 text-sky-400" /> },
    { id: 'applepay', label: 'Apple Pay', icon: <Smartphone className="w-4 h-4 text-stone-300" /> },
  ];

  const handleQuickCash = (amount: number) => {
    sounds.playClick();
    setCashTendered(amount);
  };

  const handleAddCash = (increment: number) => {
    sounds.playClick();
    setCashTendered((prev) => prev + increment);
  };

  const handleSearchAndBind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearchStatus('查詢手機中...');
    sounds.playClick();
    
    // First try exact phone match
    const exact = await findMemberByPhone(searchPhone);
    if (exact) {
      sounds.playRegister();
      setActivePosMember(exact);
      setSearchStatus(`✓ 已確認會員：${exact.displayName} (${exact.phone})`);
      return;
    }

    // Secondary fallback search
    const results = await searchMembers(searchPhone);
    if (results.length > 0) {
      sounds.playRegister();
      setActivePosMember(results[0]);
      setSearchStatus(`✓ 已確認會員：${results[0].displayName} (${results[0].phone})`);
    } else {
      setSearchStatus('❌ 查無符合手機號碼。可請顧客掃碼至獨立網頁立即申請，現領 10 點！');
    }
  };

  const handleManualVerify = async () => {
    if (!targetMember) return;
    sounds.playRegister();
    const ok = await manuallyVerifyMember(targetMember.id, true, '店長 陳品研 (櫃台現場確認)');
    if (ok) {
      setSearchStatus('✓ 已由門市人員手動確認完成會員審核！');
    }
  };

  const handleConfirmPayment = async () => {
    if (isCashInsufficient) return;
    sounds.playRegister();

    const orderNumber = `#A${String(Math.floor(10 + Math.random() * 90))}`;
    const invoicePrefix = 'TW-' + Math.floor(10000000 + Math.random() * 90000000);
    const randomCode = String(Math.floor(1000 + Math.random() * 9000));

    const totalDiscount = ecoDiscount + pointsDiscount;

    const newOrder: SalesOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      orderNumber,
      timestamp: Date.now(),
      orderType,
      items: [...items],
      itemsCount: totalCups,
      subtotal,
      discount: totalDiscount,
      totalTwd: totalDue,
      paymentMethod,
      tenderedTwd: paymentMethod === 'cash' ? cashTendered : totalDue,
      changeTwd: paymentMethod === 'cash' ? changeTwd : 0,
      invoiceType,
      carrierCode: invoiceType === 'carrier' ? carrierCode || '/AB20-9K' : undefined,
      taxIdNumber: invoiceType === 'taxId' ? taxIdNumber || '83920194' : undefined,
      invoiceNumber: invoicePrefix,
      randomCode,
      // Member linkage and points
      memberId: targetMember?.id,
      memberName: targetMember?.displayName,
      memberPhone: targetMember?.phone,
      memberEmail: targetMember?.email,
      pointsEarned: targetMember ? estimatedPointsEarned : undefined,
      pointsRedeemed: pointsDiscount > 0 ? pointsDiscount : undefined,
      pointsDiscount: pointsDiscount > 0 ? pointsDiscount : undefined,
    };

    // Record order points in Google Cloud Firestore & update member profile
    if (targetMember) {
      try {
        await recordOrderForMember(newOrder, pointsDiscount, pointsDiscount);
      } catch (err) {
        console.error('Failed to sync member order to Firestore:', err);
      }
    }

    onCompleteCheckout(newOrder);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#181A22] border border-[#2B2F3D] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-stone-200 animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#13141A] border-b border-[#242733] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                櫃台收銀結帳
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                {orderType === 'takeout' ? '外帶' : orderType === 'dinein' ? '內用' : '外送'} · 共 {totalCups} 杯飲品
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#20232E] text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="p-6 bg-[#16171F] border-b border-[#242733] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block font-mono">
              應收結帳金額 (TOTAL DUE)
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
              NT$ {totalDue}
            </div>
          </div>

          <div className="text-right text-xs text-stone-400 font-mono space-y-0.5">
            <div>小計: NT$ {subtotal}</div>
            {ecoDiscount > 0 && <div className="text-emerald-400">環保杯折抵: -NT$ {ecoDiscount}</div>}
            {pointsDiscount > 0 && <div className="text-amber-400 font-bold">會員點數折抵: -NT$ {pointsDiscount}</div>}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[68vh] overflow-y-auto">
          {/* Member Loyalty Section */}
          <div className="p-4 rounded-xl bg-[#13151D] border border-[#272A36] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>會員手機確認與點數折抵</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinQr(true)}
                  className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 cursor-pointer"
                  title="出示 QR Code 讓顧客掃碼至獨立網頁申請"
                >
                  <QrIcon className="w-3 h-3 text-amber-400" />
                  <span>顧客掃碼申請 (立牌 QR)</span>
                </button>

                {targetMember && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActivePosMember(null);
                      setSearchStatus(null);
                    }}
                    className="text-[11px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    解除會員
                  </button>
                )}
              </div>
            </div>

            {targetMember ? (
              <div className="space-y-3">
                <div className="bg-[#1A1D27] p-3 rounded-xl border border-[#2A2E3D] space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                        {targetMember.displayName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{targetMember.displayName}</span>
                          <span className="text-amber-300 font-mono text-xs">({targetMember.phone})</span>
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          {targetMember.email} · {TIER_CONFIGS[targetMember.tier]?.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-stone-400">現有點數</div>
                      <div className="text-base font-bold text-amber-400 font-mono">
                        {targetMember.points} 點
                      </div>
                    </div>
                  </div>

                  {/* Manual verification status & Action */}
                  <div className="pt-2 border-t border-[#252936] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      {targetMember.verifiedByAdmin ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>管理者已手動審核通過</span>
                        </span>
                      ) : targetMember.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>信箱已驗證通過</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>尚未完成審核</span>
                        </span>
                      )}
                    </div>

                    {!targetMember.verifiedByAdmin && !targetMember.emailVerified && (
                      <button
                        type="button"
                        onClick={handleManualVerify}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow"
                      >
                        店員即時手動核准驗證
                      </button>
                    )}

                    <div className="text-[11px] font-mono text-emerald-400">
                      本單預計累積: +{estimatedPointsEarned} 點
                    </div>
                  </div>
                </div>

                {/* Points Redemption Selector if member has points */}
                {targetMember.points > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-stone-300">
                      <span>使用點數折抵現金 (1點 = NT$1):</span>
                      <span className="font-mono text-amber-400 font-bold">折抵 NT$ {pointsDiscount}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(0)}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                          pointsToRedeem === 0
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#1E212B] border-[#2A2E3A] text-stone-400 hover:text-white'
                        }`}
                      >
                        不折抵
                      </button>

                      <button
                        type="button"
                        disabled={maxRedeemablePoints < 10}
                        onClick={() => setPointsToRedeem(10)}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                          pointsToRedeem === 10
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#1E212B] border-[#2A2E3A] text-stone-400 hover:text-white'
                        }`}
                      >
                        抵 10 點
                      </button>

                      <button
                        type="button"
                        disabled={maxRedeemablePoints < 20}
                        onClick={() => setPointsToRedeem(20)}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                          pointsToRedeem === 20
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#1E212B] border-[#2A2E3A] text-stone-400 hover:text-white'
                        }`}
                      >
                        抵 20 點
                      </button>

                      <button
                        type="button"
                        disabled={maxRedeemablePoints <= 0}
                        onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                        className={`py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                          pointsToRedeem === maxRedeemablePoints && maxRedeemablePoints > 0
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#1E212B] border-[#2A2E3A] text-stone-400 hover:text-white'
                        }`}
                      >
                        全部折抵
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Phone number confirmation input for fast cashier entry */
              <div className="space-y-2">
                <form onSubmit={handleSearchAndBind} className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="輸入顧客手機號碼確認會員 (如 0912-345-678)..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#1B1E28] border border-[#2B2F3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0 shadow"
                  >
                    確認手機會員
                  </button>
                </form>

                {searchStatus && (
                  <div className="text-[11px] text-amber-300/90 font-mono pl-1">
                    {searchStatus}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
              1. 選擇支付途徑 (Payment Method)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPaymentMethod(opt.id);
                      if (opt.id === 'cash') {
                        setCashTendered(totalDue);
                      }
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#1F222C] border-[#2A2E3B] text-stone-300 hover:bg-[#252935]'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Calculation Pad (If Cash Selected) */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-xl bg-[#13141B] border border-[#252834] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-300 font-mono">
                  現金收銀快速找零計算
                </span>
                <span className="text-xs font-mono text-amber-400">
                  實收: NT$ {cashTendered}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => handleQuickCash(totalDue)}
                  className="py-2 px-2 rounded-lg bg-[#222530] text-stone-300 hover:text-white hover:bg-[#2C3140] border border-[#303546] transition-colors cursor-pointer"
                >
                  剛好 NT$ {totalDue}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(100)}
                  className="py-2 px-2 rounded-lg bg-[#222530] text-stone-300 hover:text-white hover:bg-[#2C3140] border border-[#303546] transition-colors cursor-pointer"
                >
                  $100
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(500)}
                  className="py-2 px-2 rounded-lg bg-[#222530] text-stone-300 hover:text-white hover:bg-[#2C3140] border border-[#303546] transition-colors cursor-pointer"
                >
                  $500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(1000)}
                  className="py-2 px-2 rounded-lg bg-[#222530] text-stone-300 hover:text-white hover:bg-[#2C3140] border border-[#303546] transition-colors cursor-pointer"
                >
                  $1,000
                </button>
              </div>

              {/* Cash Increment Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">增減面額:</span>
                <button
                  type="button"
                  onClick={() => handleAddCash(50)}
                  className="px-2.5 py-1 text-xs rounded bg-[#20232E] text-stone-300 hover:bg-[#2A2F3E] border border-[#2E3344] cursor-pointer"
                >
                  +50
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(100)}
                  className="px-2.5 py-1 text-xs rounded bg-[#20232E] text-stone-300 hover:bg-[#2A2F3E] border border-[#2E3344] cursor-pointer"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(500)}
                  className="px-2.5 py-1 text-xs rounded bg-[#20232E] text-stone-300 hover:bg-[#2A2F3E] border border-[#2E3344] cursor-pointer"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(0)}
                  className="ml-auto px-2.5 py-1 text-xs rounded text-stone-500 hover:text-rose-400 cursor-pointer"
                >
                  歸零
                </button>
              </div>

              {/* Change Indicator */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1C1E27] border border-[#2C3140]">
                <span className="text-xs font-bold text-stone-300">
                  {isCashInsufficient ? '實收不足金額' : '應找零金額 (Change)'}
                </span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    isCashInsufficient ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isCashInsufficient ? `-NT$ ${totalDue - cashTendered}` : `NT$ ${changeTwd}`}
                </span>
              </div>
            </div>
          )}

          {/* Invoice & Carrier Options */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
              2. 統一發票開立模式
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInvoiceType('paper')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  invoiceType === 'paper'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#1F222C] border-[#2A2E3B] text-stone-400 hover:bg-[#252935]'
                }`}
              >
                電子發票 (印出紙本)
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('carrier')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  invoiceType === 'carrier'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#1F222C] border-[#2A2E3B] text-stone-400 hover:bg-[#252935]'
                }`}
              >
                手機條碼載具
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('taxId')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  invoiceType === 'taxId'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#1F222C] border-[#2A2E3B] text-stone-400 hover:bg-[#252935]'
                }`}
              >
                公司統一編號 (8碼)
              </button>
            </div>

            {invoiceType === 'carrier' && (
              <input
                type="text"
                placeholder="請輸入手機載具條碼 (如: /AB32-9K)"
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="mt-2.5 w-full px-3.5 py-2 bg-[#1C1E27] border border-[#2B2F3D] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            )}

            {invoiceType === 'taxId' && (
              <input
                type="text"
                maxLength={8}
                placeholder="請輸入 8 碼公司統一編號"
                value={taxIdNumber}
                onChange={(e) => setTaxIdNumber(e.target.value.replace(/\D/g, ''))}
                className="mt-2.5 w-full px-3.5 py-2 bg-[#1C1E27] border border-[#2B2F3D] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#13141B] border-t border-[#242733] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-[#20232E] hover:bg-[#2A2E3D] text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            返回點單
          </button>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isCashInsufficient}
            className="flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:bg-stone-800 disabled:text-stone-600 disabled:pointer-events-none text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>完成結帳 · 出單列印收據 (NT$ {totalDue})</span>
          </button>
        </div>
      </div>

      {/* Standalone Join QR Popup for customer to scan on their phone */}
      {showJoinQr && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowJoinQr(false)}
        >
          <div
            className="bg-[#181A22] border border-[#2B2F3D] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                顧客專屬獨立申請頁
              </span>
              <button
                type="button"
                onClick={() => setShowJoinQr(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white font-display">
              請顧客使用手機相機掃碼
            </h3>

            {joinQrUrl ? (
              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                <img src={joinQrUrl} alt="Join VIP Member QR" className="w-48 h-48 mx-auto" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-stone-800 rounded-2xl mx-auto flex items-center justify-center">
                <QrIcon className="w-12 h-12 text-stone-500" />
              </div>
            )}

            <div className="space-y-1 text-xs text-stone-400">
              <p className="text-amber-300 font-semibold">
                手機掃碼即可在獨立網頁填寫姓名與電話
              </p>
              <p className="text-[11px] text-stone-500">
                註冊即領 10 點入會禮，送出後報電話立即折抵 NT$ 10！
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowJoinQr(false);
                window.open(`${window.location.origin}${window.location.pathname}?page=join`, '_blank');
              }}
              className="w-full py-2 bg-[#222532] hover:bg-[#2B2F3F] text-stone-300 text-xs font-semibold rounded-xl border border-[#2F3445] transition-all cursor-pointer"
            >
              直接在當前裝置開啟獨立頁面
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
