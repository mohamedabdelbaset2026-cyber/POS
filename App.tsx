
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, CreditCard, UserPlus, FileText, ChevronLeft, MessageSquare, Settings, Printer, Store, Save, FilePlus, XCircle, ShoppingBag, Utensils, Bike, MapPin, Tags, Ruler, Key } from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import Sidebar from './components/Sidebar';
import WeighingModal from './components/WeighingModal';
import AddCustomerModal from './components/AddCustomerModal';
import CategoryModal from './components/CategoryModal';
import MealBuilderModal from './components/MealBuilderModal';
import UnitModal from './components/UnitModal';
import ProductModal from './components/ProductModal';
import { getRecipeSuggestion } from './services/geminiService';
import { Product, CartItem, Customer, Sale, ViewState, Order, OrderType } from './types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_CATEGORIES, INITIAL_UNITS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.POS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [units, setUnits] = useState<string[]>(INITIAL_UNITS);
  
  // Settings State
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    alert('تم حفظ مفتاح API بنجاح');
  };

  // Multi-Order State Management
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', label: 'طلب 1', items: [], customer: null, type: OrderType.TAKEAWAY, createdAt: Date.now() }
  ]);
  const [activeOrderId, setActiveOrderId] = useState<string>('1');

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // Inventory Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // AI Chef State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Derived State ---
  
  // Get the currently active order object
  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === activeOrderId) || orders[0];
  }, [orders, activeOrderId]);

  // Ensure we fallback if activeOrderId is somehow invalid (though logic prevents this)
  const cart = activeOrder ? activeOrder.items : [];
  const selectedCustomer = activeOrder ? activeOrder.customer : null;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  // --- Order Management Handlers ---

  const createNewOrder = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newOrder: Order = {
      id: newId,
      label: `طلب ${orders.length + 1}`,
      items: [],
      customer: null,
      type: OrderType.TAKEAWAY, // Default to takeaway
      createdAt: Date.now()
    };
    setOrders([...orders, newOrder]);
    setActiveOrderId(newId);
    setCustomerSearchTerm('');
  };

  const closeOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent switching to the tab we are closing
    
    // Check if it's the only order
    if (orders.length === 1) {
      // Instead of closing, just clear it
      setOrders(orders.map(o => o.id === orderId ? { ...o, items: [], customer: null, type: OrderType.TAKEAWAY, tableNum: undefined } : o));
      return;
    }

    const newOrders = orders.filter(o => o.id !== orderId);
    setOrders(newOrders);
    
    // If we closed the active order, switch to the last one
    if (activeOrderId === orderId) {
      setActiveOrderId(newOrders[newOrders.length - 1].id);
    }
  };

  const updateActiveOrder = (updates: Partial<Order>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === activeOrderId ? { ...order, ...updates } : order
      )
    );
  };

  // --- Cart Handlers ---

  const handleProductClick = (product: Product) => {
    setWeighingProduct(product);
  };

  const addToCart = (quantity: number) => {
    if (!weighingProduct || quantity <= 0) return;

    // Calculate subtotal
    // If unit is GRAM, quantity is in grams, but price is per KG. So divide by 1000.
    const subtotal = weighingProduct.unit === 'gram'
      ? (quantity / 1000) * weighingProduct.price
      : quantity * weighingProduct.price;

    const newItem: CartItem = {
      ...weighingProduct,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity,
      subtotal: subtotal,
    };

    updateActiveOrder({ items: [...cart, newItem] });
    setWeighingProduct(null);
  };

  const removeFromCart = (cartId: string) => {
    updateActiveOrder({ items: cart.filter(item => item.cartId !== cartId) });
  };

  const assignCustomer = (customer: Customer | null) => {
    updateActiveOrder({ customer });
    setCustomerSearchTerm('');
  };

  const handleAddNewCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
    assignCustomer(newCustomer);
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const handleAddUnit = (newUnit: string) => {
    if (!units.includes(newUnit)) {
      setUnits([...units, newUnit]);
    }
  };

  const handleRemoveUnit = (unitToRemove: string) => {
    if (unitToRemove !== 'gram') { // Prevent removing gram
        setUnits(units.filter(u => u !== unitToRemove));
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleOrderTypeChange = (type: OrderType) => {
    if (type === OrderType.DINE_IN) {
        updateActiveOrder({ type, customer: null, tableNum: '1' }); // Default table 1
    } else {
        // For Takeaway and Delivery, keep the customer if selected, just change type
        updateActiveOrder({ type, tableNum: undefined });
    }
  };

  const handleCheckout = (method: 'cash' | 'card') => {
    
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      items: cart,
      total: cartTotal,
      paymentMethod: method,
      customerId: selectedCustomer?.id, // If null, it's a cash/anonymous customer
      orderType: activeOrder.type
    };

    setSalesHistory([sale, ...salesHistory]);
    setShowPayment(false);
    
    // Close current order (remove it from list)
    if (orders.length > 1) {
        const newOrders = orders.filter(o => o.id !== activeOrderId);
        setOrders(newOrders);
        setActiveOrderId(newOrders[newOrders.length - 1].id);
    } else {
        // If it was the last one, reset it
        setOrders([{ ...activeOrder, items: [], customer: null, id: Math.random().toString(36).substr(2, 9), type: OrderType.TAKEAWAY, tableNum: undefined }]);
    }
    
    alert(`تم إكمال الطلب! طريقة الدفع: ${method === 'cash' ? 'نقداً' : 'بطاقة'}`);
  };

  const handleAiAsk = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const response = await getRecipeSuggestion(aiPrompt);
      setAiResponse(response);
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatUnit = (unit: string) => {
    return unit === 'gram' ? 'جرام' : unit;
  };

  // --- Render Functions ---

  const renderPOS = () => (
    <div className="flex flex-col md:flex-row h-full">
      {/* Product Grid Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="بحث عن أسماك طازجة..." 
              className="w-full ps-10 pe-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-100 overflow-hidden group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 end-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 shadow-sm">
                    {product.price} ج.م/{product.unit === 'gram' ? 'كجم' : formatUnit(product.unit)}
                  </div>
                  {product.isFresh && (
                    <div className="absolute top-2 start-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      طازج
                    </div>
                  )}
                  {product.subItems && (
                     <div className="absolute bottom-2 start-2 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        وجبة
                     </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-lg truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-500 text-sm">{product.category}</span>
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-96 bg-white border-s border-slate-200 h-[40vh] md:h-full flex flex-col shadow-2xl z-20">
        
        {/* Order Tabs */}
        <div className="flex items-center overflow-x-auto bg-slate-100 p-2 gap-2 scrollbar-hide border-b border-slate-200">
           {orders.map(order => (
             <div 
               key={order.id}
               onClick={() => setActiveOrderId(order.id)}
               className={`flex items-center ps-3 pe-2 py-2 rounded-t-lg cursor-pointer min-w-[6rem] transition-colors relative group ${
                 activeOrderId === order.id 
                 ? 'bg-white text-cyan-700 shadow-sm border-t-2 border-cyan-500 font-bold' 
                 : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
               }`}
             >
               <span className="text-xs truncate">{order.label}</span>
               <button 
                onClick={(e) => closeOrder(e, order.id)}
                className={`ms-2 p-0.5 rounded-full hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ${orders.length === 1 ? 'hidden' : ''}`}
               >
                 <XCircle className="w-3 h-3" />
               </button>
             </div>
           ))}
           <button 
             onClick={createNewOrder}
             className="p-2 bg-slate-200 hover:bg-cyan-100 hover:text-cyan-700 rounded-lg transition-colors"
             title="فاتورة جديدة"
           >
             <FilePlus className="w-4 h-4" />
           </button>
        </div>

        {/* Order Info & Type Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-200 p-1 rounded-lg mb-4">
            <button 
               onClick={() => handleOrderTypeChange(OrderType.TAKEAWAY)}
               className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-bold transition-all ${activeOrder.type === OrderType.TAKEAWAY ? 'bg-white text-cyan-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ShoppingBag className="w-4 h-4 me-1" />
              شباك
            </button>
            <button 
               onClick={() => handleOrderTypeChange(OrderType.DINE_IN)}
               className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-bold transition-all ${activeOrder.type === OrderType.DINE_IN ? 'bg-white text-cyan-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Utensils className="w-4 h-4 me-1" />
              صالة
            </button>
            <button 
               onClick={() => handleOrderTypeChange(OrderType.DELIVERY)}
               className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-bold transition-all ${activeOrder.type === OrderType.DELIVERY ? 'bg-white text-cyan-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Bike className="w-4 h-4 me-1" />
              دليفري
            </button>
          </div>

          {/* Conditional Input based on Type */}
          
          {/* CASE: DINE_IN -> Table Select */}
          {activeOrder.type === OrderType.DINE_IN && (
             <div className="mb-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">رقم الطاولة</label>
                <select 
                  value={activeOrder.tableNum || '1'}
                  onChange={(e) => updateActiveOrder({ tableNum: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-cyan-500 font-bold text-slate-700"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i+1} value={String(i+1)}>طاولة {i+1}</option>
                  ))}
                </select>
             </div>
          )}

          {/* CASE: DELIVERY OR TAKEAWAY -> Customer Search / Add */}
          {(activeOrder.type === OrderType.DELIVERY || activeOrder.type === OrderType.TAKEAWAY) && (
             <div className="mb-2 relative">
                {!selectedCustomer ? (
                  <>
                    <div className="relative">
                       <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="text"
                         value={customerSearchTerm}
                         onChange={(e) => setCustomerSearchTerm(e.target.value)}
                         placeholder="بحث عميل (اختياري)..."
                         className="w-full ps-9 pe-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-cyan-500 text-sm"
                       />
                       {customerSearchTerm && (
                         <div className="absolute top-full start-0 end-0 bg-white border border-slate-200 shadow-lg rounded-b-lg max-h-48 overflow-y-auto z-50">
                            {customers.filter(c => 
                              c.name.includes(customerSearchTerm) || 
                              c.phone.includes(customerSearchTerm) || 
                              (c.address && c.address.includes(customerSearchTerm))
                            ).map(c => (
                              <div 
                                key={c.id} 
                                onClick={() => assignCustomer(c)}
                                className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex flex-col"
                              >
                                <span className="font-bold text-sm text-slate-800">{c.name}</span>
                                <span className="text-xs text-slate-500">{c.phone} | {c.address || 'بدون عنوان'}</span>
                              </div>
                            ))}
                            {customers.filter(c => c.name.includes(customerSearchTerm) || c.phone.includes(customerSearchTerm)).length === 0 && (
                               <div className="p-3 text-center text-sm text-slate-500">لا توجد نتائج</div>
                            )}
                         </div>
                       )}
                    </div>
                    <div className="flex gap-2 mt-2">
                         <div className="flex-1 text-xs text-slate-500 flex items-center justify-center bg-slate-100 rounded-lg">
                            <UserPlus className="w-3 h-3 me-1" />
                            عميل نقدي (تلقائي)
                         </div>
                        <button 
                          onClick={() => setShowAddCustomerModal(true)}
                          className="flex-1 py-1.5 text-xs font-bold text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 me-1" /> عميل جديد
                        </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-cyan-50 border border-cyan-100 p-2 rounded-lg flex justify-between items-center">
                    <div className="flex flex-col overflow-hidden">
                       <span className="text-sm font-bold text-cyan-800 truncate">{selectedCustomer.name}</span>
                       <div className="flex items-center text-xs text-cyan-600 truncate">
                          <MapPin className="w-3 h-3 me-1 inline" />
                          {selectedCustomer.address || 'استلام محل'}
                       </div>
                    </div>
                    <button onClick={() => assignCustomer(null)} className="text-cyan-600 hover:text-cyan-800 shrink-0 ms-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
             </div>
          )}

        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p>السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="flex items-start justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                    {/* Meal Sub-Items Display */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.subItems.map((sub, idx) => (
                           <div key={idx} className="text-[10px] text-slate-400 flex items-center">
                             <span className="w-1 h-1 bg-slate-300 rounded-full me-1"></span>
                             {sub.name} ({sub.quantity} {formatUnit(sub.unit)})
                           </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600" dir="ltr">
                        {item.quantity} {formatUnit(item.unit)}
                      </span>
                      {item.unit === 'gram' && (
                          <span className="text-[10px] text-slate-400">
                             ({(item.quantity/1000).toFixed(3)} كجم)
                          </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-slate-800">{item.subtotal.toFixed(2)} ج.م</span>
                  <button 
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-2 text-slate-500 text-sm">
            <span>المجموع الفرعي</span>
            <span>{cartTotal.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-slate-500 text-sm">
            <span>الضريبة (5%)</span>
            <span>{(cartTotal * 0.05).toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-slate-800">الإجمالي</span>
            <span className="text-2xl font-bold text-cyan-600">{(cartTotal * 1.05).toFixed(2)} ج.م</span>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center"
          >
            <span>دفع {(cartTotal * 1.05).toFixed(2)} ج.م</span>
            <ChevronLeft className="w-5 h-5 ms-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">إدارة المخزون</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowUnitModal(true)}
            className="bg-slate-200 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-300 font-medium flex items-center transition-colors"
          >
            <Ruler className="w-5 h-5 me-2" /> الوحدات
          </button>
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="bg-slate-200 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-300 font-medium flex items-center transition-colors"
          >
            <Tags className="w-5 h-5 me-2" /> التصنيفات
          </button>
          <button 
            onClick={() => setShowMealModal(true)}
            className="bg-amber-500 text-white px-5 py-2 rounded-lg hover:bg-amber-600 font-medium flex items-center transition-colors"
          >
            <Utensils className="w-5 h-5 me-2" /> الوجبات والصواني
          </button>
          <button 
             onClick={() => setShowProductModal(true)}
             className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 font-medium flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 me-2" /> إضافة منتج
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-start">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4 text-start">المنتج</th>
              <th className="px-6 py-4 text-start">التصنيف</th>
              <th className="px-6 py-4 text-end">المخزون</th>
              <th className="px-6 py-4 text-end">السعر</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center">
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover me-4" alt="" />
                  <div>
                    <span className="font-semibold text-slate-700 block">{p.name}</span>
                    {p.subItems && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded">وجبة مجمعة</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{p.category}</td>
                <td className="px-6 py-4 text-end font-mono" dir="ltr">{p.stock} {formatUnit(p.unit)}</td>
                <td className="px-6 py-4 text-end font-mono">{p.price.toFixed(2)} ج.م</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock > 10 ? 'متوفر' : 'منخفض'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-cyan-600 hover:underline text-sm font-medium">تعديل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">ولاء العملاء</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{c.name}</h3>
                <p className="text-slate-500 text-sm">{c.phone}</p>
                {c.address && <p className="text-xs text-slate-400 mt-1">{c.address}</p>}
              </div>
              <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold">
                {c.points} نقطة
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-600 pt-4 border-t border-slate-100">
              <span>الزيارات: {c.visits}</span>
              <span>آخر زيارة: {c.lastVisit}</span>
            </div>
            <button 
              onClick={() => {
                assignCustomer(c);
                setCurrentView(ViewState.POS);
              }}
              className="w-full mt-4 bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors"
            >
              بدء طلب
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => {
    // Mock Data for charts
    const salesData = [
      { name: 'السبت', sales: 4000 },
      { name: 'الأحد', sales: 3000 },
      { name: 'الاثنين', sales: 2000 },
      { name: 'الثلاثاء', sales: 2780 },
      { name: 'الأربعاء', sales: 1890 },
      { name: 'الخميس', sales: 6390 },
      { name: 'الجمعة', sales: 3490 },
    ];

    return (
      <div className="p-8 h-full overflow-y-auto bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">تقارير المبيعات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6">الإيرادات الأسبوعية</h3>
            <div className="h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="sales" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6">اتجاه المبيعات</h3>
            <div className="h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={3} dot={{r: 4, fill: '#0f172a'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4">أحدث المعاملات</h3>
           {salesHistory.length === 0 ? (
             <p className="text-slate-400">لا توجد معاملات مسجلة في هذه الجلسة.</p>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-start">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                   <tr>
                     <th className="px-4 py-2 text-start">رقم الطلب</th>
                     <th className="px-4 py-2 text-start">النوع</th>
                     <th className="px-4 py-2 text-start">التوقيت</th>
                     <th className="px-4 py-2 text-start">الإجمالي</th>
                     <th className="px-4 py-2 text-start">الطريقة</th>
                   </tr>
                 </thead>
                 <tbody>
                    {salesHistory.map(sale => (
                      <tr key={sale.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 font-mono">{sale.id}</td>
                        <td className="px-4 py-3 font-bold text-xs text-cyan-600">
                            {sale.orderType === OrderType.DELIVERY ? 'دليفري' : sale.orderType === OrderType.DINE_IN ? 'صالة' : 'شباك'}
                        </td>
                        <td className="px-4 py-3">{new Date(sale.date).toLocaleTimeString('ar-EG')}</td>
                        <td className="px-4 py-3 font-bold">{sale.total.toFixed(2)} ج.م</td>
                        <td className="px-4 py-3 uppercase text-xs font-bold text-slate-600">
                          {sale.paymentMethod === 'cash' ? 'نقداً' : sale.paymentMethod === 'card' ? 'بطاقة' : 'مشترك'}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderAiChef = () => (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-4">
             <MessageSquare className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">مساعد الشيف الذكي</h1>
          <p className="text-slate-500 mt-2">اطلب نصائح للطهي أو وصفات أو اقتراحات لتقديم المأكولات البحرية.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
           <textarea 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="مثال: ما هي أفضل طريقة لطهي السلمون ليبقى طرياً؟"
              className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-cyan-500 focus:bg-white transition-all outline-none resize-none h-32 text-slate-800"
           />
           <div className="flex justify-between items-center mt-4">
             <div className="text-xs text-slate-400" dir="ltr">Powered by Gemini AI</div>
             <button 
                onClick={handleAiAsk}
                disabled={isAiLoading || !aiPrompt}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
             >
               {isAiLoading ? 'جاري التفكير...' : 'اسأل الشيف'}
             </button>
           </div>
        </div>

        {aiResponse && (
          <div className="bg-white rounded-2xl shadow-sm border-s-4 border-cyan-500 p-8 animate-fade-in">
             <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
               <FileText className="w-5 h-5 me-2 text-cyan-600" />
               اقتراح الشيف
             </h3>
             <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
               {aiResponse}
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">الإعدادات</h1>
      
      <div className="max-w-4xl space-y-6">
        
        {/* Gemini API Key Setting */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-s-4 border-s-purple-500">
           <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Key className="w-5 h-5 text-purple-600" />
             إعدادات الذكاء الاصطناعي (Gemini AI)
           </h2>
           <div className="mb-4">
             <p className="text-sm text-slate-500 mb-2">
               لتفعيل ميزة "الشيف الذكي"، يرجى إدخال مفتاح Google Gemini API الخاص بك.
               سيتم حفظ المفتاح محلياً في متصفحك.
             </p>
             <div className="flex gap-2">
               <input 
                 type="password" 
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 font-mono text-sm"
                 placeholder="Enter your API Key here..."
                 style={{ direction: 'ltr' }}
               />
               <button 
                 onClick={handleSaveApiKey}
                 className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-bold"
               >
                 حفظ المفتاح
               </button>
             </div>
           </div>
        </div>

        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-600" />
            بيانات المتجر
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">اسم المتجر</label>
               <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500" defaultValue="AquaPoint POS" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">العملة</label>
               <select className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500">
                 <option>جنيه مصري (EGP)</option>
                 <option>ريال سعودي (SAR)</option>
                 <option>دولار أمريكي (USD)</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
               <input type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500" defaultValue="0123456789" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">نسبة الضريبة (%)</label>
               <input type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500" defaultValue="5" />
             </div>
          </div>
        </div>

        {/* Printer Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Printer className="w-5 h-5 text-cyan-600" />
             الطابعات المتصلة
           </h2>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
               <div>
                 <div className="font-bold text-slate-700">طابعة الكاشير (الفواتير)</div>
                 <div className="text-sm text-slate-500 font-mono">EPSON TM-T88V (USB)</div>
               </div>
               <button className="text-cyan-600 text-sm font-bold hover:bg-cyan-50 px-3 py-1 rounded transition-colors">إعداد</button>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
               <div>
                 <div className="font-bold text-slate-700">طابعة المطبخ (التجهيز)</div>
                 <div className="text-sm text-slate-500 font-mono">Network Printer (192.168.1.200)</div>
               </div>
               <button className="text-cyan-600 text-sm font-bold hover:bg-cyan-50 px-3 py-1 rounded transition-colors">إعداد</button>
             </div>
           </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-900/20">
            <Save className="w-5 h-5 me-2" />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans" dir="rtl">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 h-full relative overflow-hidden">
        {currentView === ViewState.POS && renderPOS()}
        {currentView === ViewState.INVENTORY && renderInventory()}
        {currentView === ViewState.CUSTOMERS && renderCustomers()}
        {currentView === ViewState.REPORTS && renderReports()}
        {currentView === ViewState.AI_CHEF && renderAiChef()}
        {currentView === ViewState.SETTINGS && renderSettings()}
      </main>

      {/* Global Modals - Rendered regardless of active view */}
      {weighingProduct && (
        <WeighingModal 
          product={weighingProduct} 
          onClose={() => setWeighingProduct(null)} 
          onConfirm={addToCart} 
        />
      )}

      {showAddCustomerModal && (
        <AddCustomerModal 
          onClose={() => setShowAddCustomerModal(false)}
          onSave={handleAddNewCustomer}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={handleAddCategory}
        />
      )}
      
      {showUnitModal && (
        <UnitModal 
          units={units}
          onClose={() => setShowUnitModal(false)}
          onAddUnit={handleAddUnit}
          onRemoveUnit={handleRemoveUnit}
        />
      )}

      {showProductModal && (
        <ProductModal 
          categories={categories}
          units={units}
          onClose={() => setShowProductModal(false)}
          onSave={handleAddProduct}
        />
      )}

      {showMealModal && (
        <MealBuilderModal 
          products={products}
          categories={categories}
          onClose={() => setShowMealModal(false)}
          onSave={handleAddProduct}
        />
      )}

      {showPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                الدفع 
                <span className="mx-2 text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {activeOrder.type === OrderType.DELIVERY ? 'دليفري' : activeOrder.type === OrderType.DINE_IN ? `طاولة ${activeOrder.tableNum}` : 'شباك'}
                </span>
              </h2>
              <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-slate-600">إغلاق</button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleCheckout('cash')}
                className="flex flex-col items-center justify-center p-8 border-2 border-slate-100 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">كاش</span>
                </div>
                <span className="font-bold text-lg text-slate-700">نقداً</span>
              </button>
              <button 
                onClick={() => handleCheckout('card')}
                className="flex flex-col items-center justify-center p-8 border-2 border-slate-100 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg text-slate-700">بطاقة</span>
              </button>
            </div>
            <div className="bg-slate-50 p-6 flex justify-between items-center">
               <span className="text-slate-500">المبلغ المستحق</span>
               <span className="text-3xl font-bold text-slate-800">{(cartTotal * 1.05).toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
