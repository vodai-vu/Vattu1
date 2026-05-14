import { useState, useEffect } from 'react';
import { 
  Search, 
  Phone, 
  MapPin, 
  User as UserIcon, 
  Building2, 
  Filter,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { 
  collection, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { Department, Personnel } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function LienLacTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'dept' | 'leaders' | 'staff'>('all');

  useEffect(() => {
    const unsubDepts = onSnapshot(collection(db, 'departments'), (snap) => {
      setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
    });
    const unsubPersonnel = onSnapshot(collection(db, 'personnel'), (snap) => {
      setPersonnel(snap.docs.map(d => ({ id: d.id, ...d.data() } as Personnel)));
    });
    return () => { unsubDepts(); unsubPersonnel(); };
  }, []);

  const filteredDepts = departments.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeaders = personnel.filter(p => 
    (p.jobTitle?.toLowerCase().includes('trưởng') || p.jobTitle?.toLowerCase().includes('phó')) &&
    (p.name?.toLowerCase().includes(search.toLowerCase()) || p.department?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAll = personnel.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.department?.toLowerCase().includes(search.toLowerCase()) ||
    p.jobTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 bg-transparent overflow-auto custom-scrollbar p-1">
      {/* Global Search Toolbar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 sticky top-0 z-20">
         <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm danh bạ (Tên, Khoa phòng, SĐT...)" 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
            />
         </div>
         <div className="flex gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'dept', label: 'Khoa/Phòng' },
              { id: 'leaders', label: 'Lãnh đạo' },
              { id: 'staff', label: 'Nhân viên' },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-xl transition-all",
                  activeFilter === f.id ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Table 1: Danh sách Khoa/Phòng */}
        {(activeFilter === 'all' || activeFilter === 'dept') && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                   <Building2 className="w-6 h-6 text-blue-600" /> Danh sách Khoa/Phòng
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{filteredDepts.length} Đơn vị</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50/50">
                      <tr>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Khoa/Phòng</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">SĐT</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredDepts.map((d, i) => (
                        <tr key={d.id} className="hover:bg-blue-50/20 transition-colors">
                           <td className="p-4 text-sm font-bold text-gray-400">{i + 1}</td>
                           <td className="p-4 text-sm font-black text-gray-800">{d.name}</td>
                           <td className="p-4">
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                 <MapPin className="w-4 h-4 text-gray-400" /> {d.location}
                              </span>
                           </td>
                           <td className="p-4">
                              <a href={`tel:${d.phone}`} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline">
                                 <Phone className="w-4 h-4" /> {d.phone}
                              </a>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
        )}

        {/* Table 2: Danh sách Trưởng/Phó khoa */}
        {(activeFilter === 'all' || activeFilter === 'leaders') && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                   <UserIcon className="w-6 h-6 text-indigo-600" /> Danh sách Trưởng/Phó khoa
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{filteredLeaders.length} Nhân sự</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/30">
                {filteredLeaders.map((p) => (
                   <motion.div 
                    key={p.id}
                    whileHover={{ y: -5 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center"
                   >
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 overflow-hidden shrink-0 border-2 border-white shadow-md">
                         <img src={p.image || `https://ui-avatars.com/api/?name=${p.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{p.jobTitle}</p>
                         <p className="text-base font-black text-gray-900 truncate">{p.name}</p>
                         <p className="text-xs text-gray-500 font-medium truncate mb-2">{p.department}</p>
                         <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                            <Phone className="w-3.5 h-3.5" /> {p.phone}
                         </a>
                      </div>
                   </motion.div>
                ))}
             </div>
          </section>
        )}

        {/* Table 3: Danh sách toàn Bệnh viện */}
        {(activeFilter === 'all' || activeFilter === 'staff') && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                   <Building2 className="w-6 h-6 text-gray-600" /> Danh sách toàn Bệnh viện
                </h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50/50">
                      <tr>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhân viên</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">SĐT</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chức vụ</th>
                        <th className="p-4 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khoa/Phòng</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredAll.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                           <td className="p-4 text-sm font-bold text-gray-400">{i + 1}</td>
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                    <img src={p.image || `https://ui-avatars.com/api/?name=${p.name}`} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-sm font-bold text-gray-800">{p.name}</span>
                              </div>
                           </td>
                           <td className="p-4">
                              <a href={`tel:${p.phone}`} className="text-sm font-medium text-gray-600 hover:text-blue-600">{p.phone}</a>
                           </td>
                           <td className="p-4 text-sm text-gray-500">{p.jobTitle}</td>
                           <td className="p-4">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{p.department}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
        )}
      </div>
    </div>
  );
}
