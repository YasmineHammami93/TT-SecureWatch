import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ShieldCheck, Brain, Zap, BarChart3, Bell, Users, ChevronRight, Activity, Lock, Database } from 'lucide-react';
import TTLogo from '../components/TTLogo';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: ShieldCheck,
    title: 'Détection en Temps Réel',
    description: 'Surveillance continue des menaces avec alertes instantanées provenant de sources SIEM multiples.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'group-hover:border-blue-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
  },
  {
    icon: Brain,
    title: 'Intelligence Artificielle',
    description: 'Modèles ML avancés pour la classification automatique des alertes et la réduction des faux positifs.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'group-hover:border-purple-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]'
  },
  {
    icon: Zap,
    title: 'Réponse Automatisée',
    description: 'Playbooks SOC prédéfinis pour une remédiation rapide et efficace des incidents de sécurité.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'group-hover:border-amber-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]'
  },
  {
    icon: BarChart3,
    title: 'Tableau de Bord Analytique',
    description: 'Visualisation interactive des métriques de sécurité avec indicateurs de performance clés.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'group-hover:border-emerald-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
  },
  {
    icon: Bell,
    title: 'Notifications Intelligentes',
    description: 'Système d\'alertes contextuelles avec priorisation basée sur la sévérité et l\'impact.',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'group-hover:border-red-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  },
  {
    icon: Users,
    title: 'Gestion RBAC',
    description: 'Contrôle d\'accès basé sur les rôles avec permissions granulaires pour chaque utilisateur.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'group-hover:border-cyan-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-500 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Background Ambience Blocks */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/10 blur-[150px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex h-20 items-center justify-between px-6 md:px-12 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white dark:bg-gray-900 p-1.5 rounded-full border border-gray-100 dark:border-gray-800">
              <TTLogo className="h-8 w-8" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              TT Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1875c7] to-[#2bc0e4]">Watch</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none group"
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1875c7_0%,#2bc0e4_50%,#1875c7_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 px-6 py-1 text-sm font-bold text-gray-900 dark:text-gray-100 backdrop-blur-3xl transition-all group-hover:bg-gray-50 dark:group-hover:bg-gray-900">
              Se Connecter
            </span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mt-20 z-10">
        <section className="flex flex-col items-center justify-center text-center px-4 pt-12 pb-16 md:pt-20 md:pb-20">
          
          <div className="inline-flex items-center rounded-full bg-white dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800 px-4 py-1.5 mb-8 shadow-sm backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest text-[#1875c7] dark:text-[#2bc0e4] uppercase">Plateforme SOC Nouvelle Génération</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#0f172a] dark:text-white mb-6 leading-[1.1] animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Sécurité Intelligente.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1875c7] via-[#2bc0e4] to-[#1875c7] animate-gradient-x">
              Réponse Instantanée.
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Protégez l'infrastructure de Tunisie Telecom avec une plateforme SOC centralisée combinant surveillance en temps réel, intelligence artificielle et automatisation poussée.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Accéder au Tableau de Bord
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>

        </section>

        {/* Dynamic Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent my-8"></div>

        {/* Features Section */}
        <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              Fonctionnalités <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1875c7] to-[#2bc0e4]">Principales</span>
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium text-lg">
              Une architecture SOC complète pour détecter, analyser et répondre aux menaces avant qu'elles n'impactent votre réseau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300 group hover:-translate-y-2 ${feature.border} ${feature.glow}`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 -rotate-12">
                  <feature.icon className={`w-32 h-32 ${feature.color}`} />
                </div>
                
                <div className={`relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} mb-6 ring-4 ring-white dark:ring-gray-950 shadow-sm transition-transform group-hover:scale-110 duration-300`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                
                <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all">
                  {feature.title}
                </h3>
                
                <p className="relative z-10 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Premium Footer */}
      <footer className="relative border-t border-gray-200/50 dark:border-gray-800/80 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl z-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <TTLogo className="h-8 w-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <div>
              <span className="font-extrabold text-gray-900 dark:text-white tracking-tight">TT SecureWatch</span>
              <p className="text-[10px] uppercase tracking-widest text-[#1875c7] dark:text-[#2bc0e4] font-bold">Tunisie Telecom SOC</p>
            </div>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors text-sm font-semibold">Documentation</a>
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors text-sm font-semibold">Confidentialité</a>
            <a href="#" className="text-gray-500 hover:text-blue-500 transition-colors text-sm font-semibold">Support</a>
          </div>
          
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Tous droits réservés.
          </p>
        </div>
      </footer>
      
    </div>
  );
};

export default Landing;
