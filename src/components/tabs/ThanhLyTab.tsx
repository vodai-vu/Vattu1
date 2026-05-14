import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, Edit2, X, FileText } from 'lucide-react';
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
import { LiquidationRecord } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function ThanhLyTab() {
  const [records, setRecords] = useState<LiquidationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LiquidationRecord>>({
    equipmentName: '',
    model: '',
    department: '',
    liquidationDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    decisionNo: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'liquidations'), (snap) => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as LiquidationRecord)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'liquidations'));
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'liquidations', editingId), formData);
      } else {
        await addDoc(collection(db, 'liquidations'), {
          ...formData,
          createdAt: new Date().toISOString(),
          deleted: false
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ equipmentName: '', model: '', department: '', liquidationDate: format(new Date(), 'yyyy-MM-dd'), reason: '', decisionNo: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'liquidations');
    }
  };

  const handleEdit = (rec: LiquidationRecord) => {
    setEditingId(rec.id);
    setFormData({ ...rec });
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa phiếu thanh lý cho ${name}?`)) {
      try {
        await updateDoc(doc(db, 'liquidations', id), { deleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `liquidations/${id}`);
      }
    }
  };

  const filtered = records.filter(r => 
    !r.deleted && (
      r.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.decisionNo?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col h-full gap-6">
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100 text-white">
                <Trash2 className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900">Thanh lý thiết bị</h2>
                <p className="text-sm text-gray-500 font-medium">Hồ sơ và quyết định thanh lý tài sản</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm phiếu..." 
                className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); }}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tạo phiếu mới
            </button>
          </div>
       </div>
       
       <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thiết bị</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Model</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khoa/Phòng</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ngày thanh lý</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số quyết định</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lý do</th>
                  <th className="p-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-red-50/20 group">
                    <td className="p-4 font-bold text-gray-800">{rec.equipmentName}</td>
                    <td className="p-4 text-sm text-gray-600">{rec.model}</td>
                    <td className="p-4 text-sm text-gray-600">{rec.department}</td>
                    <td className="p-4 text-sm text-center font-bold text-gray-900">{rec.liquidationDate}</td>
                    <td className="p-4 text-sm font-mono text-gray-400">{rec.decisionNo}</td>
                    <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate">{rec.reason}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => handleEdit(rec)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(rec.id, rec.equipmentName)} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                       <Trash2 className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Không có dữ liệu thanh lý</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
       </div>

       <AnimatePresence>
         {isAdding && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
             >
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Sửa phiếu thanh lý' : 'Tạo phiếu thanh lý mới'}</h3>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên thiết bị *</label>
                   <input 
                     required
                     type="text" 
                     value={formData.equipmentName}
                     onChange={e => setFormData({...formData, equipmentName: e.target.value})}
                     className="w-full p-2.5 bg-gray-50 border rounded-xl"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model</label>
                     <input 
                       type="text" 
                       value={formData.model}
                       onChange={e => setFormData({...formData, model: e.target.value})}
                       className="w-full p-2.5 bg-gray-50 border rounded-xl"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Khoa sử dụng</label>
                     <input 
                       type="text" 
                       value={formData.department}
                       onChange={e => setFormData({...formData, department: e.target.value})}
                       className="w-full p-2.5 bg-gray-50 border rounded-xl"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày thanh lý</label>
                     <input 
                       type="date" 
                       value={formData.liquidationDate}
                       onChange={e => setFormData({...formData, liquidationDate: e.target.value})}
                       className="w-full p-2.5 bg-gray-50 border rounded-xl"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số quyết định</label>
                     <input 
                       type="text" 
                       value={formData.decisionNo}
                       onChange={e => setFormData({...formData, decisionNo: e.target.value})}
                       className="w-full p-2.5 bg-gray-50 border rounded-xl"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lý do thanh lý</label>
                   <textarea 
                     value={formData.reason}
                     onChange={e => setFormData({...formData, reason: e.target.value})}
                     className="w-full p-2.5 bg-gray-50 border rounded-xl h-24"
                     placeholder="VD: Hỏng hóc không thể sửa chữa, lỗi thời kỹ thuật..."
                   />
                 </div>
                 <div className="pt-4 flex gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsAdding(false)}
                     className="flex-1 py-2.5 border rounded-xl font-bold hover:bg-gray-50"
                   >
                     Hủy
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100"
                   >
                     Lưu phiếu
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}
