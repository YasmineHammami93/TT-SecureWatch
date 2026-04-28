import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Palette, Server, BookOpen, Plus, Trash2, Edit3, Shield, Info, Activity, X } from 'lucide-react';
import { collectorService, playbookService } from '../services/api';

const Settings: React.FC<{ initialTab?: string }> = ({ initialTab = 'profil' }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Sync active tab when navigating between routes pointing to same component
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const isAdmin = user?.role === 'ADMIN';

  const [sources, setSources] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  
  const [currentSource, setCurrentSource] = useState<any>(null);
  const [currentPlaybook, setCurrentPlaybook] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcRes, pbRes] = await Promise.all([
        collectorService.getAll(),
        playbookService.getAll()
      ]);
      setSources(srcRes.data || []);
      setPlaybooks(pbRes.data || []);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleDeleteSource = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette source SIEM ?')) {
      try {
        await collectorService.delete(id);
        setSources(sources.filter(s => (s._id || s.id) !== id));
      } catch (err) { alert('Erreur suppression'); }
    }
  };

  const handleDeletePlaybook = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce playbook ?')) {
      try {
        await playbookService.delete(id);
        setPlaybooks(playbooks.filter(p => (p._id || p.id) !== id));
      } catch (err) { alert('Erreur suppression'); }
    }
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSource._id || currentSource.id) {
        const id = currentSource._id || currentSource.id;
        await collectorService.update(id, currentSource);
      } else {
        await collectorService.create(currentSource);
      }
      loadData();
      setIsSourceModalOpen(false);
    } catch (err) { alert('Erreur sauvegarde'); }
  };

  const handleSavePlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Scénario alternatif: validation locale
    if (!currentPlaybook.actions || currentPlaybook.actions.length === 0) {
      alert('Veuillez sélectionner au moins une action pour ce playbook.');
      return;
    }

    try {
      if (currentPlaybook._id || currentPlaybook.id) {
        const id = currentPlaybook._id || currentPlaybook.id;
        await playbookService.update(id, currentPlaybook);
      } else {
        await playbookService.create(currentPlaybook);
      }
      loadData();
      setIsPlaybookModalOpen(false);
    } catch (err: any) { 
      const msg = err.response?.data?.error || 'Erreur lors de la sauvegarde du playbook.';
      alert(msg);
    }
  };

  const openSourceModal = (source?: any) => {
    setCurrentSource(source || { name: '', url: '', status: 'Actif' });
    setIsSourceModalOpen(true);
  };

  const openPlaybookModal = (playbook?: any) => {
    setCurrentPlaybook(playbook || { 
      name: '', 
      description: '', 
      trigger: 'Toutes Alertes',
      incidentType: 'Malware',
      actions: [],
      parameters: { notifications: true, ipBlocking: false }
    });
    setIsPlaybookModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profil & Sécurité</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez vos informations personnelles et vos paramètres de connexion.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Nom d'utilisateur</label>
                  <input type="text" disabled value={user?.username || ''} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Adresse Email</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Rôle Attribué</label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <Shield className={`h-5 w-5 ${isAdmin ? 'text-purple-500' : 'text-blue-500'}`} />
                    <span className={`font-bold ${isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                <button 
                  onClick={() => alert('Informations de profil mises à jour (Simulation)')}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Mettre à jour
                </button>
                <button 
                  onClick={() => alert('Fonctionnalité de changement de mot de passe à venir')}
                  className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Changer de mot de passe
                </button>
              </div>
            </div>
          </div>
        );

      case 'apparence':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Apparence de l'Application</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personnalisez l'interface selon vos préférences visuelles.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Thème d'affichage</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Passez du mode clair au mode sombre (Optimisé pour les analystes SOC).</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-[#2bc0e4]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'sources':
        if (!isAdmin) return null;
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configuration des Sources SIEM</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connectez et gérez vos collecteurs de journaux et détecteurs de menaces.</p>
              </div>
              <button onClick={() => openSourceModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4" /> Ajouter une Source
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sources.map(source => (
                <div key={source.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md group hover:border-emerald-400 transition-colors relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl ${source.status === 'Actif' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <Server className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white">{source.name}</h4>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold mt-1 ${source.status === 'Actif' ? 'text-emerald-500' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${source.status === 'Actif' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          {source.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openSourceModal(source)} className="p-1.5 text-gray-400 hover:text-[#1875c7] dark:hover:text-[#2bc0e4] bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteSource(source._id || source.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Endpoint API:</span>
                      <span className="text-gray-900 dark:text-gray-300 font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border dark:border-gray-700 truncate max-w-[180px] sm:max-w-[200px]" title={source.url}>{source.url}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Dernier Sync:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">{source.lastSync}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'playbooks':
        if (!isAdmin) return null;
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Création et Gestion des Playbooks SOC</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Définissez des routines d'automatisation pour contrer les cybermenaces récurrentes.</p>
              </div>
              <button onClick={() => openPlaybookModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                <Plus className="h-4 w-4" /> Nouveau Playbook
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {playbooks.map(playbook => (
                <div key={playbook.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md group hover:border-purple-400 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-base">{playbook.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{playbook.incidentType}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{playbook.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-[10px] uppercase font-bold text-gray-500">{playbook.trigger}</span>
                        </div>
                        {playbook.actions && playbook.actions.map((act: string, idx: number) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 font-bold uppercase">{act}</span>
                        ))}
                        <div className="flex items-center gap-2 ml-auto">
                          <span className={`w-2 h-2 rounded-full ${playbook.parameters?.notifications ? 'bg-emerald-500' : 'bg-gray-300'}`} title="Notifications"></span>
                          <span className={`w-2 h-2 rounded-full ${playbook.parameters?.ipBlocking ? 'bg-red-500' : 'bg-gray-300'}`} title="Blocage IP"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => openPlaybookModal(playbook)} className="p-2 text-gray-400 hover:text-purple-500 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors"><Edit3 className="h-5 w-5" /></button>
                     <button onClick={() => handleDeletePlaybook(playbook._id || playbook.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex gap-4 items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">Les playbooks sont exécutés en arrière-plan via le moteur d'automatisation. Assurez-vous d'avoir les bonnes configurations API (Wazuh, Fortigate) activées dans "Sources SIEM" avant de lancer une action de blocage réseau.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'profil' ? 'bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <User className="h-5 w-5" /> Profil
          </button>
          <button 
            onClick={() => setActiveTab('apparence')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'apparence' ? 'bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Palette className="h-5 w-5" /> Apparence
          </button>
          
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Administration SOC</p>
              <button 
                onClick={() => setActiveTab('sources')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'sources' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-gray-800 dark:hover:text-emerald-400'}`}
              >
                <Server className="h-5 w-5" /> Sources SIEM
              </button>
              <button 
                onClick={() => setActiveTab('playbooks')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'playbooks' ? 'bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-gray-800 dark:hover:text-purple-400'}`}
              >
                <BookOpen className="h-5 w-5" /> Playbooks SOC
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          {renderContent()}
        </div>
      </div>

      {/* --- Modals --- */}
      {isSourceModalOpen && currentSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform scale-100 transition-transform">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" /> 
                {currentSource.id ? 'Modifier la Source' : 'Nouvelle Source'}
              </h3>
              <button onClick={() => setIsSourceModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveSource} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nom du SIEM</label>
                <input required type="text" value={currentSource.name} onChange={e => setCurrentSource({...currentSource, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400" placeholder="ex: Wazuh Master Node" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Endpoint API (URL)</label>
                <input required type="text" value={currentSource.url} onChange={e => setCurrentSource({...currentSource, url: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-mono text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Statut Intégration</label>
                <select value={currentSource.status} onChange={e => setCurrentSource({...currentSource, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                  <option value="Actif">Actif (Synchronisation auto)</option>
                  <option value="Inactif">Inactif (Désactivé)</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPlaybookModalOpen && currentPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform scale-100 transition-transform">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" /> 
                {currentPlaybook.id ? 'Modifier Playbook' : 'Nouveau Playbook'}
              </h3>
              <button onClick={() => setIsPlaybookModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSavePlaybook} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nom du Playbook</label>
                <input required type="text" value={currentPlaybook.name} onChange={e => setCurrentPlaybook({...currentPlaybook, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm" placeholder="ex: Réponse Anti-Malware" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type d'incident</label>
                  <select value={currentPlaybook.incidentType} onChange={e => setCurrentPlaybook({...currentPlaybook, incidentType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-xs font-bold">
                    <option value="Malware">Malware</option>
                    <option value="Bruteforce">Bruteforce</option>
                    <option value="DDoS">DDoS</option>
                    <option value="Scan">Scan de ports</option>
                    <option value="Exfiltration">Exfiltration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Conditions</label>
                  <select value={currentPlaybook.trigger} onChange={e => setCurrentPlaybook({...currentPlaybook, trigger: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-xs font-bold">
                    <option value="Toutes Alertes">Toutes</option>
                    <option value="Critique">Critique</option>
                    <option value="Elevé">Elevé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description locale</label>
                <textarea required rows={2} value={currentPlaybook.description} onChange={e => setCurrentPlaybook({...currentPlaybook, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-xs resize-none" placeholder="Description de l'action..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Actions associées</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Block IP', 'Isolate Host', 'Disable User', 'Notify RSSI'].map(act => (
                    <button 
                      key={act}
                      type="button"
                      onClick={() => {
                        const acts = currentPlaybook.actions || [];
                        setCurrentPlaybook({
                          ...currentPlaybook, 
                          actions: acts.includes(act) ? acts.filter((a:any) => a !== act) : [...acts, act]
                        });
                      }}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                        currentPlaybook.actions?.includes(act) 
                        ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/40 dark:border-purple-700' 
                        : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Paramètres d'exécution</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Activer Notifications</span>
                  <button 
                    type="button"
                    onClick={() => setCurrentPlaybook({...currentPlaybook, parameters: {...currentPlaybook.parameters, notifications: !currentPlaybook.parameters?.notifications}})}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${currentPlaybook.parameters?.notifications ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentPlaybook.parameters?.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Blocage IP automatique</span>
                  <button 
                    type="button"
                    onClick={() => setCurrentPlaybook({...currentPlaybook, parameters: {...currentPlaybook.parameters, ipBlocking: !currentPlaybook.parameters?.ipBlocking}})}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${currentPlaybook.parameters?.ipBlocking ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentPlaybook.parameters?.ipBlocking ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all text-sm">
                  {currentPlaybook.id || currentPlaybook._id ? 'Sauvegarder les modifications' : 'Enregistrer le Playbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
