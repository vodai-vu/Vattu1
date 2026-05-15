import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User as UserIcon, 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit2, 
  X,
  PhoneCall,
  MoreVertical
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Contact } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function LienLacTab() {
  const [activeTab, setActiveTab] = useState<'khoa_phong' | 'lanh_dao' | 'nhan_su'>('khoa_phong');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    position: '',
    phone: '',
    department: '',
    category: 'khoa_phong'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), (snap) => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contact)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contacts'));
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, category: activeTab, deleted: false };
      if (editingId) {
        await updateDoc(doc(db, 'contacts', editingId), data);
      } else {
        await addDoc(collection(db, 'contacts'), data);
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'contacts');
    }
  };

  const handleEdit = (c: Contact) => {
    setEditingId(c.id);
    setFormData(c);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa liên lạc ${name}?`)) {
      try {
        await updateDoc(doc(db, 'contacts', id), { deleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      phone: '',
      department: '',
      category: activeTab
    });
  };

  const filtered = contacts.filter(c => 
    !c.deleted && 
    c.category === activeTab &&
    (c.name?.toLowerCase().includes(search.toLowerCase()) || 
     c.phone?.toLowerCase().includes(search.toLowerCase()) ||
     c.department?.toLowerCase().includes(search.toLowerCase()))
  );

  const TABS = [
    { id: 'khoa_phong', label: 'Khoa/Phòng', icon: Building2 },
    { id: 'lanh_dao', label: 'Lãnh đạo', icon: UserIcon },
    { id: 'nhan_su', label: 'Nhân viên', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full gap-6 bg-transparent overflow-hidden p-1">
      {/* Search & Tool Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-gray-900 border-r border-gray-100 pr-6 mr-2">Danh bạ liên lạc</h2>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
               {TABS.map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSearch(''); }}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                    activeTab === tab.id ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                  )}
                 >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, SĐT..." 
                className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64" 
              />
            </div>
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
              className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center gap-2"
            >
               <Plus className="w-4 h-4" /> Thêm mới
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar pb-10">
         <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {activeTab === 'khoa_phong' ? 'Tên Khoa/Phòng' : 'Họ và tên'}
                    </th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {activeTab === 'khoa_phong' ? 'Vị trí/Khu vực' : 'Chức vụ'}
                    </th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</th>
                    {activeTab !== 'khoa_phong' && (
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khoa/Phòng</th>
                    )}
                    <th className="p-4 w-24"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filtered.map((c, i) => (
                    <tr key={c.id} className="hover:bg-blue-50/10 group transition-colors">
                       <td className="p-4 text-xs font-bold text-gray-400">{i + 1}</td>
                       <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm",
                               activeTab === 'khoa_phong' ? "bg-blue-100 text-blue-700" : 
                               activeTab === 'lanh_dao' ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"
                             )}>
                                {c.name?.charAt(0)}
                             </div>
                             <span className="font-bold text-gray-800">{c.name}</span>
                          </div>
                       </td>
                       <td className="p-4 text-sm text-gray-600 font-medium">
                          {activeTab === 'khoa_phong' ? (
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-300" /> {c.position}</div>
                          ) : c.position}
                       </td>
                       <td className="p-4">
                          <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                             <Phone className="w-3.5 h-3.5" /> {c.phone}
                          </a>
                       </td>
                       {activeTab !== 'khoa_phong' && (
                         <td className="p-4">
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold border border-gray-100">
                               {c.department}
                            </span>
                         </td>
                       )}
                       <td className="p-4 text-right">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all justify-end">
                             <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                       <td colSpan={6} className="p-20 text-center text-gray-300">
                          <div className="flex flex-col items-center gap-2">
                             <MoreVertical className="w-12 h-12 opacity-10" />
                             <p className="text-xs font-bold uppercase tracking-widest italic">Chưa có dữ liệu liên lạc cho mục này</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </section>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-10"
            >
               <div className={cn(
                 "p-8 border-b flex justify-between items-center",
                 activeTab === 'khoa_phong' ? "bg-blue-50" : activeTab === 'lanh_dao' ? "bg-indigo-50" : "bg-teal-50"
               )}>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      {editingId ? 'Cập nhật' : 'Thêm mới'}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Danh bạ: {TABS.find(t => t.id === activeTab)?.label}
                    </p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               
               <form onSubmit={handleSave} className="p-8 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      {activeTab === 'khoa_phong' ? 'Tên Khoa/Phòng' : 'Họ và tên'} *
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder={activeTab === 'khoa_phong' ? "VD: Khoa Cấp cứu" : "VD: Nguyễn Văn A"}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {activeTab === 'khoa_phong' ? 'Vị trí/Khu vực' : 'Chức vụ'}
                      </label>
                      <input 
                        type="text" 
                        value={formData.position}
                        onChange={e => setFormData({...formData, position: e.target.value})}
                        placeholder={activeTab === 'khoa_phong' ? "VD: Tòa nhà A" : "VD: Trưởng khoa"}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại *</label>
                      <div className="relative">
                        <PhoneCall className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          required
                          type="text" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="0123.456.789"
                          className="w-full pl-10 pr-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {activeTab !== 'khoa_phong' && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khoa/Phòng công tác</label>
                      <input 
                        type="text" 
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        placeholder="VD: Khoa Ngoại tổng hợp"
                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-gray-800"
                      />
                    </div>
                  )}

                  <div className="pt-6 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      HỦY BỎ
                    </button>
                    <button 
                      type="submit" 
                      className={cn(
                        "flex-1 py-4 text-white rounded-2xl font-black shadow-xl transition-all active:scale-[0.98]",
                        activeTab === 'khoa_phong' ? "bg-blue-600 shadow-blue-100" : activeTab === 'lanh_dao' ? "bg-indigo-600 shadow-indigo-100" : "bg-teal-600 shadow-teal-100"
                      )}
                    >
                      XÁC NHẬN LƯU
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
