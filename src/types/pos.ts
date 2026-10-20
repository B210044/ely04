export type PosTab = 'cashier' | 'inventory' | 'analytics' | 'bom' | 'store_info' | 'members';

export type DrinkCategory = 'all' | 'milk_tea' | 'cloud_foam' | 'fruit_spark' | 'pure_brew';

export type CupSize = 'M' | 'L';

export interface PosDrink {
  id: string;
  number: string;
  name: string; // English
  chineseName: string; // Traditional Chinese
  category: DrinkCategory;
  categoryLabel: string;
  basePriceTwd: number; // TWD
  description: string;
  notes: string;
  image: string;
  accentColor: string;
  defaultIce: string;
  defaultSweetness: string;
  defaultToppings: string[];
}

export interface ToppingOption {
  id: string;
  name: string;
  priceTwd: number; // +10 or +15 TWD
  calories: number;
}

export interface CartItem {
  id: string;
  drinkId: string;
  name: string;
  chineseName: string;
  number: string;
  size: CupSize;
  ice: string;
  sweetness: string;
  toppings: ToppingOption[];
  note?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export type OrderType = 'takeout' | 'dinein' | 'delivery';

export type PaymentMethod = 'cash' | 'linepay' | 'jko' | 'credit' | 'applepay';

export interface SalesOrder {
  orderId: string;
  orderNumber: string;
  timestamp: number;
  orderType: OrderType;
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  discount: number; // Eco cup etc.
  totalTwd: number;
  paymentMethod: PaymentMethod;
  tenderedTwd?: number;
  changeTwd?: number;
  invoiceType: 'paper' | 'carrier' | 'taxId';
  carrierCode?: string;
  taxIdNumber?: string;
  invoiceNumber: string;
  randomCode: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  pointsDiscount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'tea' | 'dairy' | 'topping' | 'packaging' | 'sweetener';
  categoryLabel: string;
  currentStock: number;
  minThreshold: number; // Ngưỡng tối thiểu cảnh báo
  fixedParStock: number; // Số lượng cố định (固定基準存量 / Par Level)
  lastRestockQty: number; // Số lượng nhập hàng gần nhất (最近一次進貨量)
  totalRestockedQty: number; // Tổng số lượng đã nhập hàng (累計進貨總量)
  unit: string;
  costPerUnitTwd: number;
  supplier: string;
  lastRestocked: string;
}

export interface RestockRecord {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  restockQty: number; // Số lượng nhập hàng
  fixedParStock: number; // Số lượng cố định tại thời điểm nhập
  unit: string;
  costPerUnitTwd: number;
  totalCostTwd: number;
  supplier: string;
  timestamp: number;
  dateStr: string;
  batchNumber: string;
  operator: string;
  note?: string;
}

export interface StoreContactInfo {
  storeName: string;
  storeNameEn: string;
  branchName: string;
  hotline: string;
  phone: string;
  address: string;
  email: string;
  businessHours: string;
  zaloPhone: string;
  lineId: string;
  facebookUrl: string;
  instagramHandle: string;
  wifiSsid: string;
  wifiPassword: string;
  onlineMenuUrl: string;
  paymentQrNote: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface BomIngredient {
  name: string;
  amount: string;
  costTwd: number;
}

export interface DrinkBom {
  drinkId: string;
  drinkName: string;
  drinkNumber: string;
  category: string;
  sopSteps: string[];
  ingredients: BomIngredient[];
  packagingCostTwd: number;
  totalCostTwd: number;
  retailPriceTwd: number;
  marginPct: number;
}
