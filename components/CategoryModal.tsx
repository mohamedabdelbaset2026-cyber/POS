
import React, { useState } from 'react';
import { X, Plus, Tags } from 'lucide-react';

interface CategoryModalProps {
  onClose: () => void;
  onSave: (category: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSave }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSave(categoryName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center">
            <Tags className="w-5 h-5 me-2" />
            إضافة تصنيف جديد
          </h3>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">اسم التصنيف</label>
          <input 
            type="text" 
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 mb-6"
            placeholder="مثال: مشروبات، مقبلات..."
            autoFocus
          />

          <button 
            type="submit"
            disabled={!categoryName.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
          >
            <Plus className="w-5 h-5 me-2" />
            إضافة التصنيف
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
