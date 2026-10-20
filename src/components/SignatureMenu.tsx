import React, { useState } from 'react';
import { SignatureDrink, ToppingId } from '../types/boba';
import { SIGNATURE_12_FLOWS, BASE_TEAS, MILK_TYPES, TOPPINGS } from '../data/signatureDrinks';
import { sounds } from '../utils/audio';
import { Plus, SlidersHorizontal, Info, X, Check } from 'lucide-react';

interface SignatureMenuProps {
  onSelectDrinkForLab: (drink: SignatureDrink) => void;
  onQuickAdd: (drink: SignatureDrink) => void;
}

export const SignatureMenu: React.FC<SignatureMenuProps> = ({
  onSelectDrinkForLab,
  onQuickAdd,
}) => {
  const [filter, setFilter] = useState<'all' | 'milk_tea' | 'cloud_foam' | 'fruit_spark' | 'pure_brew'>('all');
  const [activeDrinkModal, setActiveDrinkModal] = useState<SignatureDrink | null>(null);
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);

  const filteredDrinks = SIGNATURE_12_FLOWS.filter((drink) => {
    if (filter === 'all') return true;
    return drink.category === filter;
  });

  const handleQuickAddClick = (e: React.MouseEvent, drink: SignatureDrink) => {
    e.stopPropagation();
    sounds.playPearlPop();
    onQuickAdd(drink);
    setAddedNoticeId(drink.id);
    setTimeout(() => {
      setAddedNoticeId((current) => (current === drink.id ? null : current));
    }, 1500);
  };

  return (
    <section className="py-8 sm:py-12 bg-[#FAF8F5] border-t border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-800 uppercase mb-1">
              <span>Curated Selection</span>
              <span aria-hidden="true">·</span>
              <span>12 Hand-Crafted Formulas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-display">
              The 12 Signature Flows
            </h2>
            <p className="mt-1 text-sm text-stone-600 max-w-xl">
              Each recipe has been calibrated for precise tea-to-cream ratios, optimum chewing texture, and natural bouquet aromatics.
            </p>
          </div>

          {/* Functional Filter Tabs (Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All 12
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilter('milk_tea');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === 'milk_tea'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Milk Teas
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilter('cloud_foam');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === 'cloud_foam'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Cloud Foams
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilter('fruit_spark');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === 'fruit_spark'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Fruit Sparks
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilter('pure_brew');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filter === 'pure_brew'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pure Brews
            </button>
          </div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDrinks.map((drink) => {
            const tea = BASE_TEAS[drink.baseTea];
            const milk = MILK_TYPES[drink.milk];
            const isAdded = addedNoticeId === drink.id;

            return (
              <div
                key={drink.id}
                onClick={() => setActiveDrinkModal(drink)}
                className="group relative bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-0.5"
              >
                {/* Visual Area */}
                <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                  {drink.image ? (
                    <img
                      src={drink.image}
                      alt={drink.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                  ) : (
                    /* Fallback styled container with rich tea tones */
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-white relative"
                      style={{
                        background: `linear-gradient(135deg, ${drink.accentColor} 0%, #1c1917 100%)`,
                      }}
                    >
                      <div className="w-16 h-24 border-2 border-white/40 rounded-b-2xl relative flex items-end justify-center pb-2 bg-white/10 backdrop-blur-xs">
                        <div className="w-2.5 h-16 bg-white/60 absolute -top-4 rounded-full -rotate-6" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-black/60" />
                          <div className="w-2 h-2 rounded-full bg-black/70" />
                          <div className="w-2 h-2 rounded-full bg-black/80" />
                        </div>
                      </div>
                      <span className="mt-3 text-xs tracking-widest uppercase opacity-80 font-mono">
                        Flow #{drink.number}
                      </span>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Number & Chinese Name Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/50 backdrop-blur-md text-white text-xs font-mono font-medium">
                    <span>Flow #{drink.number}</span>
                    <span className="opacity-50">/</span>
                    <span className="font-sans">{drink.chineseName}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs text-stone-200 truncate max-w-[200px]">
                      {tea?.name || 'Artisanal Brew'}
                    </span>
                    <span className="text-sm font-bold font-mono tabular-nums bg-white/20 backdrop-blur-md px-2 py-0.5 rounded">
                      ${drink.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Content Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-display group-hover:text-amber-800 transition-colors">
                      {drink.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {drink.tagline}
                    </p>

                    {/* Metadata line with typographic separators */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                      <span>{drink.caffeineMg}mg caffeine</span>
                      <span aria-hidden="true">·</span>
                      <span>{drink.calories} kcal</span>
                      <span aria-hidden="true">·</span>
                      <span>{drink.defaultToppings.length} topping(s)</span>
                    </div>

                    {/* Flavor Profile Mini-Bars */}
                    <div className="mt-4 space-y-1.5 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Tea Aroma</span>
                        <div className="w-24 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full"
                            style={{ width: `${drink.flavorProfile.teaAroma}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Chewiness</span>
                        <div className="w-24 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-stone-800 h-full rounded-full"
                            style={{ width: `${drink.flavorProfile.chewiness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        onSelectDrinkForLab(drink);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAddClick(e, drink)}
                      className={`inline-flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drink Detail Modal */}
      {activeDrinkModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveDrinkModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            {activeDrinkModal.image && (
              <div className="relative h-56 sm:h-64 w-full bg-stone-900 overflow-hidden">
                <img
                  src={activeDrinkModal.image}
                  alt={activeDrinkModal.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                <button
                  type="button"
                  onClick={() => setActiveDrinkModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/90 hover:text-white hover:bg-black/70 backdrop-blur-md transition-all cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium">
                  <span>FLOW #{activeDrinkModal.number}</span>
                  <span className="opacity-50">·</span>
                  <span>{activeDrinkModal.chineseName}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold font-display drop-shadow-sm">
                    {activeDrinkModal.name}
                  </h3>
                  <p className="mt-1 text-xs text-stone-200 line-clamp-1">
                    {activeDrinkModal.tagline}
                  </p>
                </div>
              </div>
            )}

            {!activeDrinkModal.image && (
              <div className="relative p-6 border-b border-stone-100 bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => setActiveDrinkModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-amber-800 mb-1">
                  <span>FLOW #{activeDrinkModal.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeDrinkModal.chineseName}</span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 font-display">
                  {activeDrinkModal.name}
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  {activeDrinkModal.tagline}
                </p>
              </div>
            )}

            <div className="p-6 space-y-5 max-h-[calc(85vh-16rem)] overflow-y-auto">
              <p className="text-sm text-stone-700 leading-relaxed">
                {activeDrinkModal.description}
              </p>

              {/* Recipe Components */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Formula Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                    <span className="text-stone-400 block mb-0.5">Tea Estate</span>
                    <span className="font-semibold text-stone-800">
                      {BASE_TEAS[activeDrinkModal.baseTea]?.name}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {BASE_TEAS[activeDrinkModal.baseTea]?.origin}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                    <span className="text-stone-400 block mb-0.5">Dairy / Base</span>
                    <span className="font-semibold text-stone-800">
                      {MILK_TYPES[activeDrinkModal.milk]?.name}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {MILK_TYPES[activeDrinkModal.milk]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Included Toppings */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Signature Toppings
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeDrinkModal.defaultToppings.map((topId) => {
                    const top = TOPPINGS[topId];
                    if (!top) return null;
                    return (
                      <div
                        key={topId}
                        className="p-2 bg-stone-50 border border-stone-200/80 rounded-lg text-xs"
                      >
                        <span className="font-medium text-stone-800">{top.name}</span>
                        <span className="text-stone-500 block text-[11px] mt-0.5">{top.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar / Sensory Scale */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Flavor Matrix
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-stone-50 rounded border border-stone-200/50">
                    <span className="text-stone-400 block text-[10px]">Aroma</span>
                    <span className="font-mono font-bold text-amber-700">
                      {activeDrinkModal.flavorProfile.teaAroma}%
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded border border-stone-200/50">
                    <span className="text-stone-400 block text-[10px]">Cream</span>
                    <span className="font-mono font-bold text-amber-700">
                      {activeDrinkModal.flavorProfile.creaminess}%
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded border border-stone-200/50">
                    <span className="text-stone-400 block text-[10px]">Sweetness</span>
                    <span className="font-mono font-bold text-amber-700">
                      {activeDrinkModal.flavorProfile.sweetness}%
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded border border-stone-200/50">
                    <span className="text-stone-400 block text-[10px]">Chew</span>
                    <span className="font-mono font-bold text-amber-700">
                      {activeDrinkModal.flavorProfile.chewiness}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer CTAs */}
            <div className="p-6 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-500 block">Single Price</span>
                <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                  ${activeDrinkModal.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectDrinkForLab(activeDrinkModal);
                    setActiveDrinkModal(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Open in Boba Lab
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleQuickAddClick(e, activeDrinkModal);
                    setActiveDrinkModal(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
