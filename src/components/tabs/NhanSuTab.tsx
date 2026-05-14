import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Lock, Unlock, Search, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { 
  collection, 
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { Personnel } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function NhanSuTab() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'permissions'>('list');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'personnel'), (snap) => {
      setPersonnel(snap.docs.map(d => ({ id: d.id, ...d.data() } as Personnel)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'personnel'));
    return unsub;
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    try {
      await updateDoc(doc(db, 'personnel', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `personnel/${id}`);
    }
  };

  const filtered = personnel.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      {/* Header & Internal Nav */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
               <Users className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-xl font-black text-gray-900">Quản lý Nhân sự & Quyền hạn</h2>
               <div className="flex gap-4 mt-1">
                  <button 
                    onClick={() => setActiveTab('list')}
                    className={cn("text-xs font-bold uppercase tracking-widest transition-colors", activeTab === 'list' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 border-b-2 border-transparent hover:text-gray-600")}
                  >
                    Danh sách nhân sự
                  </button>
                  <button 
                    onClick={() => setActiveTab('permissions')}
                    className={cn("text-xs font-bold uppercase tracking-widest transition-colors", activeTab === 'permissions' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 border-b-2 border-transparent hover:text-gray-600")}
                  >
                    Cấp quyền
                  </button>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm nhân viên..." 
                className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-700 transition flex items-center gap-2">
               <Plus className="w-4 h-4" /> Thêm mới
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pb-10">
         <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div 
                key="list" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                 <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                       <tr>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">SĐT</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Công việc</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên đăng nhập</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                          <th className="p-4 w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filtered.map(p => (
                          <tr key={p.id} className="hover:bg-indigo-50/10">
                             <td className="p-4 text-sm font-black text-gray-800">{p.name}</td>
                             <td className="p-4 text-sm text-gray-600">{p.phone}</td>
                             <td className="p-4 text-xs text-gray-500 truncate max-w-[200px]">{p.address}</td>
                             <td className="p-4">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100">{p.jobTitle}</span>
                             </td>
                             <td className="p-4 text-sm font-mono text-gray-400">{p.username}</td>
                             <td className="p-4">
                                <button 
                                  onClick={() => toggleStatus(p.id, p.status)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                                    p.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  )}
                                >
                                   {p.status === 'active' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                   {p.status === 'active' ? 'Hoạt động' : 'Đã khoá'}
                                </button>
                             </td>
                             <td className="p-4">
                                <button className="p-2 text-gray-300 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all">
                                   <Edit2 className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </motion.div>
            ) : (
              <motion.div 
                key="perms" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                 <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                       <tr>
                          <th rowSpan={2} className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100">Tên</th>
                          <th colSpan={2} className="p-4 text-[10px] font-black text-gray-600 uppercase tracking-widest text-center border-b border-gray-100">Quyền xem chi tiết</th>
                       </tr>
                       <tr>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-r border-gray-100">Kiểm kê</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Kiểm định</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filtered.map(p => (
                          <tr key={p.id} className="hover:bg-indigo-50/10">
                             <td className="p-4 text-sm font-black text-gray-800 border-r border-gray-100">{p.name}</td>
                             <td className="p-4 border-r border-gray-100">
                                <div className="flex flex-wrap gap-1 justify-center max-w-[400px] mx-auto uppercase">
                                   {['Tên', 'Model', 'Giá', 'SL'].map(col => (
                                     <button key={col} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded border border-green-200">
                                        {col}
                                     </button>
                                   ))}
                                   <button className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                      +
                                   </button>
                                </div>
                             </td>
                             <td className="p-4 text-center">
                                <button className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-200 shadow-sm">
                                   Cấu hình chi tiết
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
