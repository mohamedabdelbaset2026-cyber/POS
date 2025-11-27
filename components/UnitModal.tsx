
import React, { useState } from 'react';
import { X, Plus, Trash2, Ruler } from 'lucide-react';

interface UnitModalProps {
  units: string[];
  onClose: () => void;
  onAddUnit: (unit: string) => void;
  onRemoveUnit: (unit: string) => void;
}

const UnitModal: React.FC<UnitModalProps> = ({ units, onClose, onAddUnit, onRemoveUnit }) => {
  const [newUnit, setNewUnit] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUnit.trim()) {
      onAddUnit(newUnit.trim());
      setNewUnit('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-cyan-800 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center">
            <Ruler className="w-5 h-5 me-2" />
            إدارة الوحدات
          </h3>
          <button onClick={onClose} className="hover:bg-cyan-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200">
           <form onSubmit={handleAdd} className="flex gap-2">
             <input 
               type="text" 
               value={newUnit}
               onChange={(e) => setNewUnit(e.target.value)}
               className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
               placeholder="اسم الوحدة (مثال: علبة)"
             />
             <button 
               type="submit"
               disabled={!newUnit.trim()}
               className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg font-bold"
             >
               <Plus className="w-5 h-5" />
             </button>
           </form>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">الوحدات الحالية</h4>
           <div className="space-y-2">
             {units.map((unit) => (
               <div key={unit} className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded-lg">
                 <span className="font-medium text-slate-700">{unit}</span>
                 {unit !== 'gram' && (
                    <button 
                      onClick={() => onRemoveUnit(unit)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UnitModal;
