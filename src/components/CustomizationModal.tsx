import React, { useState } from 'react';
import { CupSize, PosDrink, ToppingOption, CartItem } from '../types/pos';
import { ICE_OPTIONS, SWEETNESS_OPTIONS, TOPPING_OPTIONS } from '../data/posData';
import { sounds } from '../utils/audio';
import { X, Plus, Minus, Check, Flame, Snowflake, Sparkles } from 'lucide-react';

interface CustomizationModalProps {
  drink: PosDrink;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  drink,
  onClose,
  onAddToCart,
}) => {
  const [size, setSize] = useState<CupSize>('L');
  const [ice, setIce] = useState<string>(drink.defaultIce || '少冰');
  const [sweetness, setSweetness] = useState<string>(drink.defaultSweetness || '半糖');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>(() => {
    // Preselect defaults if matching
    return TOPPING_OPTIONS.filter((t) => drink.defaultToppings.includes(t.name));
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');

  // Price calculations in TWD
  const sizeSurcharge = size === 'L' ? 10 : 0;
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.priceTwd, 0);
  const unitPrice = drink.basePriceTwd + sizeSurcharge + toppingsTotal;
  const totalSubtotal = unitPrice * quantity;

  const toggleTopping = (topping: ToppingOption) => {
    sounds.playPearlPop();
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleConfirm = () => {
    sounds.playSealSnap();
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      drinkId: drink.id,
      name: drink.name,
      chineseName: drink.chineseName,
      number: drink.number,
      size,
      ice,
      sweetness,
      toppings: selectedToppings,
      note: customNote.trim() || undefined,
      unitPrice,
      quantity,
      subtotal: totalSubtotal,
      image: drink.image,
    };
    onAddToCart(newItem);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#181A20] border border-[#2B2F3B] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-stone-200 animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Preview Banner */}
        <div className="relative bg-[#121316] border-b border-[#262933] p-4 sm:p-5 flex items-start gap-4">
          <img
            src={drink.image}
            alt={drink.chineseName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-[#2F3340] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                FLOW #{drink.number}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {drink.categoryLabel}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              {drink.chineseName}
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-0.5 truncate">
              {drink.name} · {drink.notes}
            </p>
            <div className="mt-2 text-amber-400 font-bold font-mono text-base">
              基本定價 NT$ {drink.basePriceTwd}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#22252F] text-stone-400 hover:text-white hover:bg-[#2C313E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(85vh-14rem)] overflow-y-auto">
          {/* 1. Cup Size */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
              1. 規格容量 (Cup Size)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSize('M');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  size === 'M'
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/40'
                    : 'bg-[#1F222B] border-[#2A2E3B] text-stone-400 hover:text-stone-200 hover:bg-[#252934]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">中杯 (M - 500ml)</span>
                  <span className="font-mono text-xs text-stone-400">+NT$ 0</span>
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">標準手搖份量</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSize('L');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  size === 'L'
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/40'
                    : 'bg-[#1F222B] border-[#2A2E3B] text-stone-400 hover:text-stone-200 hover:bg-[#252934]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">大杯 (L - 700ml)</span>
                  <span className="font-mono text-xs text-amber-400">+NT$ 10</span>
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">大容量滿足推薦</span>
              </button>
            </div>
          </div>

          {/* 2. Ice Level */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                2. 冰量選擇 (Ice Level)
              </label>
              <span className="text-xs text-amber-400/90 font-mono">已選: {ice}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ICE_OPTIONS.map((opt) => {
                const isSelected = ice === opt.label;
                const isHot = opt.id === 'hot' || opt.id === 'warm';
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sounds.playIceClink();
                      setIce(opt.label);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-sm'
                        : 'bg-[#1F222B] border-[#2A2E3B] text-stone-300 hover:bg-[#262A35]'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs">
                      {isHot ? (
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <Snowflake className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      )}
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-stone-500">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sweetness Level */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                3. 甜度選擇 (Sweetness)
              </label>
              <span className="text-xs text-amber-400/90 font-mono">已選: {sweetness}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SWEETNESS_OPTIONS.map((opt) => {
                const isSelected = sweetness === opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSweetness(opt.label);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-sm'
                        : 'bg-[#1F222B] border-[#2A2E3B] text-stone-300 hover:bg-[#262A35]'
                    }`}
                  >
                    <span className="text-xs font-medium">{opt.label}</span>
                    <span className="text-[10px] text-stone-500">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Toppings (+10/15 TWD) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                4. 口感加料 (Toppings) · 依需求自由複選
              </label>
              <span className="text-xs text-stone-400">
                已選 {selectedToppings.length} 項 (+NT$ {toppingsTotal})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TOPPING_OPTIONS.map((top) => {
                const isSelected = selectedToppings.some((t) => t.id === top.id);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/70 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-[#1F222B] border-[#2A2E3B] text-stone-300 hover:bg-[#252934]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{top.name}</div>
                      <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                        +NT$ {top.priceTwd}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-black'
                          : 'border border-stone-600 bg-black/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Custom Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              客製備註 (Optional Note)
            </label>
            <input
              type="text"
              placeholder="例：自備環保杯、珍珠少一點、茶濃..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1F222B] border border-[#2D313E] rounded-xl text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Footer & Live Calculation Bar */}
        <div className="p-4 sm:p-5 bg-[#121316] border-t border-[#262933] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Stepper & Unit Price */}
          <div className="flex items-center gap-5 justify-between sm:justify-start">
            <div className="flex items-center gap-2 bg-[#1F222B] border border-[#2F3342] rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg bg-[#272B37] text-stone-300 hover:text-white hover:bg-[#323746] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono font-bold text-base text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setQuantity((q) => q + 1);
                }}
                className="w-8 h-8 rounded-lg bg-[#272B37] text-stone-300 hover:text-white hover:bg-[#323746] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-[11px] text-stone-400 block font-mono">
                單杯 NT$ {unitPrice}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
                NT$ {totalSubtotal}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>加入點單清單 (NT$ {totalSubtotal})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
