import { useState } from 'react';
import { Zap, Calculator, FileText, Image as ImageIcon, MapPin, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function MayPhatTab() {
  const [generators, setGenerators] = useState([
    { id: '1', name: 'Cummins 500kVA', type: 'Diesel', specs: '3 pha, 400V', location: 'Nhà máy phát khu K', powerTo: 'Khu K, Khu D, Cấp cứu', calc: 'Tải định mức: 400kW' },
    { id: '2', name: 'Denyo 200kVA', type: 'Diesel', specs: '3 pha, 400V', location: 'Sân sau khu 11 tầng', powerTo: 'Khu 11 tầng', calc: 'Tải định mức: 160kW' },
  ]);

  const isAdmin = true; // Replace with actual check

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar">
      {/* Table: Máy phát */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-yellow-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" /> Hệ thống Máy phát điện
          </h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên máy</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại máy</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông số</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí đặt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cấp điện cho</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tính toán (Admin)</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {generators.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                       <td className="p-4 text-sm font-black text-gray-900">{g.name}</td>
                       <td className="p-4 text-sm text-gray-600">{g.type}</td>
                       <td className="p-4 text-xs font-medium text-gray-500">{g.specs}</td>
                       <td className="p-4 text-sm font-medium text-blue-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {g.location}
                       </td>
                       <td className="p-4 text-sm text-gray-600 italic">{g.powerTo}</td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 bg-gray-50 p-2 rounded text-[10px] font-mono border border-gray-100 min-h-[40px]">
                                {g.calc}
                             </div>
                             {isAdmin && (
                                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                   <Settings className="w-4 h-4" />
                                </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>

      {/* Sub-sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
         {/* Tính toán dầu nhớt */}
         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-orange-50 rounded-xl"><Calculator className="w-6 h-6 text-orange-600" /></div>
               <h4 className="font-bold text-gray-800">Tính toán dầu nhớt máy phát</h4>
            </div>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tiêu hao định mức</label>
                     <input type="text" placeholder="0.21 L/kWh" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Thời gian chạy</label>
                     <input type="text" placeholder="Giờ" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  </div>
               </div>
               <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs text-orange-700 font-bold mb-1">Kết quả dự kiến:</p>
                  <p className="text-2xl font-black text-orange-900">0.00 Lít</p>
               </div>
            </div>
         </section>

         {/* Tính toán máy phát điện */}
         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-yellow-50 rounded-xl"><Calculator className="w-6 h-6 text-yellow-600" /></div>
               <h4 className="font-bold text-gray-800">Tính toán máy phát điện</h4>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Chọn máy phát</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none">
                     {generators.map(g => <option key={g.id}>{g.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tải sử dụng hiện tại (A)</label>
                  <input type="text" placeholder="Ampe" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
               </div>
               <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <p className="text-xs text-yellow-700 font-bold mb-1">Phần trăm tải:</p>
                  <p className="text-2xl font-black text-yellow-900">0.0%</p>
               </div>
            </div>
         </section>

         {/* Sơ đồ máy phát */}
         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-blue-50 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
               <h4 className="font-bold text-gray-800">Sơ đồ máy phát</h4>
            </div>
            <div className="flex-1 min-h-[150px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
               <ImageIcon className="w-10 h-10" />
               <span className="text-xs font-bold uppercase tracking-widest">Bấm để tải sơ đồ</span>
            </div>
         </section>
      </div>
    </div>
  );
}
