import React, { useState } from 'react';
import { DrinkBom } from '../types/pos';
import { DRINK_BOMS } from '../data/posData';
import { sounds } from '../utils/audio';
import {
  FileSpreadsheet,
  Percent,
  Search,
  Sliders,
  DollarSign,
  Coffee,
  Check,
  X,
  ListOrdered,
  Sparkles,
} from 'lucide-react';

export const BomManagementTab: React.FC = () => {
  const [boms, setBoms] = useState<DrinkBom[]>(DRINK_BOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBomModal, setActiveBomModal] = useState<DrinkBom | null>(null);

  // Filter
  const filteredBoms = boms.filter((b) => {
    if (!searchQuery) return true;
    return (
      b.drinkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.drinkNumber.includes(searchQuery) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleUpdatePrice = (newPrice: number) => {
    if (!activeBomModal || newPrice <= 0) return;
    const margin = Math.round(((newPrice - activeBomModal.totalCostTwd) / newPrice) * 1000) / 10;
    const updated = {
      ...activeBomModal,
      retailPriceTwd: newPrice,
      marginPct: margin,
    };
    setActiveBomModal(updated);
    setBoms((prev) => prev.map((b) => (b.drinkId === updated.drinkId ? updated : b)));
    sounds.playClick();
  };

  return (
    <div className="flex-1 bg-[#0F1013] text-stone-200 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span>STANDARD OPERATING PROCEDURE & BOM</span>
            <span>·</span>
            <span>精準原料配方控管</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            12 款經典特調配方 BOM 管理
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            即時計算每杯茶湯克數、鮮乳毫升、糖度刻度、包材損耗與毛利貢獻率。
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="搜尋配方名稱或編號 (如: 01, 抹茶)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1C1E26] border border-[#2B2F3D] rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37]">
          <span className="text-xs text-stone-400 font-mono">標準化配方品項</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            12 <span className="text-xs font-sans text-stone-500">款黃金比例</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37]">
          <span className="text-xs text-stone-400 font-mono">平均原料單杯成本 (COGS)</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            NT$ 32.5 <span className="text-xs font-sans text-stone-500">(含包材)</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#161820] border border-[#262A37]">
          <span className="text-xs text-stone-400 font-mono">全店平均毛利率 (Gross Margin)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            57.8% <span className="text-xs font-sans text-stone-500">健康利潤空間</span>
          </div>
        </div>
      </div>

      {/* BOM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBoms.map((bom) => (
          <div
            key={bom.drinkId}
            className="bg-[#15171F] border border-[#252834] rounded-2xl p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                  FLOW #{bom.drinkNumber}
                </span>
                <span className="text-xs text-stone-400">{bom.category}</span>
              </div>

              <h3 className="text-lg font-bold text-white font-display">
                {bom.drinkName}
              </h3>

              {/* Price & Cost Highlights */}
              <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-[#111218] border border-[#222530] rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-stone-500 block">門市售價</span>
                  <span className="font-mono font-bold text-white text-sm">
                    NT$ {bom.retailPriceTwd}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">物料總成本</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    NT$ {bom.totalCostTwd}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">單杯毛利率</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {bom.marginPct}%
                  </span>
                </div>
              </div>

              {/* Key Ingredients List Preview */}
              <div className="space-y-1.5 text-xs text-stone-300 pt-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase block tracking-wider">
                  主要用料規格:
                </span>
                {bom.ingredients.slice(0, 3).map((ing, idx) => (
                  <div key={idx} className="flex justify-between font-mono text-[11px]">
                    <span className="text-stone-300 truncate max-w-[180px]">{ing.name}</span>
                    <span className="text-stone-500">{ing.amount}</span>
                  </div>
                ))}
                {bom.ingredients.length > 3 && (
                  <div className="text-[10px] text-stone-500 italic">
                    + 其他 {bom.ingredients.length - 3} 種原料與包材
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="mt-5 pt-3 border-t border-[#232632] flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                SOP共 {bom.sopSteps.length} 道標準工序
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveBomModal(bom);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#222530] hover:bg-amber-500 hover:text-black text-amber-400 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>檢視標準製程 SOP</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOM Detail & Pricing Simulator Modal */}
      {activeBomModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveBomModal(null)}
        >
          <div
            className="bg-[#181A22] border border-[#2B2F3D] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-stone-200 animate-in fade-in zoom-in-95 duration-150 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#13141A] border-b border-[#242733] p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                    FLOW #{activeBomModal.drinkNumber}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {activeBomModal.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-display">
                  {activeBomModal.drinkName} · 標準配方物料清單 (BOM)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveBomModal(null)}
                className="p-1.5 rounded-lg bg-[#20232E] text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-12rem)] overflow-y-auto">
              {/* Cost & Profit Simulator */}
              <div className="p-4 rounded-xl bg-[#13141B] border border-[#252834] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-400 font-mono block">
                    目前門市標定售價 (可即時調價試算)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdatePrice(activeBomModal.retailPriceTwd - 5)}
                      className="w-7 h-7 rounded bg-[#20232E] hover:bg-[#2B303E] text-stone-300 font-mono font-bold text-sm"
                    >
                      -5
                    </button>
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      NT$ {activeBomModal.retailPriceTwd}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdatePrice(activeBomModal.retailPriceTwd + 5)}
                      className="w-7 h-7 rounded bg-[#20232E] hover:bg-[#2B303E] text-stone-300 font-mono font-bold text-sm"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div className="text-right flex items-center gap-6 sm:gap-8 justify-between sm:justify-end">
                  <div>
                    <span className="text-[11px] text-stone-500 font-mono block">總成本 (COGS)</span>
                    <span className="text-base font-bold font-mono text-amber-400">
                      NT$ {activeBomModal.totalCostTwd}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 font-mono block">毛利率 (Margin)</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {activeBomModal.marginPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipe Ingredients Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                  1. 標準原物料精確配比清單
                </h4>
                <div className="bg-[#14161D] border border-[#242733] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#101116] border-b border-[#242733] text-stone-500 font-mono text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">物料成分</th>
                        <th className="py-2.5 px-3">標準用量</th>
                        <th className="py-2.5 px-3 text-right">原料成本 (TWD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20232E]">
                      {activeBomModal.ingredients.map((ing, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-stone-200">{ing.name}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-400">{ing.amount}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-400 tabular-nums">
                            NT$ {ing.costTwd}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2.5 px-3 text-stone-400">專用杯具 + 封膜 + 甘蔗吸管</td>
                        <td className="py-2.5 px-3 font-mono text-stone-500">1 套</td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400 tabular-nums">
                          NT$ {activeBomModal.packagingCostTwd}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SOP Steps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. 吧台標準調飲出杯製程 (Barista SOP)</span>
                </h4>
                <div className="space-y-2">
                  {activeBomModal.sopSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#14161E] border border-[#242735] text-xs text-stone-300 leading-relaxed font-sans"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#13141B] border-t border-[#242733] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBomModal(null)}
                className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                儲存並關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
