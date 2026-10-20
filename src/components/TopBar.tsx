import React from 'react';
import { ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TopBarProps {
  activeTab: 'menu' | 'lab' | 'barista' | 'orders';
  setActiveTab: (tab: 'menu' | 'lab' | 'barista' | 'orders') => void;
  cartCount: number;
  openCart: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  isMuted,
  setIsMuted,
}) => {
  const handleMuteToggle = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playClick();
    }
  };

  const handleNavClick = (tab: 'menu' | 'lab' | 'barista' | 'orders') => {
    setActiveTab(tab);
    sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('menu')}
          className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-display hover:opacity-90 transition-opacity flex items-center gap-1.5 focus:outline-hidden"
        >
          <span>BobaFlow</span>
          <span className="text-amber-700 font-mono text-base font-semibold">12</span>
        </button>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => handleNavClick('menu')}
            className={`cursor-pointer transition-colors hover:text-stone-900 ${
              activeTab === 'menu' ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-amber-600' : ''
            }`}
          >
            The 12 Flows
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('lab')}
            className={`cursor-pointer transition-colors hover:text-stone-900 ${
              activeTab === 'lab' ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-amber-600' : ''
            }`}
          >
            Boba Lab
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('barista')}
            className={`cursor-pointer transition-colors hover:text-stone-900 ${
              activeTab === 'barista' ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-amber-600' : ''
            }`}
          >
            Barista Rush
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('orders')}
            className={`cursor-pointer transition-colors hover:text-stone-900 ${
              activeTab === 'orders' ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-amber-600' : ''
            }`}
          >
            Order Tracker
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Mute toggle & Bag) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMuteToggle}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100/70 transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-stone-700" />}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              openCart();
            }}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors whitespace-nowrap active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-mono text-[11px] font-bold tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="sm:hidden flex items-center justify-around border-t border-stone-200/60 px-2 py-2 text-xs font-medium text-stone-600">
        <button
          type="button"
          onClick={() => handleNavClick('menu')}
          className={`py-1 ${activeTab === 'menu' ? 'text-amber-800 font-bold' : ''}`}
        >
          12 Flows
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('lab')}
          className={`py-1 ${activeTab === 'lab' ? 'text-amber-800 font-bold' : ''}`}
        >
          Boba Lab
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('barista')}
          className={`py-1 ${activeTab === 'barista' ? 'text-amber-800 font-bold' : ''}`}
        >
          Barista
        </button>
        <button
          type="button"
          onClick={() => handleNavClick('orders')}
          className={`py-1 ${activeTab === 'orders' ? 'text-amber-800 font-bold' : ''}`}
        >
          Tracker
        </button>
      </div>
    </header>
  );
};
