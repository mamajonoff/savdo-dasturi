import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';

export default function Home({ settings }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-500/20">
        <div className="flex justify-between items-start mb-2">
          <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Bugungi Kassa Tushumi</span>
          <Wallet className="w-6 h-6 text-blue-200" />
        </div>
        <div className="text-3xl font-bold">12,450,000 UZS</div>
        <p className="text-xs text-blue-200 mt-2">Do'kon: <span className="font-semibold">{settings.shopName}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-emerald-600">
            <ArrowDownLeft className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Haqdorlik (Mijozlar)</span>
          </div>
          <div className="text-xl font-bold text-slate-800">4,200,000 UZS</div>
          <span className="text-[11px] text-slate-400">Biz olishimiz kerak</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-rose-600">
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Qarzdorlik (Taqsimot)</span>
          </div>
          <div className="text-xl font-bold text-slate-800">1,850,000 UZS</div>
          <span className="text-[11px] text-slate-400">Taminotchilarga qarzimiz</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm text-slate-800">Tugab qolayotgan tovarlar</span>
          </div>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium border border-amber-200">
            3 ta mahsulot
          </span>
        </div>

        <div className="space-y-2">
          {[
            { name: "Sement M-500", rest: "4 qop", min: "10 qop" },
            { name: "Profil pipe 40x40", rest: "12 metr", min: "50 metr" },
            { name: "Gipsokarton 9.5mm", rest: "2 dona", min: "15 dona" }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-600 block">{item.rest} qoldi</span>
                <span className="text-[10px] text-slate-400">min: {item.min}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}