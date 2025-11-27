
import React, { useState, useEffect, useRef } from 'react';
import { X, Scale, Check } from 'lucide-react';
import { Product } from '../types';

interface WeighingModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

const WeighingModal: React.FC<WeighingModalProps> = ({ product, onClose, onConfirm }) => {
  const [weight, setWeight] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
        // تعيين قيمة افتراضية 1 للمنتجات بالقطعة، وفارغة للوزن
        if (product.unit !== 'gram') {
            setWeight('1');
        } else {
            setWeight(''); 
        }
        // التركيز التلقائي على حقل الإدخال
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }
  }, [product]);

  if (!product) return null;

  const numericWeight = parseFloat(weight) || 0;
  
  // Logic: If unit is GRAM, price is per KG (1000g).
  // Formula: (grams / 1000) * price_per_kg
  const total = product.unit === 'gram' 
    ? (numericWeight / 1000) * product.price 
    : numericWeight * product.price;

  const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (numericWeight > 0) {
          onConfirm(numericWeight);
      }
  };

  const unitLabel = product.unit === 'gram' ? 'جرام' : product.unit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-cyan-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center">
            <Scale className="w-5 h-5 me-2" />
            {product.unit === 'gram' ? 'إدخال الوزن (جرام)' : 'تحديد العدد'}
          </h3>
          <button onClick={onClose} className="hover:bg-cyan-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover border" />
              <div className="ms-4">
                <h4 className="font-bold text-slate-800">{product.name}</h4>
                <p className="text-sm text-slate-500">
                    {product.price.toFixed(2)} ج.م / {product.unit === 'gram' ? 'كجم' : product.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl text-center mb-6 border-2 border-cyan-100 focus-within:border-cyan-500 transition-colors">
             <label className="block text-slate-500 text-sm font-medium mb-2 uppercase tracking-wide">
                {product.unit === 'gram' ? 'الوزن (جرام)' : 'الكمية'}
             </label>
             <input 
                ref={inputRef}
                type="number" 
                step={product.unit === 'gram' ? "1" : "1"}
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="text-5xl font-mono font-bold text-slate-800 bg-transparent text-center w-full focus:outline-none placeholder:text-slate-300"
                placeholder={product.unit === 'gram' ? "0" : "1"}
                style={{ direction: 'ltr' }} 
             />
             {product.unit === 'gram' && numericWeight > 0 && (
                 <div className="text-xs text-slate-400 mt-2 font-mono">
                     = {(numericWeight / 1000).toFixed(3)} كجم
                 </div>
             )}
          </div>

          <div className="flex justify-between items-end border-t pt-4">
            <div className="text-slate-500">إجمالي السعر</div>
            <div className="text-3xl font-bold text-cyan-600" dir="ltr">{total.toFixed(2)} ج.م</div>
          </div>

          <button 
            type="submit"
            disabled={numericWeight <= 0}
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <Check className="w-6 h-6 me-2" />
            تأكيد وإضافة
          </button>
        </form>
      </div>
    </div>
  );
};

export default WeighingModal;
