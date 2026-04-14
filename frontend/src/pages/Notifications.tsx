import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertTriangle, CheckCircle, ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import { notificationService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert' | 'critique';
  sender: string;
  createdAt: string;
  alertId?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      if (res.status === 'success') {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critique': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
     switch (type) {
      case 'critique': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20';
      case 'alert': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';
      default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            title="Retour au Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight dark:text-white flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              Centre de Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Messages de l'administrateur et alertes système critiques
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune notification pour le moment.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-4 p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${getBg(notif.type)}`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                    {notif.sender || 'SYSTÈME'} • {notif.type}
                  </p>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                  {notif.message}
                </p>
                {notif.alertId && (
                  <button 
                    onClick={() => navigate(`/alerts/${notif.alertId}`)}
                    className="mt-3 text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                  >
                    Voir l'alerte concernée →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
