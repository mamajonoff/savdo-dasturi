import React, { useState } from 'react';
import { 
  BarChart3, PackagePlus, ShoppingCart, CreditCard, 
  TrendingDown, RotateCcw, Users, Truck, UserCheck, 
  Boxes, Wallet, TrendingUp, ArrowLeft, Calendar, FileText, Filter, X, ArrowDownLeft, ArrowUpRight 
} from 'lucide-react';

export default function Hisobotlar({ 
  products, sales, payments, expenses, 
  returnsList, customers, suppliers, employees, settings 
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Kassa hisoboti uchun sana oralig'i (Standart: oy boshi va bugun)
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [kassaFilterType, setKassaFilterType] = useState('all'); // 'all', 'savdo', 'mijoz', 'taminotchi', 'xarajat', 'qaytarish'
  
  const [selectedDocDetail, setSelectedDocDetail] = useState(null); // Hujjat ustiga bosganda batafsil ochish

  const reportCards = [
    { id: 'savdo', title: 'Savdo hisoboti', desc: 'Barcha sotuvlar va tushumlar', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'foyda', title: 'Foyda hisoboti', desc: 'Sof foyda va savdo marjasi', icon: TrendingUp, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'kassa', title: 'Kassa hisoboti', desc: 'Naqd va plastik pullar balansi', icon: Wallet, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { id: 'kirim', title: 'Kirim hisoboti', desc: 'Omborga kelgan tovarlar tarixi', icon: PackagePlus, color: 'bg-violet-50 text-violet-600 border-violet-200' },
    { id: 'tolov', title: "To'lovlar hisoboti", desc: 'Mijoz va ta\'minotchi to\'lovlari', icon: CreditCard, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { id: 'xarajatlar', title: 'Xarajatlar hisoboti', desc: 'Do\'kon xarajatlari va turlari', icon: TrendingDown, color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { id: 'qaytarish', title: 'Tovar qaytarish hisoboti', desc: 'Qaytarilgan tovarlar statistikasi', icon: RotateCcw, color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { id: 'mijozlar', title: 'Mijozlar hisoboti', desc: 'Mijozlar qarzlari va savdolari', icon: Users, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    { id: 'taminotchilar', title: "Ta'minotchilar hisoboti", desc: "Ta'minotchilar bilan qoldiqlar", icon: Truck, color: 'bg-teal-50 text-teal-600 border-teal-200' },
    { id: 'xodimlar', title: 'Xodimlar hisoboti', desc: 'Xodimlar maoshi va ro\'yxati', icon: UserCheck, color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
    { id: 'ombor', title: "Do'kondagi jami tovarlar", desc: 'Ombor qoldig\'i va umumiy qiymati', icon: Boxes, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  ];

  // KASSA HISOBOTI UCHUN BARCHA TRANZAKSIYALARNI YIG'ISH
  // 1. Savdo tushumlari (Kirim)
  const allTransactions = [
    ...sales.map(s => ({
      id: s.id,
      date: s.date,
      type: 'savdo',
      typeName: 'Savdo to\'lovi',
      action: 'in',
      amount: (s.cashAmount || 0) + (s.cardAmount || 0),
      originalData: s
    })),
    // 2. To'lovlar (Mijoz / Ta'minotchi)
    ...payments.map(p => ({
      id: p.id,
      date: p.date,
      type: p.targetType === 'customer' ? 'mijoz' : 'taminotchi',
      typeName: p.targetType === 'customer' 
        ? (p.action === 'in' ? 'Mijozdan pul olish' : 'Mijozga pul berish') 
        : (p.action === 'out' ? 'Ta\'minotchiga to\'lov' : 'Ta\'minotchidan pul olish'),
      action: p.action === 'in' ? 'in' : 'out',
      amount: p.amount,
      originalData: p
    })),
    // 3. Xarajatlar (Chiqim)
    ...expenses.map(e => ({
      id: e.id,
      date: e.date,
      type: 'xarajat',
      typeName: `Xarajat: ${e.basis}`,
      action: 'out',
      amount: e.amount,
      originalData: e
    })),
    // 4. Tovar qaytarish
    ...returnsList.map(r => ({
      id: r.id,
      date: r.date,
      type: 'qaytarish',
      typeName: r.returnType === 'customer' ? 'Tovar qaytarish (Mijozga pul berish)' : 'Tovar qaytarish (Mijozdan pul olish)',
      action: r.returnType === 'customer' ? 'out' : 'in',
      amount: r.refundAmount || 0,
      originalData: r
    }))
  ];

  // Sana bo'yicha saralash
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Tanlangan sanadan oldingi kassa qoldig'ini hisoblash
  const priorTransactions = allTransactions.filter(t => t.date < startDate);
  const priorKassaBalance = priorTransactions.reduce((sum, t) => {
    return sum + (t.action === 'in' ? t.amount : -t.amount);
  }, 0);

  // Tanlangan sana oralig'idagi tranzaksiyalar
  const rangeTransactions = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
  
  // Filtr bo'yicha saralash
  const filteredKassaTransactions = rangeTransactions.filter(t => {
    if (kassaFilterType === 'all') return true;
    return t.type === kassaFilterType;
  });

  const rangeKirimSum = filteredKassaTransactions.filter(t => t.action === 'in').reduce((s, t) => s + t.amount, 0);
  const rangeChiqimSum = filteredKassaTransactions.filter(t => t.action === 'out').reduce((s, t) => s + t.amount, 0);
  const rangeNetSum = rangeKirimSum - rangeChiqimSum;
  const totalKassaSum = priorKassaBalance + rangeNetSum;

  return (
    <div className="space-y-4 pb-12">
      
      {/* HEADER */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedReport && (
            <button 
              onClick={() => setSelectedReport(null)}
              className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {selectedReport ? reportCards.find(r => r.id === selectedReport)?.title : "Umumiy Hisobotlar Markazi"}
            </h2>
          </div>
        </div>
      </div>

      {/* ASOSIY MENYU */}
      {!selectedReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedReport(card.id)}
                className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer flex items-start gap-3.5 group"
              >
                <div className={`p-3 rounded-2xl border ${card.color} shrink-0 group-hover:scale-105 transition`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition truncate">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. KASSA HISOBOTI MAXSUS DIZAYNI */}
      {selectedReport === 'kassa' && (
        <div className="space-y-4">
          
          {/* Sana tanlash va Filtrlar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Davr:</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <span>—</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Filtr tugmalari */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'savdo', label: 'Savdo' },
                  { id: 'mijoz', label: 'Mijoz' },
                  { id: 'taminotchi', label: "Ta'minotchi" },
                  { id: 'xarajat', label: 'Xarajat' },
                  { id: 'qaytarish', label: 'Qaytarish' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setKassaFilterType(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                      kassaFilterType === f.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KIRIM VA CHIQIM (Bitta qatorda, Sof kassa olib tashlandi) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Kassaga Kirim</span>
              <h3 className="text-lg font-extrabold text-emerald-600 mt-1">+{rangeKirimSum.toLocaleString()} UZS</h3>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Kassadan Chiqim</span>
              <h3 className="text-lg font-extrabold text-rose-600 mt-1">-{rangeChiqimSum.toLocaleString()} UZS</h3>
            </div>
          </div>

          {/* Oldingi kassa qoldig'i */}
          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-blue-900">
            <span>📅 {startDate} dan oldingi kassa qoldig'i:</span>
            <span className="text-sm font-bold">{priorKassaBalance.toLocaleString()} UZS</span>
          </div>

          {/* Hujjatlar ro'yxati */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 mb-2">Kassadagi harakatlar tarixi ({filteredKassaTransactions.length} ta)</h3>
            
            {filteredKassaTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">Ushbu davrda kassa harakatlari topilmadi.</div>
            ) : (
              filteredKassaTransactions.map((t, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedDocDetail(t)}
                  className="bg-slate-50 border border-slate-100 hover:border-blue-300 p-3 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        t.action === 'in' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {t.id}
                      </span>
                      <span className="text-[11px] text-slate-400">{t.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">{t.typeName}</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold ${t.action === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.action === 'in' ? '+' : '-'}{t.amount.toLocaleString()} UZS
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pastki yakuniy hisob-kitoblar */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 shadow-lg text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Davr mobaynida yig'ilgan balans:</span>
              <strong className="text-white">{rangeNetSum.toLocaleString()} UZS</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Oldingi kassa qoldig'i:</span>
              <strong className="text-white">{priorKassaBalance.toLocaleString()} UZS</strong>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
              <span>Hozirgi Jami Kassa Balansi:</span>
              <span className="text-emerald-400 text-base">{totalKassaSum.toLocaleString()} UZS</span>
            </div>
          </div>

        </div>
      )}

      {/* 2. BOSHQA HISOBOTLAR (Savdo, Foyda, Ombor va h.k.) */}
      {selectedReport === 'savdo' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase">Jami sotuvlar soni</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{sales.length} ta</h3>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase">Jami savdo summasi</span>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">{sales.reduce((s, x) => s + x.totalAmount, 0).toLocaleString()} UZS</h3>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'foyda' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase">Sof foyda (Jami)</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {sales.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + ((i.price - (i.costPrice || 0)) * i.qty), 0) - (s.discount || 0), 0).toLocaleString()} UZS
            </h3>
          </div>
        </div>
      )}

      {selectedReport === 'ombor' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase">Ombordagi tovarlar qiymati</span>
            <h3 className="text-xl font-bold text-blue-600 mt-1">{products.reduce((s, p) => s + (p.stock * (p.salePrice || 0)), 0).toLocaleString()} UZS</h3>
          </div>
        </div>
      )}

      {/* HUJJAT TAFSILOTLARI MODAL OYNASI */}
      {selectedDocDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Hujjat Tafsiloti ({selectedDocDetail.id})
              </h3>
              <button onClick={() => setSelectedDocDetail(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Sana:</span>
                <strong className="text-slate-800">{selectedDocDetail.date}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Harakat turi:</span>
                <strong className="text-slate-800">{selectedDocDetail.typeName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Summa:</span>
                <strong className={`text-sm font-bold ${selectedDocDetail.action === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedDocDetail.action === 'in' ? '+' : '-'}{selectedDocDetail.amount.toLocaleString()} UZS
                </strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDocDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}