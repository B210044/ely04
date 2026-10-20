import React, { useState } from 'react';
import {
  BaseTeaId,
  CartItem,
  CupSize,
  IceLevel,
  MilkTypeId,
  SignatureDrink,
  StrawColor,
  SweetnessLevel,
  ToppingId,
} from '../types/boba';
import { BASE_TEAS, MILK_TYPES, TOPPINGS, SIGNATURE_12_FLOWS } from '../data/signatureDrinks';
import { CupVisualizer } from './CupVisualizer';
import { sounds } from '../utils/audio';
import { Plus, Check, Bookmark, Sparkles, ChevronDown, Flame, Coffee } from 'lucide-react';

interface BobaLabProps {
  initialConfig?: SignatureDrink | null;
  onAddToCart: (item: CartItem) => void;
}

export const BobaLab: React.FC<BobaLabProps> = ({ initialConfig, onAddToCart }) => {
  const [baseTea, setBaseTea] = useState<BaseTeaId>(initialConfig?.baseTea || 'ceylon');
  const [milk, setMilk] = useState<MilkTypeId>(initialConfig?.milk || 'fresh_milk');
  const [sweetness, setSweetness] = useState<SweetnessLevel>(initialConfig?.defaultSweetness ?? 50);
  const [ice, setIce] = useState<IceLevel>(initialConfig?.defaultIce ?? 'regular');
  const [toppings, setToppings] = useState<ToppingId[]>(
    initialConfig?.defaultToppings || ['brown_sugar_boba']
  );
  const [size, setSize] = useState<CupSize>('standard');
  const [strawColor, setStrawColor] = useState<StrawColor>('charcoal');
  const [customName, setCustomName] = useState<string>(
    initialConfig ? `Custom ${initialConfig.name}` : 'My Signature Flow'
  );
  const [savedRecipes, setSavedRecipes] = useState<{ id: string; name: string }[]>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_saved_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Update when initialConfig changes
  React.useEffect(() => {
    if (initialConfig) {
      setBaseTea(initialConfig.baseTea);
      setMilk(initialConfig.milk);
      setSweetness(initialConfig.defaultSweetness);
      setIce(initialConfig.defaultIce);
      setToppings([...initialConfig.defaultToppings]);
      setCustomName(`Crafted: ${initialConfig.name}`);
    }
  }, [initialConfig]);

  // Price calculation
  const basePrice = 5.25;
  const sizeSurcharge = size === 'grande' ? 1.0 : 0.0;
  const toppingsPrice = toppings.reduce((sum, tId) => sum + (TOPPINGS[tId]?.price || 0), 0);
  const totalPrice = basePrice + sizeSurcharge + toppingsPrice;

  // Calorie calculation
  const milkCal = MILK_TYPES[milk]?.calories || 0;
  const sweetnessCal = Math.round((sweetness / 100) * 80);
  const toppingsCal = toppings.reduce((sum, tId) => sum + (TOPPINGS[tId]?.calories || 0), 0);
  const totalCalories = Math.round((milkCal + sweetnessCal + toppingsCal) * (size === 'grande' ? 1.3 : 1.0));

  // Caffeine
  const caffeineMg = Math.round((BASE_TEAS[baseTea]?.caffeineMg || 0) * (size === 'grande' ? 1.3 : 1.0));

  const handleToggleTopping = (tId: ToppingId) => {
    if (toppings.includes(tId)) {
      sounds.playClick();
      setToppings(toppings.filter((id) => id !== tId));
    } else {
      if (toppings.length >= 3) {
        // max 3 toppings
        return;
      }
      sounds.playPearlPop();
      setToppings([...toppings, tId]);
    }
  };

  const handleSaveRecipe = () => {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      name: customName.trim() || 'Artisanal Blend',
      baseTea,
      milk,
      sweetness,
      ice,
      toppings,
      size,
    };
    const updated = [newRecipe, ...savedRecipes.slice(0, 7)];
    setSavedRecipes(updated);
    try {
      localStorage.setItem('bobaflow_saved_recipes', JSON.stringify(updated));
    } catch {}
    sounds.playSuccessChime();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleAddCustomToCart = () => {
    sounds.playPearlPop();
    const item: CartItem = {
      cartItemId: `custom-${Date.now()}`,
      name: customName || 'Custom Boba Flow',
      size,
      baseTea,
      milk,
      sweetness,
      ice,
      toppings: [...toppings],
      unitPrice: totalPrice,
      quantity: 1,
    };
    onAddToCart(item);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1800);
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lab Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-800 uppercase mb-1">
            <span>Fluid Formulation</span>
            <span aria-hidden="true">·</span>
            <span>Live Interactive Cup Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-display">
            Artisanal Boba Lab
          </h2>
          <p className="mt-1 text-sm text-stone-600 max-w-xl">
            Engineer your custom brew with micro-adjustments to steep profile, organic plant mylks, cold-simmered pearls, and ice thermodynamics.
          </p>
        </div>

        {/* Main Lab Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Visual Simulator & Live Telemetry (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center sticky lg:top-20">
            {/* Drink Name Input */}
            <div className="w-full mb-4">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Give your blend a name..."
                className="w-full text-center text-lg font-bold font-display text-stone-900 border-b border-dashed border-stone-300 pb-1 focus:outline-hidden focus:border-amber-700 bg-transparent placeholder:text-stone-400"
              />
            </div>

            {/* Visualizer */}
            <div className="my-2 py-4">
              <CupVisualizer
                baseTea={baseTea}
                milk={milk}
                sweetness={sweetness}
                ice={ice}
                toppings={toppings}
                size={size}
                strawColor={strawColor}
                isInteractive={true}
              />
            </div>

            {/* Telemetry & Nutritional Specs */}
            <div className="w-full mt-6 pt-5 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Energy
                </span>
                <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                  {totalCalories}
                </span>
                <span className="text-[10px] text-stone-500 block">kcal</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Caffeine
                </span>
                <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                  {caffeineMg}
                </span>
                <span className="text-[10px] text-stone-500 block">mg</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/50">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Formula Price
                </span>
                <span className="text-base font-bold font-mono text-amber-800 tabular-nums">
                  ${totalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-500 block">USD</span>
              </div>
            </div>

            {/* Straw Color Bar */}
            <div className="w-full mt-4 flex items-center justify-between px-2 text-xs text-stone-500">
              <span>Straw Style</span>
              <div className="flex items-center gap-2">
                {(['charcoal', 'amber', 'matcha', 'rose'] as StrawColor[]).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setStrawColor(col);
                    }}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      col === 'charcoal'
                        ? 'bg-stone-800'
                        : col === 'amber'
                        ? 'bg-amber-600'
                        : col === 'matcha'
                        ? 'bg-emerald-700'
                        : 'bg-rose-400'
                    } ${strawColor === col ? 'ring-2 ring-stone-950 scale-110' : 'opacity-70'}`}
                    title={`${col} straw`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom CTAs on Left Card */}
            <div className="w-full mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveRecipe}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{saveSuccessNotice ? 'Saved!' : 'Save Recipe'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddCustomToCart}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  addedNotice
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                }`}
              >
                {addedNotice ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addedNotice ? 'Added to Bag' : `Add ($${totalPrice.toFixed(2)})`}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Preset Flow Quick Loader */}
            <div className="p-4 bg-white border border-stone-200/90 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Quick Base From 12 Flows
                </span>
                <span className="text-xs text-stone-400">Load and modify</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SIGNATURE_12_FLOWS.slice(0, 6).map((flow) => (
                  <button
                    key={flow.id}
                    type="button"
                    onClick={() => {
                      sounds.playLiquidPour();
                      setBaseTea(flow.baseTea);
                      setMilk(flow.milk);
                      setSweetness(flow.defaultSweetness);
                      setIce(flow.defaultIce);
                      setToppings([...flow.defaultToppings]);
                      setCustomName(`Crafted: ${flow.name}`);
                    }}
                    className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="font-mono text-amber-700 text-[10px]">#{flow.number}</span>
                    <span>{flow.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Base Tea Leaf Selection */}
            <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  Single-Estate Tea Liquor
                </h3>
                <span className="text-xs text-stone-400">Select 1 Base</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(BASE_TEAS).map((tea) => {
                  const isSelected = baseTea === tea.id;
                  return (
                    <button
                      key={tea.id}
                      type="button"
                      onClick={() => {
                        sounds.playLiquidPour();
                        setBaseTea(tea.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700/50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">{tea.name}</span>
                        <div
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: tea.color }}
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{tea.notes}</p>
                      <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-2">
                        <span>{tea.origin}</span>
                        <span>·</span>
                        <span>{tea.caffeineMg}mg caf</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dairy & Plant Mylk Base */}
            <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  Milk & Texture Base
                </h3>
                <span className="text-xs text-stone-400">Included</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(MILK_TYPES).map((m) => {
                  const isSelected = milk === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        sounds.playLiquidPour();
                        setMilk(m.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                      }`}
                    >
                      <span className="text-xs font-semibold block leading-tight">{m.name}</span>
                      <span
                        className={`text-[10px] mt-1 block ${
                          isSelected ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {m.calories} kcal
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sweetness & Ice Tuning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sweetness */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Sweetness
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-800">{sweetness}%</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {([0, 30, 50, 80, 100, 120] as SweetnessLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSweetness(level);
                      }}
                      className={`py-2 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                        sweetness === level
                          ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Ice Volume
                  </h3>
                  <span className="text-xs font-medium text-stone-500 capitalize">{ice}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['none', 'light', 'regular', 'warm'] as IceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        sounds.playIceClink();
                        setIce(lvl);
                      }}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all capitalize cursor-pointer ${
                        ice === lvl
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {lvl === 'none' ? 'No Ice (0%)' : lvl === 'light' ? 'Light (30%)' : lvl === 'regular' ? 'Regular (100%)' : 'Warm (Hot)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Artisanal Toppings Selection (Up to 3) */}
            <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 font-display flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  Toppings & Chews
                </h3>
                <span className="text-xs text-stone-400">
                  Select up to 3 ({toppings.length}/3)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(TOPPINGS).map((top) => {
                  const isSelected = toppings.includes(top.id);
                  return (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => handleToggleTopping(top.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50/70'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: top.color }}
                        />
                        <div>
                          <span className="text-xs font-semibold text-stone-900 block leading-tight">
                            {top.name}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            +{top.calories} kcal · {top.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-stone-700 shrink-0 ml-2">
                        +${top.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Cup Size */}
            <div className="p-5 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Cup Capacity
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Standard is perfect for high tea-density; Grande for long sips.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSize('standard');
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    size === 'standard'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Standard 16 oz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSize('grande');
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    size === 'grande'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  Grande 24 oz (+$1.00)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
