/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CartItem,
  InventoryItem,
  OrderType,
  PosTab,
  RestockRecord,
  SalesOrder,
  StoreContactInfo,
} from './types/pos';
import {
  DEFAULT_STORE_CONTACT,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_RESTOCK_RECORDS,
} from './data/posData';
import { PosTopBar } from './components/PosTopBar';
import { PosCashier } from './components/PosCashier';
import { InventoryTab } from './components/InventoryTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { BomManagementTab } from './components/BomManagementTab';
import { StoreInfoTab } from './components/StoreInfoTab';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptPrinterModal } from './components/ReceiptPrinterModal';
import { MemberManagementTab } from './components/MemberManagementTab';
import { StandaloneMemberPage } from './components/StandaloneMemberPage';
import { MemberProvider } from './context/MemberContext';

export default function App() {
  return (
    <MemberProvider>
      <PosAppContent />
    </MemberProvider>
  );
}

function PosAppContent() {
  const [activeTab, setActiveTab] = useState<PosTab>('cashier');
  const [orderType, setOrderType] = useState<OrderType>('takeout');
  const [hasEcoCup, setHasEcoCup] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<SalesOrder | null>(null);

  // Standalone Member Application Page URL detection
  const [isStandaloneView, setIsStandaloneView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.search.includes('page=join') ||
        window.location.search.includes('join') ||
        window.location.hash.includes('join')
      );
    }
    return false;
  });

  useEffect(() => {
    const checkUrl = () => {
      setIsStandaloneView(
        window.location.search.includes('page=join') ||
        window.location.search.includes('join') ||
        window.location.hash.includes('join')
      );
    };
    window.addEventListener('popstate', checkUrl);
    window.addEventListener('hashchange', checkUrl);
    return () => {
      window.removeEventListener('popstate', checkUrl);
      window.removeEventListener('hashchange', checkUrl);
    };
  }, []);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Inventory state persisted
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // Sales Orders state persisted
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    try {
      const saved = localStorage.getItem('pos_sales_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Restock Inbound Records persisted
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pos_restock_records');
      return saved ? JSON.parse(saved) : INITIAL_RESTOCK_RECORDS;
    } catch {
      return INITIAL_RESTOCK_RECORDS;
    }
  });

  // Store Contact & QR info persisted
  const [storeContact, setStoreContact] = useState<StoreContactInfo>(() => {
    try {
      const saved = localStorage.getItem('pos_store_contact');
      return saved ? JSON.parse(saved) : DEFAULT_STORE_CONTACT;
    } catch {
      return DEFAULT_STORE_CONTACT;
    }
  });

  // Sync cart
  useEffect(() => {
    try {
      localStorage.setItem('pos_cart_items', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Sync inventory
  useEffect(() => {
    try {
      localStorage.setItem('pos_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  // Sync orders
  useEffect(() => {
    try {
      localStorage.setItem('pos_sales_orders', JSON.stringify(salesOrders));
    } catch {}
  }, [salesOrders]);

  // Sync restock records
  useEffect(() => {
    try {
      localStorage.setItem('pos_restock_records', JSON.stringify(restockRecords));
    } catch {}
  }, [restockRecords]);

  // Sync store contact info
  useEffect(() => {
    try {
      localStorage.setItem('pos_store_contact', JSON.stringify(storeContact));
    } catch {}
  }, [storeContact]);

  // Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Find if matching specification exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.drinkId === item.drinkId &&
          i.size === item.size &&
          i.ice === item.ice &&
          i.sweetness === item.sweetness &&
          JSON.stringify(i.toppings.map((t) => t.id).sort()) ===
            JSON.stringify(item.toppings.map((t) => t.id).sort()) &&
          (i.note || '') === (item.note || '')
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const nextQty = next[existingIdx].quantity + item.quantity;
        next[existingIdx].quantity = nextQty;
        next[existingIdx].subtotal = nextQty * next[existingIdx].unitPrice;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Restock inventory handler with full inbound details & history
  const handleRestockInventory = (
    itemId: string,
    addAmount: number,
    details?: {
      costPerUnit?: number;
      supplier?: string;
      batchNumber?: string;
      note?: string;
      operator?: string;
    }
  ) => {
    let affectedItem: InventoryItem | undefined;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          affectedItem = item;
          const newStock = Math.round((item.currentStock + addAmount) * 10) / 10;
          return {
            ...item,
            currentStock: newStock,
            lastRestockQty: addAmount,
            totalRestockedQty: (item.totalRestockedQty || item.lastRestockQty || 0) + addAmount,
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    // Create persistent restock inbound record
    const targetItem = affectedItem || inventory.find((i) => i.id === itemId);
    if (targetItem) {
      const unitCost = details?.costPerUnit ?? targetItem.costPerUnitTwd;
      const dateStr = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const randSeq = Math.floor(Math.random() * 90 + 10);
      const batchCode = details?.batchNumber || `INB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randSeq}`;

      const newRecord: RestockRecord = {
        id: `rc-${Date.now()}-${randSeq}`,
        itemId: targetItem.id,
        itemName: targetItem.name,
        category: targetItem.categoryLabel,
        restockQty: addAmount,
        fixedParStock: targetItem.fixedParStock,
        unit: targetItem.unit,
        costPerUnitTwd: unitCost,
        totalCostTwd: Math.round(addAmount * unitCost),
        supplier: details?.supplier || targetItem.supplier,
        timestamp: Date.now(),
        dateStr,
        batchNumber: batchCode,
        operator: details?.operator || '陳品研 (早班店長)',
        note: details?.note || '原物料常規進貨補給入庫',
      };

      setRestockRecords((prev) => [newRecord, ...prev]);
    }
  };

  // Update fixed par level stock handler
  const handleUpdateFixedParStock = (itemId: string, newPar: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, fixedParStock: newPar } : item))
    );
  };

  // Update store contact info handler
  const handleUpdateStoreContact = (updated: StoreContactInfo) => {
    setStoreContact(updated);
  };

  // Complete checkout handler: deducts stock & saves order & opens receipt printer
  const handleCompleteCheckout = (order: SalesOrder) => {
    // 1. Add to sales orders ledger
    setSalesOrders((prev) => [order, ...prev]);

    // 2. Realistic inventory deduction
    setInventory((prev) => {
      const updated = [...prev];
      let cups500Used = 0;
      let cups700Used = 0;
      let strawsUsed = 0;

      order.items.forEach((item) => {
        if (item.size === 'M') cups500Used += item.quantity;
        if (item.size === 'L') cups700Used += item.quantity;
        strawsUsed += item.quantity;
      });

      return updated.map((item) => {
        if (item.id === 'inv-pack-cup-m') {
          return { ...item, currentStock: Math.max(0, item.currentStock - cups500Used) };
        }
        if (item.id === 'inv-pack-cup-l') {
          return { ...item, currentStock: Math.max(0, item.currentStock - cups700Used) };
        }
        if (item.id === 'inv-pack-straw') {
          return { ...item, currentStock: Math.max(0, item.currentStock - strawsUsed) };
        }
        if (item.id === 'inv-dairy-milk') {
          return { ...item, currentStock: Math.max(0, Math.round((item.currentStock - 0.2 * strawsUsed) * 10) / 10) };
        }
        if (item.id === 'inv-topping-boba') {
          return { ...item, currentStock: Math.max(0, Math.round((item.currentStock - 0.08 * strawsUsed) * 10) / 10) };
        }
        return item;
      });
    });

    // 3. Clear cart
    setCartItems([]);
    setHasEcoCup(false);
    setIsCheckoutOpen(false);

    // 4. Open Thermal Receipt Printer
    setActiveReceiptOrder(order);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (isStandaloneView) {
    return (
      <StandaloneMemberPage
        onBackToPos={() => {
          setIsStandaloneView(false);
          const cleanUrl = window.location.pathname;
          window.history.pushState({}, '', cleanUrl);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1013] text-[#F3F4F6] font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar: (茶研所, 前台收銀 POS, 後台庫存與補貨, 銷售分析報表, 配方BOM管理) */}
      <PosTopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenStandalonePage={() => setIsStandaloneView(true)}
      />

      {/* Main Workspace View Router */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'cashier' && (
          <PosCashier
            cartItems={cartItems}
            orderType={orderType}
            setOrderType={setOrderType}
            hasEcoCup={hasEcoCup}
            setHasEcoCup={setHasEcoCup}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            restockRecords={restockRecords}
            onRestock={handleRestockInventory}
            onUpdateFixedParStock={handleUpdateFixedParStock}
            onNavigateToStoreInfo={() => setActiveTab('store_info')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            orders={salesOrders}
            onViewOrderReceipt={(order) => setActiveReceiptOrder(order)}
          />
        )}

        {activeTab === 'bom' && <BomManagementTab />}

        {activeTab === 'members' && (
          <MemberManagementTab
            onReorderDrinks={(reorderItems) => {
              setCartItems((prev) => [...reorderItems, ...prev]);
              setActiveTab('cashier');
            }}
            onNavigateToCashier={() => setActiveTab('cashier')}
          />
        )}

        {activeTab === 'store_info' && (
          <StoreInfoTab
            contactInfo={storeContact}
            onUpdateContactInfo={handleUpdateStoreContact}
          />
        )}
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={cartItems}
          orderType={orderType}
          hasEcoCup={hasEcoCup}
          onClose={() => setIsCheckoutOpen(false)}
          onCompleteCheckout={handleCompleteCheckout}
        />
      )}

      {/* Thermal Receipt Printer Simulator */}
      {activeReceiptOrder && (
        <ReceiptPrinterModal
          order={activeReceiptOrder}
          storeContact={storeContact}
          onClose={() => setActiveReceiptOrder(null)}
          onStartNewOrder={() => {
            setActiveReceiptOrder(null);
            setActiveTab('cashier');
          }}
        />
      )}
    </div>
  );
}
