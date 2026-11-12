import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  PackagePlus, Plus, Search, Calendar, ChevronRight, 
  Trash2, ArrowLeft, Check, X, UserPlus, Edit3,
  FileSpreadsheet, Download, PackageCheck
} from 'lucide-react';

export default function Kirim({ products, setProducts, suppliers = [], setSuppliers }) {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('app_invoices');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [
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
    ];
  });

  // Ma'lumotlarni saqlash yordamchisi
  const updateInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    localStorage.setItem('app_invoices', JSON.stringify(newInvoices));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filterDate, setFilterDate] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // Tezkor yangi tovar yaratish modal statelari
  const [quickProdModal, setQuickProdModal] = useState({ isOpen: false, rowIndex: null, name: '', barcode: '' });

  // Excel fayl input ref
  const fileInputRef = useRef(null);

  const [formItems, setFormItems] = useState([
    { productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }
  ]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  // 1. TA'MINOTCHI QO'SHISH
  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return;
    const newSup = { id: Date.now(), name: newSupplierName, balance: 0, hasOperations: false };
    if (setSuppliers) setSuppliers([...suppliers, newSup]);
    setSelectedSupplier(newSup.name);
    setNewSupplierName('');
    setShowAddSupplier(false);
  };

  // 2. TEZKOR YANGI TOVAR YARATISH
  const handleCreateQuickProduct = (e) => {
    e.preventDefault();
    if (!quickProdModal.name.trim()) return;

    const newProd = {
      id: Date.now(),
      name: quickProdModal.name,
      barcode: quickProdModal.barcode,
      stock: 0,
      costPrice: 0,
      salePrice: 0,
      hasOperations: false
    };

    setProducts([...products, newProd]);

    // Hozirgi kirim qatoriga shu tovarni tanlab qo'yish
    if (quickProdModal.rowIndex !== null) {
      const updated = [...formItems];
      updated[quickProdModal.rowIndex].productId = newProd.id;
      updated[quickProdModal.rowIndex].productName = newProd.name;
      setFormItems(updated);
    }

    setQuickProdModal({ isOpen: false, rowIndex: null, name: '', barcode: '' });
  };

  // 3. EXCEL SHABLON YUKLAB OLISH
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "Tovar nomi": "Sement M-500", "Soni": 50, "Kirim summasi": 75000, "Chakana narx": 85000, "Optom narx": 80000 },
      { "Tovar nomi": "Kraska 3kg", "Soni": 20, "Kirim summasi": 40000, "Chakana narx": 50000, "Optom narx": 45000 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kirim_Shablon");
    XLSX.writeFile(wb, "Kirim_Shablon.xlsx");
  };

  // 4. EXCEL FAYLNI O'QISH VA YUKLASH
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("Excel fayl bo'sh!");
          return;
        }

        const importedItems = [];
        let updatedProducts = [...products];

        data.forEach((row, idx) => {
          const name = row["Tovar nomi"] || row["tovar nomi"] || row["Nomi"];
          const qty = Number(row["Soni"] || row["soni"] || 0);
          const costPrice = Number(row["Kirim summasi"] || row["Kirim narxi"] || row["kirim summasi"] || 0);
          const priceChakana = Number(row["Chakana narx"] || row["chakana narx"] || 0);
          const priceOptom = Number(row["Optom narx"] || row["optom narx"] || 0);

          if (name && qty > 0) {
            // Omborda bu tovar bor-yo'qligini tekshirish
            let existingProd = updatedProducts.find(p => p.name.toLowerCase() === String(name).trim().toLowerCase());
            
            if (!existingProd) {
              // Omborda yo'q bo'lsa, yangi tovar sifatida qo'shish
              existingProd = {
                id: Date.now() + idx + Math.random(),
                name: String(name).trim(),
                barcode: "",
                stock: 0,
                costPrice: costPrice,
                salePrice: priceChakana,
                hasOperations: false
              };
              updatedProducts.push(existingProd);
            }

            importedItems.push({
              productId: existingProd.id,
              productName: existingProd.name,
              qty: qty,
              costPrice: costPrice,
              priceChakana: priceChakana,
              priceOptom: priceOptom
            });
          }
        });

        if (importedItems.length > 0) {
          setProducts(updatedProducts);
          // Agar birinchi qator bo'sh bo'lsa o'rniga qo'yamiz, aks holda davomidan qo'shamiz
          const nonEmptyExisting = formItems.filter(i => i.productName.trim() !== '');
          setFormItems([...nonEmptyExisting, ...importedItems]);
          alert(`Muvaffaqiyatli! Exceldan ${importedItems.length} xil tovar yuklandi. Endi ta'minotchini tanlab davom eting.`);
        } else {
          alert("Excel faylda to'g'ri ma'lumot topilmadi. Ustun nomlari shablondagidek ekanligini tekshiring.");
        }
      } catch (err) {
        alert("Faylni o'qishda xatolik yuz berdi!");
      }
      e.target.value = null; // Inputni tozalash
    };
    reader.readAsBinaryString(file);
  };

  const handleProductSelect = (index, prod) => {
    const updated = [...formItems];
    updated[index].productId = prod.id;
    updated[index].productName = prod.name;
    updated[index].costPrice = prod.costPrice || '';
    updated[index].priceChakana = prod.salePrice || '';
    updated[index].priceOptom = prod.salePrice ? Math.round(prod.salePrice * 0.95) : '';
    setFormItems(updated);
    setActiveSearchIndex(null);
  };

  const handleAddRow = () => {
    setFormItems([...formItems, { productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (formItems.length === 1) {
      setFormItems([{ productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }]);
      return;
    }
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = () => {
    if (!selectedSupplier) {
      alert("Iltimos, ta'minotchini tanlang!");
      return;
    }

    const validItems = formItems.filter(item => item.productName && Number(item.qty) > 0);
    if (validItems.length === 0) {
      alert("Kamida 1 ta tovarni to'liq kirim qiling!");
      return;
    }

    const totalInvoiceSum = validItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.costPrice)), 0);
    const paid = Number(paidAmount) || 0;
    const debt = totalInvoiceSum - paid;

    const newInvoice = {
      id: `K-${1000 + invoices.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: selectedSupplier,
      totalAmount: totalInvoiceSum,
      paidAmount: paid,
      items: validItems.map((item, idx) => ({
        id: Date.now() + idx,
        productId: item.productId || Date.now() + idx,
        productName: item.productName,
        qty: Number(item.qty),
        costPrice: Number(item.costPrice),
        priceChakana: Number(item.priceChakana),
        priceOptom: Number(item.priceOptom)
      }))
    };

    // Ombordagi tovarlar qoldig'i va narxini yangilash
    setProducts(products.map(prod => {
      // Bir xil tovar bir necha qatorda bo'lsa hammasini qo'shib hisoblash
      const matchingItems = validItems.filter(item => item.productId === prod.id || item.productName.toLowerCase() === prod.name.toLowerCase());
      if (matchingItems.length > 0) {
        const addedQty = matchingItems.reduce((s, m) => s + Number(m.qty), 0);
        const lastItem = matchingItems[matchingItems.length - 1];
        return {
          ...prod,
          stock: prod.stock + addedQty,
          costPrice: Number(lastItem.costPrice) || prod.costPrice,
          salePrice: Number(lastItem.priceChakana) || prod.salePrice,
          hasOperations: true
        };
      }
      return prod;
    }));

    // Ta'minotchi balansiga (qarzimizga) qo'shish
    if (setSuppliers) {
      setSuppliers(suppliers.map(sup => {
        if (sup.name === selectedSupplier) {
          return {
            ...sup,
            balance: (sup.balance || 0) + debt,
            hasOperations: true
          };
        }
        return sup;
      }));
    }

    updateInvoices([newInvoice, ...invoices]);
    setIsNewModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSupplier('');
    setPaidAmount('');
    setFormItems([{ productId: '', productName: '', qty: '', costPrice: '', priceChakana: '', priceOptom: '' }]);
  };

  const handleUpdateInvoiceItem = (invoiceId, itemId, field, value) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const updatedItems = inv.items.map(it => {
          if (it.id === itemId) {
            return { ...it, [field]: Number(value) || 0 };
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
    updateInvoices(updatedInvoices);
  };

  const handleDeleteInvoiceItem = (invoiceId, itemId) => {
    if (confirm("Haqiqatdan ham ushbu tovar kirimini bekor qilib o'chirmoqchimisiz?")) {
      const updated = invoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedItems = inv.items.filter(it => it.id !== itemId);
          const newTotal = updatedItems.reduce((sum, i) => sum + (i.qty * i.costPrice), 0);
          const updatedInv = { ...inv, items: updatedItems, totalAmount: newTotal };
          if (selectedInvoice) setSelectedInvoice(updatedInv);
          return updatedInv;
        }
        return inv;
      });
      updateInvoices(updated);
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
      
      {/* HEADER VA YANGI KIRIM TUGMASI */}
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

      {/* HUJJATLAR RO'YXATI */}
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

      {/* 1. HUJJAT TAFSILOTI VA TAHRIRLASH MODALI */}
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
                <h4 className="text-xs font-semibold text-slate-500 uppercase">Kirim Qilingan Tovarlar ({selectedInvoice.items.length} ta)</h4>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-slate-700 font-semibold">Kirim: {item.costPrice.toLocaleString()} UZS</div>
                        <div className="text-[10px] text-slate-400">Chakana: {item.priceChakana.toLocaleString()} | Optom: {item.priceOptom.toLocaleString()}</div>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteInvoiceItem(selectedInvoice.id, item.id); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

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

      {/* 2. YANGI KIRIM YARATISH MODALI (EXCEL VA QO'LDA KIRITISH BILAN) */}
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
                
                {/* EXCEL ORQALI YUKLASH PANELI */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">Ko'p tovarlarni Excel orqali yuklash</span>
                      <span className="text-[10px] text-emerald-700">100+ tovarlarni bittada kiritish uchun</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-2.5 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold hover:bg-emerald-100 flex items-center gap-1 transition cursor-pointer"
                      title="Excel shablonini yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Shablon
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel yuklash
                    </button>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      ref={fileInputRef} 
                      onChange={handleExcelUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* TA'MINOTCHI TANLASH */}
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
                    </select>

                    <button
                      type="button"
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
                        type="button"
                        onClick={handleAddSupplier}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold cursor-pointer"
                      >
                        Qo'shish
                      </button>
                    </div>
                  )}
                </div>

                {/* KIRIM TOVARLARI RO'YXATI */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600 uppercase">Kirim Tovarlari ({formItems.length} ta)</label>
                  </div>

                  {formItems.map((item, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2 relative">
                      
                      {/* Tovar nomi inputi + Yonida "+" (Yangi tovar yaratish) tugmasi */}
                      <div className="flex gap-1.5 relative">
                        <div className="relative flex-1">
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

                        {/* Yangi tovar yaratish tugmasi */}
                        <button
                          type="button"
                          onClick={() => setQuickProdModal({ isOpen: true, rowIndex: index, name: item.productName, barcode: '' })}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Omborda yo'q bo'lsa yangi tovar yaratish"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
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
                    <span>Ta'minotchi:</span>
                    <strong className="text-slate-800">{selectedSupplier || "Tanlanmagan"}</strong>
                  </div>
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
                    placeholder="Masalan: 1000000 (Bo'sh qolsa qarz bo'lib saqlanadi)"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
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

      {/* 3. TEZKOR YANGI TOVAR YARATISH MODALI */}
      {quickProdModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <PackageCheck className="w-5 h-5 text-blue-600" />
                Yangi tovar yaratish
              </h3>
              <button 
                onClick={() => setQuickProdModal({ isOpen: false, rowIndex: null, name: '', barcode: '' })} 
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tovar Nomi</label>
                <input 
                  type="text"
                  required
                  autoFocus
                  placeholder="Masalan: Mix 100mm"
                  value={quickProdModal.name}
                  onChange={(e) => setQuickProdModal({ ...quickProdModal, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Shtrix kodi (Ixtiyoriy)</label>
                <input 
                  type="text"
                  placeholder="Shtrix kod..."
                  value={quickProdModal.barcode}
                  onChange={(e) => setQuickProdModal({ ...quickProdModal, barcode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setQuickProdModal({ isOpen: false, rowIndex: null, name: '', barcode: '' })} 
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}