import React, { useState } from 'react';
import { 
  PackagePlus, Plus, Search, Calendar, ChevronRight, 
  Trash2, ArrowLeft, Check, Eye, X, UserPlus, Filter, Edit3 
} from 'lucide-react';

export default function Kirim({ products, setProducts, suppliers = [], setSuppliers }) {
  const [invoices, setInvoices] = useState([
    {
      id: "K-1001",
      date: "2026-11-10",
      supplierName: "Grand Qurilish MCHJ",
      totalAmount: 4350000,
      paidAmount: 2000000,
      items: [
        { id: 101, productId: 1, productName: "Sement M-500", qty: 30, costPrice: 75000, priceChakana: 85000, priceOptom: 82000 },
        { id: 102, productId: 2, productName: "Profil pipe 40x40", qty: 75, costPrice: 28000, priceChakana: 32000, priceOptom: 30000 }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filterDate, setFilterDate] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false); // Tahrirlash rejimi

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const [formItems, setFormItems] = useState([
    { productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }
  ]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return;
    const newSup = { id: Date.now(), name: newSupplierName };
    if (setSuppliers) setSuppliers([...suppliers, newSup]);
    setSelectedSupplier(newSup.name);
    setNewSupplierName('');
    setShowAddSupplier(false);
  };

  const handleProductSelect = (index, prod) => {
    const updated = [...formItems];
    updated[index].productId = prod.id;
    updated[index].productName = prod.name;
    updated[index].costPrice = prod.costPrice || '';
    updated[index].priceChakana = prod.salePrice || '';
    updated[index].priceOptom = prod.salePrice ? prod.salePrice * 0.95 : '';
    setFormItems(updated);
    setActiveSearchIndex(null);
  };

  const handleAddRow = () => {
    setFormItems([...formItems, { productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = () => {
    if (!selectedSupplier) {
      alert("Iltimos, ta'minotchini tanlang!");
      return;
    }

    const validItems = formItems.filter(item => item.productName && item.qty > 0);
    if (validItems.length === 0) {
      alert("Kamida 1 ta tovarni to'liq kirim qiling!");
      return;
    }

    const totalInvoiceSum = validItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.costPrice)), 0);

    const newInvoice = {
      id: `K-${1000 + invoices.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: selectedSupplier,
      totalAmount: totalInvoiceSum,
      paidAmount: Number(paidAmount) || 0,
      items: validItems.map((item, idx) => ({
        id: Date.now() + idx,
        productId: item.productId || Date.now(),
        productName: item.productName,
        qty: Number(item.qty),
        costPrice: Number(item.costPrice),
        priceChakana: Number(item.priceChakana),
        priceOptom: Number(item.priceOptom)
      }))
    };

    setProducts(products.map(prod => {
      const match = validItems.find(item => item.productId === prod.id || item.productName.toLowerCase() === prod.name.toLowerCase());
      if (match) {
        return {
          ...prod,
          stock: prod.stock + Number(match.qty),
          costPrice: Number(match.costPrice),
          salePrice: Number(match.priceChakana),
          hasOperations: true
        };
      }
      return prod;
    }));

    setInvoices([newInvoice, ...invoices]);
    setIsNewModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSupplier('');
    setPaidAmount('');
    setFormItems([{ productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }]);
  };

  // Hujjat ichidagi tovar ma'lumotlarini tahrirlashni saqlash
  const handleUpdateInvoiceItem = (invoiceId, itemId, field, value) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const updatedItems = inv.items.map(it => {
          if (it.id === itemId) {
            return { ...it, [field]: Number(value) || value };
          }
          return it;
        });
        const newTotal = updatedItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.costPrice)), 0);
        const updatedInv = { ...inv, items: updatedItems, totalAmount: newTotal };
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice(updatedInv);
        }
        return updatedInv;
      }
      return inv;
    });
    setInvoices(updatedInvoices);
  };

  const handleDeleteInvoiceItem = (invoiceId, itemId) => {
    if (confirm("Haqiqatdan ham ushbu tovar kirimini bekor qilib o'chirmoqchimisiz?")) {
      setInvoices(invoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedItems = inv.items.filter(it => it.id !== itemId);
          const newTotal = updatedItems.reduce((sum, i) => sum + (i.qty * i.costPrice), 0);
          const updatedInv = { ...inv, items: updatedItems, totalAmount: newTotal };
          if (selectedInvoice) setSelectedInvoice(updatedInv);
          return updatedInv;
        }
        return inv;
      }));
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesDate = filterDate ? inv.date === filterDate : true;
    if (!searchQuery) return matchesDate;

    if (searchType === 'id') {
      return matchesDate && inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchType === 'supplier') {
      return matchesDate && inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return matchesDate && inv.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  });

  return (
    <div className="space-y-4 pb-10">
      
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-blue-600" />
            Kirim Hujjatlari
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Jami kirimlar: <span className="font-bold text-slate-700">{invoices.length} ta</span></p>
        </div>

        <button
          onClick={() => { resetForm(); setIsNewModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi kirim
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
            <option value="name">Tovar bo'yicha</option>
            <option value="id">ID bo'yicha</option>
            <option value="supplier">Ta'minotchi</option>
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Kirim hujjatlari topilmadi.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div 
              key={inv.id}
              onClick={() => { setSelectedInvoice(inv); setIsEditingInvoice(false); }}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                    {inv.id}
                  </span>
                  <span className="text-xs text-slate-400">{inv.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{inv.supplierName}</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Kirim Summasi</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {inv.totalAmount.toLocaleString()} UZS
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* HUJJAT TAFSILOTI VA TAHRIRLASH MODALI */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase">{selectedInvoice.id}</span>
                <h3 className="font-bold text-slate-800 text-lg">{selectedInvoice.supplierName}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{selectedInvoice.date}</span>
                <span className="text-base font-bold text-emerald-600">{selectedInvoice.totalAmount.toLocaleString()} UZS</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">Kirim Qilingan Tovarlar</h4>
                <span className="text-[11px] text-blue-600 font-medium">
                  {isEditingInvoice ? "✏️ Tahrirlash rejimi yoqilgan" : "Ko'rish rejimi"}
                </span>
              </div>

              {selectedInvoice.items.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="space-y-0.5 min-w-[140px]">
                    <span className="font-bold text-slate-800 block text-sm">{item.productName}</span>
                    {!isEditingInvoice && (
                      <span className="text-slate-500">Soni: <strong className="text-slate-700">{item.qty} dona</strong></span>
                    )}
                  </div>

                  {isEditingInvoice ? (
                    // Tahrirlash inputlari
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Soni</label>
                        <input 
                          type="number" 
                          value={item.qty}
                          onChange={(e) => handleUpdateInvoiceItem(selectedInvoice.id, item.id, 'qty', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-md font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Kirim narx</label>
                        <input 
                          type="number" 
                          value={item.costPrice}
                          onChange={(e) => handleUpdateInvoiceItem(selectedInvoice.id, item.id, 'costPrice', e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Chakana</label>
                        <input 
                          type="number" 
                          value={item.priceChakana}
                          onChange={(e) => handleUpdateInvoiceItem(selectedInvoice.id, item.id, 'priceChakana', e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Optom</label>
                        <input 
                          type="number" 
                          value={item.priceOptom}
                          onChange={(e) => handleUpdateInvoiceItem(selectedInvoice.id, item.id, 'priceOptom', e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    // Oddiy ko'rinish
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-slate-700 font-semibold">Kirim: {item.costPrice.toLocaleString()} UZS</div>
                        <div className="text-[10px] text-slate-400">Chakana: {item.priceChakana.toLocaleString()} | Optom: {item.priceOptom.toLocaleString()}</div>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteInvoiceItem(selectedInvoice.id, item.id); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pastki tugmalar: Tahrirlash va Yopish */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={() => setIsEditingInvoice(!isEditingInvoice)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isEditingInvoice 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditingInvoice ? "Tahrirlashni yakunlash" : "Tahrirlash"}
              </button>

              <button 
                onClick={() => { setSelectedInvoice(null); setIsEditingInvoice(false); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}

      {/* YANGI KIRIM YARATISH MODALI */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                Yangi Kirim Hujjati {step === 2 && "(To'lov bosqichi)"}
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 1 && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Ta'minotchi</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Ta'minotchini tanlang...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                      <option value="Grand Qurilish MCHJ">Grand Qurilish MCHJ</option>
                      <option value="Asia Trade">Asia Trade</option>
                    </select>

                    <button
                      onClick={() => setShowAddSupplier(!showAddSupplier)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 cursor-pointer"
                      title="Yangi ta'minotchi qo'shish"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>

                  {showAddSupplier && (
                    <div className="flex gap-2 mt-2 bg-blue-50 p-2 rounded-xl border border-blue-100">
                      <input 
                        type="text"
                        placeholder="Ta'minotchi nomi..."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                      <button 
                        onClick={handleAddSupplier}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold cursor-pointer"
                      >
                        Qo'shish
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">Kirim Tovarlari</label>

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

                      <div className="grid grid-cols-4 gap-2">
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
                          <label className="text-[10px] text-slate-400 block">Kirim narx</label>
                          <input 
                            type="number"
                            placeholder="UZS"
                            value={item.costPrice}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[index].costPrice = e.target.value;
                              setFormItems(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Chakana</label>
                          <input 
                            type="number"
                            placeholder="UZS"
                            value={item.priceChakana}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[index].priceChakana = e.target.value;
                              setFormItems(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Optom</label>
                          <input 
                            type="number"
                            placeholder="UZS"
                            value={item.priceOptom}
                            onChange={(e) => {
                              const updated = [...formItems];
                              updated[index].priceOptom = e.target.value;
                              setFormItems(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold"
                          />
                        </div>
                      </div>

                      {formItems.length > 1 && (
                        <button 
                          onClick={() => handleRemoveRow(index)}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleAddRow}
                    className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Yana tovar qo'shish
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
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
                    <span>Jami Kirim Summasi:</span>
                    <strong className="text-slate-800 text-sm">
                      {formItems.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.costPrice || 0)), 0).toLocaleString()} UZS
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Ta'minotchiga berilgan to'lov summasi (UZS)
                  </label>
                  <input 
                    type="number"
                    placeholder="Masalan: 1000000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Orqaga
                  </button>

                  <button
                    onClick={handleSaveInvoice}
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