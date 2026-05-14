import { useState } from 'react';
import { Flame, Plus, ShieldCheck, History, Image as ImageIcon, Trash2, PenTool } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function PCCCTab() {
  const isAdmin = true; // Replace with actual check

  const [repairs, setRepairs] = useState([
    { id: '1', name: 'Đầu báo khói tầng 5', code: 'PCCC-01', managerId: 'ADM-01' },
    { id: '2', name: 'Bơm bù áp - Nhà K', code: 'PCCC-05', managerId: 'ADM-02' },
  ]);

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar">
      {/* Admin Image Gallery Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-red-600 rounded-xl shadow-lg shadow-red-100"><Flame className="w-6 h-6 text-white" /></div>
             <div>
                <h3 className="text-lg font-black text-gray-800">Hệ thống PCCC</h3>
                <p className="text-xs text-red-600 font-bold uppercase tracking-widest italic">An toàn là trên hết</p>
             </div>
          </div>
          {isAdmin && (
             <button className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tải ảnh hệ thống
             </button>
          )}
        </div>
        
        <div className="p-6">
           <div className="flex flex-wrap gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-40 h-40 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 gap-2 overflow-hidden relative group">
                   <ImageIcon className="w-8 h-8" />
                   <span className="text-[10px] font-bold uppercase">Sơ đồ {i}</span>
                   {isAdmin && (
                      <button className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all hover:bg-red-50">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   )}
                </div>
              ))}
              <div className="w-40 h-40 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                 <Plus className="w-8 h-8" />
              </div>
           </div>
        </div>
      </section>

      {/* Repair History Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
            Theo dõi bảo trì & Sửa chữa
          </h3>
          <div className="flex gap-2">
             <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200">
                <History className="w-5 h-5" />
             </button>
             <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200">
                <PenTool className="w-5 h-5" />
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên máy / Linh kiện</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã máy</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Người quản lý</th>
                    <th className="p-4 w-16"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {repairs.map((r, i) => (
                    <tr key={r.id} className="hover:bg-red-50/10 group transition-colors">
                       <td className="p-4 text-sm font-bold text-gray-400">{i+1}</td>
                       <td className="p-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-gray-800">{r.name}</span>
                             <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Bảo trì định kỳ</span>
                          </div>
                       </td>
                       <td className="p-4 text-sm font-mono text-gray-600 bg-gray-50/50 rounded inline-block my-4 ml-4">#{r.code}</td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-[10px] font-black text-red-700">ID</div>
                             <span className="text-sm font-bold text-gray-600">{r.managerId}</span>
                          </div>
                       </td>
                       <td className="p-4 text-right">
                          <button className="p-2 text-gray-300 hover:text-blue-600 rounded-lg group-hover:bg-white transition-all shadow-sm">
                             <Plus className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>
    </div>
  );
}
