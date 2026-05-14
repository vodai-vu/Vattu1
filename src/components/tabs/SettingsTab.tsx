import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Warehouse, 
  Phone, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type SubMenu = 'kiem-ke' | 'kho-vat-tu' | 'lien-lac' | 'thiet-bi';

export default function SettingsTab() {
  const [activeMenu, setActiveMenu] = useState<SubMenu>('kiem-ke');
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);
  const [newLocName, setNewLocName] = useState('');
  
  const [conditions, setConditions] = useState<string[]>(['Hư hỏng', 'Không sửa được', 'Dự phòng', 'Hoạt động tốt']);
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    const unsubLocs = onSnapshot(collection(db, 'locations'), (snap) => {
      setLocations(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    });
    return () => unsubLocs();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    try {
      await addDoc(collection(db, 'locations'), { name: newLocName });
      setNewLocName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'locations');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `locations/${id}`);
    }
  };

  const MENU_ITEMS = [
    { id: 'kiem-ke', label: 'Kiểm kê', icon: ClipboardList },
    { id: 'kho-vat-tu', label: 'Kho vật tư', icon: Warehouse },
    { id: 'lien-lac', label: 'Liên lạc', icon: Phone },
    { id: 'thiet-bi', label: 'Tình trạng thiết bị', icon: Settings },
  ];

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="w-[280px] border-r border-gray-100 flex flex-col p-6 bg-gray-50/50 shrink-0">
        <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
           <Settings className="w-6 h-6 text-gray-400" /> Cấu hình hệ thống
        </h3>
        
        <nav className="space-y-1">
          {MENU_ITEMS.map(item => (
            <button
               key={item.id}
               onClick={() => setActiveMenu(item.id as SubMenu)}
               className={cn(
                 "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                 activeMenu === item.id 
                   ? "bg-white text-blue-700 shadow-md shadow-blue-50 border border-gray-200" 
                   : "text-gray-500 hover:bg-white hover:shadow-sm"
               )}
            >
               <item.icon className={cn("w-5 h-5", activeMenu === item.id ? "text-blue-600" : "text-gray-400")} />
               {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-orange-50 rounded-2xl border border-orange-100">
           <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-black text-orange-800 uppercase tracking-widest">Khu vực Admin</span>
           </div>
           <p className="text-[10px] text-orange-700 font-medium">Các thay đổi tại đây sẽ ảnh hưởng đến toàn bộ người dùng trong hệ thống.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
         {activeMenu === 'kiem-ke' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                 <div>
                    <h4 className="text-lg font-black text-gray-900">Quản lý cột hiển thị toàn cục</h4>
                    <p className="text-sm text-gray-500">Bật/Tắt các cột mà User được phép xem trong tab Kiểm kê</p>
                 </div>
                 <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
                    <Save className="w-4 h-4" /> Lưu cấu hình
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {['Tên thiết bị', 'Hình ảnh', 'Model', 'Công ty SX', 'Nước SX', 'Năm SX', 'Năm SD', 'Số lượng', 'Tình trạng', 'Nguyên giá'].map(col => (
                   <div key={col} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <span className="font-bold text-gray-700">{col}</span>
                      <button className="text-blue-600">
                         <ToggleRight className="w-8 h-8" />
                      </button>
                   </div>
                 ))}
              </div>
           </motion.div>
         )}

         {activeMenu === 'kho-vat-tu' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                 <div>
                    <h4 className="text-lg font-black text-gray-900">Danh sách Kho</h4>
                    <p className="text-sm text-gray-500">Cấu hình các kho lưu trữ vật tư chính</p>
                 </div>
                 <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition">
                    <Plus className="w-4 h-4" /> Thêm kho mới
                 </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50">
                       <tr>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên kho</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhân sự quản lý</th>
                          <th className="p-4 w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {[
                         { name: 'Kho khu 11 tầng', loc: 'Tầng 1 - Khu 11 tầng', mgr: 'Anh Trưng' },
                         { name: 'Kho a Phú (Quạt)', loc: 'Khu D', mgr: 'Anh Phú' },
                       ].map((k, i) => (
                         <tr key={i}>
                            <td className="p-4 text-sm font-bold text-gray-800">{k.name}</td>
                            <td className="p-4 text-sm text-gray-500">{k.loc}</td>
                            <td className="p-4 text-sm font-medium text-blue-600">{k.mgr}</td>
                            <td className="p-4">
                               <button className="text-red-400 hover:text-red-600 px-2 py-1"><Trash2 className="w-4 h-4" /></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </motion.div>
         )}

         {activeMenu === 'lien-lac' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-black text-gray-900">Quản lý Vị trí / Khu vực</h4>
              </div>

              <form onSubmit={handleAddLocation} className="max-w-2xl flex gap-2">
                 <input 
                   type="text" 
                   value={newLocName}
                   onChange={e => setNewLocName(e.target.value)}
                   placeholder="Nhập tên khu vực mới (VD: Khu 15 tầng)..." 
                   className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                 />
                 <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm
                 </button>
              </form>

              <div className="max-w-2xl space-y-3">
                 {locations.map(loc => (
                    <div key={loc.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg"><MapPin className="w-5 h-5 text-blue-600" /></div>
                          <span className="font-bold text-gray-800">{loc.name}</span>
                       </div>
                       <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
              </div>
           </motion.div>
         )}

         {activeMenu === 'thiet-bi' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <h4 className="text-lg font-black text-gray-900 mb-4">Tùy chọn Tình trạng thiết bị</h4>
               <div className="max-w-xl bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="space-y-3 mb-6">
                     {conditions.map((cond, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm">
                           <span className="text-sm font-medium text-gray-700">{cond}</span>
                           <button onClick={() => setConditions(conditions.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                        </div>
                     ))}
                  </div>
                  <div className="flex gap-2">
                     <input 
                      type="text" 
                      value={newCondition}
                      onChange={e => setNewCondition(e.target.value)}
                      placeholder="Thêm trạng thái mới..." 
                      className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                     />
                     <button 
                      onClick={() => { if(newCondition) { setConditions([...conditions, newCondition]); setNewCondition(''); } }}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                     >
                        Thêm
                     </button>
                  </div>
               </div>
            </motion.div>
         )}
      </div>
    </div>
  );
}
