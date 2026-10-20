import React from 'react';
import { CartItem } from '../types/boba';
import { BASE_TEAS, MILK_TYPES, TOPPINGS } from '../data/signatureDrinks';
import { sounds } from '../utils/audio';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
  onExploreMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onExploreMenu,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <h2 className="text-lg font-bold text-stone-900 font-display">Your Drink Bag</h2>
              <span className="text-xs font-mono text-stone-400">
                ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Items or Empty */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 font-display">
                  Your bag is empty
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Discover our 12 signature flows or design your personal cup in the Boba Lab.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onExploreMenu();
                  }}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  Explore The 12 Flows
                </button>
              </div>
            ) : (
              items.map((item) => {
                const tea = BASE_TEAS[item.baseTea];
                const milk = MILK_TYPES[item.milk];
                return (
                  <div
                    key={item.cartItemId}
                    className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200/80 shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 font-display">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                            <span className="capitalize">{item.size} </span>
                            <span>·</span>
                            <span>{item.sweetness}% Sweet</span>
                            <span>·</span>
                            <span className="capitalize">{item.ice} Ice</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-sm font-mono font-bold text-stone-900 tabular-nums shrink-0">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Toppings Line */}
                    {item.toppings.length > 0 && (
                      <div className="text-[11px] text-stone-600 flex flex-wrap gap-1">
                        <span className="text-stone-400">Toppings:</span>
                        {item.toppings.map((tId) => (
                          <span key={tId} className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-700">
                            {TOPPINGS[tId]?.name || tId}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Controls Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onRemoveItem(item.cartItemId);
                        }}
                        className="text-stone-400 hover:text-rose-600 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onUpdateQuantity(item.cartItemId, -1);
                          }}
                          className="text-stone-600 hover:text-stone-900 p-0.5"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold tabular-nums px-1">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPearlPop();
                            onUpdateQuantity(item.cartItemId, 1);
                          }}
                          className="text-stone-600 hover:text-stone-900 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/70 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-stone-800">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8.25%)</span>
                  <span className="font-mono tabular-nums text-stone-800">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span className="font-mono tabular-nums text-base text-amber-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playSuccessChime();
                  onCheckout();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <span>Confirm Counter Pickup (${total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
