import React, { useState } from 'react';
import { 
  CreditCard, Plus, Search, Calendar, 
  Trash2, Edit3, X, Check, ArrowDownLeft, ArrowUpRight, User, Truck, Zap 
} from 'lucide-react';

export default function Tolov({ payments, setPayments, customers, setCustomers, suppliers, setSuppliers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filterDate, setFilterDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [targetType, setTargetType] = useState('customer');
  const [searchTargetQuery, setSearchTargetQuery] = useState('');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [paymentAction, setPaymentAction] = useState('in');
  const [amount, setAmount] = useState('');

  const handleOpenModal = (pay = null) => {
    if (pay) {
      setEditingPayment(pay);
      setTargetType(pay.targetType);
      
      // Bazadan to'g'ri mijoz yoki taminotchini topib biriktiramiz
      const currentList = pay.targetType === 'customer' ? customers : suppliers;
      const foundTarget = currentList.find(t => t.id === pay.targetId) || { id: pay.targetId, name: pay.targetName, balance: 0 };
      
      setSelectedTarget(foundTarget);
      setPaymentAction(pay.action);
      setAmount(pay.amount);
    } else {
      setEditingPayment(null);
      setTargetType('customer');
      setSearchTargetQuery('');
      setSelectedTarget(null);
      setPaymentAction('in');
      setAmount('');
    }
    setIsTargetDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!selectedTarget || !amount || Number(amount) <= 0) {
      alert("Iltimos, mijoz/ta'minotchini tanlang va summani kiriting!");
      return;
    }

    const payAmount = Number(amount);

    if (editingPayment) {
      // Tahrirlash: avvalgi eski balans ta'sirini to'g'rilab, yangisini qo'shamiz
      const oldAmount = editingPayment.amount;
      const oldAction = editingPayment.action;
      const oldType = editingPayment.targetType;
      const oldTargetId = editingPayment.targetId;

      // 1. Eskisini qaytarish
      if (oldType === 'customer') {
        setCustomers(customers.map(c => {
          if (c.id === oldTargetId) {
            const diff = oldAction === 'in' ? oldAmount : -oldAmount;
            return { ...c, balance: (c.balance || 0) + diff };
          }
          return c;
        }));
      } else {
        setSuppliers(suppliers.map(s => {
          if (s.id === oldTargetId) {
            const diff = oldAction === 'out' ? oldAmount : -oldAmount;
            return { ...s, balance: (s.balance || 0) + diff };
          }
          return s;
        }));
      }

      // 2. Yangisini qo'llash
      if (targetType === 'customer') {
        setCustomers(customers.map(c => {
          if (c.id === selectedTarget.id) {
            const diff = paymentAction === 'in' ? -payAmount : payAmount;
            return { ...c, balance: (c.balance || 0) + diff };
          }
          return c;
        }));
      } else {
        setSuppliers(suppliers.map(s => {
          if (s.id === selectedTarget.id) {
            const diff = paymentAction === 'out' ? -payAmount : payAmount;
            return { ...s, balance: (s.balance || 0) + diff };
          }
          return s;
        }));
      }

      setPayments(payments.map(p => {
        if (p.id === editingPayment.id) {
          return {
            ...p,
            targetType,
            targetId: selectedTarget.id,
            targetName: selectedTarget.name,
            action: paymentAction,
            amount: payAmount
          };
        }
        return p;
      }));
    } else {
      const newPay = {
        id: `T-${1000 + payments.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        targetType,
        targetId: selectedTarget.id,
        targetName: selectedTarget.name,
        action: paymentAction,
        amount: payAmount
      };

      if (targetType === 'customer') {
        setCustomers(customers.map(c => {
          if (c.id === selectedTarget.id) {
            const diff = paymentAction === 'in' ? -payAmount : payAmount;
            return { ...c, balance: (c.balance || 0) + diff };
          }
          return c;
        }));
      } else {
        setSuppliers(suppliers.map(s => {
          if (s.id === selectedTarget.id) {
            const diff = paymentAction === 'out' ? -payAmount : payAmount;
            return { ...s, balance: (s.balance || 0) + diff };
          }
          return s;
        }));
      }

      setPayments([newPay, ...payments]);
    }

    setIsModalOpen(false);
  };

  const handleDeletePayment = (pay) => {
    if (confirm("Ushbu to'lov hujjatini o'chirishni tasdiqlaysizmi?")) {
      // O'chirilganda mijoz/ta'minotchi balansini ham qaytarib qo'yamiz
      if (pay.targetType === 'customer') {
        setCustomers(customers.map(c => {
          if (c.id === pay.targetId) {
            const diff = pay.action === 'in' ? pay.amount : -pay.amount;
            return { ...c, balance: (c.balance || 0) + diff };
          }
          return c;
        }));
      } else {
        setSuppliers(suppliers.map(s => {
          if (s.id === pay.targetId) {
            const diff = pay.action === 'out' ? pay.amount : -pay.amount;
            return { ...s, balance: (s.balance || 0) + diff };
          }
          return s;
        }));
      }

      setPayments(payments.filter(p => p.id !== pay.id));
    }
  };

  const handleFillMaxAmount = () => {
    if (!selectedTarget) return;
    const maxVal = Math.abs(selectedTarget.balance || 0);
    setAmount(maxVal > 0 ? maxVal : '');
  };

  const filteredPayments = payments.filter(p => {
    const matchesDate = filterDate ? p.date === filterDate : true;
    if (!searchQuery) return matchesDate;

    if (searchType === 'id') {
      return matchesDate && p.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return matchesDate && p.targetName.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const totalIn = payments.filter(p => p.action === 'in').reduce((sum, p) => sum + p.amount, 0);
  const totalOut = payments.filter(p => p.action === 'out').reduce((sum, p) => sum + p.amount, 0);

  const targetList = targetType === 'customer' ? customers : suppliers;
  const filteredTargets = targetList.filter(t => t.name.toLowerCase().includes(searchTargetQuery.toLowerCase()));

  return (
    <div className="space-y-4 pb-10">
      
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Mijozlar va Ta'minotchilar To'lovlari
          </h2>
          <div className="flex items-center gap-4 mt-1 text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" /> Olingan: {totalIn.toLocaleString()} UZS
            </span>
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Berilgan: {totalOut.toLocaleString()} UZS
            </span>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yangi to'lov
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

      <div className="space-y-2.5">
        {filteredPayments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            To'lov hujjatlari topilmadi.
          </div>
        ) : (
          filteredPayments.map((pay) => (
            <div 
              key={pay.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                    pay.action === 'in' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {pay.id}
                  </span>
                  <span className="text-xs text-slate-400">{pay.date}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {pay.targetType === 'customer' ? 'Mijoz' : "Ta'minotchi"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm truncate">{pay.targetName}</h3>
                <p className="text-[11px] text-slate-500">
                  {pay.action === 'in' ? 'Pul olindi (Kirim)' : 'Pul berildi (Chiqim)'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Summa</span>
                  <span className={`text-sm font-bold ${pay.action === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pay.action === 'in' ? '+' : '-'}{pay.amount.toLocaleString()} UZS
                  </span>
                </div>

                {/* Tahrirlash va O'chirish tugmalari */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => handleOpenModal(pay)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePayment(pay)}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingPayment ? "To'lovni tahrirlash" : "Yangi To'lov Hujjati"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase">Kim bilan oldi-berdi?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTargetType('customer'); setSelectedTarget(null); setSearchTargetQuery(''); setIsTargetDropdownOpen(false); }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                      targetType === 'customer'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Mijoz
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTargetType('supplier'); setSelectedTarget(null); setSearchTargetQuery(''); setIsTargetDropdownOpen(false); }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                      targetType === 'supplier'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Ta'minotchi
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  {targetType === 'customer' ? 'Mijozni qidirish va tanlash' : "Ta'minotchini qidirish va tanlash"}
                </label>

                {selectedTarget ? (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{selectedTarget.name}</span>
                      <span className={`text-[11px] font-semibold ${selectedTarget.balance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Balans (Qarz/Haq): {Number(selectedTarget.balance || 0).toLocaleString()} UZS
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedTarget(null); setIsTargetDropdownOpen(true); }}
                      className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      O'zgartirish
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Ismini yozib qidiring yoki bosing..."
                      value={searchTargetQuery}
                      onFocus={() => setIsTargetDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchTargetQuery(e.target.value);
                        setIsTargetDropdownOpen(true);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />

                    {isTargetDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                        {filteredTargets.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">Bazada hech kim topilmadi</div>
                        ) : (
                          filteredTargets.map(t => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setSelectedTarget(t);
                                setSearchTargetQuery('');
                                setIsTargetDropdownOpen(false);
                              }}
                              className="px-3.5 py-2.5 text-xs hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none transition"
                            >
                              <span className="font-bold text-slate-800">{t.name}</span>
                              <span className="text-slate-500 font-medium">Qarzi: {Number(t.balance || 0).toLocaleString()} UZS</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase">Amal turi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAction('in')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentAction === 'in'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    Pul olish (Kirim)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentAction('out')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentAction === 'out'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Pul berish (Chiqim)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Summa (UZS)</label>
                <div className="relative flex items-center">
                  <input 
                    type="number"
                    required
                    placeholder="Summani kiriting..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold pr-10"
                  />
                  <button
                    type="button"
                    onClick={handleFillMaxAmount}
                    className="absolute right-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title="Barcha qarz/haq summasini avtomatik yozish"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Saqlash
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}