
import React, { useState } from 'react';
import { X, Save, Utensils, Search, Plus, Trash2 } from 'lucide-react';
import { Product, UnitType, SubItem } from '../types';

interface MealBuilderModalProps {
  products: Product[]; // List of existing products to choose from
  categories: string[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

const MealBuilderModal: React.FC<MealBuilderModalProps> = ({ products, categories, onClose, onSave }) => {
  const [mealName, setMealName] = useState('');
  const [mealCategory, setMealCategory] = useState('وجبات');
  const [mealPrice, setMealPrice] = useState('');
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  
  // Search state for adding items
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !p.subItems // Prevent adding a meal inside a meal to avoid infinite recursion complexity
  );

  const addSubItem = (product: Product) => {
    // Default quantity: 1 for Piece/Plate, 250g for Grams
    const defaultQty = product.unit === UnitType.GRAM ? 250 : 1;
    
    const newItem: SubItem = {
      productId: product.id,
      name: product.name,
      quantity: defaultQty,
      unit: product.unit
    };
    setSubItems([...subItems, newItem]);
  };

  const removeSubItem = (index: number) => {
    const newItems = [...subItems];
    newItems.splice(index, 1);
    setSubItems(newItems);
  };

  const updateSubItemQuantity = (index: number, qty: number) => {
    const newItems = [...subItems];
    newItems[index].quantity = qty;
    setSubItems(newItems);
  };

  const handleSave = () => {
    if (!mealName || !mealPrice || subItems.length === 0) return;

    const newMeal: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: mealName,
      category: mealCategory,
      price: parseFloat(mealPrice),
      unit: UnitType.PLATE, // Meals usually sold as a plate/set
      image: 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 100), // Random placeholder
      stock: 100, // Infinite/High stock for virtual meals
      isFresh: true,
      subItems: subItems
    };

    onSave(newMeal);
    onClose();
  };

  const formatUnit = (unit: string) => {
    return unit === UnitType.GRAM ? 'جرام' : unit === UnitType.PIECE ? 'قطعة' : 'طبق';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-cyan-700 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="text-xl font-bold flex items-center">
            <Utensils className="w-6 h-6 me-2" />
            بناء وجبة / صينية جديدة
          </h3>
          <button onClick={onClose} className="hover:bg-cyan-800 p-1 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          
          {/* Right Side: Product Picker */}
          <div className="w-full md:w-1/2 bg-slate-50 border-e border-slate-200 flex flex-col p-4">
             <h4 className="font-bold text-slate-700 mb-2">أضف أصناف للوجبة</h4>
             <div className="relative mb-4">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="بحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full ps-9 p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-cyan-500"
                />
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2 pe-1">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <img src={product.image} className="w-10 h-10 rounded object-cover me-3" alt="" />
                      <div>
                        <div className="text-sm font-bold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.price} ج.م / {formatUnit(product.unit)}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => addSubItem(product)}
                      className="bg-cyan-50 text-cyan-700 p-2 rounded-lg hover:bg-cyan-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          {/* Left Side: Meal Details */}
          <div className="w-full md:w-1/2 flex flex-col p-6 bg-white overflow-y-auto">
             <div className="mb-6 space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">اسم الوجبة</label>
                   <input 
                      type="text" 
                      value={mealName} 
                      onChange={(e) => setMealName(e.target.value)} 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                      placeholder="مثال: صينية سي فود عائلية"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">السعر الإجمالي</label>
                     <input 
                        type="number" 
                        value={mealPrice} 
                        onChange={(e) => setMealPrice(e.target.value)} 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                        placeholder="0.00"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">التصنيف</label>
                     <select 
                        value={mealCategory} 
                        onChange={(e) => setMealCategory(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                     >
                       {categories.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                     </select>
                   </div>
                </div>
             </div>

             <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">مكونات الوجبة</h4>
                {subItems.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    لم تتم إضافة أصناف بعد
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                        <div className="flex-1 font-medium text-slate-700 text-sm">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <input 
                             type="number"
                             value={item.quantity}
                             onChange={(e) => updateSubItemQuantity(idx, parseFloat(e.target.value) || 0)}
                             className="w-20 p-1 text-center border border-slate-300 rounded focus:border-cyan-500 text-sm"
                          />
                          <span className="text-xs text-slate-500 w-10">{formatUnit(item.unit)}</span>
                        </div>
                        <button onClick={() => removeSubItem(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
           <button 
             onClick={handleSave}
             disabled={!mealName || !mealPrice || subItems.length === 0}
             className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center transition-all"
           >
             <Save className="w-5 h-5 me-2" />
             حفظ الوجبة
           </button>
        </div>
      </div>
    </div>
  );
};

export default MealBuilderModal;
