import React, { useState } from 'react';
import { Users, Plus, Search, Phone, MapPin, Edit2, Trash2, X } from 'lucide-react';

export default function Mijozlar({ customers, setCustomers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleOpenModal = (cust = null) => {
    if (cust) {
      setEditingCustomer(cust);
      setFormData({ name: cust.name, phone: cust.phone || '', address: cust.address || '' });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, name: formData.name, phone: formData.phone, address: formData.address }
          : c
      ));
    } else {
      const newCust = {
        id: Date.now(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        balance: 0,
        hasOperations: false
      };
      setCustomers([...customers, newCust]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCustomer = (cust) => {
    if (cust.balance !== 0 || cust.hasOperations) {
      alert("Diqqat! Bu mijoz bilan oldin operatsiya amalga oshirilgan yoki uning balansida qarzdorligi mavjud. Uni o'chirib bo'lmaydi!");
      return;
    }

    if (confirm(`"${cust.name}" ni o'chirishni tasdiqlaysizmi?`)) {
      setCustomers(customers.filter(c => c.id !== cust.id));
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-4">
      
      {/* Sarlavha va Yangi mijoz tugmasi */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Mijozlar Bazasi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Jami mijozlar: <span className="font-bold text-slate-700">{customers.length} ta</span></p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi mijoz
        </button>
      </div>

      {/* Qidiruv oynasi */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Mijoz ismi yoki telefon raqami bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition"
        />
      </div>

      {/* Mijozlar ro'yxati */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Hech qanday mijoz topilmadi.
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div key={cust.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              
              {/* Chap tomonda: Ismi, qarzi, keyin manzil va uning ostida telefon raqami */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="font-bold text-slate-800 text-base truncate">{cust.name}</h3>
                
                <div className="flex flex-col items-start gap-1">
                  {/* 1. Qarz va Manzil bir qatorda */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-semibold ${cust.balance > 0 ? 'text-rose-600' : cust.balance < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      Qarzi: {cust.balance ? `${Number(cust.balance).toLocaleString()} UZS` : "0 UZS"}
                    </span>

                    {cust.address && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cust.address}
                      </span>
                    )}
                  </div>
                  
                  {/* 2. Telefon raqami va qo'ng'iroq qilish tugmasi pastki qatorda */}
                  {cust.phone && (
                    <a 
                      href={`tel:${cust.phone}`}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Qo'ng'iroq qilish"
                    >
                      <Phone className="w-3 h-3" />
                      {cust.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* O'ng chekkada: Tahrirlash va O'chirish */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0 self-start">
                <button
                  onClick={() => handleOpenModal(cust)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(cust)}
                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Yangi mijoz yaratish / Tahrirlash modal oynasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingCustomer ? "Mijoz ma'lumotlarini tahrirlash" : "Yangi mijoz qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Mijoz F.I.Sh / Nomi</label>
                <input 
                  type="text"
                  required
                  placeholder="Masalan: Anvar Toshmatov"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Telefon Raqami</label>
                <input 
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Manzili (Ixtiyoriy)</label>
                <input 
                  type="text"
                  placeholder="Masalan: Chilonzor 9-mavze"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}