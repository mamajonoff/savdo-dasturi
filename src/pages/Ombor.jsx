import React, { useState } from 'react';
import { Boxes, Plus, Search, Barcode, Edit2, Trash2, X } from 'lucide-react';

export default function Ombor({ products, setProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodFormData, setProdFormData] = useState({ name: '', barcode: '', salePrice: '' });

  const handleOpenProdModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProdFormData({ name: prod.name, barcode: prod.barcode || '', salePrice: prod.salePrice || '' });
    } else {
      setEditingProduct(null);
      setProdFormData({ name: '', barcode: '', salePrice: '' });
    }
    setIsProdModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodFormData.name.trim()) return;

    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name: prodFormData.name, salePrice: Number(prodFormData.salePrice) || p.salePrice }
          : p
      ));
    } else {
      const newProd = {
        id: Date.now(),
        name: prodFormData.name,
        barcode: prodFormData.barcode,
        stock: 0,
        costPrice: 0,
        salePrice: Number(prodFormData.salePrice) || 0,
        hasOperations: false
      };
      setProducts([...products, newProd]);
    }

    setIsProdModalOpen(false);
  };

  const handleDeleteProduct = (prod) => {
    if (prod.stock > 0 || prod.hasOperations) {
      alert("Diqqat! Bu tovar bo'yicha oldin operatsiya amalga oshirilgan yoki omborda qoldig'i mavjud. Uni o'chirib bo'lmaydi!");
      return;
    }

    if (confirm(`"${prod.name}" ni o'chirishni tasdiqlaysizmi?`)) {
      setProducts(products.filter(p => p.id !== prod.id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Ombor Qoldig'i
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jami tovar turlari: <span className="font-bold text-slate-700">{products.length} ta</span> | Umumiy qoldiq: <span className="font-bold text-slate-700">{products.reduce((acc, p) => acc + p.stock, 0)} dona</span>
          </p>
        </div>

        <button
          onClick={() => handleOpenProdModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi tovar
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Tovar nomi yoki shtrix-kodi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition"
        />
      </div>

      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Hech qanday tovar topilmadi.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base truncate">{prod.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 font-medium">
                    Qoldiq: <strong className="text-slate-800">{prod.stock} dona</strong>
                  </span>
                  {prod.barcode && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Barcode className="w-3 h-3" />
                      {prod.barcode}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase">Kirim narxi</span>
                <span className="text-xs font-bold text-slate-700">
                  {prod.costPrice ? `${Number(prod.costPrice).toLocaleString()} UZS` : "Belgilanmagan"}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  onClick={() => handleOpenProdModal(prod)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(prod)}
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

      {isProdModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProduct ? "Tovarni tahrirlash" : "Yangi tovar qo'shish"}
              </h3>
              <button onClick={() => setIsProdModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tovar Nomi</label>
                <input 
                  type="text"
                  required
                  value={prodFormData.name}
                  onChange={(e) => setProdFormData({...prodFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {!editingProduct && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Shtrix kodi (Ixtiyoriy)</label>
                  <input 
                    type="text"
                    value={prodFormData.barcode}
                    onChange={(e) => setProdFormData({...prodFormData, barcode: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Sotuv Narxi (UZS)</label>
                <input 
                  type="number"
                  value={prodFormData.salePrice}
                  onChange={(e) => setProdFormData({...prodFormData, salePrice: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProdModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}