import React, { useState } from 'react';
import { BaseTeaId, CupSize, IceLevel, MilkTypeId, StrawColor, ToppingId } from '../types/boba';
import { BASE_TEAS, MILK_TYPES, TOPPINGS } from '../data/signatureDrinks';
import { sounds } from '../utils/audio';
import { Sparkles, RefreshCw } from 'lucide-react';

interface CupVisualizerProps {
  baseTea: BaseTeaId;
  milk: MilkTypeId;
  sweetness: number;
  ice: IceLevel;
  toppings: ToppingId[];
  size?: CupSize;
  strawColor?: StrawColor;
  isInteractive?: boolean;
}

export const CupVisualizer: React.FC<CupVisualizerProps> = ({
  baseTea,
  milk,
  sweetness,
  ice,
  toppings,
  size = 'standard',
  strawColor = 'charcoal',
  isInteractive = true,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [bouncedIndex, setBouncedIndex] = useState<number | null>(null);

  const tea = BASE_TEAS[baseTea] || BASE_TEAS.ceylon;
  const milkData = MILK_TYPES[milk] || MILK_TYPES.fresh_milk;
  const hasMilk = milk !== 'no_milk';
  const hasCheeseFoam = toppings.includes('cheese_foam');
  const hasBrownSugar = toppings.includes('brown_sugar_boba');

  // Straw colors
  const strawStyle = {
    amber: 'bg-amber-600 border-amber-700',
    matcha: 'bg-emerald-700 border-emerald-800',
    charcoal: 'bg-stone-800 border-stone-900',
    rose: 'bg-rose-400 border-rose-500',
  }[strawColor] || 'bg-stone-800 border-stone-900';

  // Liquid color calculation
  let liquidColor = tea.color;
  let liquidGradient = `linear-gradient(180deg, ${tea.color}dd 0%, ${tea.color} 100%)`;

  if (hasMilk) {
    if (baseTea === 'matcha') {
      liquidGradient = 'linear-gradient(180deg, #40714B 0%, #76A065 50%, #ECE6D8 100%)';
    } else if (baseTea === 'ceylon') {
      liquidGradient = 'linear-gradient(180deg, #A85A32 0%, #C97D55 40%, #EBD0B9 100%)';
    } else if (baseTea === 'tieguanyin') {
      liquidGradient = 'linear-gradient(180deg, #8C5E39 0%, #AF7C53 45%, #E5CFBC 100%)';
    } else if (baseTea === 'hojicha') {
      liquidGradient = 'linear-gradient(180deg, #7A5333 0%, #9B6F49 45%, #DECBBA 100%)';
    } else {
      liquidGradient = 'linear-gradient(180deg, #D49D42 0%, #E5B96B 50%, #F5E8D0 100%)';
    }
  }

  const handleShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    sounds.playShaker();
    setTimeout(() => {
      sounds.playShaker();
    }, 150);
    setTimeout(() => {
      sounds.playLiquidPour();
      setIsShaking(false);
    }, 450);
  };

  const handlePearlClick = (idx: number) => {
    setBouncedIndex(idx);
    sounds.playPearlPop();
    setTimeout(() => setBouncedIndex(null), 400);
  };

  // Ice count
  const iceCount = ice === 'regular' ? 4 : ice === 'light' ? 2 : 0;

  // Generate pearl representations
  const pearlsList = React.useMemo(() => {
    const list: { id: number; color: string; size: number; x: number; y: number; type: string }[] = [];
    const pearlToppings = toppings.filter((t) => t !== 'cheese_foam');

    if (pearlToppings.length === 0) return list;

    let idCounter = 0;
    pearlToppings.forEach((tId) => {
      const topInfo = TOPPINGS[tId];
      if (!topInfo) return;

      const count = tId === 'brown_sugar_boba' || tId === 'honey_golden_pearls' ? 14 : 8;
      for (let i = 0; i < count; i++) {
        list.push({
          id: idCounter++,
          color: topInfo.color,
          size: tId === 'popping_lychee' ? 14 : 12,
          x: 12 + Math.random() * 76, // %
          y: 6 + Math.random() * 24, // % from bottom
          type: tId,
        });
      }
    });

    return list;
  }, [toppings]);

  return (
    <div className="relative flex flex-col items-center select-none py-2">
      {/* Cup Container with Shake Animation */}
      <div
        className={`relative transition-transform duration-200 ${
          isShaking ? 'translate-x-1 -rotate-3 scale-105' : ''
        }`}
        style={{
          width: size === 'grande' ? '210px' : '190px',
          height: size === 'grande' ? '300px' : '270px',
        }}
      >
        {/* Straw */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-4 h-32 rounded-full border shadow-sm z-30 transform -rotate-6 transition-all duration-300 ${strawStyle}`}
        >
          {/* Straw highlight line */}
          <div className="w-1 h-full bg-white/30 rounded-full ml-0.5" />
        </div>

        {/* Cup Rim & Top Lid / Film */}
        <div className="absolute top-0 left-0 right-0 h-5 bg-stone-200/90 rounded-full border border-stone-300 z-20 flex items-center justify-center shadow-inner backdrop-blur-xs">
          <div className="w-24 h-1 bg-stone-300/80 rounded-full" />
        </div>

        {/* Glass Body */}
        <div
          className="relative w-full h-full pt-3 pb-2 px-3 overflow-hidden rounded-b-[42px] border-2 border-stone-200/80 shadow-xl bg-white/20 backdrop-blur-md"
          style={{
            clipPath: 'polygon(5% 0%, 95% 0%, 88% 100%, 12% 100%)',
          }}
        >
          {/* Glass Specular Reflection Highlight (Left) */}
          <div className="absolute top-0 left-3 w-3 h-full bg-gradient-to-r from-white/45 to-transparent z-20 pointer-events-none" />

          {/* Liquid Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500 overflow-hidden"
            style={{
              height: '88%',
              background: liquidGradient,
            }}
          >
            {/* Tiger Brown Sugar Drizzle Stripes (if brown sugar boba present) */}
            {hasBrownSugar && (
              <div className="absolute inset-0 opacity-80 mix-blend-multiply pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path
                    d="M 15,0 Q 20,40 10,70 Q 5,90 20,100 L 25,100 Q 15,70 25,40 Q 22,0 15,0 Z"
                    fill="#36170B"
                    opacity="0.85"
                  />
                  <path
                    d="M 45,0 Q 55,30 40,65 Q 35,90 50,100 L 58,100 Q 48,70 60,35 Q 52,0 45,0 Z"
                    fill="#431D0E"
                    opacity="0.8"
                  />
                  <path
                    d="M 80,0 Q 72,40 85,75 Q 82,90 75,100 L 84,100 Q 92,75 80,45 Q 85,0 80,0 Z"
                    fill="#2E1208"
                    opacity="0.85"
                  />
                </svg>
              </div>
            )}

            {/* Subtle Liquid Swirl Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

            {/* Ice Cubes */}
            {iceCount > 0 && (
              <div className="absolute top-4 inset-x-4 flex justify-around pointer-events-none z-10">
                {Array.from({ length: iceCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-lg bg-white/50 border border-white/80 shadow-md backdrop-blur-xs transform"
                    style={{
                      transform: `rotate(${idx * 18 - 15}deg) translateY(${idx % 2 === 0 ? 0 : 8}px)`,
                    }}
                  >
                    <div className="w-2 h-2 rounded bg-white/70 m-1" />
                  </div>
                ))}
              </div>
            )}

            {/* Cheese Foam Crown (Top of liquid) */}
            {hasCheeseFoam && (
              <div className="absolute top-0 left-0 right-0 h-11 bg-gradient-to-b from-[#FFFDF0] to-[#F7F2D7] shadow-sm z-15 border-b border-amber-200/50 flex items-center justify-center">
                {/* Sprinkles on foam */}
                <div className="w-full flex justify-center gap-1.5 opacity-60">
                  <div className="w-1 h-1 rounded-full bg-amber-800" />
                  <div className="w-1 h-1 rounded-full bg-amber-700" />
                  <div className="w-1 h-1 rounded-full bg-amber-900" />
                  <div className="w-1 h-1 rounded-full bg-amber-600" />
                </div>
              </div>
            )}

            {/* Pearls / Toppings at Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-auto">
              {pearlsList.map((pearl) => {
                const isBounced = bouncedIndex === pearl.id;
                return (
                  <button
                    key={pearl.id}
                    type="button"
                    onClick={() => handlePearlClick(pearl.id)}
                    className="absolute rounded-full border border-black/20 shadow-inner cursor-pointer transition-transform duration-200 hover:scale-125 focus:outline-hidden"
                    style={{
                      backgroundColor: pearl.color,
                      width: `${pearl.size}px`,
                      height: `${pearl.size}px`,
                      left: `${pearl.x}%`,
                      bottom: `${pearl.y}%`,
                      transform: isBounced ? 'translateY(-14px) scale(1.3)' : 'translateY(0)',
                      zIndex: isBounced ? 25 : 10,
                    }}
                    title={`Click to bounce ${pearl.type.replace(/_/g, ' ')}`}
                  >
                    {/* Pearl gloss highlight */}
                    <div className="w-1 h-1 rounded-full bg-white/50 ml-0.5 mt-0.5" />
                  </button>
                );
              })}

              {/* If no pearls selected */}
              {pearlsList.length === 0 && (
                <div className="absolute bottom-3 inset-x-0 text-center text-[10px] text-white/50 tracking-wider">
                  PURE LIQUID BREW
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cup Foot Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-3 bg-stone-400/25 rounded-full blur-xs pointer-events-none" />
      </div>

      {/* Interactive Controls & Metadata Under Cup */}
      {isInteractive && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{size === 'grande' ? 'Grande 24 oz' : 'Standard 16 oz'}</span>
            <span aria-hidden="true">·</span>
            <span>{sweetness}% Sweet</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{ice} Ice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShake}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg shadow-2xs hover:bg-stone-50 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isShaking ? 'animate-spin' : ''}`} />
              Shake Cup
            </button>
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tap pearls to bounce</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
