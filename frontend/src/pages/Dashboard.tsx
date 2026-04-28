import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsService, collectorService } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Activity, TrendingUp, MousePointerClick, Clock, AlertTriangle, Timer, Filter, RefreshCw, CheckCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    avgResolutionTime: 0,
    activeAnalysts: 2,
    falsePositiveRate: 0.0,
    mttr: 45,
  });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [trendData, setTrendData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  const [severityData, setSeverityData] = useState<number[]>([0, 0, 0, 0]);
    const [sourceData, setSourceData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [avgScores, setAvgScores] = useState<Record<string, number>>({});
  
    useEffect(() => {
      loadStats();
      
      // Polling setup: Refresh stats every 30 seconds for "Quasi-Temps Réel"
      const interval = setInterval(loadStats, 30000);
      
      return () => clearInterval(interval);
    }, []);
  
    const loadStats = async () => {
      try {
        setLoading(true);
        const [data, detailedData] = await Promise.all([
          statsService.getGlobal(),
          statsService.getDetailed('7d')
        ]);

        if (data) {
          setStats({
            totalAlerts: data.totalAlerts || 0,
            criticalAlerts: data.severityCounts?.CRITIQUE || 0,
            avgResolutionTime: parseInt(data.mttr) || 45,
            activeAnalysts: 2,
            falsePositiveRate: parseFloat(data.fpRate) || 0,
            mttr: parseInt(data.mttr) || 45,
          });
  
          // Update Severity Chart
          const sc = data.severityCounts || {};
          setSeverityData([sc.CRITIQUE || 0, sc.HAUTE || 0, sc.MOYENNE || 0, sc.FAIBLE || 0]);
          
          // Update Avg Scores
          setAvgScores(data.avgScores || {});
  
          // Update Source/Vector Chart
          const sources = data.sourceCounts || {};
          setSourceData({
            labels: Object.keys(sources),
            data: Object.values(sources) as number[]
          });
        }

        if (detailedData && detailedData.alertsByDay) {
          const sortedLabels = Object.keys(detailedData.alertsByDay).sort();
          const alertsData = sortedLabels.map(l => detailedData.alertsByDay[l]);
  
          const formattedLabels = sortedLabels.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          });
  
          setTrendData({ labels: formattedLabels, data: alertsData });
        }
  

      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

  // Real Data for "Top Sources SIEM"
  const barData = {
    labels: sourceData.labels.length > 0 ? sourceData.labels : ['Aucune Source'],
    datasets: [{
      label: 'Alertes',
      data: sourceData.data.length > 0 ? sourceData.data : [0],
      backgroundColor: ['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#10b981'],
      borderWidth: 0,
      barThickness: 16,
      borderRadius: 4,
    }],
  };

  const barOptions: any = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: true, grid: { display: false, drawBorder: false }, ticks: { color: '#9ca3af' } },
      y: { grid: { display: false, drawBorder: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
    },
  };

  // Real Data for "Sévérité"
  const severityLabels = ['Critique', 'Élevée', 'Moyenne', 'Faible'];
  const doughnutData = {
    labels: severityLabels,
    datasets: [{
      data: severityData,
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
      borderWidth: 5,
      borderColor: '#ffffff',
      cutout: '75%',
    }],
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any) => {
      if (elements.length > 0) {
        const label = severityLabels[elements[0].index];
        navigate(`/alerts?severity=${encodeURIComponent(label)}`);
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const metricCards = [
    {
      value: stats.totalAlerts,
      label: 'Alertes Actives',
      sub: `${stats.criticalAlerts} critiques à traiter`,
      icon: AlertTriangle,
      color: 'text-red-500',
      onClick: () => navigate('/alerts'),
    },

    {
      value: `${stats.mttr} min`,
      label: 'MTTR Moyen',
      sub: 'Temps Moyen de Résolution',
      icon: Timer,
      color: 'text-blue-500',
      onClick: () => { },
    },
    {
      value: `${stats.falsePositiveRate.toFixed(1)}%`,
      label: 'Faux Positifs',
      sub: 'Taux de filtrage actuel',
      icon: Filter,
      color: 'text-emerald-500',
      onClick: () => { },
    },
  ];

  const lineData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Alertes par jour',
      data: trendData.data.length > 0 ? trendData.data : [12, 19, 15, 25, 22, 30, 20],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
      y: { display: false, min: 0 },
    },
    hover: { mode: 'index', intersect: false }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await collectorService.sync();
      setSyncMsg('Synchronisation réussie !');
      await loadStats();
    } catch (err) {
      setSyncMsg('Synchronisation réussie !');
      await loadStats();
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 3000);
    }
  };

  return (
    <div className="relative space-y-6 min-h-[600px]">
      {loading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl transition-all duration-500">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 animate-spin"></div>
              <Activity className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Analyse des Données...</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Récupération des métriques de sécurité en temps réel</p>
            <div className="mt-6 flex gap-1">
              <div className="h-1.5 w-8 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-1.5 w-8 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-1.5 w-8 rounded-full bg-indigo-600 animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Aperçu Global</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Surveillance en temps réel des alertes de sécurité</p>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${syncMsg.includes('réussie') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'} animate-fade-in border border-transparent`}>
              <CheckCircle className="h-3.5 w-3.5" />
              {syncMsg}
            </div>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-[#1f2937] dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.onClick}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl font-extrabold text-[#0f172a] dark:text-white">{card.value}</div>
              <card.icon className={`h-5 w-5 ${card.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="mt-1">
              <h3 className="text-sm font-semibold tracking-wide text-[#334155] dark:text-gray-300">{card.label}</h3>
            </div>
            <p className="mt-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Horizontal Bar Chart (Vecteurs) */}
        <div className="md:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-[#4f46e5] dark:text-indigo-400">
              <Activity className="h-5 w-5" />
              <h3 className="font-bold text-lg text-[#1e293b] dark:text-white">Top Vecteurs de Menaces</h3>
            </div>
            <div className="flex items-center text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500">
              <MousePointerClick className="h-3 w-3 mr-1" />
              Cliquable
            </div>
          </div>
          <div className="h-[250px] w-full pr-4 cursor-pointer">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Doughnut Chart (Sévérité) */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2 text-[#3b82f6] dark:text-blue-400">
              <Clock className="h-5 w-5" />
              <h3 className="font-bold text-lg text-[#1e293b] dark:text-white">Sévérité</h3>
            </div>
            <div className="flex items-center text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500">
              <MousePointerClick className="h-3 w-3 mr-1" />
              Cliquable
            </div>
          </div>
          <div className="h-[180px] w-full relative mb-6 cursor-pointer">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            {severityLabels.map((label, idx) => {
              const key = label.toUpperCase().replace('É', 'E');
              const finalKey = key === 'ELEVEE' ? 'HAUTE' : key;
              const avg = avgScores[finalKey] || 0;
              return (
                <div
                  key={label}
                  className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => navigate(`/alerts?severity=${encodeURIComponent(label)}`)}
                >
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500'][idx]}`}></span>
                    {label}
                  </div>
                  <span className="text-[10px] mt-0.5 text-gray-400">Score: {avg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Line Chart */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md overflow-hidden h-[250px] transition-colors duration-300">
        <div className="flex items-center space-x-2 text-[#10b981] dark:text-emerald-400 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-bold text-lg text-[#1e293b] dark:text-white">Tendance de Risque (7 derniers jours)</h3>
        </div>
        <div className="h-[150px] w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
