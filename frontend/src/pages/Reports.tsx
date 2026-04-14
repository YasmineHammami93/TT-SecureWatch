import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Shield, Activity, Plus, MoreVertical, FileDown, CheckCircle, Clock, Filter, ChevronDown } from 'lucide-react';
import { reportService } from '../services/api';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nouveaux états pour les critères (Scénario Nominal Étape 2)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('Technique');
  const [reportName, setReportName] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await reportService.getAll();
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccess(false);
    try {
      // Utilisation des critères sélectionnés (Scénario Nominal Étape 3 & 4)
      await reportService.generate({ 
        name: reportName || `Rapport ${reportType} - ${new Date().toLocaleDateString('fr-FR')}`,
        type: reportType,
        startDate,
        endDate
      });
      await fetchReports();
      setSuccess(true);
      setReportName(''); // Reset
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    // Utilisation des filtres sélectionnés pour l'export réel (Scénario Nominal Étape 4)
    const url = reportService.exportCSV(startDate, endDate);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-[#1875c7]" />
            Centre de Rapports SOC
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Audit, archivage et exportation des incidents de sécurité.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {success && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-bold animate-bounce">
              <CheckCircle className="h-4 w-4" />
              Rapport Prêt
            </div>
          )}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold shadow-sm hover:border-[#1875c7] hover:text-[#1875c7] transition-all"
          >
            <Download className="h-4 w-4" />
            Export Rapide CSV
          </button>
        </div>
      </div>

      {/* Configuration du Rapport (Scénario Nominal Étape 2) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <FileText className="h-32 w-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
            <Filter className="h-4 w-4 text-[#1875c7]" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Configuration du Rapport</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Calendar className="h-3 w-3" /> DATE DE DÉBUT
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#1875c7] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Calendar className="h-3 w-3" /> DATE DE FIN
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#1875c7] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Shield className="h-3 w-3" /> TYPE DE RAPPORT
            </label>
            <div className="relative">
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 appearance-none outline-none focus:ring-2 focus:ring-[#1875c7] cursor-pointer"
              >
                <option value="Technique">Technique (ToN-IoT)</option>
                <option value="Hebdomadaire">Hebdomadaire (Bilan)</option>
                <option value="Exécutif">Exécutif (Management)</option>
                <option value="Conformité">Conformité (ISO 27001)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] text-white rounded-xl py-3 text-sm font-black shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? <Clock className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {generating ? 'Compilation...' : 'Générer le Rapport'}
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden mt-8 transition-all">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <FileDown className="h-5 w-5 text-gray-400" />
            <h3 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-tighter">Historique des Générations</h3>
          </div>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 py-1 px-3 rounded-full border border-gray-100 dark:border-gray-700 shadow-inner">
            TOTAL: {reports.length} ARCHIVES
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Clock className="h-10 w-10 animate-spin mb-4 text-[#1875c7]" />
              <p className="text-sm font-bold uppercase tracking-widest">Chargement des données...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8fafc] dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-8 py-5">Identifiant / Nom</th>
                  <th className="px-6 py-5">Catégorie</th>
                  <th className="px-6 py-5">Date de Création</th>
                  <th className="px-6 py-5">Opérateur</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {reports.map((report) => (
                  <tr key={report._id || report.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl shadow-sm ${report.status === 'ready' ? 'bg-white dark:bg-gray-700 text-[#1875c7] border border-blue-100 dark:border-blue-800' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">
                            {report.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{report.size || '2.4 MB'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        report.type === 'Exécutif' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 
                        report.type === 'Conformité' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                        'bg-blue-50 text-[#1875c7] dark:bg-blue-900/20'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-500 dark:text-gray-400">
                      {new Date(report.date || report.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">
                          {(report.author || 'S').substring(0, 2)}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">{report.author}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#1875c7] hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-none hover:shadow-md transition-all" title="Télécharger">
                          <FileDown className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
