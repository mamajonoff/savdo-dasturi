import React, { useState } from 'react';
import { 
  TrendingDown, Plus, Search, Calendar, 
  Trash2, Edit3, X, Check, PlusCircle 
} from 'lucide-react';

export default function Xarajatlar({ expenses, setExpenses, expenseTypes, setExpenseTypes }) {
  // Hujjatlar va qidiruv/filtr statelari
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('basis'); // 'basis' yoki 'id'
  const [filterDate, setFilterDate] = useState('');

  // Modal va tahrirlash statelari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Forma statelari
  const [formData, setFormData] = useState({
    basis: '',
    amount: '',
    comment: ''
  });

  // Yangi xarajat asosi qo'shish uchun inline input
  const [newBasisName, setNewBasisName] = useState('');
  const [showAddBasis, setShowAddBasis] = useState(false);

  // Xarajat asosi qo'shish funksiyasi
  const handleAddExpenseBasis = () => {
    if (!newBasisName.trim()) return;
    const newBasis = { id: Date.now(), name: newBasisName };
    setExpenseTypes([...expenseTypes, newBasis]);
    setFormData({ ...formData, basis: newBasis.name });
    setNewBasisName('');
    setShowAddBasis(false);
  };

  // Modalni ochish (Yangi yoki Tahrirlash)
  const handleOpenModal = (exp = null) => {
    if (exp) {
      setEditingExpense(exp);
      setFormData({
        basis: exp.basis,
        amount: exp.amount,
        comment: exp.comment || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({ basis: '', amount: '', comment: '' });
    }
    setIsModalOpen(true);
    setShowAddBasis(false);
  };

  // Saqlash (Yangi qo'shish yoki Tahrirlash)
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!formData.basis || !formData.amount) {
      alert("Iltimos, xarajat asosi va summasini kiriting!");
      return;
    }

    if (editingExpense) {
      setExpenses(expenses.map(item => 
        item.id === editingExpense.id 
          ? { ...item, basis: formData.basis, amount: Number(formData.amount), comment: formData.comment }
          : item
      ));
    } else {
      const newExp = {
        id: `X-${1000 + expenses.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        basis: formData.basis,
        amount: Number(formData.amount),
        comment: formData.comment
      };
      setExpenses([newExp, ...expenses]);
    }

    setIsModalOpen(false);
  };

  // O'chirish
  const handleDeleteExpense = (id) => {
    if (confirm("Ushbu xarajat hujjatini o'chirishni tasdiqlaysizmi?")) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  };

  // Filterlash va qidirish
  const filteredExpenses = expenses.filter(exp => {
    const matchesDate = filterDate ? exp.date === filterDate : true;
    if (!searchQuery) return matchesDate;

    if (searchType === 'id') {
      return matchesDate && exp.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return matchesDate && exp.basis.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <div className="space-y-4 pb-10">
      
      {/* HEADER VA YANGI XARAJAT TUGMASI */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            Xarajatlar Hujjatlari
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jami xarajatlar: <span className="font-bold text-slate-700">{expenses.length} ta</span> | 
            Summa: <span className="font-bold text-rose-600">{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} UZS</span>
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi xarajat
        </button>
      </div>

      {/* SANA FILTRI VA QIDIRUV */}
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
            <option value="basis">Xarajat asosi</option>
            <option value="id">ID bo'yicha</option>
          </select>
        </div>
      </div>

      {/* XARAJATLAR RO'YXATI */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Xarajat hujjatlari topilmadi.
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div 
              key={exp.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
                    {exp.id}
                  </span>
                  <span className="text-xs text-slate-400">{exp.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm truncate">{exp.basis}</h3>
                {exp.comment && <p className="text-[11px] text-slate-400 truncate">Izoh: {exp.comment}</p>}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Summa</span>
                  <span className="text-sm font-bold text-rose-600">
                    {exp.amount.toLocaleString()} UZS
                  </span>
                </div>

                {/* Izmenit va o'chirish */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => handleOpenModal(exp)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Tahrirlash"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
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

      {/* YANGI XARAJAT QO'SHISH / TAHRIRLASH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingExpense ? "Xarajatni tahrirlash" : "Yangi xarajat qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              
              {/* Xarajat asosi tanlash */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Xarajat Asosi</label>
                <div className="flex gap-2">
                  <select
                    value={formData.basis}
                    onChange={(e) => setFormData({...formData, basis: e.target.value})}
                    required
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Asosni tanlang...</option>
                    {expenseTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowAddBasis(!showAddBasis)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 cursor-pointer"
                    title="Yangi asos qo'shish"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Yangi asos qo'shish inputi */}
                {showAddBasis && (
                  <div className="flex gap-2 mt-2 bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <input 
                      type="text"
                      placeholder="Yangi xarajat asosi nomi..."
                      value={newBasisName}
                      onChange={(e) => setNewBasisName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddExpenseBasis}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold cursor-pointer"
                    >
                      Qo'shish
                    </button>
                  </div>
                )}
              </div>

              {/* Xarajat summasi */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Xarajat Summasi (UZS)</label>
                <input 
                  type="number"
                  required
                  placeholder="Masalan: 250000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold text-rose-600"
                />
              </div>

              {/* Izoh (ixtiyoriy) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Izoh (Ixtiyoriy)</label>
                <textarea 
                  rows="2"
                  placeholder="Qo'shimcha ma'lumot..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
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