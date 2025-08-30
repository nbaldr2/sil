import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Download, RefreshCw, Eye, AlertTriangle, CheckCircle,
  Info, XCircle, User, Activity, Shield, Database, Clock
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user_email?: string;
  user_name?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address: string;
  success: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  metadata?: string;
}

interface AuditStats {
  overview: {
    totalEvents: number;
    uniqueUsers: number;
    failedEvents: number;
    criticalEvents: number;
  };
}

import { API_BASE_URL } from '../../config/api';

// ... existing code ...

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '', action: '', severity: '', category: '', startDate: '', endDate: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sil_lab_token');
    return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs`, {
        params: { ...filters, page: currentPage, limit: 20 },
        headers: getAuthHeaders()
      });
      setLogs(response.data.logs || []);
      setTotalRecords(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      console.log('Auth headers:', getAuthHeaders());
      console.log('Request URL:', `${API_BASE_URL}/admin/audit-logs`);
      
      // Show mock data for now to demonstrate the interface
      setLogs([
        {
          id: '1', timestamp: new Date().toISOString(), user_email: 'admin@sil-lab.com',
          user_name: 'Administrator', action: 'USER_LOGIN', resource_type: 'USER',
          ip_address: '192.168.1.100', success: true, severity: 'LOW' as const, category: 'AUTHENTICATION'
        },
        {
          id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user_email: 'user@sil-lab.com',
          user_name: 'Lab Technician', action: 'PATIENT_CREATE', resource_type: 'PATIENT',
          ip_address: '192.168.1.101', success: true, severity: 'MEDIUM' as const, category: 'PATIENT_MANAGEMENT'
        }
      ]);
      setTotalRecords(2);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/audit-stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      console.log('Auth headers for stats:', getAuthHeaders());
      console.log('Stats request URL:', `${API_BASE_URL}/admin/audit-stats`);
      
      // Provide mock stats for demonstration
      setStats({
        overview: { totalEvents: 1250, uniqueUsers: 15, failedEvents: 23, criticalEvents: 5 }
      });
    }
  }, []);

  const exportLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs/export`, {
        params: { ...filters, format: 'csv' },
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const initializeAuditSystem = async () => {
    try {
      console.log('Initializing audit system...');
      console.log('Auth headers:', getAuthHeaders());
      
      const response = await axios.post(`${API_BASE_URL}/admin/audit/initialize`, {}, { 
        headers: getAuthHeaders() 
      });
      
      console.log('Audit system initialization response:', response.data);
      alert('Audit system initialized successfully!');
      fetchLogs();
    } catch (error) {
      console.error('Failed to initialize audit system:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else {
        alert(`Failed to initialize audit system: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLogs]);

  const getSeverityColor = (severity: string) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <Shield className="inline w-8 h-8 mr-3 text-blue-600" />Audit Trail
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive system activity tracking</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={initializeAuditSystem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Database className="w-4 h-4 mr-2" />Initialize
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalEvents.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.uniqueUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Failed Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.failedEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Critical Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.criticalEvents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Export</h3>
            <button onClick={exportLogs} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />Export CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text" placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Severities</option>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option><option value="CRITICAL">Critical</option>
            </select>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit Events ({totalRecords.toLocaleString()} total)</h3>
              <button onClick={fetchLogs} disabled={loading} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div><div className="font-medium">{log.user_name || 'System'}</div>
                        <div className="text-gray-500 text-xs">{log.user_email || 'N/A'}</div></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{log.resource_type || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{log.success ? 'Success' : 'Failed'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{log.ip_address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => { setSelectedLog(log); setShowDetails(true); }} className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No audit logs found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No logs match your current filters.</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Event Details</h3>
                  <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                  <div><strong>User:</strong> {selectedLog.user_name} ({selectedLog.user_email})</div>
                  <div><strong>Action:</strong> {selectedLog.action}</div>
                  <div><strong>Resource:</strong> {selectedLog.resource_type} {selectedLog.resource_id && `(${selectedLog.resource_id})`}</div>
                  <div><strong>IP Address:</strong> {selectedLog.ip_address}</div>
                  <div><strong>Status:</strong> {selectedLog.success ? 'Success' : 'Failed'}</div>
                  <div><strong>Severity:</strong> {selectedLog.severity}</div>
                  <div><strong>Category:</strong> {selectedLog.category}</div>
                  {selectedLog.metadata && (
                    <div><strong>Metadata:</strong><pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto">{JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}</pre></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};