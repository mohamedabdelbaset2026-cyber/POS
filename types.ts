
export interface SubItem {
  productId: string;
  name: string;
  quantity: number; 
  unit: string;
}

export enum UnitType {
  GRAM = 'gram',
  PIECE = 'قطعة',
  PLATE = 'طبق',
  KG = 'كجم',
  LITER = 'لتر',
  BOX = 'علبة'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string; // Changed to string to support dynamic units
  image: string;
  stock: number;
  isFresh: boolean;
  subItems?: SubItem[];
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  points: number;
  visits: number;
  lastVisit: string;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'split';
  customerId?: string;
  orderType: OrderType;
}

export enum OrderType {
  TAKEAWAY = 'TAKEAWAY',
  DINE_IN = 'DINE_IN',
  DELIVERY = 'DELIVERY'
}

export interface Order {
  id: string;
  label: string;
  items: CartItem[];
  customer: Customer | null;
  type: OrderType;
  tableNum?: string;
  createdAt: number;
}

export enum ViewState {
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS',
  AI_CHEF = 'AI_CHEF',
  SETTINGS = 'SETTINGS'
}
