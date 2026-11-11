import React, { useState } from 'react';
import { UserCheck, Plus, Phone, Edit2, Trash2, X } from 'lucide-react';

export default function Xodimlar({ employees, setEmployees }) {
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [empFormData, setEmpFormData] = useState({ name: '', phone: '', salary: '' });

  const handleOpenEmpModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmpFormData({ name: emp.name, phone: emp.phone, salary: emp.salary });
    } else {
      setEditingEmployee(null);
      setEmpFormData({ name: '', phone: '', salary: '' });
    }
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empFormData.name.trim()) return;

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, name: empFormData.name, phone: empFormData.phone, salary: Number(empFormData.salary) }
          : emp
      ));
    } else {
      const newEmp = {
        id: Date.now(),
        name: empFormData.name,
        phone: empFormData.phone,
        salary: Number(empFormData.salary) || 0
      };
      setEmployees([...employees, newEmp]);
    }
    setIsEmpModalOpen(false);
  };

  const handleDeleteEmployee = (id) => {
    if (confirm("Ushbu xodimni o'chirishni tasdiqlaysizmi?")) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Xodimlar Ro'yxati
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Jami {employees.length} ta xodim ro'yxatda</p>
        </div>

        <button
          onClick={() => handleOpenEmpModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi xodim
        </button>
      </div>

      <div className="space-y-2.5">
        {employees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Hali xodimlar qo'shilmadi.
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base truncate">{emp.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  {emp.salary ? `${Number(emp.salary).toLocaleString()} UZS / oy` : "Oylik belgilanmagan"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-medium text-slate-600 flex items-center justify-end gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {emp.phone || "Nomer yo'q"}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => handleOpenEmpModal(emp)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingEmployee ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}
              </h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Xodim Ismi va Familiyasi</label>
                <input 
                  type="text"
                  required
                  value={empFormData.name}
                  onChange={(e) => setEmpFormData({...empFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Telefon Raqami</label>
                <input 
                  type="text"
                  value={empFormData.phone}
                  onChange={(e) => setEmpFormData({...empFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Oylik Summasi (UZS)</label>
                <input 
                  type="number"
                  value={empFormData.salary}
                  onChange={(e) => setEmpFormData({...empFormData, salary: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}