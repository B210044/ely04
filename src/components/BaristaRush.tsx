import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';
import { SIGNATURE_12_FLOWS, BASE_TEAS, MILK_TYPES, TOPPINGS } from '../data/signatureDrinks';
import { SignatureDrink } from '../types/boba';
import { CupVisualizer } from './CupVisualizer';
import { Timer, Award, Play, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';

interface OrderTicket {
  ticketId: string;
  customerName: string;
  drink: SignatureDrink;
  timeLimitSeconds: number;
}

const CUSTOMER_NAMES = [
  'Mei-Ling', 'Alex K.', 'Hana', 'Kenzo', 'Sophia T.', 'Julian', 'Elena', 'Wei', 'Chloe', 'Marcus', 'Aoi', 'Leo'
];

export const BaristaRush: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [tipsEarned, setTipsEarned] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [currentTicket, setCurrentTicket] = useState<OrderTicket | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  // Crafting Station State for the current ticket
  const [hasPearls, setHasPearls] = useState(false);
  const [hasTea, setHasTea] = useState(false);
  const [hasMilk, setHasMilk] = useState(false);
  const [hasIce, setHasIce] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [isSealed, setIsSealed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Spawn a new order ticket
  const spawnTicket = () => {
    const randomDrink = SIGNATURE_12_FLOWS[Math.floor(Math.random() * SIGNATURE_12_FLOWS.length)];
    const randomName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const newTicket: OrderTicket = {
      ticketId: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      customerName: randomName,
      drink: randomDrink,
      timeLimitSeconds: 28,
    };
    setCurrentTicket(newTicket);
    setTimeLeft(28);
    // Reset station
    setHasPearls(false);
    setHasTea(false);
    setHasMilk(false);
    setHasIce(false);
    setShakeCount(0);
    setIsSealed(false);
  };

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this order
          handleOrderFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTicket]);

  const handleStartGame = () => {
    sounds.playSuccessChime();
    setIsPlaying(true);
    setScore(0);
    setTipsEarned(0);
    setCompletedOrders(0);
    spawnTicket();
  };

  const handleOrderFail = () => {
    sounds.playSealSnap();
    setFeedbackMsg('Time expired! Customer had to leave.');
    setTimeout(() => {
      setFeedbackMsg(null);
      spawnTicket();
    }, 1500);
  };

  // Station action steps
  const handleAddPearls = () => {
    if (hasPearls || !isPlaying) return;
    sounds.playPearlPop();
    setHasPearls(true);
  };

  const handlePourTea = () => {
    if (hasTea || !isPlaying) return;
    sounds.playLiquidPour();
    setHasTea(true);
  };

  const handlePourMilk = () => {
    if (hasMilk || !isPlaying) return;
    sounds.playLiquidPour();
    setHasMilk(true);
  };

  const handleAddIce = () => {
    if (hasIce || !isPlaying) return;
    sounds.playIceClink();
    setHasIce(true);
  };

  const handleShake = () => {
    if (!isPlaying || isSealed) return;
    if (!hasTea) return;
    sounds.playShaker();
    setShakeCount((prev) => Math.min(prev + 1, 3));
  };

  const handleSealAndServe = () => {
    if (!isPlaying || isSealed) return;
    if (!hasTea || shakeCount < 3) return;

    sounds.playSealSnap();
    setIsSealed(true);

    setTimeout(() => {
      // Calculate satisfaction
      sounds.playSuccessChime();
      const tip = (2.0 + Math.random() * 2.5).toFixed(2);
      const points = 100 + timeLeft * 10;
      setScore((s) => s + points);
      setTipsEarned((t) => t + parseFloat(tip));
      setCompletedOrders((c) => c + 1);
      setFeedbackMsg(`Perfect Brew! +$${tip} tip · +${points} pts`);

      setTimeout(() => {
        setFeedbackMsg(null);
        spawnTicket();
      }, 1400);
    }, 400);
  };

  const canShake = hasTea && !isSealed;
  const canSeal = hasTea && shakeCount >= 3 && !isSealed;

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-800 uppercase mb-1">
              <span>Interactive Barista Flow</span>
              <span aria-hidden="true">·</span>
              <span>Speed & Precision Simulation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-display">
              Barista Rush Station
            </h2>
            <p className="mt-1 text-sm text-stone-600 max-w-xl">
              Fulfill live tea orders step-by-step: scoop tapioca pearls, steep single-estate tea, ice scoop, shake to emulsify, and hot-seal the cup.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-white border border-stone-200 rounded-xl shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Score
              </span>
              <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                {score}
              </span>
            </div>
            <div className="px-3.5 py-2 bg-white border border-stone-200 rounded-xl shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Tips Jar
              </span>
              <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                ${tipsEarned.toFixed(2)}
              </span>
            </div>
            <div className="px-3.5 py-2 bg-white border border-stone-200 rounded-xl shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Served
              </span>
              <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                {completedOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Not Playing Screen */}
        {!isPlaying ? (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-800">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display text-stone-900">
              Step Behind the Flow Bar
            </h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Customers are lining up for the 12 Signature Flows. Assemble recipes accurately against the clock, perfect the 3-shake rhythm, and keep the counter moving.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-stone-500">
              <span>1. Scoop Fresh Boba</span>
              <span>·</span>
              <span>2. Steep Tea & Pour Milk</span>
              <span>·</span>
              <span>3. Add Ice</span>
              <span>·</span>
              <span>4. Shake 3x & Seal</span>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start Rush Shift</span>
            </button>
          </div>
        ) : (
          /* Active Game Workstation */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Live Customer Ticket (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                  <span className="font-bold text-stone-700">{currentTicket?.ticketId}</span>
                  <span>·</span>
                  <span>Queue #1</span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 font-mono text-xs font-bold tabular-nums">
                  <Timer className="w-3.5 h-3.5 text-amber-700" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {currentTicket && (
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-xs text-stone-400 block">Customer</span>
                    <h4 className="text-base font-bold text-stone-900 font-display">
                      {currentTicket.customerName}
                    </h4>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block mb-1">
                      Flow #{currentTicket.drink.number}
                    </span>
                    <h5 className="text-sm font-bold text-stone-900">
                      {currentTicket.drink.name}
                    </h5>
                    <p className="text-xs text-stone-500 mt-1">
                      {currentTicket.drink.tagline}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-xs space-y-1 text-stone-600">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Tea:</span>
                        <span className="font-medium">{BASE_TEAS[currentTicket.drink.baseTea]?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Milk:</span>
                        <span className="font-medium">{MILK_TYPES[currentTicket.drink.milk]?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Topping:</span>
                        <span className="font-medium">
                          {currentTicket.drink.defaultToppings.map((t) => TOPPINGS[t]?.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {feedbackMsg && (
                    <div className="p-3 bg-amber-100/80 border border-amber-300 text-amber-950 rounded-xl text-xs font-semibold text-center animate-in fade-in">
                      {feedbackMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pause / End Shift</span>
                  </button>
                </div>
              )}
            </div>

            {/* Center: Live Station Cup Visualizer (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[420px]">
              <div className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                Workstation Cup
              </div>

              {currentTicket ? (
                <div className="py-2">
                  <CupVisualizer
                    baseTea={hasTea ? currentTicket.drink.baseTea : 'ceylon'}
                    milk={hasMilk ? currentTicket.drink.milk : 'no_milk'}
                    sweetness={currentTicket.drink.defaultSweetness}
                    ice={hasIce ? currentTicket.drink.defaultIce : 'none'}
                    toppings={hasPearls ? currentTicket.drink.defaultToppings : []}
                    size="standard"
                    strawColor="charcoal"
                    isInteractive={false}
                  />

                  {/* Status Overlay */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono">
                    <span className={hasPearls ? 'text-emerald-700 font-bold' : 'text-stone-300'}>
                      ● Boba
                    </span>
                    <span>·</span>
                    <span className={hasTea ? 'text-emerald-700 font-bold' : 'text-stone-300'}>
                      ● Tea
                    </span>
                    <span>·</span>
                    <span className={hasMilk ? 'text-emerald-700 font-bold' : 'text-stone-300'}>
                      ● Milk
                    </span>
                    <span>·</span>
                    <span className={hasIce ? 'text-emerald-700 font-bold' : 'text-stone-300'}>
                      ● Ice
                    </span>
                    <span>·</span>
                    <span className={shakeCount >= 3 ? 'text-emerald-700 font-bold' : 'text-stone-300'}>
                      ● Shaken ({shakeCount}/3)
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right: Barista Action Counter Steps (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              {/* Step 1: Pearls */}
              <button
                type="button"
                onClick={handleAddPearls}
                disabled={hasPearls}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  hasPearls
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-white border-stone-200 hover:border-amber-700 hover:shadow-xs text-stone-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Step 01</span>
                  <span className="text-sm font-bold font-display">1. Scoop Fresh Boba Pearls</span>
                </div>
                {hasPearls && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </button>

              {/* Step 2: Tea Liquor */}
              <button
                type="button"
                onClick={handlePourTea}
                disabled={hasTea}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  hasTea
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-white border-stone-200 hover:border-amber-700 hover:shadow-xs text-stone-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Step 02</span>
                  <span className="text-sm font-bold font-display">2. Dispense Tea Liquor</span>
                </div>
                {hasTea && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </button>

              {/* Step 3: Milk & Sweetness */}
              <button
                type="button"
                onClick={handlePourMilk}
                disabled={hasMilk || !hasTea}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  hasMilk
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : !hasTea
                    ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-200'
                    : 'bg-white border-stone-200 hover:border-amber-700 hover:shadow-xs text-stone-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Step 03</span>
                  <span className="text-sm font-bold font-display">3. Pour Cold Silk Milk</span>
                </div>
                {hasMilk && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </button>

              {/* Step 4: Ice */}
              <button
                type="button"
                onClick={handleAddIce}
                disabled={hasIce || !hasTea}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  hasIce
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : !hasTea
                    ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-200'
                    : 'bg-white border-stone-200 hover:border-amber-700 hover:shadow-xs text-stone-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Step 04</span>
                  <span className="text-sm font-bold font-display">4. Scoop Ice Cubes</span>
                </div>
                {hasIce && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </button>

              {/* Step 5: Cocktail Shaker */}
              <button
                type="button"
                onClick={handleShake}
                disabled={!canShake || shakeCount >= 3}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  shakeCount >= 3
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : !canShake
                    ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-200'
                    : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 active:scale-98'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Step 05</span>
                  <span className="text-sm font-bold font-display">
                    5. Shake Drink ({shakeCount}/3)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {shakeCount >= 3 ? 'Ready!' : 'Tap to Shake'}
                </span>
              </button>

              {/* Step 6: Hot Seal Cup & Serve */}
              <button
                type="button"
                onClick={handleSealAndServe}
                disabled={!canSeal}
                className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSealed
                    ? 'bg-emerald-600 text-white font-bold'
                    : canSeal
                    ? 'bg-stone-900 text-white hover:bg-stone-800 font-bold shadow-md active:scale-98'
                    : 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">Hot-Seal Film & Hand to Customer</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
