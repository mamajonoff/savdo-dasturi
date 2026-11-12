import React, { useState, useEffect } from 'react';
import { 
  Menu, X, User, LogOut, PackagePlus, ShoppingCart, 
  CreditCard, BarChart3, TrendingDown, RotateCcw, 
  Boxes, Users, Truck, UserCheck, Settings
} from 'lucide-react';

import Home from './pages/Home';
import Ombor from './pages/Ombor';
import Mijozlar from './pages/Mijozlar';
import Taminotchilar from './pages/Taminotchilar';
import Xodimlar from './pages/Xodimlar';
import Kirim from './pages/Kirim';
import Xarajatlar from './pages/Xarajatlar';
import Tolov from './pages/Tolov';
import TovarQaytarish from './pages/TovarQaytarish';
import Savdo from './pages/Savdo';
import Hisobotlar from './pages/Hisobotlar';
import Sozlamalar from './pages/Sozlamalar';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return { shopName: "Mening Do'konim", showCostPrice: true, defaultPriceType: 'chakana', password: '' };
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('app_employees');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: 1, name: "Ali Valiyev", phone: "+998 90 123 45 67", salary: 4500000 }];
  });

  useEffect(() => {
    localStorage.setItem('app_employees', JSON.stringify(employees));
  }, [employees]);

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('app_products');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [
      { id: 1, name: "Sement M-500", barcode: "4780012345678", stock: 45, costPrice: 75000, salePrice: 85000, hasOperations: true },
      { id: 2, name: "Profil pipe 40x40", barcode: "4780098765432", stock: 120, costPrice: 24000, salePrice: 28000, hasOperations: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_products', JSON.stringify(products));
  }, [products]);

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('app_customers');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: 1, name: "Anvar Toshmatov", phone: "+998 90 555 44 33", address: "Chilonzor", balance: 150000, hasOperations: true }];
  });

  useEffect(() => {
    localStorage.setItem('app_customers', JSON.stringify(customers));
  }, [customers]);

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('app_suppliers');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: 1, name: "Grand Qurilish MCHJ", phone: "+998 71 200 11 22", address: "Sergeli", balance: 0, hasOperations: true }];
  });

  useEffect(() => {
    localStorage.setItem('app_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const [expenseTypes, setExpenseTypes] = useState(() => {
    const saved = localStorage.getItem('app_expense_types');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: 1, name: "Ijara to'lovi" }];
  });

  useEffect(() => {
    localStorage.setItem('app_expense_types', JSON.stringify(expenseTypes));
  }, [expenseTypes]);

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('app_expenses');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: "X-1001", date: "2026-11-10", basis: "Ijara to'lovi", amount: 1500000, comment: "Noyabr oyi uchun" }];
  });

  useEffect(() => {
    localStorage.setItem('app_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('app_payments');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{ id: "T-1001", date: "2026-11-10", targetType: "customer", targetId: 1, targetName: "Anvar Toshmatov", action: "in", amount: 200000 }];
  });

  useEffect(() => {
    localStorage.setItem('app_payments', JSON.stringify(payments));
  }, [payments]);

  const [returnsList, setReturnsList] = useState(() => {
    const saved = localStorage.getItem('app_returns');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [
      { 
        id: "Q-1001", 
        date: "2026-11-10", 
        returnType: "customer", 
        targetId: 1, 
        targetName: "Anvar Toshmatov", 
        totalAmount: 85000, 
        refundAmount: 85000,
        items: [{ productId: 1, productName: "Sement M-500", qty: 1, price: 85000 }] 
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_returns', JSON.stringify(returnsList));
  }, [returnsList]);

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('app_sales');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [
      {
        id: "S-1001",
        date: "2026-11-10",
        customerId: 1,
        customerName: "Anvar Toshmatov",
        items: [{ productId: 1, name: "Sement M-500", qty: 2, price: 85000, costPrice: 75000 }],
        subTotal: 170000,
        discount: 0,
        totalAmount: 170000,
        cashAmount: 170000,
        cardAmount: 0,
        debt: 0
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_sales', JSON.stringify(sales));
  }, [sales]);

  const handleLogout = () => {
    alert("Dasturdan chiqildi!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>

        <button onClick={() => setActiveTab('home')} className="text-lg font-bold tracking-tight text-blue-600 hover:opacity-90 cursor-pointer truncate max-w-[200px]">
          {settings.shopName || "Mening Do'konim"}
        </button>

        <div className="relative">
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium border border-blue-200 hover:bg-blue-200 transition cursor-pointer">
            <User className="w-5 h-5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40">
              <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium cursor-pointer">
                <LogOut className="w-4 h-4" />
                Dasturdan chiqish
              </button>
            </div>
          )}
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-lg">Bo'limlar Menyusi</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {[
            { id: 'kirim', label: 'Kirim', icon: PackagePlus },
            { id: 'savdo', label: 'Savdo', icon: ShoppingCart },
            { id: 'tolov', label: "To'lov", icon: CreditCard },
            { id: 'xarajatlar', label: 'Xarajatlar', icon: TrendingDown },
            { id: 'qaytarish', label: 'Tovar qaytarish', icon: RotateCcw },
            { id: 'hisobotlar', label: 'Hisobotlar', icon: BarChart3 },
            { id: 'ombor', label: 'Ombor', icon: Boxes },
            { id: 'mijozlar', label: 'Mijozlar', icon: Users },
            { id: 'taminotchilar', label: "Ta'minotchilar", icon: Truck },
            { id: 'xodimlar', label: 'Xodimlar', icon: UserCheck },
            { id: 'sozlamalar', label: 'Sozlamalar', icon: Settings }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {activeTab === 'home' && <Home settings={settings} />}
        {activeTab === 'kirim' && <Kirim products={products} setProducts={setProducts} suppliers={suppliers} setSuppliers={setSuppliers} settings={settings} />}
        {activeTab === 'savdo' && <Savdo sales={sales} setSales={setSales} products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} settings={settings} />}
        {activeTab === 'tolov' && <Tolov payments={payments} setPayments={setPayments} customers={customers} setCustomers={setCustomers} suppliers={suppliers} setSuppliers={setSuppliers} settings={settings} />}
        {activeTab === 'xarajatlar' && <Xarajatlar expenses={expenses} setExpenses={setExpenses} expenseTypes={expenseTypes} setExpenseTypes={setExpenseTypes} settings={settings} />}
        {activeTab === 'qaytarish' && <TovarQaytarish returnsList={returnsList} setReturnsList={setReturnsList} customers={customers} setCustomers={setCustomers} suppliers={suppliers} setSuppliers={setSuppliers} products={products} setProducts={setProducts} settings={settings} />}
        {activeTab === 'hisobotlar' && <Hisobotlar products={products} sales={sales} payments={payments} expenses={expenses} returnsList={returnsList} customers={customers} suppliers={suppliers} employees={employees} settings={settings} />}
        {activeTab === 'ombor' && <Ombor products={products} setProducts={setProducts} settings={settings} />}
        {activeTab === 'mijozlar' && <Mijozlar customers={customers} setCustomers={setCustomers} settings={settings} />}
        {activeTab === 'taminotchilar' && <Taminotchilar suppliers={suppliers} setSuppliers={setSuppliers} settings={settings} />}
        {activeTab === 'xodimlar' && <Xodimlar employees={employees} setEmployees={setEmployees} settings={settings} />}
        {activeTab === 'sozlamalar' && <Sozlamalar settings={settings} setSettings={setSettings} />}

        {activeTab !== 'home' && activeTab !== 'kirim' && activeTab !== 'savdo' && activeTab !== 'tolov' && activeTab !== 'xarajatlar' && activeTab !== 'qaytarish' && activeTab !== 'hisobotlar' && activeTab !== 'ombor' && activeTab !== 'mijozlar' && activeTab !== 'taminotchilar' && activeTab !== 'xodimlar' && activeTab !== 'sozlamalar' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-slate-700 uppercase tracking-wide">{activeTab} bo'limi</h2>
            <p className="text-slate-400 text-sm mt-1">Ushbu bo'lim mantiqiy funksionalligi tayyorlanmoqda...</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-2 py-1 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {[
            { id: 'kirim', label: 'Kirim', icon: PackagePlus },
            { id: 'savdo', label: 'Savdo', icon: ShoppingCart },
            { id: 'tolov', label: "To'lov", icon: CreditCard },
            { id: 'hisobotlar', label: 'Hisobotlar', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </footer>

    </div>
  );
}