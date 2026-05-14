import { useState, useEffect } from 'react';
import { AirVent, Plus, Trash2, Search, Warehouse } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

export default function DieuHoaTab() {
  const [acTypes, setAcTypes] = useState([
    { id: '1', name: 'Daikin Inverter 2HP', type: 'Treo tường', specs: 'Gas R32, Tiết kiệm điện' },
    { id: '2', name: 'Panasonic 1HP', type: 'Treo tường', specs: 'Nanoe-G lọc khí' },
  ]);

  const [acMgmt, setAcMgmt] = useState([
    { id: 'm1', department: 'Khoa Nhi', name: 'Daikin Inverter 2HP', quantity: 2, price: 15000000, status: 'Hoạt động', location: 'Phòng trực bác sĩ' },
    { id: 'm2', department: 'Cấp Cứu', name: 'Panasonic 1HP', quantity: 4, price: 9000000, status: 'Cần vệ sinh', location: 'Phòng bệnh 101' },
  ]);

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar">
      {/* Table 1: Loại Điều hoà */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-sky-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <AirVent className="w-6 h-6 text-sky-600" /> Loại Điều hoà
          </h3>
          <button className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-sm">
            Thêm loại mới
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại máy</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông số</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {acTypes.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                <td className="p-4 text-sm font-black text-gray-800">{t.name}</td>
                <td className="p-4 text-sm text-gray-600">{t.type}</td>
                <td className="p-4 text-xs font-medium text-gray-500 bg-sky-50 px-2 py-1 rounded inline-block my-3 ml-4">{t.specs}</td>
                <td className="p-4"><button className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Table 2: Quản lý Điều hoà */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" /> Quản lý Điều hoà
          </h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Khoa/Phòng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">Stt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Điều hoà</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số lượng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn giá</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành tiền</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tình trạng</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {acMgmt.map((m, i) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                       <td className="p-4 text-sm font-black text-sky-800">{m.department}</td>
                       <td className="p-4 text-xs font-bold text-gray-400">{i+1}</td>
                       <td className="p-4 text-sm font-bold text-gray-700">{m.name}</td>
                       <td className="p-4 text-sm font-bold">{m.quantity}</td>
                       <td className="p-4 text-sm text-gray-500">{formatCurrency(m.price)}</td>
                       <td className="p-4 text-sm font-black text-blue-600">{formatCurrency(m.price * m.quantity)}</td>
                       <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold",
                            m.status === 'Hoạt động' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          )}>{m.status}</span>
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
