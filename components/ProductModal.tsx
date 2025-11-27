
import React, { useState } from 'react';
import { X, Save, Fish, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  categories: string[];
  units: string[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ categories, units, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[1] || 'أسماك'); // Default to second category (skip "All")
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState(units[0] || 'gram');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  const handleSave = () => {
    if (!name || !price || !unit) return;

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      price: parseFloat(price),
      unit,
      image: image || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
      stock: parseFloat(stock) || 0,
      isFresh: true, // Default
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-cyan-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center">
            <Fish className="w-5 h-5 me-2" />
            إضافة منتج جديد
          </h3>
          <button onClick={onClose} className="hover:bg-cyan-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المنتج *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
              placeholder="مثال: سمك بوري"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">السعر *</label>
               <input 
                 type="number" 
                 value={price}
                 onChange={(e) => setPrice(e.target.value)}
                 className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                 placeholder="0.00"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">المخزون</label>
               <input 
                 type="number" 
                 value={stock}
                 onChange={(e) => setStock(e.target.value)}
                 className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                 placeholder="0"
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {categories.filter(c => c !== 'الكل').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوحدة</label>
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u === 'gram' ? 'جرام (للوزن)' : u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">رابط الصورة (اختياري)</label>
             <div className="relative">
                <ImageIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full ps-9 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500 ltr-text"
                  placeholder="https://..."
                  style={{ direction: 'ltr' }}
                />
             </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!name || !price || !unit}
            className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
          >
            <Save className="w-5 h-5 me-2" />
            حفظ المنتج
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
