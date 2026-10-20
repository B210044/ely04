import React, { useState } from 'react';
import { SalesOrder } from '../types/pos';
import { sounds } from '../utils/audio';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  CreditCard,
  Calendar,
  Eye,
  Award,
  Sparkles,
  BarChart2,
  PieChart,
} from 'lucide-react';

interface AnalyticsTabProps {
  orders: SalesOrder[];
  onViewOrderReceipt: (order: SalesOrder) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  orders,
  onViewOrderReceipt,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Computed metrics
  const totalRevenueTwd = orders.reduce((sum, o) => sum + o.totalTwd, 0);
  const totalCupsSold = orders.reduce((sum, o) => sum + o.itemsCount, 0);
  const averageTicketTwd = orders.length > 0 ? Math.round(totalRevenueTwd / orders.length) : 0;

  // Find top drink
  const drinkSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!drinkSalesMap[item.chineseName]) {
        drinkSalesMap[item.chineseName] = { name: item.chineseName, count: 0, revenue: 0 };
      }
      drinkSalesMap[item.chineseName].count += item.quantity;
      drinkSalesMap[item.chineseName].revenue += item.subtotal;
    });
  });

  const sortedDrinks = Object.values(drinkSalesMap).sort((a, b) => b.count - a.count);
  const topDrink = sortedDrinks[0] || { name: '琥珀黑糖虎紋', count: 18, revenue: 1350 };

  // Simulated hourly sales data (09:00 - 21:00)
  const hourlyData = [
    { hour: '09:00', cups: 12, revenue: 980 },
    { hour: '10:00', cups: 25, revenue: 2150 },
    { hour: '11:00', cups: 42, revenue: 3580 },
    { hour: '12:00', cups: 68, revenue: 5820 },
    { hour: '13:00', cups: 54, revenue: 4620 },
    { hour: '14:00', cups: 48, revenue: 4100 },
    { hour: '15:00', cups: 62, revenue: 5310 },
    { hour: '16:00', cups: 38, revenue: 3240 },
    { hour: '17:00', cups: 45, revenue: 3850 },
    { hour: '18:00', cups: 58, revenue: 4970 },
    { hour: '19:00', cups: 40, revenue: 3420 },
    { hour: '20:00', cups: 22, revenue: 1890 },
  ];

  const maxRevenue = Math.max(...hourlyData.map((d) => d.revenue));

  const categoryShare = [
    { name: '招牌鮮奶茶', share: 44, color: 'bg-amber-500' },
    { name: '雲頂芝士奶蓋', share: 26, color: 'bg-emerald-500' },
    { name: '鮮果萃茶', share: 20, color: 'bg-rose-500' },
    { name: '原葉極萃純茶', share: 10, color: 'bg-sky-500' },
  ];

  return (
    <div className="flex-1 bg-[#0F1013] text-stone-200 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span>REVENUE & METRICS</span>
            <span>·</span>
            <span>即時營業分析報表</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            今日門市營運分析報告
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            統計即時出杯量、客單價分佈、熱門加料排名與全日各時段營收波動。
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#1A1C24] border border-[#2B2F3D] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedTimeRange('today');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedTimeRange === 'today'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            今日實時
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedTimeRange('week');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedTimeRange === 'week'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            本週統計
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedTimeRange('month');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedTimeRange === 'month'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            本月總覽
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#161820] border border-[#262A37] relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
            <span>今日營業總額</span>
            <span className="text-emerald-400 font-bold">+18.4% YoY</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2 tabular-nums">
            NT$ {(totalRevenueTwd + 43950).toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block font-mono">
            含實體POS與線上外送點單
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#161820] border border-[#262A37] relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
            <span>累計售出杯數</span>
            <span className="text-emerald-400 font-bold">514 杯</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            {totalCupsSold + 514} <span className="text-xs font-sans text-stone-400">杯</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block font-mono">
            尖峰時段：12:00 - 14:00
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#161820] border border-[#262A37] relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
            <span>平均客單價 (AOV)</span>
            <span className="text-stone-400 font-bold">每單 2.4 杯</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2 tabular-nums">
            NT$ {averageTicketTwd > 0 ? averageTicketTwd : 185}
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block font-mono">
            加料率達 68.2%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#161820] border border-[#262A37] relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
            <span>熱門人氣冠軍</span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <Award className="w-3.5 h-3.5" /> NO.1
            </span>
          </div>
          <div className="text-xl font-bold text-white mt-2 truncate font-display">
            {topDrink.name}
          </div>
          <span className="text-[11px] text-amber-400/90 mt-2 block font-mono">
            已售出 128 杯 (佔比 24.8%)
          </span>
        </div>
      </div>

      {/* Hourly Sales Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#15171F] border border-[#252834] space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">全日時段營業額趨勢 (09:00 - 20:00)</h3>
            </div>
            <span className="text-xs font-mono text-stone-400">單位: 新台幣 (TWD)</span>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-2 sm:gap-3 px-2">
              {hourlyData.map((bar, idx) => {
                const heightPct = Math.round((bar.revenue / maxRevenue) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] font-mono px-2 py-1 rounded border border-[#333] pointer-events-none whitespace-nowrap z-20 shadow-md">
                      {bar.cups} 杯 · ${bar.revenue}
                    </div>

                    <div className="w-full bg-[#1F222C] rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 truncate w-full text-center">
                      {bar.hour.split(':')[0]}時
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Share (1 col) */}
        <div className="p-5 rounded-2xl bg-[#15171F] border border-[#252834] space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">各系列飲品銷售佔比</h3>
            </div>

            {/* Visual Bar Distribution */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#1E2029] mb-4">
              {categoryShare.map((cat, idx) => (
                <div
                  key={idx}
                  className={`${cat.color}`}
                  style={{ width: `${cat.share}%` }}
                  title={`${cat.name}: ${cat.share}%`}
                />
              ))}
            </div>

            <div className="space-y-3">
              {categoryShare.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-stone-300">{cat.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {cat.share}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#1A1C25] rounded-xl border border-[#292D3B] text-[11px] text-stone-400">
            💡 <strong className="text-stone-200">經營洞察:</strong> 招牌厚鮮奶茶系列毛利達 58%，為今日主營收引擎。
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger Table */}
      <div className="p-5 rounded-2xl bg-[#15171F] border border-[#252834] space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">近期櫃台收銀交易紀錄 (Recent Transactions)</h3>
          </div>
          <span className="text-xs font-mono text-stone-400">共 {orders.length} 筆即時記錄</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101116] border-b border-[#242733] text-stone-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">取餐號 / 交易編號</th>
                <th className="py-3 px-4">成立時間</th>
                <th className="py-3 px-4">型態</th>
                <th className="py-3 px-4">點購品項簡述</th>
                <th className="py-3 px-4">總杯數</th>
                <th className="py-3 px-4">支付方式</th>
                <th className="py-3 px-4">實收總計</th>
                <th className="py-3 px-4 text-right">憑證收據</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212430]">
              {orders.map((ord) => {
                const timeString = new Date(ord.timestamp).toLocaleTimeString('zh-TW', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });

                const summaryText = ord.items.map((i) => `${i.chineseName}x${i.quantity}`).join('、');

                return (
                  <tr key={ord.orderId} className="hover:bg-[#1A1C24] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      <div>{ord.orderNumber}</div>
                      <div className="text-[10px] text-stone-500 font-normal">{ord.orderId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-400 tabular-nums">
                      {timeString}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#20232E] text-stone-300 text-[10px] font-mono">
                        {ord.orderType === 'takeout' ? '外帶' : ord.orderType === 'dinein' ? '內用' : '外送'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 max-w-[220px] truncate">
                      {summaryText}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white tabular-nums">
                      {ord.itemsCount} 杯
                    </td>
                    <td className="py-3.5 px-4 capitalize font-mono text-stone-400">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm tabular-nums">
                      NT$ {ord.totalTwd}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onViewOrderReceipt(ord);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#222530] hover:bg-amber-500 hover:text-black text-stone-300 font-medium text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>收據出單</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
