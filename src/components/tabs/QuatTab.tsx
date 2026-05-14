import { useState, useEffect } from 'react';
import { Wind, Plus, Trash2, Search, Warehouse, Building2, Terminal } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

export default function QuatTab() {
  const [fanTypes, setFanTypes] = useState([
    { id: '1', name: 'Quạt trần Vinawind', type: 'Quạt trần', specs: 'Sải cánh 1.4m' },
    { id: '2', name: 'Quạt treo tường Senko', type: 'Quạt treo', specs: '3 tốc độ' },
  ]);

  const [fanMgmt, setFanMgmt] = useState([
    { id: 'm1', department: 'Khoa Nội', name: 'Quạt trần Vinawind', quantity: 10, price: 1200000, status: 'Hoạt động', location: 'Trần phòng bệnh' },
    { id: 'm2', department: 'Khoa Ngoại', name: 'Quạt treo tường Senko', quantity: 5, price: 500000, status: 'Dự phòng', location: 'Tường hành lang' },
  ]);

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar">
      {/* Table 1: Loại quạt */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Wind className="w-6 h-6 text-blue-600" /> Loại quạt
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-100">
            Thêm loại mới
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại quạt</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông số</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fanTypes.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                <td className="p-4 text-sm font-black text-gray-800">{t.name}</td>
                <td className="p-4 text-sm text-gray-600">{t.type}</td>
                <td className="p-4 text-xs font-medium text-gray-500 bg-gray-50/50 rounded inline-block my-3 ml-4">{t.specs}</td>
                <td className="p-4"><button className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Table 2: Quản lý quạt */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-600" /> Quản lý quạt
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Tìm theo khoa/phòng..." className="pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Khoa/Phòng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Quạt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số lượng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn giá</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành tiền</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tình trạng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {fanMgmt.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                       <td className="p-4 text-sm font-black text-blue-800">{m.department}</td>
                       <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                       <td className="p-4 text-sm font-bold text-gray-700">{m.name}</td>
                       <td className="p-4 text-sm font-bold">{m.quantity}</td>
                       <td className="p-4 text-sm text-gray-500">{formatCurrency(m.price)}</td>
                       <td className="p-4 text-sm font-black text-emerald-600">{formatCurrency(m.price * m.quantity)}</td>
                       <td className="p-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold">{m.status}</span>
                       </td>
                       <td className="p-4 text-xs text-gray-500 italic">{m.location}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>
    </div>
  );
}
