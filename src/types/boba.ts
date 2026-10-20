export interface FlavorProfile {
  teaAroma: number; // 0 - 100
  creaminess: number; // 0 - 100
  sweetness: number; // 0 - 100
  chewiness: number; // 0 - 100
}

export type BaseTeaId = 'ceylon' | 'tieguanyin' | 'matcha' | 'jasmine' | 'hojicha' | 'osmanthus';

export interface BaseTea {
  id: BaseTeaId;
  name: string;
  origin: string;
  notes: string;
  caffeineMg: number;
  color: string;
  gradient: string;
}

export type MilkTypeId = 'fresh_milk' | 'oat_barista' | 'coconut_silk' | 'almond' | 'no_milk';

export interface MilkType {
  id: MilkTypeId;
  name: string;
  calories: number;
  description: string;
  color: string;
}

export type ToppingId =
  | 'brown_sugar_boba'
  | 'honey_golden_pearls'
  | 'popping_lychee'
  | 'cheese_foam'
  | 'egg_pudding'
  | 'grass_jelly'
  | 'aloe_vera'
  | 'taro_mash';

export interface Topping {
  id: ToppingId;
  name: string;
  price: number;
  calories: number;
  color: string;
  chewScore: number;
  description: string;
}

export type SweetnessLevel = 0 | 30 | 50 | 80 | 100 | 120;
export type IceLevel = 'none' | 'light' | 'regular' | 'warm';
export type CupSize = 'standard' | 'grande';
export type StrawColor = 'amber' | 'matcha' | 'charcoal' | 'rose';

export interface SignatureDrink {
  id: string;
  number: string; // e.g. "01"
  name: string;
  chineseName: string;
  tagline: string;
  category: 'milk_tea' | 'pure_brew' | 'fruit_spark' | 'cloud_foam';
  description: string;
  price: number;
  baseTea: BaseTeaId;
  milk: MilkTypeId;
  defaultSweetness: SweetnessLevel;
  defaultIce: IceLevel;
  defaultToppings: ToppingId[];
  flavorProfile: FlavorProfile;
  caffeineMg: number;
  calories: number;
  image?: string;
  accentColor: string;
}

export interface CustomDrinkConfig {
  id: string;
  name: string;
  baseTea: BaseTeaId;
  milk: MilkTypeId;
  sweetness: SweetnessLevel;
  ice: IceLevel;
  toppings: ToppingId[];
  size: CupSize;
  strawColor: StrawColor;
  price: number;
  calories: number;
  caffeineMg: number;
}

export interface CartItem {
  cartItemId: string;
  drinkId?: string; // If based on signature
  name: string;
  size: CupSize;
  baseTea: BaseTeaId;
  milk: MilkTypeId;
  sweetness: SweetnessLevel;
  ice: IceLevel;
  toppings: ToppingId[];
  unitPrice: number;
  quantity: number;
  image?: string;
}

export type OrderStatus = 'received' | 'brewing' | 'shaking' | 'topping' | 'ready';

export interface ActiveOrder {
  orderId: string;
  orderNumber: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  estimatedSecondsLeft: number;
}
