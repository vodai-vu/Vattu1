import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Save, 
  Undo, 
  Plus, 
  Trash2, 
  Printer, 
  Calendar as CalendarIcon,
  User as UserIcon,
  Circle
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  getDay
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Solar, Lunar } from 'lunar-javascript';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Personnel, DutySchedule } from '../../types';

type MenuState = 'lich-truc' | 'ban-nhap' | 'chinh-sua' | 'trang-in';
type LocationState = 'CS1' | 'CS2' | 'CS3';

export default function LichTab() {
  const [activeMenu, setActiveMenu] = useState<MenuState>('lich-truc');
  const [location, setLocation] = useState<LocationState>('CS1');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLunar, setShowLunar] = useState(false);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);

  useEffect(() => {
    const unsubPersonnel = onSnapshot(collection(db, 'personnel'), (snap) => {
      setPersonnel(snap.docs.map(d => ({ id: d.id, ...d.data() } as Personnel)));
    });

    const unsubSchedules = onSnapshot(collection(db, 'dutySchedules'), (snap) => {
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as DutySchedule)));
    });

    return () => {
      unsubPersonnel();
      unsubSchedules();
    };
  }, []);

  const isAdmin = true; // Replace with actual check

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Left Menu (25%) */}
      <div className="w-1/4 min-w-[280px] border-r border-gray-100 flex flex-col p-4 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" /> Quản lý lịch
        </h3>
        
        <div className="space-y-2 mb-8">
          {[
            { id: 'lich-truc', label: 'Lịch trực', adminOnly: false },
            { id: 'ban-nhap', label: 'Bản nháp lịch', adminOnly: false },
            { id: 'chinh-sua', label: 'Chỉnh sửa lịch', adminOnly: true },
            { id: 'trang-in', label: 'Trang in', adminOnly: true },
          ].map(item => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as MenuState)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeMenu === item.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Chọn cơ sở</label>
          <div className="grid grid-cols-1 gap-1">
            {['CS1', 'CS2', 'CS3'].map(cs => (
              <button
                key={cs}
                onClick={() => setLocation(cs as LocationState)}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg text-left transition-colors",
                  location === cs ? "bg-white border border-gray-200 shadow-sm font-bold text-blue-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {cs === 'CS1' ? 'Cơ sở 1 (11 tầng)' : cs === 'CS2' ? 'Cơ sở 2 (15 tầng)' : 'Cơ sở 3 (Khu D)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content (75%) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-bold text-gray-800 capitalize min-w-[150px] text-center">
              Tháng {format(currentMonth, 'MM/yyyy')}
            </h4>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-sm py-1 px-3 bg-gray-50 rounded-full border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Hôm nay
             </div>
             <button 
              onClick={() => setShowLunar(!showLunar)}
              className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-all", showLunar ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-500 border-gray-200")}
             >
                Âm lịch: {showLunar ? 'Bật' : 'Tắt'}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          {activeMenu === 'lich-truc' && <LichTrucView currentMonth={currentMonth} showLunar={showLunar} schedules={schedules} />}
          {activeMenu === 'chinh-sua' && <ChinhSuaLichView currentMonth={currentMonth} schedules={schedules} personnel={personnel} />}
          {activeMenu === 'trang-in' && <TrangInView currentMonth={currentMonth} schedules={schedules} personnel={personnel} />}
        </div>
      </div>
    </div>
  );
}

