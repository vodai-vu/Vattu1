import { useState, useEffect, createContext, useContext } from 'react';
import { 
  AuthError, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { 
  ClipboardList, 
  ShieldCheck, 
  Trash2, 
  Wind, 
  AirVent, 
  Zap, 
  Flame, 
  BarChart3, 
  Calendar, 
  Warehouse, 
  Phone, 
  Users, 
  Settings,
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Camera,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { cn } from './lib/utils';
import { UserRole, UserProfile } from './types';
import KiemKeTab from './components/tabs/KiemKeTab';
import KiemDinhTab from './components/tabs/KiemDinhTab';
import ThanhLyTab from './components/tabs/ThanhLyTab';
import QuatTab from './components/tabs/QuatTab';
import DieuHoaTab from './components/tabs/DieuHoaTab';
import MayPhatTab from './components/tabs/MayPhatTab';
import PCCCTab from './components/tabs/PCCCTab';
import TienDoTab from './components/tabs/TienDoTab';
import LichTab from './components/tabs/LichTab';
import KhoVatTuTab from './components/tabs/KhoVatTuTab';
import LienLacTab from './components/tabs/LienLacTab';
import NhanSuTab from './components/tabs/NhanSuTab';
import SettingsTab from './components/tabs/SettingsTab';

// Tabs list
const TABS = [
  { id: 'kiem-ke', label: 'Kiểm kê', icon: ClipboardList },
  { id: 'kiem-dinh', label: 'Kiểm định', icon: ShieldCheck },
  { id: 'thanh-ly', label: 'Thanh lý', icon: Trash2 },
  { id: 'quat', label: 'Quạt', icon: Wind },
  { id: 'dieu-hoa', label: 'Điều hoà', icon: AirVent },
  { id: 'may-phat', label: 'Máy phát', icon: Zap },
  { id: 'pccc', label: 'PCCC', icon: Flame },
  { id: 'tien-do', label: 'Tiến độ', icon: BarChart3 },
  { id: 'lich', label: 'Lịch', icon: Calendar },
  { id: 'kho-vat-tu', label: 'Kho vật tư', icon: Warehouse },
  { id: 'lien-lac', label: 'Liên lạc', icon: Phone },
  { id: 'nhan-su', label: 'Nhân sự', icon: Users },
  { id: 'quan-ly-cai-dat', label: 'Quản lý & Cài đặt', icon: Settings },
];

// Context
const AuthContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('kiem-ke');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Force a mock user for demo purposes as requested
    const mockUser = {
      uid: 'demo-user-id',
      email: 'demo@benhviennhi.vn',
      displayName: 'Quản trị viên (Demo)',
      photoURL: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    } as User;

    const mockProfile: UserProfile = {
      uid: 'demo-user-id',
      email: 'demo@benhviennhi.vn',
      displayName: 'Quản trị viên (Demo)',
      role: 'admin',
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);

    // Keep original auth listener commented for future real integration if needed
    /*
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // ... existing code
    });
    return unsubscribe;
    */
  }, []);

  const login = async () => {
    setLoginError(null);
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          setLoginError('Cửa sổ đăng nhập đã bị đóng.');
        } else if (error.message.includes('cancelled-by-user')) {
          setLoginError('Đăng nhập bị hủy.');
        } else {
          setLoginError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    // Optionally reload to reset everything
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <ShieldCheck className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Phòng Vật Tư - Thiết Bị Y Tế</h1>
          <p className="text-gray-500 mb-8">Bệnh Viện Nhi - Hệ thống quản lý tập trung</p>
          
          {loginError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"
            >
              {loginError}
            </motion.div>
          )}

          <button
            onClick={login}
            disabled={isAuthenticating}
            className={cn(
              "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2",
              isAuthenticating && "opacity-70 cursor-not-allowed"
            )}
          >
            {isAuthenticating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
              />
            ) : (
              "Đăng nhập với Google"
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="bg-white border-r border-gray-200 flex flex-col relative z-20 shadow-sm"
        >
          <div className="p-4 flex items-center gap-3 border-b border-gray-100 h-16 shrink-0 overflow-hidden">
            <div className="bg-blue-600 p-2 rounded-lg shrink-0">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-gray-800 whitespace-nowrap"
              >
                BV Nhi - Vật Tư
              </motion.span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-4 shrink-0 overflow-hidden">
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full shrink-0 border border-gray-200"
              />
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{profile?.role}</p>
                </motion.div>
              )}
            </div>
            <button
              onClick={logout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhanh..." 
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden p-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                {renderTabContent(activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

function renderTabContent(tabId: string) {
  switch (tabId) {
    case 'kiem-ke':
      return <KiemKeTab />;
    case 'kiem-dinh':
      return <KiemDinhTab />;
    case 'thanh-ly':
      return <ThanhLyTab />;
    case 'quat':
      return <QuatTab />;
    case 'dieu-hoa':
      return <DieuHoaTab />;
    case 'may-phat':
      return <MayPhatTab />;
    case 'pccc':
      return <PCCCTab />;
    case 'tien-do':
      return <TienDoTab />;
    case 'lich':
      return <LichTab />;
    case 'kho-vat-tu':
      return <KhoVatTuTab />;
    case 'lien-lac':
      return <LienLacTab />;
    case 'nhan-su':
      return <NhanSuTab />;
    case 'quan-ly-cai-dat':
      return <SettingsTab />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
          Chưa phát triển nội dung cho tab {tabId}
        </div>
      );
  }
}
