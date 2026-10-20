import React from 'react';
import { ArrowRight, Beaker, Flame } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOpenLab: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMenu, onOpenLab }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Quiet text kicker with typographic separator */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-800 uppercase mb-3">
              <span>Artisanal Tea Bar</span>
              <span aria-hidden="true">·</span>
              <span>12 Master Recipes</span>
              <span aria-hidden="true">·</span>
              <span>Simmered to Order</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 font-display leading-[1.15] text-balance">
              Where heritage tea brewing meets fluid modern craft.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Experience the 12 Signature Flows—from slow-caramelized Tiger Brown Sugar pearls to first-harvest Uji ceremonial matcha cloud foams. Customize every drop in our live Boba Lab or step behind the counter in Barista Rush.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onExploreMenu();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <span>Explore The 12 Flows</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenLab();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-stone-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <Beaker className="w-4 h-4 text-amber-700" />
                <span>Custom Boba Lab</span>
              </button>
            </div>

            {/* Claim-to-Proof Row */}
            <div className="mt-10 pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">90m</p>
                <p className="text-xs text-stone-500 mt-0.5">Slow-braised cassava</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">100%</p>
                <p className="text-xs text-stone-500 mt-0.5">Single-estate whole leaves</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">0%</p>
                <p className="text-xs text-stone-500 mt-0.5">Synthetic tea powders</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200/90 aspect-16/9 lg:aspect-4/3 bg-stone-100 group">
              <img
                src="/src/assets/images/hero_artisanal_boba_1790659770263.jpg"
                alt="Artisanal modern Taiwanese boba milk tea with brown sugar tiger stripes and fresh ice"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono tracking-wider uppercase text-amber-300">Signature Flow #01</span>
                    <h3 className="text-lg font-semibold tracking-tight font-display">Amber Tiger Dawn</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 backdrop-blur-md border border-white/20 text-xs font-medium">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Slow-Cooked Cane Sugar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
