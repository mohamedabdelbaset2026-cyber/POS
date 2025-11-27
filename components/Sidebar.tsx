
import React from 'react';
import { ShoppingCart, Users, Fish, ChefHat, BarChart3, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: ViewState.POS, label: 'نقطة البيع', icon: ShoppingCart },
    { id: ViewState.INVENTORY, label: 'المخزون', icon: Fish },
    { id: ViewState.CUSTOMERS, label: 'العملاء', icon: Users },
    { id: ViewState.REPORTS, label: 'التقارير', icon: BarChart3 },
    { id: ViewState.AI_CHEF, label: 'الشيف الذكي', icon: ChefHat },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 text-white h-screen flex flex-col justify-between shrink-0 transition-all duration-300">
      <div>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-700">
          <Fish className="w-8 h-8 text-cyan-400" />
          <span className="ms-3 font-bold text-xl hidden md:block text-cyan-50">AquaPoint POS</span>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span className="ms-3 font-medium hidden md:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={() => onNavigate(ViewState.SETTINGS)}
          className={`flex items-center w-full justify-center md:justify-start p-2 rounded-lg transition-colors ${
            currentView === ViewState.SETTINGS 
            ? 'bg-slate-800 text-white' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-6 h-6 shrink-0" />
          <span className="ms-3 hidden md:block">الإعدادات</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
