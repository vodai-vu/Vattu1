import React, { useState, useEffect } from 'react';
import { Flame, Plus, ShieldCheck, History, Image as ImageIcon, Trash2, PenTool, X, Edit2 } from 'lucide-react';
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
import { PCCCEquipment } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function PCCCTab() {
  const [equipment, setEquipment] = useState<PCCCEquipment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PCCCEquipment>>({
    name: '',
    code: '',
    location: '',
    lastCheck: new Date().toISOString().split('T')[0],
    status: 'Bình thường',
    managerId: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pccc'), (snap) => {
      setEquipment(snap.docs.map(d => ({ id: d.id, ...d.data() } as PCCCEquipment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pccc'));
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'pccc', editingId), formData);
      } else {
        await addDoc(collection(db, 'pccc'), { ...formData, deleted: false });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', code: '', location: '', lastCheck: new Date().toISOString().split('T')[0], status: 'Bình thường', managerId: '' });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'pccc');
    }
  };

  const handleEdit = (eq: PCCCEquipment) => {
    setEditingId(eq.id);
    setFormData(eq);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa thiết bị PCCC: ${name}?`)) {
      try {
        await updateDoc(doc(db, 'pccc', id), { deleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `pccc/${id}`);
      }
    }
  };

  const filtered = equipment.filter(e => !e.deleted);

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar p-1">
      {/* Header Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-red-600 rounded-xl shadow-lg shadow-red-100"><Flame className="w-6 h-6 text-white" /></div>
             <div>
                <h3 className="text-lg font-black text-gray-800">Hệ thống PCCC</h3>
                <p className="text-xs text-red-600 font-bold uppercase tracking-widest italic">An toàn là trên hết</p>
             </div>
          </div>
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); }}
            className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm thiết bị
          </button>
        </div>
        
        <div className="p-6 overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên thiết bị</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã/Code</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Quản lý</th>
                    <th className="p-4 w-20"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-red-50/10 group transition-colors">
                       <td className="p-4 text-sm font-bold text-gray-400">{i+1}</td>
                       <td className="p-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-gray-800">{r.name}</span>
                             <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Kiểm tra: {r.lastCheck}</span>
                          </div>
                       </td>
                       <td className="p-4 text-sm font-mono text-gray-600">#{r.code}</td>
                       <td className="p-4 text-sm text-gray-600">{r.location}</td>
                       <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold",
                            r.status === 'Bình thường' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>{r.status}</span>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-[10px] font-black text-red-700">ID</div>
                             <span className="text-sm font-bold text-gray-600">{r.managerId}</span>
                          </div>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button onClick={() => handleEdit(r)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filtered.length === 0 && (
                   <tr>
                     <td colSpan={7} className="p-20 text-center text-gray-300">
                        <Flame className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu thiết bị PCCC</p>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </section>

      {/* Sơ đồ & Tài liệu */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sơ đồ & Tài liệu kỹ thuật</h3>
           <button className="text-xs font-bold text-blue-600 hover:underline">Quản lý sơ đồ</button>
        </div>
        <div className="p-6">
           <div className="flex flex-wrap gap-4">
              {[1, 2].map(i => (
                <div key={i} className="w-40 h-40 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 gap-2 overflow-hidden relative group">
                   <ImageIcon className="w-8 h-8" />
                   <span className="text-[10px] font-bold uppercase">Sơ đồ {i}</span>
                   <button className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
              <div className="w-40 h-40 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                 <Plus className="w-8 h-8" />
              </div>
           </div>
        </div>
      </section>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold">{editingId ? 'Sửa thiết bị PCCC' : 'Thêm thiết bị PCCC'}</h3>
                  <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên thiết bị *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã thiết bị</label>
                      <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vị trí lắp đặt</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày kiểm tra cuối</label>
                      <input type="date" value={formData.lastCheck} onChange={e => setFormData({...formData, lastCheck: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl outline-none">
                         <option>Bình thường</option>
                         <option>Cần bảo trì</option>
                         <option>Hết hạn</option>
                         <option>Đang sửa chữa</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Người quản lý</label>
                    <input type="text" value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition">Lưu thiết bị</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
