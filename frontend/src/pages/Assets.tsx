import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Server, Wifi, Monitor, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import { assetService } from '../services/api';

const typeIcons: Record<string, any> = {
  Serveur: Server,
  Réseau: Wifi,
  Poste: Monitor,
  Stockage: HardDrive,
};

const typeOptions = ['Serveur', 'Réseau', 'Poste', 'Stockage'];
const statusOptions = ['online', 'offline', 'warning'];

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Serveur');
  const [formIp, setFormIp] = useState('');
  const [formOs, setFormOs] = useState('');
  const [formStatus, setFormStatus] = useState<'online' | 'offline' | 'warning'>('online');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await assetService.getAll();
      setAssets(res.data || []);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      type: formType,
      ip: formIp,
      os: formOs,
      status: formStatus
    };

    try {
      if (editingAsset) {
        await assetService.update(editingAsset._id || editingAsset.id, payload);
        showSuccess('Équipement modifié avec succès');
      } else {
        await assetService.create(payload);
        showSuccess('Équipement ajouté avec succès');
      }
      fetchAssets();
      setShowModal(false);
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assetService.delete(id);
      fetchAssets();
      setDeleteConfirm(null);
      showSuccess('Équipement supprimé');
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const openAddModal = () => {
    setEditingAsset(null);
    setFormName('');
    setFormType('Serveur');
    setFormIp('');
    setFormOs('');
    setFormStatus('online');
    setShowModal(true);
  };

  const openEditModal = (asset: any) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.type);
    setFormIp(asset.ip);
    setFormOs(asset.os || '');
    setFormStatus(asset.status);
    setShowModal(true);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      online: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      offline: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    };
    const labels: Record<string, string> = { online: 'En ligne', offline: 'Hors ligne', warning: 'Attention' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'online' ? 'bg-emerald-500' : status === 'offline' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
        {labels[status] || status}
      </span>
    );
  };

  const onlineCount = assets.filter(a => a.status === 'online').length;
  const offlineCount = assets.filter(a => a.status === 'offline').length;
  const warningCount = assets.filter(a => a.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Inventaire des Équipements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {assets.length} équipement(s) — <span className="text-emerald-500">{onlineCount} en ligne</span> · <span className="text-amber-500">{warningCount} attention</span> · <span className="text-red-500">{offlineCount} hors ligne</span>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          Ajouter Équipement
        </button>
      </div>

      {success && (
        <div className="flex items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => {
          const Icon = typeIcons[asset.type] || Server;
          return (
            <div key={asset.id} className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{asset.name}</h3>
                    <p className="text-[11px] font-medium text-gray-400">{asset.type}</p>
                  </div>
                </div>
                {statusBadge(asset.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Adresse IP</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{asset.ip}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Système</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-right max-w-[160px] truncate">{asset.os}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Dernière activité</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {new Date(asset.lastSeen).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                <button
                  onClick={() => openEditModal(asset)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                {deleteConfirm === asset.id ? (
                  <div className="flex-1 flex gap-1">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(asset.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border dark:border-gray-700 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold dark:text-white mb-6">
              {editingAsset ? 'Modifier Équipement' : 'Nouvel Équipement'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Nom de l'équipement</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="SRV-WEB-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-bold dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Statut</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-bold dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="online">En ligne</option>
                    <option value="offline">Hors ligne</option>
                    <option value="warning">Attention</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Adresse IP</label>
                <input
                  type="text"
                  value={formIp}
                  onChange={(e) => setFormIp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="192.168.1.x"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Système d'exploitation</label>
                <input
                  type="text"
                  value={formOs}
                  onChange={(e) => setFormOs(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Windows Server 2022"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {editingAsset ? 'Enregistrer' : 'Ajouter Équipement'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl border dark:border-gray-600 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
