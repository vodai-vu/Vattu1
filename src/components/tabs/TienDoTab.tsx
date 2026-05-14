import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar as CalendarIcon,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Circle,
  X,
  BarChart3
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
  isWithinInterval,
  parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { Task } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function TienDoTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    color: '#3b82f6',
    completed: false
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));
    return unsub;
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title) return;
    try {
      await addDoc(collection(db, 'tasks'), newTask);
      setIsAdding(false);
      setNewTask({
        title: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        color: '#3b82f6',
        completed: false
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
             <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
             <h2 className="text-xl font-black text-gray-900">Tiến độ công việc</h2>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Theo dõi quy trình vận hành</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                 {tasks.filter(t => !t.completed).length}
              </span>
           </div>
           <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center gap-2"
           >
              <Plus className="w-4 h-4" /> Thêm công việc
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Left - Task List (40%) */}
         <div className="w-[400px] border-r border-gray-100 flex flex-col overflow-hidden bg-gray-50/50">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh sách công việc</span>
               <Filter className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className={cn(
                      "bg-white p-4 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md group",
                      task.completed ? "grayscale opacity-60 border-gray-300" : "border-blue-500"
                    )}
                    style={{ borderLeftColor: task.color }}
                  >
                    <div className="flex items-start justify-between gap-3">
                       <div className="flex-1 min-w-0">
                          <p className={cn("font-bold text-gray-800 truncate mb-1", task.completed && "line-through")}>{task.title}</p>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(parseISO(task.startDate), 'dd/MM')}</span>
                             <span>→</span>
                             <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {format(parseISO(task.endDate), 'dd/MM')}</span>
                          </div>
                       </div>
                       <div className="flex gap-1 shrink-0">
                          <button onClick={() => toggleTask(task)} className={cn("p-1.5 rounded-lg transition-colors", task.completed ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50")}>
                             <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
         </div>

         {/* Right - Calendar Gantt (60%) */}
         <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                  <span className="font-black text-gray-800 capitalize min-w-[120px] text-center">Tháng {format(currentMonth, 'MM yyyy')}</span>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
               </div>
               <div className="flex gap-2">
                  <Circle className="w-3 h-3 text-blue-500 fill-blue-500" />
                  <Circle className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <Circle className="w-3 h-3 text-green-500 fill-green-500" />
               </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
               <CalendarGanttView currentMonth={currentMonth} tasks={tasks} />
            </div>
         </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden relative"
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-gray-900">Thiết lập công việc mới</h3>
                   <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5 text-gray-400" />
                   </button>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Tên công việc</label>
                      <input 
                        type="text" 
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="VD: Bảo trì máy thở khoa Nhi..." 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Ngày bắt đầu</label>
                        <input 
                          type="date" 
                          value={newTask.startDate}
                          onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Ngày hoàn thành</label>
                        <input 
                          type="date" 
                          value={newTask.endDate}
                          onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                        />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Chọn màu hiển thị</label>
                      <div className="flex gap-3">
                         {['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'].map(c => (
                           <button 
                            key={c}
                            onClick={() => setNewTask({...newTask, color: c})}
                            className={cn(
                              "w-10 h-10 rounded-full border-4 transition-all transform hover:scale-110",
                              newTask.color === c ? "border-gray-900 scale-110 shadow-lg" : "border-transparent"
                            )}
                            style={{ backgroundColor: c }}
                           />
                         ))}
                      </div>
                   </div>
                </div>

                <div className="mt-10 flex gap-3">
                   <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">Hủy</button>
                   <button onClick={handleAddTask} className="flex-2 py-4 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-100 transition-all transform active:scale-95">
                      Lưu công việc
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarGanttView({ currentMonth, tasks }: { currentMonth: Date, tasks: Task[] }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="min-w-max">
       <div className="grid grid-cols-7 border-collapse">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="p-3 text-center text-xs font-black text-gray-400 border-r border-b border-gray-100 bg-gray-50/50">{d}</div>
          ))}
          {days.map((day, idx) => {
            const dayTasks = tasks.filter(t => 
              isWithinInterval(day, { 
                start: parseISO(t.startDate), 
                end: parseISO(t.endDate) 
              })
            );

            return (
              <div 
                key={day.toString()}
                className={cn(
                  "min-h-[160px] w-[140px] p-2 border-r border-b border-gray-100 flex flex-col gap-1",
                  !isSameMonth(day, monthStart) && "bg-gray-50/20"
                )}
              >
                <span className={cn(
                  "text-xs font-bold mb-1",
                  isSameDay(day, new Date()) ? "text-blue-600" : "text-gray-400"
                )}>
                  {format(day, 'd')}
                </span>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      className={cn(
                        "h-1.5 w-full rounded-full transition-all duration-500",
                        task.completed && "opacity-30"
                      )}
                      style={{ backgroundColor: task.color }}
                      title={task.title}
                    />
                  ))}
                </div>
              </div>
            );
          })}
       </div>
    </div>
  );
}

