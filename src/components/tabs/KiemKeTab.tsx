import { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  Maximize2, 
  Minimize2, 
  Search,
  Filter,
  Check,
  X,
  History,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn, formatCurrency } from '../../lib/utils';
import { Equipment } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const ALL_COLUMNS = [
  { id: 'stt', label: 'Stt' },
  { id: 'name', label: 'Tên thiết bị' },
  { id: 'images', label: 'Hình ảnh' },
  { id: 'model', label: 'Model' },
  { id: 'manufacturer', label: 'Công ty SX' },
  { id: 'country', label: 'Nước SX' },
  { id: 'yearOfManufacture', label: 'Năm SX' },
  { id: 'yearOfUse', label: 'Năm SD' },
  { id: 'quantity', label: 'SL' },
  { id: 'valuePercentage', label: '% Giá trị TS' },
  { id: 'status', label: 'Tình trạng thiết bị' },
  { id: 'source', label: 'Nguồn' },
  { id: 'note', label: 'Ghi chú' },
  { id: 'department', label: 'Đơn vị SD' },
  { id: 'departmentNote', label: 'Ghi chú (ĐV)' },
  { id: 'originalPrice', label: 'Nguyên giá' },
  { id: 'totalValue', label: 'Thành tiền' },
  { id: 'handoverDate', label: 'Ngày BG' },
  { id: 'supplier', label: 'Nhà cung cấp' },
  { id: 'repairHistory', label: 'Ghi chú sửa chữa' },
  { id: 'bookNumber', label: 'Quyển số' },
  { id: 'pageNumber', label: 'Trang số' },
];

