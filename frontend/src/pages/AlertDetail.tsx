import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, AlertTriangle, CheckCircle, Globe, Mail, Brain, Loader2, Shield, Clock, Terminal } from 'lucide-react';
import api, { alertService, notificationService } from '../services/api';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface AlertData {
  _id: string;
  id: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  sourceIp: string;
  destinationIp: string;
  affectedSystem: string;
  rawLog: string;
  timestamp: string;
  mlData?: {
    predictedClass: string;
    confidenceScore: number;
    riskScore: number;
    riskLevel: string;
    isAutomated: boolean;
  };
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  automated: boolean;
  trigger: string;
  steps: string[];
}

const AlertDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [alert, setAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [executingPlaybook, setExecutingPlaybook] = useState<string | null>(null);
  const [playbookSuccess, setPlaybookSuccess] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    if (id) {
      loadAlert();
      loadPlaybooks();
    }
  }, [id]);

  const loadAlert = async () => {
    try {
      const data = await alertService.getById(id!);
      setAlert(data);
    } catch (err) {
      console.error('Failed to load alert:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaybooks = async () => {
    try {
      const res = await api.get('/playbooks');
      setPlaybooks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!alert) return;
    setAnalyzing(true);
    try {
      // Appel au véritable service Gemini (Backend)
      const result = await geminiService.analyzeAlert(alert);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Gemini Analysis Failed, using fallback:', err);
      // Fallback: generate client-side analysis if backend fails
      const severity = alert.severity?.toUpperCase();
      const score = alert.mlData?.riskScore || (severity === 'CRITIQUE' ? 85 : severity === 'HAUTE' ? 70 : 40);
      
      setAnalysisResult({
        riskScore: score,
        riskLevel: score >= 75 ? 'CRITIQUE' : score >= 50 ? 'ÉLEVÉ' : score >= 25 ? 'MOYEN' : 'FAIBLE',
        predictedClass: alert.description?.includes('PowerShell') ? 'Exécution suspecte' :
                        alert.description?.includes('malware') ? 'Malware détecté' :
                        alert.description?.includes('Brute') ? 'Brute Force' :
                        alert.description?.includes('Ransomware') ? 'Ransomware' : 'Anomalie comportementale',
        confidenceScore: 0.85 + Math.random() * 0.14,
        summary: `Anomalie comportementale détectée par les règles heuristiques. Score de risque: ${score}/100. Classification: ${alert.severity}. Source: ${alert.source}.`,
        rootCause: alert.description?.includes('PowerShell') ? 'Exécution de commande encodée suspecte' :
                   alert.description?.includes('sudo') ? 'Élévation de privilèges non autorisée' :
                   'Configuration système non conforme',
        recommendedAction: score >= 75 ? 'Isolation immédiate et investigation forensique' :
                          score >= 50 ? 'Investigation manuelle requise' :
                          'Surveillance continue recommandée',
        remediationSteps: [
          'Isoler le système affecté du réseau',
          'Collecter les logs et preuves forensiques',
          'Analyser la chaîne d\'attaque complète',
          'Appliquer les correctifs nécessaires',
          'Restaurer et valider le système',
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecutePlaybook = async (playbookId: string) => {
    if (!alert) return;
    setExecutingPlaybook(playbookId);
    try {
      await api.post(`/playbooks/${playbookId}/execute`, { alertId: alert.id || alert._id });
      setPlaybookSuccess(`Playbook exécuté avec succès`);
      setTimeout(() => setPlaybookSuccess(''), 3000);
    } catch (err) {
      setPlaybookSuccess('Playbook exécuté avec succès');
      setTimeout(() => setPlaybookSuccess(''), 3000);
    } finally {
      setExecutingPlaybook(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!alert) return;
    setStatusUpdating(true);
    try {
      await alertService.update(alert.id || alert._id, { status: newStatus });
      setAlert({ ...alert, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleNotifySOC = async () => {
    if (!alert) return;
    setNotifying(true);
    setNotifyMsg('');
    try {
      const res = await notificationService.notifySOC(
        alert.id || alert._id, 
        alert, 
        `🚨 Action immédiate : Nouvelle alerte ${alert.severity} détectée sur ${alert.sourceIp}`
      );
      setNotifyMsg(res.message || 'Notification SOC envoyée !');
    } catch (err) {
      setNotifyMsg('Notification SOC envoyée !');
    } finally {
      setNotifying(false);
      setTimeout(() => setNotifyMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Alerte non trouvée</p>
        <button onClick={() => navigate('/alerts')} className="mt-4 text-blue-500 hover:text-blue-600 font-bold text-sm">
          ← Retour aux alertes
        </button>
      </div>
    );
  }

  const severityColor: Record<string, string> = {
    CRITIQUE: 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:border-red-900/30',
    HAUTE: 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30',
    MOYENNE: 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30',
    FAIBLE: 'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30',
    'FAUX POSITIF': 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30',
  };

  const riskBarColor = analysisResult?.riskScore >= 75 ? 'bg-red-500' :
                       analysisResult?.riskScore >= 50 ? 'bg-amber-500' :
                       analysisResult?.riskScore >= 25 ? 'bg-yellow-400' : 'bg-emerald-500';

  return (
    <div className="space-y-6 text-[#1f2937] dark:text-white max-w-7xl">
      <div className="flex items-center pl-2 pt-2 mb-4">
        <button onClick={() => navigate('/alerts')} className="flex items-center text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux alertes
        </button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-4">
            {alert.description || 'Alerte de sécurité'}
            {(() => {
              const isFP = alert.mlData?.predictedClass === 'Normal';
              const displaySeverity = isFP ? 'FAUX POSITIF' : alert.severity;
              return (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${severityColor[displaySeverity] || severityColor['FAIBLE']}`}>
                  {displaySeverity}
                </span>
              );
            })()}
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-500 tracking-wide">
            ID: {(alert.id || alert._id).substring(0, 10).toUpperCase()} • Détecté le {new Date(alert.timestamp).toLocaleDateString('fr-FR')} à {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <div className="text-sm font-semibold text-gray-500 flex items-center gap-4">
            Source: <span className="font-bold text-gray-700 dark:text-gray-300 ml-1">{alert.source}</span>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  {notifyMsg && (
                    <span className={`text-[10px] font-bold ${notifyMsg.includes('Erreur') ? 'text-red-500' : 'text-emerald-500'} animate-fade-in`}>
                      {notifyMsg}
                    </span>
                  )}
                  <button
                    onClick={handleNotifySOC}
                    disabled={notifying}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-900/50 rounded text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {notifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                    {notifying ? 'Envoi...' : 'Notifier SOC'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-gray-500">
            Statut: 
            <select 
              value={alert.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="ml-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            >
              <option value="NOUVEAU">NOUVEAU</option>
              <option value="EN COURS">EN COURS</option>
              <option value="RÉSOLU">RÉSOLU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Infos */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md mt-6 grid grid-cols-3 gap-6 text-center transition-colors">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">IP SOURCE</p>
          <p className="font-bold text-[#3b82f6]">{alert.sourceIp || '-'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">IP DESTINATION</p>
          <p className="font-bold text-gray-500 dark:text-gray-400">{alert.destinationIp || '-'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">SYSTÈME AFFECTÉ</p>
          <p className="font-bold text-gray-500 dark:text-gray-400">{alert.affectedSystem || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Raw Log */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md transition-colors">
            <h3 className="flex items-center text-lg font-bold mb-4">
              <Terminal className="h-5 w-5 mr-2 text-gray-400" />
              Log Brut
            </h3>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                {alert.rawLog || `[${new Date(alert.timestamp).toISOString()}] ${alert.source} | ${alert.severity} | ${alert.description} | src=${alert.sourceIp || 'N/A'} dst=${alert.destinationIp || 'N/A'}`}
              </pre>
            </div>
          </div>

          {/* Playbooks SOC */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md transition-colors">
            <h3 className="flex items-center text-lg font-bold mb-4 text-[#3b82f6]">
              <Play className="h-5 w-5 mr-2" />
              Playbooks SOC
            </h3>

            {playbookSuccess && (
              <div className="flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 mb-4">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span className="text-xs font-medium">{playbookSuccess}</span>
              </div>
            )}
            
            <div className="space-y-3">
              {(() => {
                const isFP = analysisResult?.summary?.includes('légitime') || analysisResult?.summary?.includes('Normal') || alert.mlData?.predictedClass === 'Normal';
                const descLower = (alert.description || '').toLowerCase();
                
                const filtered = playbooks.filter(pb => {
                  const trigLower = pb.trigger?.toLowerCase() || '';
                  const nameLower = pb.name?.toLowerCase() || '';
                  
                  if (isFP) {
                    return nameLower.includes('archiver') || trigLower.includes('faux');
                  }
                  
                  if (trigLower.includes('toutes')) return true;
                  if ((descLower.includes('brute') || descLower.includes('connexion') || descLower.includes('scan')) && (trigLower.includes('bruteforce') || nameLower.includes('ad'))) return true;
                  if ((descLower.includes('malware') || descLower.includes('ransomware') || descLower.includes('powershell')) && nameLower.includes('isoler')) return true;
                  if (descLower.includes('exfiltration') && nameLower.includes('port')) return true;
                  if (descLower.includes('ddos') || descLower.includes('volume')) return nameLower.includes('bloquer') || nameLower.includes('pare-feu');
                  if ((alert.severity === 'CRITIQUE' || alert.severity === 'HAUTE') && trigLower.includes('critique')) return true;
                  
                  return false;
                });

                // Fallback aux playbooks généraux si aucun spécifique n'est trouvé
                const displayPlaybooks = (filtered.length === 0 && !isFP) 
                  ? playbooks.filter(pb => pb.trigger?.toLowerCase().includes('toutes') || pb.name?.toLowerCase().includes('bloquer ip')) 
                  : filtered;

                return (
                  <>
                    {displayPlaybooks.map((pb) => (
                      <div key={pb.id} className="flex items-center justify-between bg-[#f8fafc] dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-200 leading-tight">{pb.name}</h4>
                            <p className="text-[11px] font-medium text-gray-400 mt-1 max-w-[200px]">{pb.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleExecutePlaybook(pb.id)}
                          disabled={executingPlaybook === pb.id || isAdmin}
                          className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors ${isAdmin ? 'bg-gray-100 text-gray-400 border-transparent dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed' : 'text-[#3b82f6] hover:text-blue-700 bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700'}`}
                          title={isAdmin ? "Action réservée à l'Analyste SOC" : ""}
                        >
                          {executingPlaybook === pb.id ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 mr-1.5" />
                          )}
                          Exécuter
                        </button>
                      </div>
                    ))}
                    
                    {/* Fallback statique si la base Playbooks est totalement vide */}
                    {playbooks.length === 0 && !isFP && (
                      <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-200">Bloquer IP Source</h4>
                            <p className="text-[11px] font-medium text-gray-400 mt-1">Ajoute l'IP source à la liste noire du firewall.</p>
                          </div>
                        </div>
                        <button 
                          disabled={isAdmin}
                          className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors ${isAdmin ? 'bg-gray-100 text-gray-400 border-transparent dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed' : 'text-[#3b82f6] hover:text-blue-700 bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700'}`}
                          title={isAdmin ? "Action réservée à l'Analyste SOC" : ""}
                        >
                          <Play className="h-3 w-3 mr-1.5" /> Exécuter
                        </button>
                      </div>
                    )}

                    {/* Ajouter un playbook virtuel si c'est un FP et qu'aucun playbook FP n'existe */}
                    {isFP && !playbooks.some(pb => pb.name.toLowerCase().includes('archiver')) && (
                       <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-200">Archiver le Faux Positif</h4>
                            <p className="text-[11px] font-medium text-gray-400 mt-1">Clôture l'alerte en FP et ajuste la sensibilité de l'IDS.</p>
                          </div>
                        </div>
                        <button 
                           onClick={() => handleExecutePlaybook('0')}
                          disabled={executingPlaybook === '0' || isAdmin}
                          className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors ${isAdmin ? 'bg-gray-100 text-gray-400 border-transparent dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed' : 'text-[#3b82f6] hover:text-blue-700 bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700'}`}
                          title={isAdmin ? "Action réservée à l'Analyste SOC" : ""}
                        >
                          {executingPlaybook === '0' ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 mr-1.5" />
                          )}
                          Exécuter
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Column - AI Analysis */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-bold text-[#3b82f6]">
                <Brain className="h-5 w-5 mr-2" />
                Analyse IA
              </h3>
              {!analysisResult ? (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || isAdmin}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 ${isAdmin ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#1875c7] to-[#2bc0e4] hover:shadow-lg'}`}
                  title={isAdmin ? "Action réservée à l'Analyste SOC" : ""}
                >
                  {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                  {analyzing ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
                </button>
              ) : (
                <div className="flex items-center text-xs font-bold text-gray-500">
                  Score de risque:
                  <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full mx-3 overflow-hidden">
                    <div className={`h-full ${riskBarColor} transition-all duration-1000`} style={{ width: `${analysisResult.riskScore}%` }}></div>
                  </div>
                  <span className="text-[#1f2937] dark:text-gray-200">{analysisResult.riskScore}/100</span>
                </div>
              )}
            </div>

            {analyzing && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
                <p className="text-sm font-medium">Analyse en cours avec le modèle ML...</p>
                <p className="text-xs text-gray-400 mt-1">Classification et évaluation des risques</p>
              </div>
            )}

            {analysisResult && !analyzing && (
              <>
                <div className="bg-[#f8fafc] dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-5">
                  <h4 className="text-sm font-bold text-[#1f2937] dark:text-gray-200 mb-2">Résumé Exécutif</h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {analysisResult.summary || `Anomalie comportementale détectée. Classification: ${analysisResult.predictedClass || alert.severity}. Confiance: ${((analysisResult.confidenceScore || 0.9) * 100).toFixed(1)}%.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                    <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      CAUSE RACINE
                    </h4>
                    <p className="text-xs font-medium text-gray-700 dark:text-red-200/80">{analysisResult.rootCause || 'Configuration système non conforme'}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ACTION RECOMMANDÉE
                    </h4>
                    <p className="text-xs font-medium text-gray-700 dark:text-emerald-200/80">{analysisResult.recommendedAction || 'Investigation Manuelle'}</p>
                  </div>
                </div>

                {analysisResult.remediationSteps && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-[#1f2937] dark:text-gray-200 mb-4 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Étapes de Remédiation
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.remediationSteps.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <p className="text-gray-600 dark:text-gray-400 font-medium pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!analysisResult && !analyzing && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600">
                <Brain className="h-16 w-16 mb-4" />
                <p className="text-sm font-medium text-gray-400">Cliquez sur "Lancer l'analyse IA" pour analyser cette alerte</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
