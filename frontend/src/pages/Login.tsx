import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TTLogo from '../components/TTLogo';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, User, Lock, EyeOff, Eye, AlertCircle, Mail, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Shared state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regConfirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (regPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!regEmail.toLowerCase().startsWith(regUsername.toLowerCase())) {
      setError(`L'email doit commencer par le nom d'utilisateur (ex: ${regUsername}@...)`);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      setSuccess('Compte créé avec succès ! Vous pouvez vous connecter.');
      // Auto switch to login tab after successful registration
      setTimeout(() => {
        setActiveTab('login');
        setUsername(regUsername);
        setPassword('');
        setSuccess('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  const inputClass = "block w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 py-3 pl-10 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500";
  const inputClassBlue = "block w-full rounded-xl border border-blue-100 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700/50 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-[#fdfbfb] to-[#f4f7fe] dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="absolute top-6 right-8">
         <button 
           onClick={toggleTheme}
           className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
         >
           {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
         </button>
      </div>

      <div className="m-auto w-full max-w-md">
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 border border-gray-50 dark:border-gray-700 flex flex-col items-center transition-colors">
          
          {/* Premium Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer mb-5">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex items-center justify-center bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-700 p-3 rounded-2xl transition-transform hover:scale-105 duration-300">
                <TTLogo className="h-12 w-12" />
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 drop-shadow-sm">
                TT Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1875c7] to-[#2bc0e4]">Watch</span>
              </h2>
              <p className="text-[10px] mt-1.5 font-bold tracking-[0.2em] uppercase">
                <span className="text-gray-400 dark:text-gray-500">Tunisie Telecom</span>
                <span className="text-[#2bc0e4] ml-1">SOC</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 p-1 mb-6 transition-colors">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 rounded-md py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-gray-600 text-primary dark:text-blue-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              CONNEXION
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-md py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-gray-600 text-primary dark:text-blue-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              CRÉER UN COMPTE
            </button>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="flex items-center rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-red-500 border border-red-100 dark:border-red-900/30 w-full mb-4">
              <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 w-full mb-4">
              <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">{success}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form className="w-full space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Nom d'utilisateur</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Entrez votre identifiant"
                    className={inputClassBlue}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" /> : <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70"
              >
                {loading ? 'Connexion en cours...' : 'Se Connecter'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form className="w-full space-y-4" onSubmit={handleRegister}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Nom d'utilisateur</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Choisissez un identifiant"
                    className={inputClassBlue}
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nom@email.com"
                    className={inputClassBlue}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 caractères"
                    className={inputClass}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 cursor-pointer" onClick={() => setShowRegPassword(!showRegPassword)}>
                    {showRegPassword ? <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" /> : <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirmez votre mot de passe"
                    className={inputClass}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70"
              >
                {loading ? 'Création en cours...' : 'Créer un Compte'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-[10px] font-semibold tracking-wide text-gray-400">
            © 2026 Tunisie Telecom. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