export default function KiemKeTab() {
  const [data, setData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>(() => {
    const defaultVisible: { [key: string]: boolean } = {};
    ALL_COLUMNS.forEach(col => defaultVisible[col.id] = true);
    return defaultVisible;
  });
  const [imageSize, setImageSize] = useState<'icon' | 'preview'>('icon');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      console.log("Captured photo:", dataUrl);
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  // Suggested values for autocompletes
  const [suggestions, setSuggestions] = useState({
    name: ['máy mê', 'máy thở', 'bàn mổ', 'máy siêu âm', 'máy X-quang'],
    department: ['Khoa Nội', 'Khoa Ngoại', 'Phòng Cấp Cứu', 'Khoa Nhi'],
    model: [],
    manufacturer: [],
    country: [],
    status: ['Hoạt động tốt', 'Hư hỏng', 'Không sửa được', 'Dự phòng'],
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'equipment'), 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
        setData(items);
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'equipment')
    );

    // Fetch user preferences
    const fetchPrefs = async () => {
      if (auth.currentUser) {
        const prefDoc = await getDoc(doc(db, 'userPreferences', auth.currentUser.uid));
        if (prefDoc.exists()) {
          const prefs = prefDoc.data();
          if (prefs.visibleColumns) {
            setVisibleColumns(prefs.visibleColumns);
          }
        }
      }
    };
    fetchPrefs();

    return unsub;
  }, []);

  const toggleColumn = async (colId: string) => {
    const newVisible = { ...visibleColumns, [colId]: !visibleColumns[colId] };
    setVisibleColumns(newVisible);
    
    // Save to Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'userPreferences', auth.currentUser.uid), {
          visibleColumns: newVisible
        }, { merge: true });
      } catch (error) {
        console.error('Failed to save preferences', error);
      }
    }
  };

  const calculateTotalValue = (price: number, quantity: number) => price * quantity;

  const handleUpdate = async (id: string, updates: Partial<Equipment>) => {
    try {
      await updateDoc(doc(db, 'equipment', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `equipment/${id}`);
    }
  };

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.model?.toLowerCase().includes(search.toLowerCase()) ||
    item.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm thiết bị (máy mê, máy thở...)" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setImageSize('preview')}
              className={cn("p-2 rounded-lg flex items-center gap-2 text-sm font-medium", imageSize === 'preview' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}
            >
              <Maximize2 className="w-4 h-4" /> Phóng to
            </button>
            <button 
              onClick={() => setImageSize('icon')}
              className={cn("p-2 rounded-lg flex items-center gap-2 text-sm font-medium", imageSize === 'icon' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}
            >
              <Minimize2 className="w-4 h-4" /> Thu nhỏ
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-2 bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" /> Thêm mới
            </button>
          </div>
        </div>

        {/* Column Toggles */}
        <div className="flex flex-wrap gap-2">
          {ALL_COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => toggleColumn(col.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                visibleColumns[col.id] 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              )}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              {ALL_COLUMNS.map(col => visibleColumns[col.id] && (
                <th key={col.id} className="p-3 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider w-[150px]">
                  {col.label}
                </th>
              ))}
              <th className="p-3 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider w-[80px] sticky right-0 bg-gray-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">
                Tác vụ
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.map((item, index) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {visibleColumns.stt && <td className="p-3 border-b border-gray-100 text-sm">{index + 1}</td>}
                  {visibleColumns.name && (
                    <td className="p-3 border-b border-gray-100 text-sm font-medium text-gray-800">
                      {item.name}
                    </td>
                  )}
                  {visibleColumns.images && (
                    <td className="p-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        {imageSize === 'preview' ? (
                          <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] custom-scrollbar">
                            {item.images?.map((img, i) => (
                              <img key={i} src={img} className="h-10 w-10 rounded border object-cover shrink-0" alt="Device" />
                            ))}
                            <button className="h-10 w-10 border border-dashed rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                             <ImageIcon className="w-5 h-5 text-gray-400" />
                             <Camera 
                              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500" 
                              onClick={startCamera}
                             />
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.model && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.model}</td>}
                  {visibleColumns.manufacturer && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.manufacturer}</td>}
                  {visibleColumns.country && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.country}</td>}
                  {visibleColumns.yearOfManufacture && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.yearOfManufacture}</td>}
                  {visibleColumns.yearOfUse && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.yearOfUse}</td>}
                  {visibleColumns.quantity && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.quantity}</td>}
                  {visibleColumns.valuePercentage && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.valuePercentage}%</td>}
                  {visibleColumns.status && (
                    <td className="p-3 border-b border-gray-100 text-sm">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        item.status === 'Hư hỏng' ? "bg-red-100 text-red-700" :
                        item.status === 'Không sửa được' ? "bg-gray-100 text-gray-700" :
                        "bg-green-100 text-green-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.source && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{item.source}</td>}
                  {visibleColumns.note && <td className="p-3 border-b border-gray-100 text-sm text-gray-600 truncate">{item.note}</td>}
                  {visibleColumns.department && <td className="p-3 border-b border-gray-100 text-sm text-blue-600 font-medium">{item.department}</td>}
                  {visibleColumns.departmentNote && <td className="p-3 border-b border-gray-100 text-sm text-gray-500 italic">{item.departmentNote}</td>}
                  {visibleColumns.originalPrice && <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{formatCurrency(item.originalPrice || 0)}</td>}
                  {visibleColumns.totalValue && (
                    <td className="p-3 border-b border-gray-100 text-sm font-semibold text-blue-700">
                      {formatCurrency(calculateTotalValue(item.originalPrice || 0, item.quantity || 0))}
                    </td>
                  )}
                  {visibleColumns.handoverDate && <td className="p-3 border-b border-gray-100 text-sm text-gray-500">{item.handoverDate}</td>}
                  {visibleColumns.supplier && <td className="p-3 border-b border-gray-100 text-sm text-gray-500">{item.supplier}</td>}
                  {visibleColumns.repairHistory && (
                    <td className="p-3 border-b border-gray-100">
                      <button className="text-gray-400 hover:text-blue-600">
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                  {visibleColumns.bookNumber && <td className="p-3 border-b border-gray-100 text-sm text-gray-500">{item.bookNumber}</td>}
                  {visibleColumns.pageNumber && <td className="p-3 border-b border-gray-100 text-sm text-gray-500">{item.pageNumber}</td>}
                  
                  <td className="p-3 border-b border-gray-100 sticky right-0 bg-white group-hover:bg-blue-50/30 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Stats/Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
        <div>Tổng số: {filteredData.length} thiết bị</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Hoạt động: {data.filter(d => d.status !== 'Hư hỏng').length}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Hỏng: {data.filter(d => d.status === 'Hư hỏng').length}</span>
        </div>
      </div>

      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Chụp ảnh thiết bị</h3>
                <button onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(track => track.stop());
                  setShowCamera(false);
                }} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="aspect-video bg-black relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button 
                  onClick={capturePhoto}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-xl flex items-center justify-center hover:scale-110 transition active:scale-95"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-gray-400"></div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
