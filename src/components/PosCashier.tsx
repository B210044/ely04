import React, { useState } from 'react';
import { CartItem, DrinkCategory, OrderType, PosDrink } from '../types/pos';
import { DRINK_CATEGORIES, POS_DRINKS } from '../data/posData';
import { sounds } from '../utils/audio';
import { PosCart } from './PosCart';
import { CustomizationModal } from './CustomizationModal';
import { Search, SlidersHorizontal, Plus, Sparkles } from 'lucide-react';

interface PosCashierProps {
  cartItems: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  hasEcoCup: boolean;
  setHasEcoCup: (hasEco: boolean | ((prev: boolean) => boolean)) => void;
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const PosCashier: React.FC<PosCashierProps> = ({
  cartItems,
  orderType,
  setOrderType,
  hasEcoCup,
  setHasEcoCup,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConfigDrink, setActiveConfigDrink] = useState<PosDrink | null>(null);

  const filteredDrinks = POS_DRINKS.filter((drink) => {
    const matchesCat = selectedCategory === 'all' || drink.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;

    const matchesSearch =
      drink.chineseName.toLowerCase().includes(query) ||
      drink.name.toLowerCase().includes(query) ||
      drink.number.includes(query) ||
      drink.notes.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  const handleCardClick = (drink: PosDrink) => {
    sounds.playClick();
    setActiveConfigDrink(drink);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0F1013]">
      {/* Left Menu Section */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Controls: Categories & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#22252F] bg-[#14151B] sticky top-0 z-10 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Segmented Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#1A1C24] border border-[#272B38] rounded-xl scrollbar-none">
              {DRINK_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCategory(cat.id as DrinkCategory);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-[#232733]'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋飲品、編號或茶底 (如: 01, 抹茶)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-[#1C1E26] border border-[#2B2F3D] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 hover:text-stone-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drink Grid */}
        <div className="p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredDrinks.map((drink) => (
              <div
                key={drink.id}
                onClick={() => handleCardClick(drink)}
                className="group bg-[#16181F] border border-[#252834] hover:border-amber-500/60 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col hover:-translate-y-0.5 shadow-md"
              >
                {/* Visual Area with Scrim */}
                <div className="relative aspect-4/3 w-full bg-[#1A1C24] overflow-hidden">
                  <img
                    src={drink.image}
                    alt={drink.chineseName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  {/* Flow Number & Tag */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.8 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold border border-amber-500/20">
                    <span>#{drink.number}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-stone-300 font-sans">{drink.categoryLabel}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-2.5 right-2.5 bg-amber-500 text-black px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono shadow-md">
                    NT$ {drink.basePriceTwd}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-display group-hover:text-amber-400 transition-colors">
                      {drink.chineseName}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5 truncate">
                      {drink.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                      {drink.description}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-[#232632] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-500 truncate max-w-[150px]">
                      {drink.notes}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg bg-[#222530] group-hover:bg-amber-500 group-hover:text-black text-amber-400 font-semibold transition-all flex items-center gap-1 text-xs shrink-0"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>配置點選</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDrinks.length === 0 && (
            <div className="py-20 text-center text-stone-500">
              <p className="text-sm">查無符合「{searchQuery}」條件之飲品</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-amber-400 underline cursor-pointer"
              >
                重設所有篩選條件
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Cart Section */}
      <PosCart
        items={cartItems}
        orderType={orderType}
        setOrderType={setOrderType}
        hasEcoCup={hasEcoCup}
        setHasEcoCup={setHasEcoCup}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
        onOpenCheckout={onOpenCheckout}
      />

      {/* Customization Modal */}
      {activeConfigDrink && (
        <CustomizationModal
          drink={activeConfigDrink}
          onClose={() => setActiveConfigDrink(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};
