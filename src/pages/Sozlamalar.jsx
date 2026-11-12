import React, { useState } from 'react';
import { Settings, Shield, Store, Check } from 'lucide-react';

export default function Sozlamalar({ settings, setSettings }) {
  const [shopName, setShopName] = useState(settings.shopName || "Mening Do'konim");
  const [showCostPrice, setShowCostPrice] = useState(settings.showCostPrice ?? true);
  const [defaultPriceType, setDefaultPriceType] = useState(settings.defaultPriceType || 'chakana');
  const [password, setPassword] = useState(settings.password || '');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const newSettings = {
      ...settings,
      shopName,
      showCostPrice,
      defaultPriceType,
      password
    };
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Dastur Sozlamalari
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Do'koningiz va savdo qoidalarini shu yerdan moslang</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        
        {/* Do'kon nomi */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
            <Store className="w-4 h-4 text-blue-600" />
            Do'kon (Biznes) Nomi
          </label>
          <input 
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold text-slate-800"
          />
        </div>

        {/* Xavfsizlik paroli */}
        <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
          <label className="text-[11px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
            <Shield className="w-4 h-4 text-blue-600" />
            Xavfsizlik Paroli (O'chirish va Tahrirlash uchun)
          </label>
          <input 
            type="password"
            placeholder="Parol kiriting (masalan: 1234)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold text-slate-800"
          />
          <span className="text-[10px] text-slate-400 block mt-1">Agar parol bo'sh qoldirilsa, o'chirish va tahrirlash parolsiz ishlaydi.</span>
        </div>

        {/* Tannarxni ko'rsatish (Switch dizayni) */}
        <div className="flex items-center justify-between bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Sotuvda tannarx ko'rinsinmi?</span>
            <span className="text-[11px] text-slate-400">Sotuv vaqtida mahsulot tannarxini ko'rsatish/yashirish</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCostPrice(!showCostPrice)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              showCostPrice ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
              showCostPrice ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Asosiy narx turi (Chakana / Optom) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block">
            Sotuv bo'limida asosiy narx turi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDefaultPriceType('chakana')}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                defaultPriceType === 'chakana'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {defaultPriceType === 'chakana' && <Check className="w-4 h-4 text-blue-600" />}
              Chakana narx
            </button>

            <button
              type="button"
              onClick={() => setDefaultPriceType('optom')}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                defaultPriceType === 'optom'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {defaultPriceType === 'optom' && <Check className="w-4 h-4 text-blue-600" />}
              Optom narx
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {savedMsg ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Sozlamalar saqlandi!
            </span>
          ) : (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              ✓ Sozlamalar avtomatik saqlanmoqda
            </span>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Saqlash
          </button>
        </div>

      </form>

    </div>
  );
}