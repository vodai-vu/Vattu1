import React, { useState, useEffect } from 'react';
import { AirVent, Plus, Trash2, Search, Warehouse, X, Edit2 } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ACType, ACManagement } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../../lib/utils';

export default function DieuHoaTab() {
  const [acTypes, setAcTypes] = useState<ACType[]>([]);
  const [acMgmt, setAcMgmt] = useState<ACManagement[]>([]);
  const [search, setSearch] = useState('');

  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingMgmt, setIsAddingMgmt] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingMgmtId, setEditingMgmtId] = useState<string | null>(null);

  const [typeFormData, setTypeFormData] = useState<Partial<ACType>>({ name: '', type: '', specs: '' });
  const [mgmtFormData, setMgmtFormData] = useState<Partial<ACManagement>>({
    department: '',
    acTypeName: '',
    quantity: 1,
    unitPrice: 0,
    status: 'Hoạt động',
    location: ''
  });

  useEffect(() => {
    const unsubTypes = onSnapshot(collection(db, 'ac_types'), (snap) => {
      setAcTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as ACType)));
    });
    const unsubMgmt = onSnapshot(collection(db, 'ac_management'), (snap) => {
      setAcMgmt(snap.docs.map(d => ({ id: d.id, ...d.data() } as ACManagement)));
    });
    return () => { unsubTypes(); unsubMgmt(); };
  }, []);

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTypeId) {
        await updateDoc(doc(db, 'ac_types', editingTypeId), typeFormData);
      } else {
        await addDoc(collection(db, 'ac_types'), typeFormData);
      }
      setIsAddingType(false);
      setEditingTypeId(null);
      setTypeFormData({ name: '', type: '', specs: '' });
    } catch (err) {
      handleFirestoreError(err, editingTypeId ? OperationType.UPDATE : OperationType.CREATE, 'ac_types');
    }
  };

  const handleSaveMgmt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...mgmtFormData,
        totalValue: (mgmtFormData.quantity || 0) * (mgmtFormData.unitPrice || 0)
      };
      if (editingMgmtId) {
        await updateDoc(doc(db, 'ac_management', editingMgmtId), data);
      } else {
        await addDoc(collection(db, 'ac_management'), data);
      }
      setIsAddingMgmt(false);
      setEditingMgmtId(null);
      setMgmtFormData({ department: '', acTypeName: '', quantity: 1, unitPrice: 0, status: 'Hoạt động', location: '' });
    } catch (err) {
      handleFirestoreError(err, editingMgmtId ? OperationType.UPDATE : OperationType.CREATE, 'ac_management');
    }
  };

  const filteredMgmt = acMgmt.filter(m => 
    m.department?.toLowerCase().includes(search.toLowerCase()) ||
    m.acTypeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar p-1">
      {/* Table 1: Loại Điều hoà */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-sky-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <AirVent className="w-6 h-6 text-sky-600" /> Loại Điều hoà
          </h3>
          <button 
            onClick={() => { setIsAddingType(true); setEditingTypeId(null); }}
            className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-100 transition"
          >
            Thêm loại mới
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại máy</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông số</th>
              <th className="p-4 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {acTypes.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50 group">
                <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                <td className="p-4 text-sm font-black text-gray-800">{t.name}</td>
                <td className="p-4 text-sm text-gray-600">{t.type}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-sky-50 text-sky-600 text-[10px] font-bold border border-sky-100 rounded">{t.specs}</span>
                </td>
                <td className="p-4">
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTypeId(t.id); setTypeFormData(t); setIsAddingType(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(window.confirm('Xóa?')) await updateDoc(doc(db, 'ac_types', t.id), {deleted: true}); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Table 2: Quản lý Điều hoà */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-blue-600" /> Quản lý Điều hoà
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo khoa/phòng..." 
                className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <button 
            onClick={() => { setIsAddingMgmt(true); setEditingMgmtId(null); }}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-100 transition"
          >
            Thêm quản lý
          </button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Khoa/Phòng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Điều hoà</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số lượng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn giá</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành tiền</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tình trạng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                    <th className="p-4 w-20"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredMgmt.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50 group">
                       <td className="p-4 text-sm font-black text-sky-800">{m.department}</td>
                       <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                       <td className="p-4 text-sm font-bold text-gray-700">{m.acTypeName}</td>
                       <td className="p-4 text-sm font-bold">{m.quantity}</td>
                       <td className="p-4 text-sm text-gray-500">{formatCurrency(m.unitPrice)}</td>
                       <td className="p-4 text-sm font-black text-blue-600">{formatCurrency(m.unitPrice * m.quantity)}</td>
                       <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold",
                            m.status === 'Hoạt động' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          )}>{m.status}</span>
                       </td>
                       <td className="p-4 text-xs text-gray-500 italic">{m.location}</td>
                        <td className="p-4">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingMgmtId(m.id); setMgmtFormData(m); setIsAddingMgmt(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={async () => { if(window.confirm('Xóa?')) await updateDoc(doc(db, 'ac_management', m.id), {deleted: true}); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {isAddingType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold">{editingTypeId ? 'Sửa loại ĐH' : 'Thêm loại Điều hòa'}</h3>
                  <button onClick={() => setIsAddingType(false)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <form onSubmit={handleSaveType} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên máy</label>
                    <input required type="text" value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại (Treo tường, Âm trần...)</label>
                    <input type="text" value={typeFormData.type} onChange={e => setTypeFormData({...typeFormData, type: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thông số</label>
                    <input type="text" value={typeFormData.specs} onChange={e => setTypeFormData({...typeFormData, specs: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg">Lưu</button>
               </form>
            </motion.div>
          </div>
        )}

        {isAddingMgmt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold">{editingMgmtId ? 'Sửa quản lý' : 'Thêm quản lý ĐH'}</h3>
                  <button onClick={() => setIsAddingMgmt(false)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <form onSubmit={handleSaveMgmt} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khoa/Phòng</label>
                      <input required type="text" value={mgmtFormData.department} onChange={e => setMgmtFormData({...mgmtFormData, department: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên máy</label>
                      <input required type="text" value={mgmtFormData.acTypeName} onChange={e => setMgmtFormData({...mgmtFormData, acTypeName: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số lượng</label>
                      <input type="number" value={mgmtFormData.quantity} onChange={e => setMgmtFormData({...mgmtFormData, quantity: parseInt(e.target.value)})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đơn giá</label>
                      <input type="number" value={mgmtFormData.unitPrice} onChange={e => setMgmtFormData({...mgmtFormData, unitPrice: parseInt(e.target.value)})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tình trạng</label>
                      <input type="text" value={mgmtFormData.status} onChange={e => setMgmtFormData({...mgmtFormData, status: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vị trí</label>
                      <input type="text" value={mgmtFormData.location} onChange={e => setMgmtFormData({...mgmtFormData, location: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Lưu</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
