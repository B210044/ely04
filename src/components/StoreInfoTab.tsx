import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { StoreContactInfo } from '../types/pos';
import { sounds } from '../utils/audio';
import {
  QrCode,
  Phone,
  MapPin,
  Clock,
  Mail,
  Wifi,
  Share2,
  Copy,
  Printer,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  Smartphone,
  ExternalLink,
  CreditCard,
  MessageCircle,
} from 'lucide-react';

interface StoreInfoTabProps {
  contactInfo: StoreContactInfo;
  onUpdateContactInfo: (updated: StoreContactInfo) => void;
}

type QrType = 'menu' | 'line_zalo' | 'payment' | 'wifi' | 'facebook';

export const StoreInfoTab: React.FC<StoreInfoTabProps> = ({
  contactInfo,
  onUpdateContactInfo,
}) => {
  const [activeQrType, setActiveQrType] = useState<QrType>('menu');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<StoreContactInfo>(contactInfo);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setFormData(contactInfo);
  }, [contactInfo]);

  // Determine QR payload based on selected type
  const getQrPayload = (type: QrType): string => {
    switch (type) {
      case 'menu':
        return formData.onlineMenuUrl || window.location.href;
      case 'line_zalo':
        return formData.lineId
          ? `https://line.me/R/ti/p/~${formData.lineId.replace('@', '')}`
          : `tel:${formData.phone}`;
      case 'payment':
        return `PAYTO:BANK:${formData.bankAccount.bankName}?ACC=${formData.bankAccount.accountNumber}&NAME=${encodeURIComponent(formData.bankAccount.accountHolder)}`;
      case 'wifi':
        return `WIFI:T:WPA;S:${formData.wifiSsid};P:${formData.wifiPassword};;`;
      case 'facebook':
        return formData.facebookUrl || 'https://facebook.com';
      default:
        return window.location.href;
    }
  };

  // Generate QR image
  useEffect(() => {
    const payload = getQrPayload(activeQrType);
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#111317',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [activeQrType, formData]);

  const handleCopy = (text: string, key: string) => {
    sounds.playSuccessChime();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccessChime();
    onUpdateContactInfo(formData);
    setIsEditing(false);
  };

  const handleResetDefault = () => {
    sounds.playClick();
    setFormData(contactInfo);
    setIsEditing(false);
  };

  const qrOptions: { id: QrType; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'menu',
      title: 'Mã QR Menu & Đặt món',
      subtitle: 'Menu trực tuyến / 線上點餐',
      icon: <QrCode className="w-4 h-4" />,
      color: 'amber',
    },
    {
      id: 'payment',
      title: 'Mã QR Thanh toán quán',
      subtitle: 'Tài khoản & QR Pay / 門市收款',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'emerald',
    },
    {
      id: 'line_zalo',
      title: 'Mã QR Zalo / LINE CSKH',
      subtitle: 'Tích điểm & Hỗ trợ / 客服與會員',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'sky',
    },
    {
      id: 'wifi',
      title: 'Mã QR Wi-Fi Cửa hàng',
      subtitle: 'Quét để kết nối ngay / 免密掃碼連網',
      icon: <Wifi className="w-4 h-4" />,
      color: 'purple',
    },
    {
      id: 'facebook',
      title: 'Mã QR Fanpage & MXH',
      subtitle: 'Theo dõi Fanpage / 社群追蹤',
      icon: <Share2 className="w-4 h-4" />,
      color: 'rose',
    },
  ];

  return (
    <div className="flex-1 bg-[#0F1013] text-stone-200 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242733]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <span>STORE IDENTITY & CONTACT</span>
            <span>·</span>
            <span>後台門市資訊與 QR CODE</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display flex items-center gap-2.5">
            <span>Mã QR & Phương thức liên lạc của quán</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-normal">
              後台設定
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Quản lý mã QR quét mã tại quán, bảng số điện thoại, mạng xã hội, thông tin chuyển khoản và Wi-Fi cho khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsStandeeModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#1C1F28] hover:bg-[#252936] text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>In biển QR để bàn (Standee)</span>
          </button>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsEditing(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh sửa thông tin quán</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-3.5 py-2 rounded-xl bg-[#222530] text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Visualizer & Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* QR Type Switcher Tabs */}
          <div className="bg-[#15171F] border border-[#262A37] rounded-2xl p-2 flex flex-wrap gap-1.5">
            {qrOptions.map((opt) => {
              const isActive = activeQrType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveQrType(opt.id);
                  }}
                  className={`flex-1 min-w-[130px] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#1E212B]'
                  }`}
                >
                  {opt.icon}
                  <div className="truncate">
                    <div className="truncate leading-snug">{opt.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* QR Display Card */}
          <div className="bg-linear-to-b from-[#181A23] to-[#12141A] border border-[#2A2E3D] rounded-3xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            {/* Ambient Accent Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest mb-1">
              STORE SCAN & CONNECT
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {formData.storeName}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {formData.branchName}
            </p>

            {/* QR Frame Container */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-500/20 relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Mã QR quán"
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-stone-400 text-xs">
                  Đang khởi tạo mã QR...
                </div>
              )}

              {/* Center Logo Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center text-xs shadow-md border-2 border-white">
                  茶
                </div>
              </div>
            </div>

            {/* QR Target Description */}
            <div className="mt-5 w-full bg-[#1A1C24] border border-[#282C3A] rounded-xl p-3 text-left space-y-1 text-xs">
              <div className="flex items-center justify-between text-stone-400 font-mono text-[11px]">
                <span>NỘI DUNG LIÊN KẾT MÃ QR:</span>
                <span className="text-amber-400 font-bold uppercase">{activeQrType}</span>
              </div>
              <div className="font-mono text-white text-[12px] truncate select-all py-1 px-2 bg-[#12141A] rounded border border-[#242733]">
                {getQrPayload(activeQrType)}
              </div>
              <div className="text-[11px] text-stone-400 pt-1 flex items-center justify-between">
                <span>Khách hàng có thể quét bằng máy ảnh điện thoại, Zalo, hoặc LINE.</span>
                <button
                  type="button"
                  onClick={() => handleCopy(getQrPayload(activeQrType), 'payload')}
                  className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'payload' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 w-full flex items-center gap-2">
              <a
                href={qrDataUrl}
                download={`${formData.storeNameEn}_QR_${activeQrType}.png`}
                className="flex-1 py-2 px-3 rounded-xl bg-[#20232E] hover:bg-[#2A2F3E] text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#2D3242]"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải ảnh QR (PNG)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsStandeeModalOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Xem bản in để bàn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Methods & Store Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Contact Details Card */}
          <div className="bg-[#15171F] border border-[#252834] rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#242733]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Thông tin liên lạc & Phương thức kết nối</span>
                  <span className="text-xs text-stone-400 font-normal">
                    (Phương thức liên lạc quán)
                  </span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Các thông tin này được đồng bộ trực tiếp lên hóa đơn in nhiệt, mã QR và giao diện đón tiếp khách.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const summary = `🍵 ${formData.storeName} (${formData.branchName})\n📞 Hotline: ${formData.hotline}\n📱 Zalo/Di động: ${formData.phone}\n📍 Địa chỉ: ${formData.address}\n⏰ Giờ mở cửa: ${formData.businessHours}\n📶 Wi-Fi: ${formData.wifiSsid} (Pass: ${formData.wifiPassword})\n💬 LINE: ${formData.lineId}\n💳 STK: ${formData.bankAccount.bankName} - ${formData.bankAccount.accountNumber} (${formData.bankAccount.accountHolder})`;
                  handleCopy(summary, 'all_info');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1E212B] hover:bg-[#282C3A] text-xs text-amber-400 font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/20 cursor-pointer"
              >
                {copiedKey === 'all_info' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép tất cả</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép toàn bộ liên hệ</span>
                  </>
                )}
              </button>
            </div>

            {/* If Not Editing: Readonly Gorgeous Cards */}
            {!isEditing ? (
              <div className="space-y-4 text-xs">
                {/* Contact Grid 1: Phones & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Hotline */}
                  <div className="p-3.5 rounded-2xl bg-[#191B24] border border-[#272B38] flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-stone-400 text-[11px] font-mono">ĐƯỜNG DÂY NÓNG / HOTLINE</div>
                        <div className="text-base font-bold text-white font-mono mt-0.5">
                          {formData.hotline}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          Số di động/Zalo: <span className="text-stone-200 font-mono">{formData.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(formData.hotline, 'hotline')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-[#242735] transition-colors cursor-pointer"
                      title="Sao chép số"
                    >
                      {copiedKey === 'hotline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Hours */}
                  <div className="p-3.5 rounded-2xl bg-[#191B24] border border-[#272B38] flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-stone-400 text-[11px] font-mono">GIỜ PHỤC VỤ (BUSINESS HOURS)</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {formData.businessHours}
                        </div>
                        <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Đang trong khung giờ phục vụ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Full Width */}
                <div className="p-3.5 rounded-2xl bg-[#191B24] border border-[#272B38] flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-stone-400 text-[11px] font-mono">ĐỊA CHỈ QUÁN (STORE ADDRESS)</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {formData.address}
                      </div>
                      <div className="text-stone-400 text-[11px] mt-0.5">
                        Chi nhánh: <span className="text-stone-200">{formData.branchName}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.address, 'address')}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-[#242735] transition-colors cursor-pointer"
                    title="Sao chép địa chỉ"
                  >
                    {copiedKey === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Social & Messaging Channels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* LINE Official / Zalo */}
                  <div className="p-3 rounded-2xl bg-[#191B24] border border-[#272B38] space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>LINE / ZALO OA</span>
                    </div>
                    <div className="font-bold text-white text-xs font-mono">
                      {formData.lineId}
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      Zalo: {formData.zaloPhone}
                    </div>
                  </div>

                  {/* Facebook & Instagram */}
                  <div className="p-3 rounded-2xl bg-[#191B24] border border-[#272B38] space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>MẠNG XÃ HỘI</span>
                    </div>
                    <div className="font-bold text-white text-xs truncate">
                      IG: {formData.instagramHandle}
                    </div>
                    <div className="text-stone-400 text-[11px] truncate">
                      FB: {formData.facebookUrl.replace('https://', '')}
                    </div>
                  </div>

                  {/* Email Support */}
                  <div className="p-3 rounded-2xl bg-[#191B24] border border-[#272B38] space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>EMAIL LIÊN HỆ</span>
                    </div>
                    <div className="font-bold text-white text-xs font-mono truncate">
                      {formData.email}
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      CSKH & Nhượng quyền
                    </div>
                  </div>
                </div>

                {/* Wi-Fi & Bank Account Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Wi-Fi Details */}
                  <div className="p-3.5 rounded-2xl bg-[#191B24] border border-[#272B38] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Wifi className="w-4 h-4" />
                        <span>Wi-Fi Cửa hàng</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Quét mã QR kết nối
                      </span>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Tên mạng (SSID):</span>
                        <span className="text-white font-bold">{formData.wifiSsid}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Mật khẩu:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-300 font-bold bg-[#111318] px-2 py-0.5 rounded border border-[#2B2F3D]">
                            {formData.wifiPassword}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(formData.wifiPassword, 'wifi_pass')}
                            className="p-1 rounded text-stone-400 hover:text-amber-400 cursor-pointer"
                          >
                            {copiedKey === 'wifi_pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className="p-3.5 rounded-2xl bg-[#191B24] border border-[#272B38] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CreditCard className="w-4 h-4" />
                        <span>Tài khoản nhận tiền quán</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Chuyển khoản QR
                      </span>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Ngân hàng:</span>
                        <span className="text-white font-bold truncate max-w-[180px]">{formData.bankAccount.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-300 font-bold bg-[#111318] px-2 py-0.5 rounded border border-[#2B2F3D]">
                            {formData.bankAccount.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(formData.bankAccount.accountNumber, 'bank_acc')}
                            className="p-1 rounded text-stone-400 hover:text-amber-400 cursor-pointer"
                          >
                            {copiedKey === 'bank_acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Chủ tài khoản:</span>
                        <span className="text-stone-200">{formData.bankAccount.accountHolder}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Editable Form */
              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Tên thương hiệu (Store Name)
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Tên chi nhánh / Cửa hàng (Branch)
                    </label>
                    <input
                      type="text"
                      value={formData.branchName}
                      onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Đường dây nóng (Hotline)
                    </label>
                    <input
                      type="text"
                      value={formData.hotline}
                      onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Số điện thoại Zalo / Di động
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-stone-400 font-bold block mb-1">
                      Địa chỉ quán (Store Address)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Giờ phục vụ / Mở cửa
                    </label>
                    <input
                      type="text"
                      value={formData.businessHours}
                      onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Tên Wi-Fi (SSID)
                    </label>
                    <input
                      type="text"
                      value={formData.wifiSsid}
                      onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Mật khẩu Wi-Fi
                    </label>
                    <input
                      type="text"
                      value={formData.wifiPassword}
                      onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      LINE ID / Zalo ID
                    </label>
                    <input
                      type="text"
                      value={formData.lineId}
                      onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Đường dẫn Menu Online (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.onlineMenuUrl}
                      onChange={(e) => setFormData({ ...formData, onlineMenuUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Ngân hàng nhận tiền
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccount.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: { ...formData.bankAccount, bankName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-bold block mb-1">
                      Số tài khoản ngân hàng
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccount.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: { ...formData.bankAccount, accountNumber: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-stone-400 font-bold block mb-1">
                      Tên chủ tài khoản ngân hàng
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccount.accountHolder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: { ...formData.bankAccount, accountHolder: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1C1E26] border border-[#2D313F] rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252834]">
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="px-4 py-2 rounded-xl bg-[#222530] text-stone-300 hover:text-white text-xs font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu thông tin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Standee Modal for Printing */}
      {isStandeeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsStandeeModalOpen(false)}
        >
          <div
            className="bg-[#181A22] border border-[#2D3140] rounded-3xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252834]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Biển QR để bàn cửa hàng (Table QR Standee)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStandeeModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Standee Sheet Preview */}
            <div
              id="printable-standee"
              className="bg-white text-stone-900 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-3 border-4 border-amber-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center font-display font-bold text-xl">
                茶
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-wider font-display text-stone-900">
                  {formData.storeName}
                </h2>
                <p className="text-xs text-stone-500 font-mono">
                  {formData.branchName}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-300">
                <img
                  src={qrDataUrl}
                  alt="Standee QR"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="text-xs font-bold text-amber-700 font-mono tracking-wide uppercase">
                {qrOptions.find((o) => o.id === activeQrType)?.title}
              </div>

              <div className="text-[11px] text-stone-600 space-y-0.5 border-t border-stone-200 pt-2 w-full">
                <div>📞 Hotline: {formData.hotline} · 📍 {formData.address}</div>
                <div>📶 Wi-Fi: <span className="font-bold">{formData.wifiSsid}</span> (Mật khẩu: <span className="font-bold">{formData.wifiPassword}</span>)</div>
                <div>💬 LINE/Zalo: {formData.lineId} · Giờ mở cửa: {formData.businessHours}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsStandeeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#222530] text-stone-300 text-xs font-semibold hover:bg-[#2C3140]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playSuccessChime();
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In biển để bàn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
