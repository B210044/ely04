import React, { useEffect, useState } from 'react';
import { ActiveOrder, OrderStatus } from '../types/boba';
import { sounds } from '../utils/audio';
import { CheckCircle2, Clock, Sparkles, QrCode, CupSoda, Bell } from 'lucide-react';

interface OrderTrackerProps {
  order: ActiveOrder | null;
  onClose: () => void;
  onExploreMore: () => void;
}

const STEPS: { id: OrderStatus; label: string; desc: string }[] = [
  { id: 'received', label: 'Order Received', desc: 'Ticket printed at the tea bar station' },
  { id: 'brewing', label: 'Steeping Whole Leaves', desc: 'Brewing single-estate tea liquor at 92°C' },
  { id: 'shaking', label: 'Chilling & Shaking', desc: 'Emulsifying organic mylk and ice crystals' },
  { id: 'topping', label: 'Topping & Sealing', desc: 'Slow-simmered pearls infused and hot-film sealed' },
  { id: 'ready', label: 'Ready for Counter Pickup', desc: 'Fresh and chilled on Bar Pick-Up Slot 12' },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onClose, onExploreMore }) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'received');

  // Auto-progress simulated order every 6 seconds for delightful live feedback
  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      setCurrentStatus((prev) => {
        if (prev === 'received') {
          sounds.playLiquidPour();
          return 'brewing';
        }
        if (prev === 'brewing') {
          sounds.playShaker();
          return 'shaking';
        }
        if (prev === 'shaking') {
          sounds.playSealSnap();
          return 'topping';
        }
        if (prev === 'topping') {
          sounds.playSuccessChime();
          return 'ready';
        }
        return 'ready';
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [order]);

  if (!order) {
    return (
      <div className="py-12 bg-[#FAF8F5]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <CupSoda className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display text-stone-900">No Active Pickup Orders</h3>
          <p className="text-sm text-stone-500 mt-1">
            Place an order from The 12 Flows or our Boba Lab to watch your cup craft in real-time.
          </p>
          <button
            type="button"
            onClick={onExploreMore}
            className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Explore The 12 Flows
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStatus);

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Ticket Header Box */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-800 uppercase font-semibold">
                <Bell className="w-3.5 h-3.5" />
                <span>Live Barista Display</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-display mt-1">
                Order Ticket {order.orderNumber}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Estimated Counter Pickup: {currentStatus === 'ready' ? 'Ready Now' : '2–4 minutes'}
              </p>
            </div>

            {/* QR Mockup */}
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 self-start sm:self-auto">
              <QrCode className="w-8 h-8 text-stone-800" />
              <div className="text-[11px] leading-tight text-stone-500 font-mono">
                <span className="font-bold text-stone-900 block">{order.orderNumber}</span>
                <span>Scan at Bar</span>
              </div>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="py-8">
            <div className="relative">
              {/* Line connector */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200 -z-0 hidden sm:block" />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
                {STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.id} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 text-left sm:text-center z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? 'bg-amber-800 border-amber-800 text-white shadow-2xs'
                            : 'bg-white border-stone-300 text-stone-400'
                        } ${isCurrent ? 'ring-4 ring-amber-100 scale-105' : ''}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-mono font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <h4
                          className={`text-xs font-bold leading-tight ${
                            isCurrent ? 'text-amber-900' : isDone ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 hidden sm:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Step Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            currentStatus === 'ready'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/60 border-amber-200 text-stone-800'
          }`}>
            {currentStatus === 'ready' ? (
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
            )}
            <div>
              <p className="text-xs font-bold font-display">
                {currentStatus === 'ready'
                  ? 'Your drinks are ready for pickup at Counter Slot 12!'
                  : STEPS[currentStepIndex]?.desc}
              </p>
              <p className="text-[11px] text-stone-500">
                {currentStatus === 'ready'
                  ? 'Show your ticket code or name to the barista.'
                  : 'Our tea master is hand-crafting each ingredient.'}
              </p>
            </div>
          </div>

          {/* Items Summary in Receipt Style */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Drink Receipt Breakdown
            </h4>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-dashed border-stone-100"
                >
                  <div className="flex items-center gap-2.5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-md object-cover border border-stone-200 shrink-0"
                      />
                    )}
                    <span className="font-mono font-bold text-stone-500">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-stone-800">{item.name}</span>
                    <span className="text-stone-400 text-[11px]">({item.sweetness}%, {item.ice} ice)</span>
                  </div>
                  <span className="font-mono tabular-nums text-stone-700">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center text-sm font-bold text-stone-900 pt-2">
              <span>Total Paid</span>
              <span className="font-mono tabular-nums text-amber-900">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onExploreMore}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Order Another Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
