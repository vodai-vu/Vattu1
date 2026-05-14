import React, { useState, useEffect } from 'react';
import { Zap, Calculator, FileText, Image as ImageIcon, MapPin, Settings, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Generator } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function MayPhatTab() {
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Generator>>({
    name: '',
    type: 'Diesel',
    specs: '',
    location: '',
    powerTo: '',
    calc: ''
  });

  const [calcOil, setCalcOil] = useState({ consumption: 0.21, time: 0 });
  const [calcLoad, setCalcLoad] = useState({ generatorIndex: 0, currentAmps: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'generators'), (snap) => {
      setGenerators(snap.docs.map(d => ({ id: d.id, ...d.data() } as Generator)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'generators'));
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'generators', editingId), formData);
      } else {
        await addDoc(collection(db, 'generators'), { ...formData, deleted: false });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', type: 'Diesel', specs: '', location: '', powerTo: '', calc: '' });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'generators');
    }
  };

  const handleEdit = (g: Generator) => {
    setEditingId(g.id);
    setFormData(g);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Xóa máy phát ${name}?`)) {
      try {
        await updateDoc(doc(db, 'generators', id), { deleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `generators/${id}`);
      }
    }
  };

  const filtered = generators.filter(g => !g.deleted);

  const oilResult = (calcOil.consumption * calcOil.time).toFixed(2);
  const currentGen = generators[calcLoad.generatorIndex];
  const loadResult = currentGen ? ((calcLoad.currentAmps / 720) * 100).toFixed(1) : 0; // Mock calculation

  return (
    <div className="flex flex-col h-full gap-8 overflow-auto custom-scrollbar p-1">
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-yellow-50/30">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" /> Hệ thống Máy phát điện
          </h3>
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); }}
            className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-yellow-100 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm máy phát
          </button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên máy</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông số</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vị trí đặt</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cấp điện cho</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ghi chú (Calc)</th>
                    <th className="p-4 w-20"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filtered.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 group transition-colors">
                       <td className="p-4 text-sm font-black text-gray-900">{g.name}</td>
                       <td className="p-4 text-sm text-gray-600">{g.type}</td>
                       <td className="p-4 text-xs font-medium text-gray-500">{g.specs}</td>
                       <td className="p-4 text-sm font-medium text-blue-600">
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {g.location}</div>
                       </td>
                       <td className="p-4 text-sm text-gray-600 italic">{g.powerTo}</td>
                       <td className="p-4">
                          <div className="bg-gray-50 p-2 rounded text-[10px] font-mono border border-gray-100 min-h-[40px]">
                             {g.calc}
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(g.id, g.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-orange-50 rounded-xl"><Calculator className="w-6 h-6 text-orange-600" /></div>
               <h4 className="font-bold text-gray-800">Tính toán dầu nhớt</h4>
            </div>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tiêu hao định mức</label>
                     <input type="number" step="0.01" value={calcOil.consumption} onChange={e => setCalcOil({...calcOil, consumption: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Thời gian chạy (Giờ)</label>
                     <input type="number" value={calcOil.time} onChange={e => setCalcOil({...calcOil, time: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  </div>
               </div>
               <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs text-orange-700 font-bold mb-1">Dự kiến:</p>
                  <p className="text-2xl font-black text-orange-900">{oilResult} Lít</p>
               </div>
            </div>
         </section>

         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-yellow-50 rounded-xl"><Zap className="w-6 h-6 text-yellow-600" /></div>
               <h4 className="font-bold text-gray-800">Kiểm tra % tải</h4>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Chọn máy phát</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                    onChange={e => setCalcLoad({...calcLoad, generatorIndex: parseInt(e.target.value)})}
                  >
                     {filtered.map((g, idx) => <option key={g.id} value={idx}>{g.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tải hiện tại (A)</label>
                  <input type="number" value={calcLoad.currentAmps} onChange={e => setCalcLoad({...calcLoad, currentAmps: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
               </div>
               <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <p className="text-xs text-yellow-700 font-bold mb-1">Phần trăm tải:</p>
                  <p className="text-2xl font-black text-yellow-900">{loadResult}%</p>
               </div>
            </div>
         </section>

         <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-blue-50 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
               <h4 className="font-bold text-gray-800">Sơ đồ máy phát</h4>
            </div>
            <div className="flex-1 min-h-[150px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
               <ImageIcon className="w-10 h-10" />
               <span className="text-xs font-bold uppercase tracking-widest">Tải sơ đồ thiết kế</span>
            </div>
         </section>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold">{editingId ? 'Sửa máy phát' : 'Thêm máy phát mới'}</h3>
                  <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên máy</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại</label>
                      <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thông số</label>
                    <input type="text" value={formData.specs} onChange={e => setFormData({...formData, specs: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vị trí</label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cấp điện cho</label>
                      <input type="text" value={formData.powerTo} onChange={e => setFormData({...formData, powerTo: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú tính toán</label>
                    <textarea value={formData.calc} onChange={e => setFormData({...formData, calc: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl h-20" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-yellow-600 text-white font-bold rounded-xl shadow-lg">Lưu máy phát</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