function LichTrucView({ currentMonth, showLunar, schedules }: { currentMonth: Date, showLunar: boolean, schedules: DutySchedule[] }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  const weekdays = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Chủ Nhật'];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  return (
    <div className="w-full flex flex-col h-full bg-white">
      <div className="grid grid-cols-7 border-t border-l border-gray-100">
        {weekdays.map(d => (
          <div key={d} className="p-2 text-center text-xs font-bold text-gray-500 border-r border-b border-gray-100 bg-gray-50 uppercase tracking-wider">
            {d}
          </div>
        ))}
        {rows.map((row, i) => (
          row.map((day, j) => {
            const isToday = isSameDay(day, new Date());
            const schedule = schedules.find(s => isSameDay(new Date(s.date), day));
            const solar = Solar.fromDate(day);
            const lunar = Lunar.fromDate(day);
            const isHoliday = schedule?.isHoliday;

            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-gray-100 flex flex-col transition-colors",
                  !isSameMonth(day, monthStart) ? "bg-gray-50/30" : "bg-white",
                  isToday && "ring-2 ring-blue-400 ring-inset shadow-lg shadow-blue-100 z-10",
                  isHoliday && (schedule?.holidayType === 'tet' ? "bg-yellow-50" : "bg-orange-50")
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-blue-600 text-white" : "text-gray-700"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {showLunar && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {lunar.getDay() === 1 ? `${lunar.getDay()}/${lunar.getMonth()}` : lunar.getDay()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  {schedule ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-1.5 rounded-r">
                      <p className="text-xs font-bold text-blue-900 truncate">{schedule.userName}</p>
                      <p className="text-[10px] text-blue-700">Tua {schedule.turn} - Nhóm {schedule.group}</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                       <Plus className="w-4 h-4 text-gray-100 group-hover:text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
        <h5 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Tạm tính tiền trực</h5>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <span className="text-sm text-gray-600">Tiền trực ngày thường:</span>
              <span className="font-bold text-gray-900">{formatCurrency(110000)}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <span className="text-sm text-gray-600">Tiền trực T7, CN:</span>
              <span className="font-bold text-gray-900">{formatCurrency(130000)}</span>
            </div>
          </div>
          <div className="space-y-4">
             <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-orange-800">Lễ Thường</span>
                  <span className="font-bold text-orange-900">{formatCurrency(165000)}</span>
                </div>
                <p className="text-xs text-orange-700">Chọn các ngày lễ trong tháng...</p>
             </div>
             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-yellow-800">Lễ Tết</span>
                  <span className="font-bold text-yellow-900">{formatCurrency(230000)}</span>
                </div>
                <p className="text-xs text-yellow-700">Chọn các ngày tết (Nguyên Đán)...</p>
             </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
           <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition">Lưu cài đặt</button>
        </div>
      </div>
    </div>
  );
}

function ChinhSuaLichView({ currentMonth, schedules, personnel }: { currentMonth: Date, schedules: DutySchedule[], personnel: Personnel[] }) {
  const [numTurns, setNumTurns] = useState(4);
  
  return (
    <div className="space-y-8 pb-20">
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h5 className="font-bold text-gray-800">Thiết lập nhóm và tua trực</h5>
            <select 
              value={numTurns} 
              onChange={(e) => setNumTurns(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Tua trực</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2">
              <Undo className="w-4 h-4" /> Hoàn tác
            </button>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
              Lưu bản nháp
            </button>
            <button className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm">
              Lưu cấu hình
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">Xoá</th>
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">Stt</th>
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">Tên NV</th>
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">SĐT</th>
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">Nhóm</th>
              <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase">Tua</th>
            </tr>
          </thead>
          <tbody>
            {personnel.slice(0, 5).map((p, i) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border-b"><button className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                <td className="p-3 border-b text-sm">{i+1}</td>
                <td className="p-3 border-b text-sm font-medium">{p.name}</td>
                <td className="p-3 border-b text-sm text-gray-500">{p.phone}</td>
                <td className="p-3 border-b">
                   <select className="px-2 py-1 text-xs border rounded bg-white">
                      {[1,2,3,4].map(g => <option key={g} value={g}>Nhóm {g}</option>)}
                   </select>
                </td>
                <td className="p-3 border-b">
                   <div className="flex gap-1">
                      {Array.from({ length: numTurns }).map((_, idx) => (
                        <button key={idx} className={cn("w-6 h-6 text-[10px] rounded-full border", idx === 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-400 border-gray-200")}>
                          {idx + 1}
                        </button>
                      ))}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 font-medium hover:border-blue-400 hover:text-blue-500 rounded-xl transition flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Thêm thành viên
        </button>
      </section>

      <section>
        <h5 className="font-bold text-gray-800 mb-4">Lịch phân công & Tạm tính tiền trực</h5>
        <div className="overflow-auto border rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 w-20">Stt</th>
                <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase sticky left-20 bg-gray-50 z-10 w-48">Tên</th>
                <th className="p-3 border-b text-xs font-bold text-gray-500 uppercase w-32">Tiền trực</th>
                {Array.from({ length: 31 }).map((_, i) => (
                  <th key={i} className="p-2 border-b text-xs font-bold text-gray-500 border-l text-center min-w-[40px]">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personnel.slice(0, 10).map((p, i) => (
                <tr key={p.id} className="hover:bg-blue-50/20">
                   <td className="p-3 border-b text-sm sticky left-0 bg-white group-hover:bg-blue-50/20">{i+1}</td>
                   <td className="p-3 border-b text-sm font-bold sticky left-20 bg-white group-hover:bg-blue-50/20">{p.name}</td>
                   <td className="p-3 border-b text-xs font-bold text-blue-600">{formatCurrency(Math.random() * 2000000)}</td>
                   {Array.from({ length: 31 }).map((_, day) => (
                     <td key={day} className="p-2 border-b border-l text-center">
                        <div className="flex flex-col items-center">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-1 opacity-20"></span>
                        </div>
                     </td>
                   ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TrangInView({ currentMonth, schedules, personnel }: { currentMonth: Date, schedules: DutySchedule[], personnel: Personnel[] }) {
  return (
    <div className="flex flex-col h-full bg-white p-8 max-w-[1200px] mx-auto shadow-2xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-black pb-2">LỊCH TRỰC PHÒNG VẬT TƯ - TBYT</h2>
          <p className="mt-2 text-gray-600 font-medium">Bệnh Viện Nhi - Tháng {format(currentMonth, 'MM/yyyy')}</p>
        </div>
        <button onClick={() => window.print()} className="p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-black transition flex items-center gap-2 no-print">
          <Printer className="w-6 h-6" /> <span className="font-bold">In lịch này</span>
        </button>
      </div>

      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
               <th className="p-2 border border-black text-xs font-bold text-center">Stt</th>
               <th className="p-2 border border-black text-sm font-bold text-left min-w-[200px]">Họ và Tên</th>
               {Array.from({ length: 31 }).map((_, i) => (
                 <th key={i} className="p-1 border border-black text-[10px] font-bold text-center w-8">{i + 1}</th>
               ))}
               <th className="p-2 border border-black text-xs font-bold text-center">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
             {personnel.map((p, i) => (
               <tr key={p.id}>
                  <td className="p-1 border border-black text-xs text-center">{i + 1}</td>
                  <td className="p-1 border border-black text-sm font-medium">{p.name}</td>
                  {Array.from({ length: 31 }).map((_, day) => (
                    <td key={day} className="p-1 border border-black text-[10px] text-center">X</td>
                  ))}
                  <td className="p-1 border border-black text-xs font-bold text-center">...</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-20">
          <div className="text-center">
             <p className="font-bold uppercase mb-20 text-gray-900">Người lập biểu</p>
             <p className="text-gray-400 font-medium italic underline">Ký tên</p>
          </div>
          <div className="text-center">
             <p className="font-bold uppercase mb-20 text-gray-900">Trưởng phòng vật tư</p>
             <p className="text-gray-400 font-medium italic underline">Ký tên và đóng dấu</p>
          </div>
      </div>
    </div>
  );
}
