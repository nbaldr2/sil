import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../App';
import { qualityControlService } from '../services/qualityControl';

interface QCNotification {
  id: string;
  automateId: string;
  automateName: string;
  testName: string;
  status: 'warning' | 'fail';
  deviation: number;
  timestamp: string;
}

export default function QCNotificationBell() {
  const { language } = useAuth();
  const [notifications, setNotifications] = useState<QCNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    fr: {
      qcAlerts: 'Alertes CQ',
      noAlerts: 'Aucune alerte',
      warning: 'Avertissement',
      fail: 'Échec',
      deviation: 'Déviation',
      viewAll: 'Voir toutes les alertes',
      newAlert: 'Nouvelle alerte CQ'
    },
    en: {
      qcAlerts: 'QC Alerts',
      noAlerts: 'No alerts',
      warning: 'Warning',
      fail: 'Fail',
      deviation: 'Deviation',
      viewAll: 'View all alerts',
      newAlert: 'New QC alert'
    }
  }[language];

  useEffect(() => {
    loadNotifications();
    
    // Check for new alerts every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Get recent QC results with warnings and failures (last 24 hours)
      const data = await qualityControlService.getAllQCResults({
        limit: 20
      });

      // Filter for warnings and failures from the last 24 hours
      const recentAlerts = data.qcResults
        .filter((result: any) => {
          const resultTime = new Date(result.timestamp).getTime();
          const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
          return (result.status === 'warning' || result.status === 'fail') && 
                 resultTime > twentyFourHoursAgo;
        })
        .map((result: any) => ({
          id: result.id,
          automateId: result.automateId,
          automateName: result.automate.name,
          testName: result.testName,
          status: result.status,
          deviation: result.deviation,
          timestamp: result.timestamp
        }));

      setNotifications(recentAlerts);
    } catch (error) {
      console.error('Error loading QC notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fail':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const unacknowledgedCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell size={20} />
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t.qcAlerts}
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {t.noAlerts}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(notification.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.automateName}
                          </p>
                          <span className={`text-xs font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status === 'fail' ? t.fail : t.warning}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {notification.testName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t.deviation}: {notification.deviation > 0 ? '+' : ''}{notification.deviation.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to QC alerts page
                  window.location.href = '/quality-control';
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t.viewAll}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}