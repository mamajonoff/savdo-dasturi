import React from 'react';
import { Settings, Store, Check } from 'lucide-react';

export default function Sozlamalar({ settings, setSettings }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Dastur Sozlamalari
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Do'koningiz va savdo qoidalarini shu yerdan moslang</p>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1.5">
            <Store className="w-4 h-4 text-slate-500" />
            Do'kon (Biznes) Nomi
          </label>
          <input 
            type="text"
            value={settings.shopName}
            onChange={(e) => setSettings({...settings, shopName: e.target.value})}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="text-sm font-semibold text-slate-700 block">Sotuvda tannarx ko'rinsinmi?</span>
            <span className="text-xs text-slate-400">Sotuv vaqtida mahsulot tannarxini ko'rsatish/yashirish</span>
          </div>
          <button
            onClick={() => setSettings({...settings, showCostPrice: !settings.showCostPrice})}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
              settings.showCostPrice ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">
            Sotuv bo'limida asosiy narx turi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSettings({...settings, defaultPriceType: 'chakana'})}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition cursor-pointer ${
                settings.defaultPriceType === 'chakana'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {settings.defaultPriceType === 'chakana' && <Check className="w-4 h-4" />}
              Chakana narx
            </button>
            <button
              onClick={() => setSettings({...settings, defaultPriceType: 'optom'})}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition cursor-pointer ${
                settings.defaultPriceType === 'optom'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {settings.defaultPriceType === 'optom' && <Check className="w-4 h-4" />}
              Optom narx
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
          ✓ Sozlamalar avtomatik saqlanmoqda
        </span>
      </div>
    </div>
  );
}