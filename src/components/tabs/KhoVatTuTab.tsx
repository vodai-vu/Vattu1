import { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Warehouse, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Image as ImageIcon,
  MoreVertical,
  PlusCircle,
  Hash,
  Clock,
  Layout
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { Personnel } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  inputTime: string;
  input: number;
  output: number;
  stock: number;
  image?: string;
  note?: string;
}

interface WarehouseUnit {
  id: string;
  name: string;
  location: string;
  canEdit: boolean;
  isCustom?: boolean;
}

export default function KhoVatTuTab() {
  const [warehouses, setWarehouses] = useState<WarehouseUnit[]>([
    { id: 'k11', name: 'Kho khu 11 tầng', location: 'Khu 11 tầng', canEdit: true },
    { id: 'p15', name: 'Phòng sửa chữa 15 tầng', location: 'Khu 15 tầng', canEdit: true },
    { id: 'ka-trung', name: 'Kho a Trưng', location: 'Khu D', canEdit: false },
    { id: 'ka-phu', name: 'Kho a Phú (Quạt)', location: 'Khu D', canEdit: true },
    { id: 'ka-duc', name: 'Kho a Đức (Điều hoà)', location: 'Khu D', canEdit: true },
  ]);
  const [activeWarehouse, setActiveWarehouse] = useState(warehouses[0].id);
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [search, setSearch] = useState('');
  const [showImageSearch, setShowImageSearch] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<'input' | 'output' | null>(null);
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);

  useEffect(() => {
    // In a real app, items would be filtered by activeWarehouse in Firestore
    const dummyItems: WarehouseItem[] = [
      { id: '1', name: 'Bóng đèn LED 1.2m', code: 'VT001', inputTime: '2024-05-10', input: 100, output: 20, stock: 80 },
      { id: '2', name: 'Công tắc đơn Panasonic', code: 'VT002', inputTime: '2024-05-12', input: 50, output: 10, stock: 40 },
      { id: '3', name: 'Ổ cắm 3 chấu', code: 'VT003', inputTime: '2024-05-14', input: 30, output: 5, stock: 25 },
    ];
    setItems(dummyItems);
  }, [activeWarehouse]);

  const currentWarehouse = warehouses.find(w => w.id === activeWarehouse);

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Left - Warehouse List (25%) */}
      <div className="w-1/4 border-r border-gray-100 bg-gray-50/50 flex flex-col pt-6 overflow-hidden">
        <div className="px-6 mb-6">
           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-blue-600" /> Danh sách Kho
           </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <label className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Kho mặc định</label>
          {warehouses.filter(w => !w.isCustom).map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWarehouse(w.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm transition-all group relative",
                activeWarehouse === w.id 
                  ? "bg-white border border-gray-200 shadow-md text-blue-700 font-bold" 
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{w.name}</span>
                {w.canEdit && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>}
              </div>
              <p className={cn("text-[10px] font-medium mt-0.5", activeWarehouse === w.id ? "text-blue-400" : "text-gray-400")}>
                {w.location}
              </p>
            </button>
          ))}

          <div className="pt-6 pb-2">
            <label className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">User tự tạo</label>
          </div>
          {warehouses.filter(w => w.isCustom).map(w => (
             <button
              key={w.id}
              onClick={() => setActiveWarehouse(w.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm transition-all shadow-sm",
                activeWarehouse === w.id ? "bg-indigo-600 text-white font-bold" : "bg-white text-gray-600 border border-gray-100"
              )}
            >
              {w.name}
            </button>
          ))}

          <button 
            onClick={() => setWarehouses([...warehouses, { id: 'cust-' + Date.now(), name: 'Kho mới của tôi', location: 'Tùy chỉnh', canEdit: true, isCustom: true }])}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 transition-all mt-4"
          >
            <PlusCircle className="w-4 h-4" /> Tạo kho mới
          </button>
        </div>
      </div>

      {/* Right - Content (75%) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm vật tư, mã hàng, ngày nhập..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => setShowImageSearch(!showImageSearch)}
              className={cn(
                "p-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all shadow-sm",
                showImageSearch ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <ImageIcon className="w-5 h-5" /> Tìm qua ảnh
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-4 gap-4 bg-gray-50/30 overflow-hidden shrink-0">
           {[
             { label: 'Tổng mặt hàng', value: items.length, icon: Package, color: 'blue' },
             { label: 'Tổng nhập', value: items.reduce((a, b) => a + b.input, 0), icon: ArrowUpRight, color: 'green' },
             { label: 'Tổng xuất', value: items.reduce((a, b) => a + b.output, 0), icon: ArrowDownLeft, color: 'orange' },
             { label: 'Tồn kho', value: items.reduce((a, b) => a + b.stock, 0), icon: Layout, color: 'indigo' },
           ].map(stat => (
             <div key={stat.label} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", `bg-${stat.color}-50`)}>
                   <stat.icon className={cn("w-6 h-6", `text-${stat.color}-600`)} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                   <p className="text-xl font-black text-gray-800">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Main Table */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth custom-scrollbar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-[900px]">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-gray-50/50">
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">Tên vật tư</th>
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">Mã số</th>
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">Thời gian nhập</th>
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-center text-green-600 uppercase tracking-widest">Nhập</th>
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-center text-orange-600 uppercase tracking-widest">Xuất</th>
                      <th className="p-4 border-b border-gray-100 text-xs font-bold text-center text-blue-600 uppercase tracking-widest">Tồn</th>
                      <th className="p-4 border-b border-gray-100 w-16"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {items.map(item => (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden bg-cover bg-center" style={item.image ? {backgroundImage: `url(${item.image})`} : {}}>
                                  {!item.image && <Package className="w-5 h-5" />}
                               </div>
                               <span className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{item.name}</span>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-sm bg-gray-50 px-2 py-1 rounded w-fit">
                               <Hash className="w-3.5 h-3.5" />
                               {item.code}
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                               <Clock className="w-3.5 h-3.5" />
                               {item.inputTime}
                            </div>
                         </td>
                         <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <span className="font-bold text-green-700">{item.input}</span>
                               <button 
                                onClick={() => { setModalType('input'); setSelectedItem(item); }}
                                className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                               >
                                  <Plus className="w-3.5 h-3.5" />
                               </button>
                            </div>
                         </td>
                         <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <span className="font-bold text-orange-700">{item.output}</span>
                               <button 
                                onClick={() => { setModalType('output'); setSelectedItem(item); }}
                                className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-100"
                               >
                                  <Minus className="w-3.5 h-3.5" />
                               </button>
                            </div>
                         </td>
                         <td className="p-4 text-center">
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-lg font-black text-blue-700 bg-blue-50 border border-blue-100",
                              item.stock < 10 && "bg-red-50 text-red-700 border-red-100"
                            )}>
                               {item.stock}
                            </span>
                         </td>
                         <td className="p-4 text-right">
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                               <MoreVertical className="w-4 h-4" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden relative"
             >
                <div className={cn("absolute top-0 left-0 w-full h-1.5", modalType === 'input' ? "bg-green-500" : "bg-orange-500")}></div>
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      {modalType === 'input' ? <Plus className="w-6 h-6 text-green-600" /> : <Minus className="w-6 h-6 text-orange-600" />}
                      Phiếu {modalType === 'input' ? 'Nhập' : 'Xuất'} Vật Tư
                   </h3>
                   <button onClick={() => setModalType(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <Minus className="w-5 h-5 text-gray-400" />
                   </button>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Tên vật tư</label>
                      <input type="text" value={selectedItem?.name} readOnly className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none font-bold text-gray-800" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Số lượng</label>
                        <input type="number" placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Thời gian</label>
                        <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Hình ảnh chi tiết</label>
                      <div className="border-2 border-dashed border-gray-100 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
                         <ImageIcon className="w-8 h-8" />
                         <span className="text-xs font-medium">Bấm để tải ảnh lên</span>
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Ghi chú</label>
                      <textarea placeholder="Tại sao nhập/xuất vật tư này?..." className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"></textarea>
                   </div>
                </div>

                <div className="mt-10 flex gap-3">
                   <button onClick={() => setModalType(null)} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">Hủy bỏ</button>
                   <button className={cn("flex-2 py-4 text-sm font-black text-white rounded-2xl shadow-lg transition-all transform active:scale-95", modalType === 'input' ? "bg-green-600 hover:bg-green-700 shadow-green-200" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200")}>
                      Xác nhận {modalType === 'input' ? 'Nhập' : 'Xuất'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
