import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Bell, BellOff, Clock, Filter } from 'lucide-react';
import { useAuth } from '../App';
import { qualityControlService } from '../services/qualityControl';

interface QCAlert {
  id: string;
  automateId: string;
  automateName: string;
  testName: string;
  level: string;
  status: 'warning' | 'fail';
  deviation: number;
  value: number;
  expected: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface QCAlertsProps {
  onAlertCount?: (count: number) => void;
}

export default function QCAlerts({ onAlertCount }: QCAlertsProps) {
  const { language, user } = useAuth();
  const [alerts, setAlerts] = useState<QCAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'warning' | 'fail'>('unacknowledged');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const t = {
    fr: {
      title: 'Alertes Contrôle Qualité',
      noAlerts: 'Aucune alerte',
      unacknowledged: 'Non acquittées',
      acknowledged: 'Acquittées',
      warning: 'Avertissement',
      fail: 'Échec',
      all: 'Toutes',
      acknowledge: 'Acquitter',
      acknowledgeAll: 'Acquitter tout',
      autoRefresh: 'Actualisation auto',
      deviation: 'Déviation',
      expected: 'Attendu',
      measured: 'Mesuré',
      acknowledgedBy: 'Acquitté par',
      at: 'à',
      filters: 'Filtres',
      alertCount: 'alertes actives'
    },
    en: {
      title: 'Quality Control Alerts',
      noAlerts: 'No alerts',
      unacknowledged: 'Unacknowledged',
      acknowledged: 'Acknowledged',
      warning: 'Warning',
      fail: 'Fail',
      all: 'All',
      acknowledge: 'Acknowledge',
      acknowledgeAll: 'Acknowledge All',
      autoRefresh: 'Auto refresh',
      deviation: 'Deviation',
      expected: 'Expected',
      measured: 'Measured',
      acknowledgedBy: 'Acknowledged by',
      at: 'at',
      filters: 'Filters',
      alertCount: 'active alerts'
    }
  }[language];

  useEffect(() => {
    loadAlerts();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
    onAlertCount?.(unacknowledgedCount);
  }, [alerts, onAlertCount]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // Get recent QC results with warnings and failures
      const data = await qualityControlService.getAllQCResults({
        limit: 100,
        status: filter === 'warning' ? 'warning' : filter === 'fail' ? 'fail' : undefined
      });

      // Transform QC results into alerts
      const qcAlerts: QCAlert[] = data.qcResults
        .filter((result: any) => result.status === 'warning' || result.status === 'fail')
        .map((result: any) => ({
          id: result.id,
          automateId: result.automateId,
          automateName: result.automate.name,
          testName: result.testName,
          level: result.level,
          status: result.status,
          deviation: result.deviation,
          value: result.value,
          expected: result.expected,
          timestamp: result.timestamp,
          acknowledged: false, // This would come from a separate alerts table in a real implementation
          acknowledgedBy: undefined,
          acknowledgedAt: undefined
        }));

      setAlerts(qcAlerts);
    } catch (error) {
      console.error('Error loading QC alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // In a real implementation, this would update an alerts table
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              acknowledged: true, 
              acknowledgedBy: user?.email || 'Unknown',
              acknowledgedAt: new Date().toISOString()
            }
          : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const acknowledgeAllAlerts = async () => {
    try {
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        acknowledged: true,
        acknowledgedBy: user?.email || 'Unknown',
        acknowledgedAt: new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error acknowledging all alerts:', error);
    }
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getAlertBgColor = (status: string, acknowledged: boolean) => {
    if (acknowledged) {
      return 'bg-gray-50 dark:bg-gray-800 opacity-75';
    }
    switch (status) {
      case 'fail':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unacknowledged':
        return !alert.acknowledged;
      case 'warning':
        return alert.status === 'warning';
      case 'fail':
        return alert.status === 'fail';
      default:
        return true;
    }
  });

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          {unacknowledgedCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unacknowledgedCount} {t.alertCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              autoRefresh 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {autoRefresh ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="text-sm">{t.autoRefresh}</span>
          </button>
          
          {unacknowledgedCount > 0 && (
            <button
              onClick={acknowledgeAllAlerts}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {t.acknowledgeAll}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t.filters}:</span>
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'unacknowledged', label: t.unacknowledged },
            { key: 'all', label: t.all },
            { key: 'warning', label: t.warning },
            { key: 'fail', label: t.fail }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t.noAlerts}
            </h3>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg ${getAlertBgColor(alert.status, alert.acknowledged)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {alert.automateName} - {alert.testName}
                      </h4>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {alert.level}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>{t.measured}: {alert.value}</span>
                        <span>{t.expected}: {alert.expected}</span>
                        <span className={`font-medium ${
                          alert.status === 'fail' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {t.deviation}: {alert.deviation > 0 ? '+' : ''}{alert.deviation.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                      
                      {alert.acknowledged && alert.acknowledgedBy && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {t.acknowledgedBy} {alert.acknowledgedBy} {t.at} {new Date(alert.acknowledgedAt!).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    {t.acknowledge}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}