import React, { useEffect, useState } from 'react';
import { alertService } from '../services/api';
import { Alert } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Sparkles } from 'lucide-react';

const severityColors: Record<string, string> = {
  CRITIQUE: 'bg-red-50 text-red-600 border border-red-200',
  HAUTE: 'bg-orange-50 text-orange-600 border border-orange-200',
  ÉLEVÉE: 'bg-orange-50 text-orange-600 border border-orange-200',
  MOYENNE: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  FAIBLE: 'bg-blue-50 text-blue-600 border border-blue-200',
  'FAUX POSITIF': 'bg-purple-50 text-purple-600 border border-purple-200',
};

const statusColors: Record<string, string> = {
  'NOUVEAU': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'EN COURS': 'bg-amber-50 text-amber-700 border border-amber-200',
  'RÉSOLU': 'bg-green-50 text-green-700 border border-green-200',
};

const AlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('search')) {
      setSearchTerm(searchParams.get('search') || '');
    }
    if (searchParams.has('severity')) {
      const sev = searchParams.get('severity')?.toUpperCase();
      if (sev === 'ÉLEVÉE' || sev === 'ELEVEE') {
        setSeverityFilter('HAUTE');
      } else {
        setSeverityFilter(sev || '');
      }
    }
    if (searchParams.has('status')) {
      setStatusFilter(searchParams.get('status')?.toUpperCase() || '');
    }
    
    // Initial fetch
    fetchAlerts();

    // Polling setup: Refresh every 30 seconds for "Quasi-Temps Réel"
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, [location.search]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams(location.search);
      const params = Object.fromEntries(searchParams.entries());

      const data = await alertService.getAll(params);
      const alertArray = Array.isArray(data) ? data : (data.alerts || []);
      
      // Dynamic Prioritization Logic
      const severityWeight: Record<string, number> = {
        'CRITIQUE': 4,
        'HAUTE': 3,
        'HAUTE (IA)': 3,
        'MOYENNE': 2,
        'FAIBLE': 1,
        'NORMAL': 0
      };

      const sortedData = [...alertArray].sort((a: any, b: any) => {
        const weightA = severityWeight[a.severity?.toUpperCase()] || 0;
        const weightB = severityWeight[b.severity?.toUpperCase()] || 0;

        if (weightA !== weightB) {
          return weightB - weightA; // Higher weight first
        }

        // Alternative scenario: chronological if severity is same
        return new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime();
      });

      setAlerts(sortedData);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert: any) => {
    const isFP = alert.mlData && alert.mlData.predictedClass === 'Normal';
    
    // Match Search Term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      alert.sourceIp?.toLowerCase().includes(searchLower) ||
      alert.description?.toLowerCase().includes(searchLower) ||
      alert.id?.toLowerCase().includes(searchLower) ||
      alert.title?.toLowerCase().includes(searchLower);

    // Match Severity
    let matchesSeverity = true;
    if (severityFilter) {
      if (severityFilter === 'FAUX POSITIF') {
        matchesSeverity = isFP;
      } else {
        // If filtering by real severity (High, Medium, etc.), exclude FPs
        matchesSeverity = !isFP && alert.severity?.toUpperCase() === severityFilter;
      }
    }

    // Match Status
    const matchesStatus = !statusFilter || alert.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md flex flex-col md:flex-row gap-4 justify-between transition-colors">
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une alerte, IP, source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="">Toutes Sévérités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="FAIBLE">Faible</option>
            <option value="FAUX POSITIF">Faux Positif</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="">Tous Statuts</option>
            <option value="NOUVEAU">Nouveau</option>
            <option value="EN COURS">En cours</option>
            <option value="RÉSOLU">Historique (Résolu)</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert: any) => {
          const isFP = alert.mlData && alert.mlData.predictedClass === 'Normal';
          const severity = isFP ? 'FAUX POSITIF' : (alert.severity?.toUpperCase() || 'FAIBLE');
          const status = alert.status?.toUpperCase() || 'NOUVEAU';
          const ip = alert.sourceIp || alert.details?.src_ip || '-';
          const date = new Date(alert.timestamp || alert.createdAt);
          const dateStr = date.toLocaleDateString('fr-FR');
          const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          const alertId = (alert.id || alert._id)?.substring(0, 10)?.toUpperCase();

          return (
            <div
              key={alert._id || alert.id}
              className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-xl px-6 py-4 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300 dark:hover:border-blue-800/50"
              onClick={() => navigate(`/alerts/${alert.id || alert._id}`)}
            >
              {/* Severity Badge */}
              <div className="w-[100px] flex-shrink-0">
                <span className={`inline-flex justify-center items-center px-3 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${severityColors[severity] || severityColors['FAIBLE']}`}>
                  {severity}
                </span>
              </div>

              {/* Title & ID */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1f2937] dark:text-gray-200 truncate group-hover:text-[#1875c7] dark:group-hover:text-[#2bc0e4] transition-colors">{alert.title || alert.description}</p>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">DEF-{alertId}</p>
              </div>

              {/* Source & IP */}
              <div className="w-[160px] flex-shrink-0 text-right">
                <p className="text-sm font-bold text-[#1f2937] dark:text-gray-200">{alert.source}</p>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{ip}</p>
              </div>

              {/* Date */}
              <div className="w-[100px] flex-shrink-0 text-right">
                <p className="text-sm font-bold text-[#1f2937] dark:text-gray-200">{dateStr}</p>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{timeStr}</p>
              </div>

              {/* Status Badge */}
              <div className="w-[110px] flex-shrink-0">
                <span className={`inline-block px-3 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${statusColors[status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                  {status}
                </span>
              </div>

              {/* IA Link */}
              <div className="w-[130px] flex-shrink-0 text-center">
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="text-[10px] font-bold text-pink-400 hover:text-pink-600 flex items-center justify-center gap-1 w-full"
                >
                  <Sparkles className="h-3 w-3" />
                  IA RÉSOLUE
                </button>
              </div>

              {/* Eye Icon */}
              <div className="flex-shrink-0 text-gray-300 group-hover:text-[#1875c7] dark:text-gray-600 dark:group-hover:text-[#2bc0e4] transition-colors">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
              Aucune alerte ne correspond à vos filtres.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold uppercase tracking-wider">
              {searchTerm || severityFilter || statusFilter ? 'Essayez de réinitialiser la recherche.' : 'Le système est sécurisé.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertList;
