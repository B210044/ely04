import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SalesOrder, StoreContactInfo } from '../types/pos';
import { sounds } from '../utils/audio';
import { Printer, Check, X, RotateCcw } from 'lucide-react';

interface ReceiptPrinterModalProps {
  order: SalesOrder;
  storeContact?: StoreContactInfo;
  onClose: () => void;
  onStartNewOrder: () => void;
}

export const ReceiptPrinterModal: React.FC<ReceiptPrinterModalProps> = ({
  order,
  storeContact,
  onClose,
  onStartNewOrder,
}) => {
  const [storeQrUrl, setStoreQrUrl] = useState<string>('');
  const [invoiceQrUrl, setInvoiceQrUrl] = useState<string>('');

  useEffect(() => {
    sounds.playPrinter();

    // Generate dual QR codes for receipt
    const storeLink = storeContact?.onlineMenuUrl || window.location.href;
    QRCode.toDataURL(storeLink, { width: 140, margin: 1 })
      .then((url) => setStoreQrUrl(url))
      .catch((err) => console.error(err));

    const invoiceStr = `${order.invoiceNumber}:${order.randomCode}:${order.totalTwd}`;
    QRCode.toDataURL(invoiceStr, { width: 140, margin: 1 })
      .then((url) => setInvoiceQrUrl(url))
      .catch((err) => console.error(err));
  }, [order, storeContact]);

  const handlePrint = () => {
    sounds.playPrinter();
    window.print();
  };

  const formattedDate = new Date(order.timestamp).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const paymentLabels: Record<string, string> = {
    cash: '現金支付 (Cash)',
    linepay: 'LINE Pay 行動支付',
    jko: '街口支付 (JKOPay)',
    credit: '信用卡感應 (Credit Card)',
    applepay: 'Apple Pay 感應支付',
  };

  const orderTypeLabels: Record<string, string> = {
    takeout: '外帶 (Takeout)',
    dinein: '內用 (Dine-in)',
    delivery: '外送 (Delivery)',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-6 text-stone-900 animate-in fade-in slide-in-from-top-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printer Output Slot Mockup */}
        <div className="bg-[#1F222B] border border-[#333847] rounded-t-2xl p-3 flex items-center justify-between text-stone-400 text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-stone-300">熱感應出單機 · 80mm 列印中</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper feeder mouth */}
        <div className="h-2 bg-[#0D0E12] border-x border-[#2A2E3B] shadow-inner" />

        {/* Thermal Receipt Paper Roll Container */}
        <div className="bg-[#FFFDF7] p-6 sm:p-7 shadow-2xl relative font-mono text-[13px] border-x border-stone-300 select-text leading-tight text-stone-900">
          {/* Perforated Top Tear Line */}
          <div className="border-b-2 border-dashed border-stone-400 pb-3 mb-4 text-center">
            <h2 className="text-xl font-bold tracking-widest font-display text-black">
              {storeContact?.storeName || '茶 研 所'}
            </h2>
            <p className="text-[11px] tracking-wider text-stone-600 mt-0.5">
              {storeContact?.branchName || 'TEA RESEARCH LAB · 敦南概念店'}
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">
              {storeContact?.address || '台北市大安區敦化南路一段 188 號'}
            </p>
            <p className="text-[10px] text-stone-500">
              門市專線: {storeContact?.hotline || storeContact?.phone || '(02) 2778-9812'}
            </p>
            {storeContact?.wifiSsid && (
              <p className="text-[9px] text-stone-400 mt-0.5">
                Wi-Fi: {storeContact.wifiSsid} / 密碼: {storeContact.wifiPassword}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="space-y-1 text-xs border-b border-stone-300 pb-3 mb-3 text-stone-700">
            <div className="flex justify-between font-bold text-black text-sm">
              <span>取餐單號: {order.orderNumber}</span>
              <span>{orderTypeLabels[order.orderType]}</span>
            </div>
            <div className="flex justify-between">
              <span>交易序號: {order.orderId}</span>
              <span>機台: POS-01</span>
            </div>
            <div className="flex justify-between">
              <span>結帳時間: {formattedDate}</span>
              <span>收銀員: 108</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b border-stone-400 pb-3 mb-3">
            <div className="flex justify-between text-xs font-bold border-b border-stone-200 pb-1 mb-2 text-stone-600">
              <span className="w-1/2">品名規格</span>
              <span className="w-1/4 text-center">數量</span>
              <span className="w-1/4 text-right">小計</span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span className="w-1/2 truncate">
                      {item.number} {item.chineseName} ({item.size})
                    </span>
                    <span className="w-1/4 text-center">{item.quantity}</span>
                    <span className="w-1/4 text-right tabular-nums">
                      NT$ {item.subtotal}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 pl-2">
                    · {item.ice} / {item.sweetness}
                  </div>
                  {item.toppings.length > 0 && (
                    <div className="text-[11px] text-stone-600 pl-2">
                      · 加料: {item.toppings.map((t) => `${t.name}(+$${t.priceTwd})`).join(' ')}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[11px] text-stone-500 pl-2 italic">
                      · 註: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Change Breakdown */}
          <div className="space-y-1.5 text-xs border-b border-stone-400 pb-3 mb-3">
            <div className="flex justify-between">
              <span>杯數合計:</span>
              <span className="tabular-nums font-bold">{order.itemsCount} 杯</span>
            </div>
            <div className="flex justify-between">
              <span>品項原價:</span>
              <span className="tabular-nums">NT$ {order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>自備環保杯折抵:</span>
                <span className="tabular-nums">-NT$ {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-black pt-1 border-t border-dashed border-stone-300">
              <span>實付總額:</span>
              <span className="tabular-nums">NT$ {order.totalTwd}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>支付方式:</span>
              <span>{paymentLabels[order.paymentMethod]}</span>
            </div>
            {order.paymentMethod === 'cash' && order.tenderedTwd !== undefined && (
              <>
                <div className="flex justify-between">
                  <span>實收金額:</span>
                  <span className="tabular-nums">NT$ {order.tenderedTwd}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900">
                  <span>應找零錢:</span>
                  <span className="tabular-nums">NT$ {order.changeTwd || 0}</span>
                </div>
              </>
            )}

            {/* Member Loyalty Accumulation Info */}
            {order.memberId && (
              <div className="mt-2 border border-amber-300 bg-amber-50 p-2 rounded text-[11px] space-y-0.5 text-stone-800">
                <div className="font-bold flex justify-between text-amber-900">
                  <span>VIP 會員: {order.memberName || '已綁定茶友'}</span>
                  {order.pointsEarned !== undefined && (
                    <span className="font-mono text-amber-800 font-bold">本次集點 +{order.pointsEarned} 點</span>
                  )}
                </div>
                {order.pointsRedeemed !== undefined && order.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-stone-600 text-[10px]">
                    <span>本單點數折抵:</span>
                    <span className="font-mono text-rose-700">-{order.pointsRedeemed} 點 (-NT$ {order.pointsDiscount})</span>
                  </div>
                )}
                <div className="text-[9px] text-stone-500 font-mono">
                  Google 雲端會員庫存帳戶已即時同步更新
                </div>
              </div>
            )}
          </div>

          {/* Electronic Invoice Mockup */}
          <div className="text-center pt-1 space-y-2">
            <div className="border border-stone-800 p-2 rounded">
              <div className="text-[11px] font-bold">電子發票證明聯</div>
              <div className="text-sm font-bold tracking-widest my-0.5">
                {order.invoiceNumber}
              </div>
              <div className="text-[10px] text-stone-600">
                隨機碼: {order.randomCode} · 總計 NT$ {order.totalTwd}
              </div>
              {order.carrierCode && (
                <div className="text-[11px] font-bold text-stone-800 mt-1">
                  手機載具: {order.carrierCode}
                </div>
              )}
              {order.taxIdNumber && (
                <div className="text-[11px] font-bold text-stone-800 mt-1">
                  買方統編: {order.taxIdNumber}
                </div>
              )}
            </div>

            {/* Dual QR Codes (Store Member/Feedback QR + Invoice QR) */}
            <div className="flex items-center justify-center gap-4 py-2 bg-stone-50 border border-stone-200 rounded p-2">
              <div className="flex flex-col items-center">
                {invoiceQrUrl ? (
                  <img src={invoiceQrUrl} alt="Invoice QR" className="w-20 h-20 object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-stone-200" />
                )}
                <span className="text-[9px] text-stone-500 font-mono mt-0.5">發票驗證 QR</span>
              </div>

              <div className="flex flex-col items-center">
                {storeQrUrl ? (
                  <img src={storeQrUrl} alt="Store QR" className="w-20 h-20 object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-stone-200" />
                )}
                <span className="text-[9px] text-stone-500 font-mono mt-0.5">門市點餐/LINE QR</span>
              </div>
            </div>

            {/* Mock Barcode */}
            <div className="h-8 bg-repeating-linear-gradient flex items-center justify-center tracking-widest text-[9px] text-stone-500 bg-stone-100 border border-stone-300">
              ||| | |||| || | |||| || ||| |||| | ||
            </div>

            <p className="text-[10px] text-stone-500 pt-2">
              現淬好茶 · 堅持茶道初心 · 謝謝光臨
            </p>
          </div>

          {/* Bottom Zigzag Cut Simulation */}
          <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#181A20] [clip-path:polygon(0%_0%,5%_100%,10%_0%,15%_100%,20%_0%,25%_100%,30%_0%,35%_100%,40%_0%,45%_100%,50%_0%,55%_100%,60%_0%,65%_100%,70%_0%,75%_100%,80%_0%,85%_100%,90%_0%,95%_100%,100%_0%)]" />
        </div>

        {/* Modal Actions */}
        <div className="bg-[#16181F] border border-[#2B2F3D] rounded-b-2xl p-4 flex items-center justify-between gap-3 shadow-xl">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-[#232733] hover:bg-[#2C3242] text-stone-200 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#333849]"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>列印收據 (Print)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onStartNewOrder();
            }}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>下一筆訂單 (New Order)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
