import React, { useState } from 'react';
import { InventoryItem, RestockRecord } from '../types/pos';
import { sounds } from '../utils/audio';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Search,
  Plus,
  RefreshCw,
  Truck,
  ArrowUpDown,
  History,
  FileSpreadsheet,
  Edit2,
  Check,
  X,
  Target,
  ShoppingCart,
  Calendar,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface InventoryTabProps {
  inventory: InventoryItem[];
  restockRecords: RestockRecord[];
  onRestock: (
    itemId: string,
    addAmount: number,
    details?: {
      costPerUnit?: number;
      supplier?: string;
      batchNumber?: string;
      note?: string;
      operator?: string;
    }
  ) => void;
  onUpdateFixedParStock: (itemId: string, newParStock: number) => void;
  onNavigateToStoreInfo?: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  restockRecords,
  onRestock,
  onUpdateFixedParStock,
  onNavigateToStoreInfo,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'history'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_par' | 'critical'>('all');

  // Restock Inbound Modal state
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockInput, setRestockInput] = useState<number>(20);
  const [restockCostInput, setRestockCostInput] = useState<number>(0);
  const [restockSupplierInput, setRestockSupplierInput] = useState<string>('');
  const [restockBatchInput, setRestockBatchInput] = useState<string>('');
  const [restockNoteInput, setRestockNoteInput] = useState<string>('');
  const [editingParModal, setEditingParModal] = useState<{ id: string; name: string; unit: string; currentPar: number } | null>(null);
  const [newParInput, setNewParInput] = useState<number>(0);

  // Quick inline edit of fixed par stock
  const [inlineParEditId, setInlineParEditId] = useState<string | null>(null);
  const [inlineParValue, setInlineParValue] = useState<number>(0);

  const totalItems = inventory.length;
  // Items where stock is below fixed par level
  const belowParItems = inventory.filter((i) => i.currentStock < (i.fixedParStock || i.minThreshold * 2));
  // Items where stock is below emergency min threshold
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);
  const criticalItems = inventory.filter((i) => i.currentStock <= i.minThreshold * 0.5);
  const healthyItemsCount = totalItems - lowStockItems.length;

  const categories = [
    { id: 'all', label: '全部原物料' },
    { id: 'tea', label: '茶葉原葉' },
    { id: 'dairy', label: '乳製品' },
    { id: 'topping', label: '加料食材' },
    { id: 'packaging', label: '杯具與包材' },
    { id: 'sweetener', label: '糖類調味' },
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (stockFilter === 'low_par') {
      matchesFilter = item.currentStock < (item.fixedParStock || item.minThreshold * 2);
    } else if (stockFilter === 'critical') {
      matchesFilter = item.currentStock <= item.minThreshold;
    }

    return matchesCat && matchesSearch && matchesFilter;
  });

  const handleOpenRestock = (item: InventoryItem) => {
    sounds.playClick();
    const par = item.fixedParStock || item.minThreshold * 2;
    const recommendedQty = Math.max(1, Math.round((par - item.currentStock) * 10) / 10);
    const defaultQty =
      recommendedQty > 0
        ? recommendedQty
        : item.unit === '個' || item.unit === '支'
        ? 500
        : 10;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = Math.floor(Math.random() * 90 + 10);

    setRestockModalItem(item);
    setRestockInput(defaultQty);
    setRestockCostInput(item.costPerUnitTwd);
    setRestockSupplierInput(item.supplier);
    setRestockBatchInput(`INB-${dateStr}-${randSeq}`);
    setRestockNoteInput('門市原物料常規進貨補給入庫');
  };

  const handleConfirmRestock = () => {
    if (!restockModalItem || restockInput <= 0) return;
    sounds.playSuccessChime();
    onRestock(restockModalItem.id, restockInput, {
      costPerUnit: restockCostInput,
      supplier: restockSupplierInput,
      batchNumber: restockBatchInput,
      note: restockNoteInput,
      operator: '陳品研 (早班店長)',
    });
    setRestockModalItem(null);
  };

  const handleSaveInlinePar = (itemId: string) => {
    if (inlineParValue <= 0) return;
    sounds.playSuccessChime();
    onUpdateFixedParStock(itemId, inlineParValue);
    setInlineParEditId(null);
  };

  const handleSaveModalPar = () => {
    if (!editingParModal || newParInput <= 0) return;
    sounds.playSuccessChime();
    onUpdateFixedParStock(editingParModal.id, newParInput);
    setEditingParModal(null);
  };

  // Total inbound procurement costs
  const totalInboundExpense = restockRecords.reduce((sum, r) => sum + r.totalCostTwd, 0);

  return (
    <div className="flex-1 bg-[#0F1013] text-stone-200 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span>STORE WAREHOUSE & PROCUREMENT</span>
            <span>·</span>
            <span>後台進銷存與定額管理</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            <span>後台庫存管理、固定基準量與進貨補貨</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-normal">
              後台核心
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Thiết lập <strong className="text-amber-300 font-mono">Số lượng cố định (固定基準量)</strong> và theo dõi <strong className="text-amber-300 font-mono">Số lượng nhập hàng (進貨補貨量)</strong> kèm lịch sử nhập kho chi tiết.
          </p>
        </div>

        {/* Action Buttons & Subtabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-[#1A1C24] border border-[#2B2F3D] rounded-xl">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSubTab('inventory');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                subTab === 'inventory'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Bảng kiểm kê kho (在庫庫存)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSubTab('history');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                subTab === 'history'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử nhập hàng (進貨記錄)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-700 text-[10px] font-mono">
                {restockRecords.length}
              </span>
            </button>
          </div>

          {onNavigateToStoreInfo && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onNavigateToStoreInfo();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#1D202A] hover:bg-[#252936] text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>Mã QR & Liên hệ quán</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stock Items */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-mono">Tổng vật tư quản lý</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {totalItems} <span className="text-xs font-sans text-stone-500">品項</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Định mức cố định đã thiết lập 100%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-800/60 border border-stone-700/50 flex items-center justify-center text-stone-300">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Below Fixed Par Stock */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-mono">Dưới số lượng cố định (Par)</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {belowParItems.length} <span className="text-xs font-sans text-stone-500">品項待補</span>
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">
              Cần tạo phiếu nhập hàng bổ sung
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Inbound Batches & Total Quantity */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-mono">Lô hàng đã nhập (Inbound)</span>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              {restockRecords.length} <span className="text-xs font-sans text-stone-500">批次</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
              Tổng chi phí: NT$ {totalInboundExpense.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Critical Stock Alert */}
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-mono">Cảnh báo chạm ngưỡng an toàn</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {lowStockItems.length} <span className="text-xs font-sans text-stone-500">項緊急</span>
            </div>
            <div className="text-[11px] text-rose-400/80 mt-0.5">
              Tồn kho ≤ ngưỡng cảnh báo tối thiểu
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {subTab === 'inventory' ? (
        /* ================= SUBTAB 1: INVENTORY TABLE ================= */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#14161D] border border-[#242733] rounded-2xl">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#1A1C24] border border-[#282C38] rounded-xl scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-[#222530]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Status Filter & Search */}
            <div className="flex items-center gap-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-[#1C1E26] border border-[#2B2F3D] rounded-xl text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả trạng thái (全部)</option>
                <option value="low_par">Dưới số lượng cố định (低於固定量)</option>
                <option value="critical">Cảnh báo khẩn cấp (緊急缺料)</option>
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm nguyên liệu, nhà cung cấp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#1C1E26] border border-[#2B2F3D] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* High-Density Inventory Table with Explicit Fixed Par & Inbound Columns */}
          <div className="bg-[#15171F] border border-[#252834] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101116] border-b border-[#242733] text-stone-400 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Tên nguyên liệu (物料品名)</th>
                    <th className="py-3.5 px-3">Phân loại</th>
                    <th className="py-3.5 px-4">Tồn kho hiện tại (即時庫存)</th>
                    {/* Explicit User Requirement: Số lượng cố định */}
                    <th className="py-3.5 px-4 bg-amber-500/5 border-x border-[#242733]">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Target className="w-3.5 h-3.5" />
                        <span>Số lượng cố định (固定基準量)</span>
                      </div>
                    </th>
                    {/* Explicit User Requirement: Số lượng nhập hàng */}
                    <th className="py-3.5 px-4 bg-sky-500/5 border-r border-[#242733]">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Số lượng nhập hàng (進貨補貨量)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-3">Ngưỡng tối thiểu</th>
                    <th className="py-3.5 px-3">Đơn giá nhập</th>
                    <th className="py-3.5 px-3">Nhà cung cấp</th>
                    <th className="py-3.5 px-3">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác nhập hàng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212430]">
                  {filteredInventory.map((item) => {
                    const parStock = item.fixedParStock || item.minThreshold * 2;
                    const isBelowPar = item.currentStock < parStock;
                    const isCritical = item.currentStock <= item.minThreshold * 0.5;
                    const isLow = item.currentStock <= item.minThreshold;
                    const ratio = Math.min(100, Math.round((item.currentStock / parStock) * 100));
                    const needRestockQty = Math.max(0, Math.round((parStock - item.currentStock) * 10) / 10);

                    return (
                      <tr key={item.id} className="hover:bg-[#1A1C24] transition-colors">
                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isLow && (
                              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" title="Dưới ngưỡng an toàn" />
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-stone-400 whitespace-nowrap">
                          {item.categoryLabel}
                        </td>

                        {/* Current Stock */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm tabular-nums text-white min-w-[70px]">
                              {item.currentStock} {item.unit}
                            </span>
                            <div className="w-16 h-2 bg-[#20232E] rounded-full overflow-hidden hidden md:block">
                              <div
                                className={`h-full rounded-full ${
                                  isCritical
                                    ? 'bg-rose-500'
                                    : isLow
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Số lượng cố định (Fixed Par Stock) */}
                        <td className="py-3.5 px-4 bg-amber-500/5 border-x border-[#242733] font-mono">
                          {inlineParEditId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                value={inlineParValue}
                                onChange={(e) => setInlineParValue(Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-[#1E212B] border border-amber-500 rounded text-xs text-white font-mono"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInlinePar(item.id)}
                                className="p-1 rounded bg-amber-500 text-black hover:bg-amber-400"
                                title="Lưu số lượng cố định"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInlineParEditId(null)}
                                className="p-1 rounded bg-stone-700 text-stone-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <div>
                                <span className="text-amber-300 font-bold tabular-nums text-sm">
                                  {parStock} {item.unit}
                                </span>
                                {isBelowPar && (
                                  <div className="text-[10px] text-amber-400 font-sans">
                                    Thiếu: <span className="font-mono font-bold">-{needRestockQty}</span> {item.unit}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playClick();
                                  setInlineParEditId(item.id);
                                  setInlineParValue(parStock);
                                }}
                                className="opacity-40 group-hover:opacity-100 p-1 rounded hover:bg-[#252835] text-stone-400 hover:text-amber-400 transition-opacity"
                                title="Sửa số lượng cố định"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Số lượng nhập hàng (Restock Quantity) */}
                        <td className="py-3.5 px-4 bg-sky-500/5 border-r border-[#242733] font-mono">
                          <div className="space-y-0.5">
                            <div className="text-sky-300 font-bold tabular-nums">
                              +{item.lastRestockQty || 0} {item.unit}
                              <span className="text-[10px] text-stone-400 font-sans ml-1 font-normal">
                                (lần trước)
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-sans">
                              Đã nhập: <span className="font-mono text-stone-300">{item.totalRestockedQty || item.lastRestockQty || 0}</span> {item.unit}
                            </div>
                          </div>
                        </td>

                        {/* Min Threshold */}
                        <td className="py-3.5 px-3 font-mono text-stone-400 tabular-nums">
                          {item.minThreshold} {item.unit}
                        </td>

                        {/* Unit Cost */}
                        <td className="py-3.5 px-3 font-mono text-stone-300 tabular-nums whitespace-nowrap">
                          NT$ {item.costPerUnitTwd}
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-3 text-stone-400 truncate max-w-[130px]">
                          {item.supplier}
                        </td>

                        {/* Stock Status Badge */}
                        <td className="py-3.5 px-3">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 whitespace-nowrap">
                              Khẩn cấp
                            </span>
                          ) : isBelowPar ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 whitespace-nowrap">
                              Dưới mức cố định
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap">
                              Đạt định mức
                            </span>
                          )}
                        </td>

                        {/* Action: Restock Inbound Button */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playSuccessChime();
                                const fastQty = needRestockQty > 0 ? needRestockQty : (item.unit === '個' || item.unit === '支' ? 200 : 10);
                                onRestock(item.id, fastQty);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#20232E] hover:bg-[#2A2F3E] text-stone-300 hover:text-white border border-[#2F3444] text-[11px] font-mono transition-colors cursor-pointer"
                              title="Nhập nhanh bổ sung vào kho"
                            >
                              +{needRestockQty > 0 ? needRestockQty : (item.unit === '個' || item.unit === '支' ? '200' : '10')} {item.unit}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRestock(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Nhập hàng</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= SUBTAB 2: INBOUND HISTORY ================= */
        <div className="space-y-4">
          <div className="bg-[#15171F] border border-[#252834] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Lịch sử nhập hàng & Quản lý lô hàng (進貨明細記錄)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Ghi nhận chi tiết từng lần nhập hàng: số lượng nhập, số lượng cố định, đơn giá, nhà cung cấp và nhân viên thực hiện.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 font-mono">TỔNG CHI PHÍ NHẬP HÀNG:</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                NT$ {totalInboundExpense.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-[#15171F] border border-[#252834] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101116] border-b border-[#242733] text-stone-400 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Thời gian / Ngày nhập</th>
                    <th className="py-3 px-4">Mã lô nhập (Batch)</th>
                    <th className="py-3 px-4">Tên nguyên liệu</th>
                    <th className="py-3 px-4 text-sky-400 font-bold">Số lượng nhập hàng</th>
                    <th className="py-3 px-4 text-amber-400 font-bold">Số lượng cố định</th>
                    <th className="py-3 px-4">Đơn giá nhập</th>
                    <th className="py-3 px-4">Tổng tiền (TWD)</th>
                    <th className="py-3 px-4">Nhà cung cấp</th>
                    <th className="py-3 px-4">Người tiếp nhận</th>
                    <th className="py-3 px-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212430]">
                  {restockRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-stone-500">
                        Chưa có phiếu nhập hàng nào. Vui lòng nhấn "Nhập hàng" tại bảng kho.
                      </td>
                    </tr>
                  ) : (
                    restockRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-[#1A1C24] transition-colors">
                        <td className="py-3 px-4 font-mono text-stone-300">
                          {record.dateStr}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                          {record.batchNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {record.itemName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sky-400 text-sm">
                          +{record.restockQty} {record.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-300">
                          {record.fixedParStock} {record.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-300">
                          NT$ {record.costPerUnitTwd}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          NT$ {record.totalCostTwd.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-stone-400">
                          {record.supplier}
                        </td>
                        <td className="py-3 px-4 text-stone-300">
                          {record.operator}
                        </td>
                        <td className="py-3 px-4 text-stone-400 max-w-[200px] truncate" title={record.note}>
                          {record.note || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Restock Dialog Modal */}
      {restockModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setRestockModalItem(null)}
        >
          <div
            className="bg-[#181A22] border border-[#2E3240] rounded-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#242733]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Phiếu nhập hàng nguyên vật liệu (進貨補貨入庫)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Item Info Summary */}
              <div className="p-3.5 rounded-xl bg-[#14161D] border border-[#242733] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {restockModalItem.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                    {restockModalItem.categoryLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-400 font-mono">
                  <div className="p-2 bg-[#1A1C24] rounded-lg border border-[#262A37]">
                    <div className="text-[10px] text-stone-500">TỒN KHO HIỆN TẠI (目前庫存):</div>
                    <div className="text-white font-bold text-sm mt-0.5">
                      {restockModalItem.currentStock} {restockModalItem.unit}
                    </div>
                  </div>

                  <div className="p-2 bg-[#1A1C24] rounded-lg border border-[#262A37]">
                    <div className="text-[10px] text-amber-400">SỐ LƯỢNG CỐ ĐỊNH (固定基準量):</div>
                    <div className="text-amber-300 font-bold text-sm mt-0.5">
                      {restockModalItem.fixedParStock} {restockModalItem.unit}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                  <span>Chênh lệch cần nhập để đủ định mức cố định:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.max(0, Math.round((restockModalItem.fixedParStock - restockModalItem.currentStock) * 10) / 10)} {restockModalItem.unit}
                  </span>
                </div>
              </div>

              {/* Form Input: Số lượng nhập hàng */}
              <div>
                <label className="text-sky-300 font-bold block mb-1.5 flex items-center justify-between">
                  <span>Nhập số lượng nhập hàng (進貨數量 - {restockModalItem.unit}):</span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    Sau khi nhập: <strong className="text-white font-mono">{Math.round((restockModalItem.currentStock + restockInput) * 10) / 10} {restockModalItem.unit}</strong>
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={restockInput}
                    onChange={(e) => setRestockInput(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3.5 py-2.5 bg-[#1F222C] border border-[#2B2F3D] rounded-xl text-lg font-mono font-bold text-sky-400 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-stone-400 font-mono font-bold text-sm w-10">
                    {restockModalItem.unit}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-stone-500 font-mono mr-1">Phím tắt:</span>
                  {restockModalItem.fixedParStock > restockModalItem.currentStock && (
                    <button
                      type="button"
                      onClick={() =>
                        setRestockInput(
                          Math.max(
                            1,
                            Math.round((restockModalItem.fixedParStock - restockModalItem.currentStock) * 10) / 10
                          )
                        )
                      }
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono cursor-pointer"
                    >
                      Bù đủ mức cố định (+{Math.round((restockModalItem.fixedParStock - restockModalItem.currentStock) * 10) / 10})
                    </button>
                  )}
                  {[10, 20, 50, 100, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockInput(val)}
                      className="px-2 py-0.5 rounded bg-[#242735] hover:bg-[#2C3040] text-stone-300 text-[11px] font-mono cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inbound Details: Unit Cost & Batch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-bold block mb-1">
                    Đơn giá nhập (NT$/{restockModalItem.unit}):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={restockCostInput}
                    onChange={(e) => setRestockCostInput(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-[#1F222C] border border-[#2B2F3D] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-bold block mb-1">
                    Mã lô nhập hàng (Batch No.):
                  </label>
                  <input
                    type="text"
                    value={restockBatchInput}
                    onChange={(e) => setRestockBatchInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F222C] border border-[#2B2F3D] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">
                  Nhà cung cấp:
                </label>
                <input
                  type="text"
                  value={restockSupplierInput}
                  onChange={(e) => setRestockSupplierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1F222C] border border-[#2B2F3D] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 font-bold block mb-1">
                  Ghi chú nhập hàng:
                </label>
                <input
                  type="text"
                  value={restockNoteInput}
                  onChange={(e) => setRestockNoteInput(e.target.value)}
                  placeholder="Kiểm định nhiệt độ, hạn sử dụng..."
                  className="w-full px-3 py-2 bg-[#1F222C] border border-[#2B2F3D] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Total Estimated Cost */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex justify-between items-center">
                <span>Dự toán tổng chi phí nhập lần này:</span>
                <span className="font-bold text-base text-amber-400">
                  NT$ {(restockInput * restockCostInput).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#222530] text-stone-300 text-xs font-semibold hover:bg-[#2C3140]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 shadow-md flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Xác nhận nhập kho (+{restockInput} {restockModalItem.unit})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
