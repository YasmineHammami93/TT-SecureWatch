import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from './Sidebar';
import { Search, Moon, Sun, Bell, User as UserIcon, Menu, X, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { notificationService } from '../services/api';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Notification States
  const [activeToast, setActiveToast] = useState<{ id: string; message: string; type: string; alertId?: string } | null>(null);
  const lastCheckedRef = useRef<number>(Date.now());
  const initialLoadRef = useRef<boolean>(true);

  const fetchNewNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getAll();
      if (res.status === 'success' && res.data.length > 0) {
        const latest = res.data[0];
        const latestTime = new Date(latest.createdAt).getTime();

        // On ne montre le toast que si la notification est plus récente que notre dernier check
        // Et on ignore le tout premier chargement pour éviter de spammer au login
        if (!initialLoadRef.current && latestTime > lastCheckedRef.current) {
          setActiveToast({
            id: latest._id,
            message: latest.message,
            type: latest.type,
            alertId: latest.alertId
          });
          
          // Auto-hide toast after 60 seconds (as requested)
          setTimeout(() => {
            setActiveToast(null);
          }, 60000);
        }
        
        lastCheckedRef.current = latestTime;
        initialLoadRef.current = false;
      }
    } catch (err) {
      console.error('[Layout] Error fetching notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNewNotifications();
      const interval = setInterval(fetchNewNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user, fetchNewNotifications]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/alerts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'critique': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe] dark:bg-gray-900 w-full transition-colors duration-300 relative">
      
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right fade-in duration-500">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-primary rounded-xl shadow-2xl p-4 flex items-start gap-4 min-w-[320px] max-w-[450px] border dark:border-gray-700">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
              {getToastIcon(activeToast.type)}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Notification SOC</h4>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                {activeToast.message}
              </p>
              <div className="flex gap-4 mt-2">
                {activeToast.alertId && (
                  <button 
                    onClick={() => { navigate(`/alerts/${activeToast.alertId}`); setActiveToast(null); }}
                    className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                  >
                    Consulter l'alerte
                  </button>
                )}
                <button 
                  onClick={() => { navigate('/notifications'); setActiveToast(null); }}
                  className="text-[10px] font-bold text-primary hover:underline uppercase"
                >
                  Voir l'historique
                </button>
              </div>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 overflow-auto w-full transition-all duration-300">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between px-8 bg-[#f4f7fe] dark:bg-gray-900 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center rounded-full bg-white dark:bg-gray-800 px-4 py-2 shadow-sm w-[400px] border dark:border-gray-700 transition-colors">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Rechercher IP, Hash, CVE... (Entrée)" 
                className="ml-3 w-full border-none bg-transparent text-sm focus:outline-none text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div 
              className="relative cursor-pointer"
              onClick={() => { initialLoadRef.current = false; navigate('/notifications'); }}
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 border-2 border-[#f4f7fe] dark:border-gray-900" />
            </div>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/settings')}
              title="Paramètres du profil"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-[#1f2937] dark:text-white leading-none">{user.username}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{user.role}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold">
                <UserIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
