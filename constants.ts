
import { Product, Customer } from './types';

// الوحدات الافتراضية للنظام
export const INITIAL_UNITS = ['gram', 'قطعة', 'طبق', 'كجم', 'لتر', 'علبة'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'سلمون أطلسي',
    category: 'أسماك',
    price: 340.50,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=400&q=80',
    stock: 50, 
    isFresh: true,
  },
  {
    id: '2',
    name: 'سمك دنيس',
    category: 'أسماك',
    price: 180.00,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1534759846116-5799c33ce362?auto=format&fit=crop&w=400&q=80',
    stock: 35,
    isFresh: true,
  },
  {
    id: '3',
    name: 'جمبري جامبو',
    category: 'قشريات',
    price: 450.00,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80',
    stock: 20,
    isFresh: false,
  },
  {
    id: '4',
    name: 'حلقات كاليماري',
    category: 'قشريات',
    price: 150.00,
    unit: 'طبق',
    image: 'https://images.unsplash.com/photo-1579887754326-0e12b6973e27?auto=format&fit=crop&w=400&q=80',
    stock: 100,
    isFresh: false,
  },
  {
    id: '5',
    name: 'استاكوزا',
    category: 'قشريات',
    price: 850.00,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1551248057-79f27174864d?auto=format&fit=crop&w=400&q=80',
    stock: 10,
    isFresh: true,
  },
  {
    id: '6',
    name: 'فيليه بلطي',
    category: 'أسماك',
    price: 120.00,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    stock: 40,
    isFresh: true,
  },
  {
    id: '7',
    name: 'كابوريا',
    category: 'قشريات',
    price: 280.00,
    unit: 'gram',
    image: 'https://images.unsplash.com/photo-1565680018834-b80642128e49?auto=format&fit=crop&w=400&q=80',
    stock: 15,
    isFresh: true,
  },
  {
    id: '8',
    name: 'بهارات سمك',
    category: 'مستلزمات',
    price: 25.00,
    unit: 'قطعة',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    stock: 200,
    isFresh: true,
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'أحمد علي', phone: '0501234567', address: 'شارع البحر، المبنى 5', points: 120, visits: 5, lastVisit: '2023-10-01' },
  { id: 'c2', name: 'سارة سمير', phone: '0559876543', address: 'حي الزهور، فيلا 12', points: 45, visits: 2, lastVisit: '2023-10-05' },
];

export const INITIAL_CATEGORIES = ['الكل', 'أسماك', 'قشريات', 'مستلزمات', 'وجبات', 'صواني'];
