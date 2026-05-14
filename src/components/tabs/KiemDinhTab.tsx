import { ShieldCheck, Plus, Search } from 'lucide-react';

export default function KiemDinhTab() {
  return (
    <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 flex flex-col p-8 overflow-hidden">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                <ShieldCheck className="w-8 h-8 text-white" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900">Kiểm định thiết bị</h2>
                <p className="text-sm text-gray-500 font-medium">Theo dõi thời hạn và chứng nhận kiểm định</p>
             </div>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700">Thêm hồ sơ kiểm định</button>
       </div>
       
       <div className="flex-1 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300 gap-4">
          <ShieldCheck className="w-16 h-16" />
          <p className="font-bold uppercase tracking-widest text-xs">Hiện tại chưa có dữ liệu kiểm định</p>
       </div>
    </div>
  );
}
