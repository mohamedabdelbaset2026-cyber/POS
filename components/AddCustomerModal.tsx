
import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Customer } from '../types';

interface AddCustomerModalProps {
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSave = () => {
    if (!name || !phone) return;
    
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      address,
      points: 0,
      visits: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    
    onSave(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-cyan-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center">
            <UserPlus className="w-5 h-5 me-2" />
            إضافة عميل جديد
          </h3>
          <button onClick={onClose} className="hover:bg-cyan-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
              placeholder="الاسم الثلاثي"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف *</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">العنوان (للتوصيل)</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500 h-24 resize-none"
              placeholder="اسم الشارع، رقم المبنى، علامة مميزة..."
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!name || !phone}
            className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
          >
            <Save className="w-5 h-5 me-2" />
            حفظ واستخدام
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
