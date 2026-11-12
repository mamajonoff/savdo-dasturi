import React, { useState } from 'react';
import { 
  RotateCcw, Plus, Search, Calendar, 
  Trash2, Edit3, X, Check, User, Truck, ChevronRight, ArrowLeft 
} from 'lucide-react';

export default function TovarQaytarish({ returnsList, setReturnsList, customers, setCustomers, suppliers, setSuppliers, products, setProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filterDate, setFilterDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [step, setStep] = useState(1); // 1: Tovar va odam tanlash, 2: Summa va to'lov

  // Yangi qaytarish formasi statelari
  const [returnType, setReturnType] = useState('customer'); // 'customer' (mijozdan) yoki 'supplier' (taminotchiga)
  const [searchTargetQuery, setSearchTargetQuery] = useState('');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null); // Tanlangan mijoz/taminotchi yoki null (bir martalik)
  const [oneTimeName, setOneTimeName] = useState(''); // Bir martalik mijoz ismi (ixtiyoriy)

  const [saleIdQuery, setSaleIdQuery] = useState(''); // Savdo ID orqali qidirish

  // Qaytarilayotgan tovarlar savati
  const [formItems, setFormItems] = useState([
    { productId: '', productName: '', qty: '', price: '' }
  ]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  // Qaytarilgan pul miqdori (2-bosqich)
  const [refundAmount, setRefundAmount] = useState('');
  const [isRefundFull, setIsRefundFull] = useState(true);

  // Modalni ochish
  const handleOpenModal = (ret = null) => {
    if (ret) {
      setEditingReturn(ret);
      setReturnType(ret.returnType);
      setSelectedTarget(ret.targetId ? { id: ret.targetId, name: ret.targetName } : null);
      setOneTimeName(ret.targetName || '');
      setFormItems(ret.items || []);
      setRefundAmount(ret.refundAmount || '');
    } else {
      setEditingReturn(null);
      setReturnType('customer');
      setSearchTargetQuery('');
      setSelectedTarget(null);
      setOneTimeName('');
      setSaleIdQuery('');
      setFormItems([{ productId: '', productName: '', qty: '', price: '' }]);
      setRefundAmount('');
    }
    setStep(1);
    setIsModalOpen(true);
  };

  // Tovar qatorini boshqarish
  const handleAddRow = () => {
    setFormItems([...formItems, { productId: '', productName: '', qty: '', price: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, prod) => {
    const updated = [...formItems];
    updated[index].productId = prod.id;
    updated[index].productName = prod.name;
    // Mijozdan qaytsa chakana narx, ta'minotchiga qaytsa tannarx
    updated[index].price = returnType === 'customer' ? (prod.salePrice || 0) : (prod.costPrice || 0);
    setFormItems(updated);
    setActiveSearchIndex(null);
  };

  // Hujjatni saqlash
  const handleSaveReturn = () => {
    const validItems = formItems.filter(i => i.productName && Number(i.qty) > 0);
    if (validItems.length === 0) {
      alert("Kamida 1 ta tovarni kiriting!");
      return;
    }

    const totalReturnSum = validItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.price)), 0);
    const targetNameFinal = selectedTarget ? selectedTarget.name : (oneTimeName.trim() || "Bir martalik mijoz");
    const finalRefund = Number(refundAmount) || (selectedTarget ? 0 : totalReturnSum); // Bir martalik bo'lsa to'liq qaytarish majburiy

    const newReturn = {
      id: `Q-${1000 + returnsList.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      returnType,
      targetId: selectedTarget ? selectedTarget.id : null,
      targetName: targetNameFinal,
      totalAmount: totalReturnSum,
      refundAmount: finalRefund,
      items: validItems
    };

    // Omborni yangilash (Mijozdan qaytsa omborga qo'shiladi, ta'minotchiga ketmish bo'lsa omvordan ayiriladi)
    setProducts(products.map(prod => {
      const match = validItems.find(i => i.productId === prod.id || i.productName.toLowerCase() === prod.name.toLowerCase());
      if (match) {
        const qtyNum = Number(match.qty);
        const newStock = returnType === 'customer' ? prod.stock + qtyNum : prod.stock - qtyNum;
        return { ...prod, stock: newStock >= 0 ? newStock : 0 };
      }
      return prod;
    }));

    // Doimiy mijoz yoki ta'minotchi bo'lsa balansni to'g'rilash
    if (selectedTarget) {
      if (returnType === 'customer') {
        setCustomers(customers.map(c => {
          if (c.id === selectedTarget.id) {
            // Qaytarilgan tovar summasi mijoz qarzidan ayriladi, agar pul berilgan bo'lsa hisoblanadi
            const diff = totalReturnSum - finalRefund;
            return { ...c, balance: (c.balance || 0) - diff };
          }
          return c;
        }));
      } else {
        setSuppliers(suppliers.map(s => {
          if (s.id === selectedTarget.id) {
            const diff = totalReturnSum - finalRefund;
            return { ...s, balance: (s.balance || 0) - diff };
          }
          return s;
        }));
      }
    }

    setReturnsList([newReturn, ...returnsList]);
    setIsModalOpen(false);
  };

  // O'chirish
  const handleDeleteReturn = (id) => {
    if (confirm("Ushbu qaytarish hujjatini o'chirishni tasdiqlaysizmi?")) {
      setReturnsList(returnsList.filter(r => r.id !== id));
    }
  };

  const targetList = returnType === 'customer' ? customers : suppliers;
  const filteredTargets = targetList.filter(t => t.name.toLowerCase().includes(searchTargetQuery.toLowerCase()));

  // Shu oy davomida qaytarilgan tovarlar jami soni va summasi
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-11"
  const monthReturns = returnsList.filter(r => r.date.startsWith(currentMonth));
  const totalMonthQty = monthReturns.reduce((sum, r) => sum + r.items.reduce((s, i) => s + Number(i.qty), 0), 0);
  const totalMonthSum = monthReturns.reduce((sum, r) => sum + r.totalAmount, 0);

  const filteredReturns = returnsList.filter(r => {
    const matchesDate = filterDate ? r.date === filterDate : true;
    if (!searchQuery) return matchesDate;
    if (searchType === 'id') {
      return matchesDate && r.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return matchesDate && r.targetName.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <div className="space-y-4 pb-10">
      
      {/* SARKAHIVA VA STATISTIKA */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            Tovar Qaytarish Hujjatlari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shu oyda qaytarilgan: <strong className="text-slate-800">{totalMonthQty} dona</strong> | 
            Jami summa: <span className="font-bold text-blue-600">{totalMonthSum.toLocaleString()} UZS</span>
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yangi hujjat
        </button>
      </div>

      {/* SANA VA QIDIRUV */}
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
              placeholder="Qidirish (ism yoki ID)..."
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
            <option value="name">Ism bo'yicha</option>
            <option value="id">ID bo'yicha</option>
          </select>
        </div>
      </div>

      {/* HUJJATLAR RO'YXATI */}
      <div className="space-y-2.5">
        {filteredReturns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Qaytarish hujjatlari topilmadi.
          </div>
        ) : (
          filteredReturns.map((ret) => (
            <div 
              key={ret.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                    {ret.id}
                  </span>
                  <span className="text-xs text-slate-400">{ret.date}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {ret.returnType === 'customer' ? 'Mijozdan' : "Ta'minotchiga"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm truncate">{ret.targetName}</h3>
                <p className="text-[11px] text-slate-400">Tovarlar soni: {ret.items.reduce((s, i) => s + Number(i.qty), 0)} ta</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Summa</span>
                  <span className="text-sm font-bold text-blue-600">
                    {ret.totalAmount.toLocaleString()} UZS
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => handleOpenModal(ret)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReturn(ret.id)}
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

      {/* YANGI QAYTARISH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                Yangi Tovar Qaytarish Hujjati {step === 2 && "(To'lov/Balans bosqichi)"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 1 && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                {/* Qaytarish turi (Mijozdan / Ta'minotchiga) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Qaytarish yo'nalishi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setReturnType('customer'); setSelectedTarget(null); setSearchTargetQuery(''); }}
                      className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                        returnType === 'customer'
                          ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Mijozdan qaytarish
                    </button>

                    <button
                      type="button"
                      onClick={() => { setReturnType('supplier'); setSelectedTarget(null); setSearchTargetQuery(''); }}
                      className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                        returnType === 'supplier'
                          ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Ta'minotchiga qaytarish
                    </button>
                  </div>
                </div>

                {/* Odam tanlash (Mijoz / Ta'minotchi - Majburiy emas, bir martalik bo'lishi mumkin) */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    {returnType === 'customer' ? 'Mijoz (Bir martalik bo\'lsa bo\'sh qoldiring)' : "Ta'minotchi"}
                  </label>

                  {selectedTarget ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{selectedTarget.name}</span>
                        <span className="text-[11px] text-slate-500">Tanlangan shaxs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTarget(null)}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        O'zgartirish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Bazadan qidirish..."
                          value={searchTargetQuery}
                          onFocus={() => setIsTargetDropdownOpen(true)}
                          onChange={(e) => {
                            setSearchTargetQuery(e.target.value);
                            setIsTargetDropdownOpen(true);
                          }}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                        />

                        {isTargetDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                            {filteredTargets.length === 0 ? (
                              <div className="p-3 text-xs text-slate-400 text-center">Topilmadi</div>
                            ) : (
                              filteredTargets.map(t => (
                                <div
                                  key={t.id}
                                  onClick={() => {
                                    setSelectedTarget(t);
                                    setSearchTargetQuery('');
                                    setIsTargetDropdownOpen(false);
                                  }}
                                  className="px-3.5 py-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50"
                                >
                                  <span className="font-bold text-slate-800">{t.name}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {returnType === 'customer' && (
                        <input 
                          type="text"
                          placeholder="Yoki 1 martalik mijoz ismi (ixtiyoriy)..."
                          value={oneTimeName}
                          onChange={(e) => setOneTimeName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Savdo ID orqali tezkor qidirish */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Savdo Hujjati ID raqami orqali tezkor yuklash (Ixtiyoriy)</label>
                  <input 
                    type="text"
                    placeholder="Masalan: S-1001"
                    value={saleIdQuery}
                    onChange={(e) => setSaleIdQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* Qaytarilayotgan tovarlar savati */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">Qaytarilayotgan Tovarlar</label>

                  {formItems.map((item, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2 relative">
                      
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Tovar nomini kiriting..."
                          value={item.productName}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[index].productName = e.target.value;
                            setFormItems(updated);
                            setActiveSearchIndex(index);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />

                        {activeSearchIndex === index && item.productName && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-36 overflow-y-auto">
                            {products
                              .filter(p => p.name.toLowerCase().includes(item.productName.toLowerCase()))
                              .map(p => (
                                <div 
                                  key={p.id}
                                  onClick={() => handleProductSelect(index, p)}
                                  className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer flex justify-between"
                                >
                                  <span className="font-semibold">{p.name}</span>
                                  <span className="text-slate-400">qoldiq: {p.stock}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Soni</label>
                          <input 
                            type="number"
                            placeholder="0"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[index].qty = e.target.value;
                              setFormItems(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">
                            {returnType === 'customer' ? 'Chakana narxi' : 'Tannarxi'}
                          </label>
                          <input 
                            type="number"
                            placeholder="UZS"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[index].price = e.target.value;
                              setFormItems(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold"
                          />
                        </div>
                      </div>

                      {formItems.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Yana tovar qo'shish
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Davom etish
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 py-2">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Qaytarish summasi jami:</span>
                    <strong className="text-slate-800 text-sm font-bold text-blue-600">
                      {formItems.reduce((sum, i) => sum + (Number(i.qty || 0) * Number(i.price || 0)), 0).toLocaleString()} UZS
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Qaytarilayotgan / To'lanadigan pul summasi (UZS)
                  </label>
                  <input 
                    type="number"
                    placeholder="Summani kiriting..."
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                  <p className="text-[11px] text-slate-400">
                    {!selectedTarget 
                      ? "Bir martalik mijoz uchun summani to'liq qaytarish majburiy."
                      : "Agar summa kiritilmasa, qoldiq mijozning qarzi/haqidan ayrilib yoki qo'shilib ketaveradi."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Orqaga
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveReturn}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Hujjatni Saqlash
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