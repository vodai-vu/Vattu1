import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Edit2, XCircle, ShieldCheck, Mail, Phone, MapPin, UserCheck, Briefcase } from 'lucide-react';
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
import { Personnel } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function NhanSuTab() {
  const [activeTab, setActiveTab] = useState<'list' | 'permissions'>('list');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Personnel>>({
    name: '',
    phone: '',
    address: '',
    jobTitle: '',
    username: '',
    status: 'active'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'personnel'), (snap) => {
      setPersonnel(snap.docs.map(d => ({ id: d.id, ...d.data() } as Personnel)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'personnel'));
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'personnel', editingId), formData);
      } else {
        await addDoc(collection(db, 'personnel'), { ...formData, deleted: false });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', jobTitle: '', username: '', status: 'active' });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'personnel');
    }
  };

  const handleEdit = (p: Personnel) => {
    setEditingId(p.id);
    setFormData(p);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa nhân sự ${name}?`)) {
      try {
        await updateDoc(doc(db, 'personnel', id), { deleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `personnel/${id}`);
      }
    }
  };

  const filtered = personnel.filter(p => 
    !p.deleted && (
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.username?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden p-1">
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
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', phone: '', address: '', jobTitle: '', username: '', status: 'active' }); }}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
            >
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
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhân viên</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chức vụ</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Liên lạc</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                          <th className="p-4 w-20"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filtered.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                             <td className="p-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                                      {p.name?.charAt(0)}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="font-bold text-gray-900">{p.name}</span>
                                      <span className="text-xs text-gray-400">@{p.username || 'user'}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="p-4 text-sm text-gray-600 font-medium">
                                <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-400" /> {p.jobTitle}</div>
                             </td>
                             <td className="p-4 text-sm text-gray-600">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {p.phone}</div>
                                   <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {p.address}</div>
                                </div>
                             </td>
                             <td className="p-4">
                                <span className={cn(
                                   "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                   p.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                   {p.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ'}
                                </span>
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => handleEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                                   <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </motion.div>
            ) : (
              <motion.div 
                key="permissions" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                 <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                    <h3 className="font-bold text-indigo-900 mb-2">Thông tin về phân quyền</h3>
                    <p className="text-sm text-indigo-700 font-medium">Tại đây quý quản trị có thể thiết lập quyền truy cập cho từng nhân viên theo vai trò cụ thể.</p>
                 </div>
                 
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50">
                          <tr>
                             <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhân viên</th>
                             <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quyền truy cập cột (Kiểm kê)</th>
                             <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tùy chỉnh</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {filtered.map(p => (
                             <tr key={p.id} className="hover:bg-indigo-50/10">
                                <td className="p-4 text-sm font-black text-gray-800 border-r border-gray-100">{p.name}</td>
                                <td className="p-4 border-r border-gray-100">
                                   <div className="flex flex-wrap gap-1 justify-center max-w-[400px] mx-auto uppercase">
                                      {['Tên', 'Model', 'Giá', 'SL'].map(col => (
                                        <button key={col} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded border border-green-200 shadow-sm">
                                           {col}
                                        </button>
                                      ))}
                                      <button className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                         +
                                      </button>
                                   </div>
                                </td>
                                <td className="p-4 text-center">
                                   <button className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors">
                                      Cấu hình chi tiết
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto pt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col mb-10"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-200 rounded-full"><XCircle className="w-6 h-6 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ tên *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chức vụ</label>
                    <input 
                      type="text" 
                      value={formData.jobTitle}
                      onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên đăng nhập (Username)</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Địa chỉ</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl h-20 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 border rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Lưu thông tin
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
