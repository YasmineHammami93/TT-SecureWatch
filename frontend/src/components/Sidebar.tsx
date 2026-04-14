import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Activity,
  FileText,
  Server,
  Settings,
  Users,
  LogOut,
  BookOpen,
  History,
  ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import TTLogo from './TTLogo';

const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label, badge, roles }: any) => {
    if (roles && user && !roles.includes(user.role)) return null;
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          clsx(
            'flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-all mb-1',
            isActive
              ? 'bg-[#edf2fe] dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 shadow-[inset_4px_0_0_0_#2563eb] dark:shadow-[inset_4px_0_0_0_#3b82f6]'
              : 'text-[#626e82] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:hover:text-gray-300'
          )
        }
      >
        <Icon className="mr-3 h-5 w-5" />
        {label}
        {badge && (
          <span className="ml-auto flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-[10px] font-bold text-red-600">
            {badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div className={clsx(
      "flex h-full flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      isOpen ? "w-[260px]" : "w-0 overflow-hidden opacity-0 border-none"
    )}>
      <div className="flex w-[260px] flex-col items-center pt-8 pb-6 mb-4 relative">
        {/* Glow behind the logo */}
        <div className="relative group cursor-pointer mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative flex items-center justify-center bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-700 p-2.5 rounded-2xl transition-transform hover:scale-105 duration-300">
            <TTLogo className="h-11 w-11" />
          </div>
        </div>
        <div className="text-center mt-1">
          <h2 className="text-[19px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 drop-shadow-sm">
            TT Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1875c7] to-[#2bc0e4]">Watch</span>
          </h2>
          <p className="text-[9px] mt-1 font-bold tracking-[0.2em] uppercase">
            <span className="text-gray-400 dark:text-gray-500">Tunisie Telecom</span>
            <span className="text-[#2bc0e4] ml-1">SOC</span>
          </p>
        </div>
        {/* Divider line */}
        <div className="absolute bottom-0 w-[180px] h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      </div>

      <div className="flex-1 overflow-auto px-4 mt-6">
        
        {/* Labeled Workspace Indicator */}
        <div className="mb-6">
          <div className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border shadow-sm ${
            user?.role === 'ADMIN' 
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-[#1875c7] dark:text-[#2bc0e4]'
          }`}>
            <span className="text-xs font-black uppercase tracking-widest flex items-center">
              {user?.role === 'ADMIN' ? 'Espace Admin' : 'Espace Analyste'}
            </span>
          </div>
        </div>

        {/* --- ESPACE ANALYSTE SOC --- */}
        {user?.role === 'ANALYSTE' && (
          <>
            <div className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Espace Analyste</h3>
              <nav>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Tableau de Bord" />
                <NavItem to="/alerts" icon={Activity} label="Alertes & Menaces" badge="99+" />
                <NavItem to="/alerts?status=RÉSOLU" icon={History} label="Historique" />
                <NavItem to="/alerts?severity=FAUX POSITIF" icon={ShieldAlert} label="Faux Positifs" />
              </nav>
            </div>
            <div className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Analytique</h3>
              <nav>
                <NavItem to="/reports" icon={FileText} label="Rapports de Sécurité" />
              </nav>
            </div>
          </>
        )}

        {/* --- ESPACE ADMINISTRATEUR --- */}
        {user?.role === 'ADMIN' && (
          <>
            <div className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-purple-500/70 dark:text-purple-400/70 mb-2">Espace Admin</h3>
              <nav>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Tableau de Bord" />
                <NavItem to="/users" icon={Users} label="Gestion des Utilisateurs" />
              </nav>
            </div>
            
            <div className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-purple-500/70 dark:text-purple-400/70 mb-2">Administration SOC</h3>
              <nav>
                <NavItem to="/sources" icon={Server} label="Sources SIEM" />
                <NavItem to="/playbooks" icon={BookOpen} label="Playbooks SOC" />
              </nav>
            </div>

            <div className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-purple-500/70 dark:text-purple-400/70 mb-2">Infrastructure</h3>
              <nav>
                <NavItem to="/assets" icon={Server} label="Gestion des Équipements" />
              </nav>
            </div>
          </>
        )}

        {/* --- COMMUN --- */}
        <div className="mb-6">
          <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Système</h3>
          <nav>
            <NavItem to="/settings" icon={Settings} label="Configuration" />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
