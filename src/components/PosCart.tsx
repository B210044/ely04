import React from 'react';
import { CartItem, OrderType } from '../types/pos';
import { sounds } from '../utils/audio';
import { useMember } from '../context/MemberContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Receipt,
  UtensilsCrossed,
  CupSoda,
  Bike,
  Sparkles,
  Leaf,
  Award,
} from 'lucide-react';

interface PosCartProps {
  items: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  hasEcoCup: boolean;
  setHasEcoCup: (hasEco: boolean | ((prev: boolean) => boolean)) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const PosCart: React.FC<PosCartProps> = ({
  items,
  orderType,
  setOrderType,
  hasEcoCup,
  setHasEcoCup,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) => {
  const { activePosMember, memberProfile, setActivePosMember } = useMember();
  const targetMember = activePosMember || memberProfile;

  const totalCups = items.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const ecoDiscount = hasEcoCup && totalCups > 0 ? totalCups * 5 : 0;
  const finalTotalTwd = Math.max(0, rawSubtotal - ecoDiscount);

  const orderTypeOptions: { id: OrderType; label: string; icon: React.ReactNode }[] = [
    { id: 'takeout', label: '外帶', icon: <CupSoda className="w-3.5 h-3.5" /> },
    { id: 'dinein', label: '內用', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: 'delivery', label: '外送', icon: <Bike className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] bg-[#16181F] border-l border-[#242732] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 shadow-2xl">
      {/* Top Header */}
      <div className="p-4 border-b border-[#242732] bg-[#121316]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              即時點單明細
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#20232D] text-amber-400 border border-[#2F3444]">
              {totalCups} 杯
            </span>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClearCart();
              }}
              className="text-xs text-stone-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          )}
        </div>

        {/* Order Type Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1C1F28] border border-[#2B2F3D] rounded-xl">
          {orderTypeOptions.map((opt) => {
            const isSelected = orderType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setOrderType(opt.id);
                }}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart Items List or Required Empty State */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <div className="w-16 h-16 rounded-2xl bg-[#1C1F28] border border-[#282C38] flex items-center justify-center text-stone-400 mb-4 shadow-inner">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            {/* EXACT REQUIRED EMPTY STATE TEXT */}
            <h3 className="text-base font-bold text-stone-200 font-display">
              尚未加入任何飲品
            </h3>
            <p className="text-xs text-stone-400 mt-2 max-w-[260px] leading-relaxed">
              點擊左側飲品卡片即可配置冰塊、甜度與加料
            </p>
            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1C24] border border-[#272B38] text-[11px] text-amber-400/80 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>可自選冰量 · 甜度 · 多種加料</span>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#1A1C24] border border-[#282C38] hover:border-[#383E4E] transition-all flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-2.5 min-w-0">
                  <img
                    src={item.image}
                    alt={item.chineseName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-[#2C303E] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">
                        {item.chineseName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        {item.size}杯
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1 font-mono">
                      <span>{item.ice}</span>
                      <span>·</span>
                      <span>{item.sweetness}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                    NT$ {item.subtotal}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    NT$ {item.unitPrice} /杯
                  </span>
                </div>
              </div>

              {/* Toppings Tags */}
              {item.toppings.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-[#232631]">
                  {item.toppings.map((top) => (
                    <span
                      key={top.id}
                      className="px-1.5 py-0.5 rounded bg-[#222530] border border-[#2E3342] text-[10px] text-stone-300 font-mono"
                    >
                      +{top.name} (${top.priceTwd})
                    </span>
                  ))}
                </div>
              )}

              {item.note && (
                <div className="text-[11px] text-stone-400 italic bg-[#15171D] px-2 py-1 rounded">
                  備註: {item.note}
                </div>
              )}

              {/* Controls: Stepper & Remove */}
              <div className="flex items-center justify-between pt-1 border-t border-[#232631]">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onRemoveItem(item.id);
                  }}
                  className="p-1.5 text-stone-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="刪除此品項"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 bg-[#14161C] border border-[#272B38] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onUpdateQuantity(item.id, -1);
                    }}
                    className="w-6 h-6 rounded bg-[#20232E] text-stone-300 hover:text-white hover:bg-[#2B303E] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-xs text-white tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onUpdateQuantity(item.id, 1);
                    }}
                    className="w-6 h-6 rounded bg-[#20232E] text-stone-300 hover:text-white hover:bg-[#2B303E] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="p-4 bg-[#121316] border-t border-[#242732] space-y-3">
        {/* Member loyalty banner */}
        {targetMember ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{targetMember.displayName}</span>
              <span className="font-mono text-stone-400 text-[11px]">({targetMember.points} 點)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActivePosMember(null);
              }}
              className="text-[10px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              解除
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#181A22] border border-[#272B38] text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-stone-500" />
              <span>會員集點</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono">結帳時報電話即可</span>
          </div>
        )}

        {/* Eco Cup Checkbox */}
        <label className="flex items-center justify-between p-2 rounded-lg bg-[#181A22] border border-[#262A36] text-xs text-stone-300 cursor-pointer hover:bg-[#1E212B] transition-colors">
          <div className="flex items-center gap-2">
            <Leaf className={`w-3.5 h-3.5 ${hasEcoCup ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span>自備環保杯優惠 (每杯 -NT$ 5)</span>
          </div>
          <input
            type="checkbox"
            checked={hasEcoCup}
            onChange={(e) => {
              sounds.playClick();
              setHasEcoCup(e.target.checked);
            }}
            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
          />
        </label>

        {/* Live TWD Calculation Breakdown */}
        <div className="space-y-1.5 text-xs text-stone-400 font-mono">
          <div className="flex items-center justify-between">
            <span>品項小計 (Subtotal)</span>
            <span className="tabular-nums text-stone-200">NT$ {rawSubtotal}</span>
          </div>
          {ecoDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>環保折抵 ({totalCups}杯)</span>
              <span className="tabular-nums">-NT$ {ecoDiscount}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#242732] text-sm font-bold text-white">
            <span className="font-display">應收總額 (Total Due)</span>
            <span className="text-xl font-mono text-amber-400 tabular-nums">
              NT$ {finalTotalTwd}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenCheckout();
          }}
          disabled={items.length === 0}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:bg-stone-800 disabled:text-stone-600 disabled:pointer-events-none text-black font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Receipt className="w-5 h-5" />
          <span>結帳收銀 (NT$ {finalTotalTwd})</span>
        </button>
      </div>
    </aside>
  );
};
