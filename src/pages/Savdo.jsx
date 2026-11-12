import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Search, Calendar, 
  Trash2, Edit3, X, Check, ArrowLeft, PlusCircle, ShoppingBag, Zap 
} from 'lucide-react';

export default function Savdo({ sales, setSales, products, setProducts, customers, setCustomers, settings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('product');
  const [filterDate, setFilterDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [step, setStep] = useState('catalog');

  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState([]);

  const [targetCustomer, setTargetCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const [discount, setDiscount] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.customer-dropdown-container')) {
        setIsCustDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const verifyPasswordAction = (actionCallback) => {
    const storedPass = settings?.password;
    if (storedPass && storedPass.trim() !== '') {
      const enteredPass = prompt("Amalni bajarish uchun parolni kiriting:");
      if (enteredPass !== storedPass) {
        alert("Parol noto'g'ri!");
        return;
      }
    }
    actionCallback();
  };

  const handleOpenModal = (sale = null) => {
    if (sale) {
      verifyPasswordAction(() => {
        setEditingSale(sale);
        setCart(sale.items || []);
        setTargetCustomer(sale.customerId ? { id: sale.customerId, name: sale.customerName, balance: 0 } : null);
        setDiscount(sale.discount || '');
        setCashAmount(sale.cashAmount || '');
        setCardAmount(sale.cardAmount || '');
        setProductSearch('');
        setStep('catalog');
        setIsModalOpen(true);
      });
    } else {
      setEditingSale(null);
      setCart([]);
      setTargetCustomer(null);
      setDiscount('');
      setCashAmount('');
      setCardAmount('');
      setProductSearch('');
      setStep('catalog');
      setIsModalOpen(true);
    }
  };

  const handleUpdateCartQty = (prod, delta) => {
    const existing = cart.find(item => item.productId === prod.id);
    if (existing) {
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        setCart(cart.filter(item => item.productId !== prod.id));
      } else {
        if (newQty > prod.stock) {
          alert(`Omborda faqat ${prod.stock} dona mavjud!`);
          return;
        }
        setCart(cart.map(item => item.productId === prod.id ? { ...item, qty: newQty } : item));
      }
    } else {
      if (delta > 0) {
        if (prod.stock <= 0) {
          alert("Tovar omborda qolmagan!");
          return;
        }
        setCart([...cart, {
          productId: prod.id,
          name: prod.name,
          qty: 1,
          price: prod.salePrice || 0,
          costPrice: prod.costPrice || 0,
          maxStock: prod.stock
        }]);
      }
    }
  };

  const handleSetExactQty = (prod, exactQty) => {
    const q = Number(exactQty);
    if (q < 0) return;
    if (q > prod.stock) {
      alert(`Omborda faqat ${prod.stock} dona mavjud!`);
      return;
    }
    const existing = cart.find(item => item.productId === prod.id);
    if (q === 0) {
      setCart(cart.filter(item => item.productId !== prod.id));
    } else if (existing) {
      setCart(cart.map(item => item.productId === prod.id ? { ...item, qty: q } : item));
    } else {
      setCart([...cart, {
        productId: prod.id,
        name: prod.name,
        qty: q,
        price: prod.salePrice || 0,
        costPrice: prod.costPrice || 0,
        maxStock: prod.stock
      }]);
    }
  };

  const handleUpdateCartPrice = (productId, newPrice) => {
    setCart(cart.map(item => item.productId === productId ? { ...item, price: Number(newPrice) || 0 } : item));
  };

  const handleRemoveCartItem = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const discountNum = Number(discount) || 0;
  const finalTotal = Math.max(0, subTotal - discountNum);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleFillCashTotal = () => {
    setCashAmount(finalTotal);
    setCardAmount('');
  };

  const handleFillCardTotal = () => {
    setCardAmount(finalTotal);
    setCashAmount('');
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const newCust = {
      id: Date.now(),
      name: newCustName,
      phone: newCustPhone,
      balance: 0,
      hasOperations: true
    };
    setCustomers([...customers, newCust]);
    setTargetCustomer(newCust);
    setNewCustName('');
    setNewCustPhone('');
    setShowNewCustForm(false);
  };

  const handleSaveSale = () => {
    if (cart.length === 0) {
      alert("Savat bo'sh!");
      return;
    }

    const paidSum = (Number(cashAmount) || 0) + (Number(cardAmount) || 0);

    if (!targetCustomer && paidSum < finalTotal) {
      alert("Bir martalik mijoz uchun to'liq summa kiritilishi shart!");
      return;
    }

    const debtAmount = Math.max(0, finalTotal - paidSum);

    const newSale = {
      id: editingSale ? editingSale.id : `S-${1000 + sales.length + 1}`,
      date: editingSale ? editingSale.date : new Date().toISOString().split('T')[0],
      customerId: targetCustomer ? targetCustomer.id : null,
      customerName: targetCustomer ? targetCustomer.name : null,
      items: cart,
      subTotal,
      discount: discountNum,
      totalAmount: finalTotal,
      cashAmount: Number(cashAmount) || 0,
      cardAmount: Number(cardAmount) || 0,
      debt: debtAmount
    };

    // Agar tahrirlanayotgan bo'lsa, oldingi savdoni omborga qaytarib, keyin yangisini ayiramiz
    let updatedProducts = [...products];
    if (editingSale) {
      editingSale.items.forEach(oldItem => {
        const prod = updatedProducts.find(p => p.id === oldItem.productId);
        if (prod) prod.stock += oldItem.qty;
      });
    }

    updatedProducts = updatedProducts.map(prod => {
      const cartItem = cart.find(i => i.productId === prod.id);
      if (cartItem) {
        return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty), hasOperations: true };
      }
      return prod;
    });
    setProducts(updatedProducts);

    if (targetCustomer && debtAmount > 0) {
      setCustomers(customers.map(c => {
        if (c.id === targetCustomer.id) {
          return { ...c, balance: (c.balance || 0) + debtAmount, hasOperations: true };
        }
        return c;
      }));
    }

    if (editingSale) {
      setSales(sales.map(s => s.id === editingSale.id ? newSale : s));
    } else {
      setSales([newSale, ...sales]);
    }

    setIsModalOpen(false);
  };

  // Savdoni o'chirish va tovarlarni omborga qaytarish
  const handleDeleteSale = (sale) => {
    verifyPasswordAction(() => {
      if (confirm("Ushbu savdo hujjatini o'chirishni tasdiqlaysizmi? Tovarlar omborga qaytariladi.")) {
        
        // 1. Tovarlarni omborga qaytarib qo'shish
        setProducts(products.map(prod => {
          const matchItem = sale.items.find(i => i.productId === prod.id);
          if (matchItem) {
            return { ...prod, stock: prod.stock + matchItem.qty };
          }
          return prod;
        }));

        // 2. Agar mijozga qarzga yozilgan bo'lsa, mijoz balansidan (qarzidan) ayirib tashlash
        if (sale.customerId && sale.debt > 0) {
          setCustomers(customers.map(c => {
            if (c.id === sale.customerId) {
              return { ...c, balance: Math.max(0, (c.balance || 0) - sale.debt) };
            }
            return c;
          }));
        }

        // 3. Savdolar ro'yxatidan o'chirish
        setSales(sales.filter(s => s.id !== sale.id));
      }
    });
  };

  const filteredSales = sales.filter(s => {
    const matchesDate = filterDate ? s.date === filterDate : true;
    if (!searchQuery) return matchesDate;

    if (searchType === 'id') {
      return matchesDate && s.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchType === 'customer') {
      return matchesDate && s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return matchesDate && s.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  });

  const filteredProductsCatalog = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredCustomersList = customers.filter(c => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()));

  return (
    <div className="space-y-4 pb-10">
      
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Savdo Hujjatlari
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Jami sotuvlar: <span className="font-bold text-slate-700">{sales.length} ta</span></p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi sotuv
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="relative sm:col-span-2 flex gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-medium px-2 py-2 rounded-xl focus:outline-none text-slate-600 shadow-sm cursor-pointer"
          >
            <option value="product">Tovar bo'yicha</option>
            <option value="id">ID bo'yicha</option>
            <option value="customer">Mijoz bo'yicha</option>
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Savdo hujjatlari topilmadi.
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div 
              key={sale.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                    {sale.id}
                  </span>
                  <span className="text-xs text-slate-400">{sale.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm truncate">
                  {sale.customerName ? sale.customerName : "1 martalik mijoz"}
                </h3>
                <p className="text-[11px] text-slate-400">Tovarlar soni: {sale.items.reduce((s, i) => s + i.qty, 0)} ta</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Sotuv summasi</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {sale.totalAmount.toLocaleString()} UZS
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => handleOpenModal(sale)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSale(sale)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {step !== 'catalog' && (
                  <button onClick={() => setStep('catalog')} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <h3 className="font-bold text-slate-800 text-base">
                  {step === 'catalog' && "Tovar tanlash"}
                  {step === 'cart' && "Savatdagi tovarlar"}
                  {step === 'checkout' && "Mijoz va To'lov"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {step === 'catalog' && (
                  <button
                    onClick={() => setStep('cart')}
                    className="relative bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Savat
                    {totalItemsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {totalItemsCount}
                      </span>
                    )}
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {step === 'catalog' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Tovar nomini yozib qidiring..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2.5">
                  {filteredProductsCatalog.map((prod) => {
                    const cartItem = cart.find(i => i.productId === prod.id);
                    const qty = cartItem ? cartItem.qty : 0;
                    const currentPrice = cartItem ? cartItem.price : (prod.salePrice || 0);

                    return (
                      <div key={prod.id} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-800 text-sm">{prod.name}</h4>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              {settings.showCostPrice && (
                                <div className="flex gap-2">
                                  <span>Tannarx:</span>
                                  <strong className="text-slate-700">{Number(prod.costPrice || 0).toLocaleString()} so'm</strong>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <span>Qoldiq:</span>
                                <strong className="text-slate-700">{prod.stock}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase">Sotuv narxi</span>
                            <input 
                              type="number"
                              value={currentPrice}
                              onChange={(e) => handleUpdateCartPrice(prod.id, e.target.value)}
                              className="w-28 text-right font-bold text-blue-600 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">so'm</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-xs text-slate-500 font-medium">Soni:</span>
                          
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                            <button
                              onClick={() => handleUpdateCartQty(prod, -1)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition cursor-pointer"
                            >
                              -
                            </button>

                            <input 
                              type="number"
                              value={qty}
                              onChange={(e) => handleSetExactQty(prod, e.target.value)}
                              className="w-12 text-center font-bold text-slate-800 text-sm focus:outline-none"
                            />

                            <button
                              onClick={() => handleUpdateCartQty(prod, 1)}
                              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold transition cursor-pointer shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Tanlangan tovarlar: {totalItemsCount} ta</span>
                  <button
                    onClick={() => {
                      if (cart.length === 0) {
                        alert("Iltimos, kamida 1 ta tovar tanlang!");
                        return;
                      }
                      setStep('cart');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Savatga o'tish ({totalItemsCount})
                  </button>
                </div>
              </div>
            )}

            {step === 'cart' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        <p className="text-slate-500">Olingan: <strong className="text-slate-700">{item.qty} dona</strong></p>
                        <p className="text-slate-400">1 donasi: {item.price.toLocaleString()} so'm</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-emerald-600 text-sm">
                          {(item.qty * item.price).toLocaleString()} so'm
                        </span>

                        <button 
                          onClick={() => handleRemoveCartItem(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Jami tovarlar soni:</span>
                    <strong className="text-slate-800">{totalItemsCount} ta</strong>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-200">
                    <span>Jami Summa:</span>
                    <span className="text-blue-600">{subTotal.toLocaleString()} UZS</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setStep('catalog')}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Orqaga
                  </button>

                  <button
                    onClick={() => setStep('checkout')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Davom etish
                  </button>
                </div>
              </div>
            )}

            {step === 'checkout' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                <div className="space-y-1.5 relative customer-dropdown-container">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Mijozni tanlash (Majburiy emas)</label>

                  {targetCustomer ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2.5 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{targetCustomer.name}</span>
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Jami qarzi: {Number(targetCustomer.balance || 0).toLocaleString()} UZS
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setTargetCustomer(null); setIsCustDropdownOpen(true); }}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        O'zgartirish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Mijozni qidirish..."
                            value={customerSearchQuery}
                            onFocus={() => setIsCustDropdownOpen(true)}
                            onChange={(e) => {
                              setCustomerSearchQuery(e.target.value);
                              setIsCustDropdownOpen(true);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                          />

                          {isCustDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                              {filteredCustomersList.length === 0 ? (
                                <div className="p-3 text-xs text-slate-400 text-center">Mijoz topilmadi</div>
                              ) : (
                                filteredCustomersList.map(c => (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      setTargetCustomer(c);
                                      setIsCustDropdownOpen(false);
                                      setCustomerSearchQuery('');
                                    }}
                                    className="px-3.5 py-2.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50"
                                  >
                                    <span className="font-bold text-slate-800">{c.name}</span>
                                    <span className="text-slate-500">Qarzi: {Number(c.balance || 0).toLocaleString()} UZS</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowNewCustForm(!showNewCustForm)}
                          className="px-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
                          title="Yangi mijoz qo'shish"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Yangi
                        </button>
                      </div>

                      {showNewCustForm && (
                        <form onSubmit={handleCreateCustomer} className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-2">
                          <input 
                            type="text"
                            required
                            placeholder="Mijoz ismi..."
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <input 
                            type="text"
                            placeholder="Telefon raqami..."
                            value={newCustPhone}
                            onChange={(e) => setNewCustPhone(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowNewCustForm(false)} className="px-3 py-1 text-xs text-slate-600">Bekor qilish</button>
                            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">Qo'shish</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Skidka (Chegirma summasi)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-rose-600"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-sm font-bold">
                  <span>Yakuniy Summa:</span>
                  <span className="text-blue-600">{finalTotal.toLocaleString()} UZS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-slate-600">Naqd pul to'lovi</label>
                      <button
                        type="button"
                        onClick={handleFillCashTotal}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
                        title="To'liq summani naqdga kiritish"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> To'ldirish
                      </button>
                    </div>
                    <input 
                      type="number"
                      placeholder="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-slate-600">Plastik / O'tkazma</label>
                      <button
                        type="button"
                        onClick={handleFillCardTotal}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
                        title="To'liq summani plastikga kiritish"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> To'ldirish
                      </button>
                    </div>
                    <input 
                      type="number"
                      placeholder="0"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Orqaga
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSale}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Savdoni Yakunlash
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}