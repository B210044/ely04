import React, { useState, useEffect } from 'react';
import { PosTab } from '../types/pos';
import { sounds } from '../utils/audio';
import { useMember } from '../context/MemberContext';
import {
  Coffee,
  Package,
  BarChart3,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Clock,
  UserCheck,
  Store,
  QrCode,
  Award,
  Database,
  Smartphone,
} from 'lucide-react';

interface PosTopBarProps {
  activeTab: PosTab;
  setActiveTab: (tab: PosTab) => void;
  cartCount: number;
  onOpenStandalonePage?: () => void;
}

export const PosTopBar: React.FC<PosTopBarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenStandalonePage,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());
  const { memberProfile, activePosMember } = useMember();
  const currentMember = activePosMember || memberProfile;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playClick();
    }
  };

  const navItems: { id: PosTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'cashier',
      label: '前台收銀 POS',
      icon: <Coffee className="w-4 h-4" />,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'inventory',
      label: '後台庫存與補貨',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: '銷售分析報表',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'bom',
      label: '配方BOM管理',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'members',
      label: '會員集點中心',
      icon: <Award className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'store_info',
      label: '門市資訊與 QR',
      icon: <QrCode className="w-4 h-4" />,
    },
  ];

  const formattedTime = currentTime.toLocaleTimeString('zh-TW', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <header className="sticky top-0 z-40 bg-[#121316] border-b border-[#252830] text-stone-200 select-none shadow-lg">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Store identification */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold tracking-wider text-white font-display">
                茶研所
              </h1>
              <span className="text-[11px] text-amber-400/90 font-mono tracking-widest uppercase hidden sm:inline">
                TEA RESEARCH LAB
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              敦南旗艦門市 · POS 終端 #01
            </p>
          </div>
        </div>

        {/* Zone 2: Required Top Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#1A1C22] border border-[#2B2F3A] rounded-xl overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#22252D]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Operator Info, Clock, Audio Switch */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Standalone Member Portal Button */}
          {onOpenStandalonePage && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenStandalonePage();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
              title="開啟個人會員申請的獨立網頁 (顧客專用)"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>獨立會員申請頁</span>
            </button>
          )}

          {/* Member shortcut chip */}
          {currentMember && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('members');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 transition-all cursor-pointer shadow-sm"
              title="前往會員中心"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{currentMember.displayName}</span>
              <span className="font-mono text-amber-400 font-bold">({currentMember.points}點)</span>
            </button>
          )}

          {/* Cashier Shift status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#181A20] border border-[#282B35] rounded-lg text-xs text-stone-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>早班</span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-200 font-medium">陳品研 (No. 108)</span>
          </div>

          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#181A20] border border-[#282B35] rounded-lg text-xs font-mono text-stone-300 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-amber-400/80" />
            <span>{formattedDate}</span>
            <span className="text-stone-400">{formattedTime}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            title={isMuted ? '開啟按鍵音效' : '關閉按鍵音效'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-[#181A20] border-[#2A2E38] text-stone-500 hover:text-stone-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
