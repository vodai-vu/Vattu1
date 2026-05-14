import { Trash2, Plus, Search } from 'lucide-react';

export default function ThanhLyTab() {
  return (
    <div className="bg-white h-full rounded-3xl shadow-sm border border-gray-100 flex flex-col p-8 overflow-hidden">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-100">
                <Trash2 className="w-8 h-8 text-white" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900">Thanh lý thiết bị</h2>
                <p className="text-sm text-gray-500 font-medium">Danh sách thiết bị đã hoặc đang chờ thanh lý</p>
             </div>
          </div>
          <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 hover:bg-red-700">Tạo phiếu thanh lý</button>
       </div>
       
       <div className="flex-1 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300 gap-4">
          <Trash2 className="w-16 h-16" />
          <p className="font-bold uppercase tracking-widest text-xs">Hiện tại chưa có dữ liệu thanh lý</p>
       </div>
    </div>
  );
}
