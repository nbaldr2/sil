import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Database,
  Activity,
  Clock,
  Settings,
  Shield,
  Wifi,
  Zap,
  Monitor,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  Battery,
  Thermometer,
  Users,
  Package,
  Eye,
  Calendar,
  Globe
} from 'lucide-react';
import { useAuth } from '../App';

interface ServerInfo {
  timestamp: string;
  system: {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
    sku: string;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    logofile: string;
    uptime: number;
  };
  runtime: {
    node: string;
    npm: string;
    pm2?: string;
    yarn?: string;
  };
  process: {
    pid: number;
    ppid: number;
    platform: string;
    arch: string;
    nodeVersion: string;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    uptime: number;
    cwd: string;
    execPath: string;
    env: Record<string, string>;
  };
  application: {
    serverStartTime: string;
    serverUptime: number;
    totalRequests: number;
    totalPatients: number;
    totalDoctors: number;
    totalAnalyses: number;
    totalResults: number;
    configRecords: number;
  };
  performance: {
    cpu: {
      manufacturer?: string;
      brand: string;
      speed: number;
      speedMax?: number;
      cores: number;
      physicalCores?: number;
      processors?: number;
      cache?: any;
      currentLoad?: number;
      temperature?: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
      active?: number;
      available: number;
      buffers?: number;
      cached?: number;
      usage: string;
      layout?: Array<{
        size: number;
        bank: string;
        type: string;
        clockSpeed: number;
        formFactor: string;
        manufacturer: string;
      }>;
    };
    graphics?: Array<{
      vendor: string;
      model: string;
      vram: number;
      vramDynamic: boolean;
    }>;
  };
  storage: Array<{
    device: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usePercent: number;
    mount: string;
  }>;
  network: {
    hostname: string;
    interfaces?: Array<{
      iface: string;
      ip4: string;
      ip6: string;
      mac: string;
      type: string;
      speed: number;
    }>;
    externalIP: { ok: boolean; outAddr?: string };
    internetConnectivity: number | null;
  };
  security: {
    users?: Array<{ user: string; tty: string; date: string; time: string }>;
    processes: {
      total: number;
      running: number;
      blocked: number;
      sleeping: number;
    };
    services: number;
  };
  database: {
    type: string;
    size: number;
    tables: {
      patients: number;
      doctors: number;
      analyses: number;
      requests: number;
      results: number;
      configs: number;
    };
  };
  battery?: {
    hasBattery: boolean;
    cycleCount: number;
    isCharging: boolean;
    designedCapacity: number;
    maxCapacity: number;
    currentCapacity: number;
    voltage: number;
    capacityUnit: string;
    percent: number;
  } | null;
}

export default function ServerInfo() {
  const { language } = useAuth();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const fetchServerInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5001/api/config/server-info');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setServerInfo(data.serverInfo);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server info');
      console.error('Error fetching server info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerInfo();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (autoRefresh) {
      interval = setInterval(fetchServerInfo, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const InfoCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    className?: string;
  }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const ProgressBar: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span className={getStatusColor(percentage)}>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Server Information</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
              <button
                onClick={fetchServerInfo}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors dark:bg-red-700 dark:hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serverInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">No server information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System & Server Information</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive overview of system resources, performance, and application metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchServerInfo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard title="System" icon={<Monitor className="text-blue-600" size={20} />}>
          <div className="space-y-2 text-sm">
            <div className="text-gray-700 dark:text-gray-300"><strong>Model:</strong> {serverInfo.system.manufacturer} {serverInfo.system.model}</div>
            <div className="text-gray-700 dark:text-gray-300"><strong>OS:</strong> {serverInfo.os.distro} {serverInfo.os.release}</div>
            <div className="text-gray-700 dark:text-gray-300"><strong>Arch:</strong> {serverInfo.os.arch}</div>
            <div className="text-gray-700 dark:text-gray-300"><strong>Hostname:</strong> {serverInfo.os.hostname}</div>
            <div className="text-gray-700 dark:text-gray-300"><strong>Uptime:</strong> {formatUptime(serverInfo.os.uptime)}</div>
          </div>
        </InfoCard>

        <InfoCard title="CPU" icon={<Cpu className="text-green-600" size={20} />}>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">{serverInfo.performance.cpu.brand}</div>
              <div className="text-gray-600 dark:text-gray-400">{serverInfo.performance.cpu.cores} cores @ {serverInfo.performance.cpu.speed} GHz</div>
            </div>
            <ProgressBar 
              percentage={serverInfo.performance.cpu.currentLoad || 0} 
              label="CPU Usage" 
            />
            {(serverInfo.performance.cpu.temperature || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Thermometer size={14} />
                <span>{serverInfo.performance.cpu.temperature}°C</span>
              </div>
            )}
          </div>
        </InfoCard>

        <InfoCard title="Memory" icon={<MemoryStick className="text-purple-600" size={20} />}>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-gray-700 dark:text-gray-300"><strong>Total:</strong> {formatBytes(serverInfo.performance.memory.total)}</div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Available:</strong> {formatBytes(serverInfo.performance.memory.available)}</div>
            </div>
            <ProgressBar 
              percentage={parseFloat(serverInfo.performance.memory.usage)} 
              label="Memory Usage" 
            />
          </div>
        </InfoCard>

        <InfoCard title="Storage" icon={<HardDrive className="text-orange-600" size={20} />}>
          {serverInfo.storage.map((disk, index) => (
            <div key={index} className="space-y-2 mb-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">{disk.mount}</div>
                <div className="text-gray-600 dark:text-gray-400">({disk.type})</div>
                <div className="text-gray-600 dark:text-gray-400">{formatBytes(disk.used)} / {formatBytes(disk.size)}</div>
              </div>
              <ProgressBar 
                percentage={disk.usePercent} 
                label={`Disk ${disk.device}`} 
              />
            </div>
          ))}
        </InfoCard>
      </div>

      {/* Application Statistics */}
      <InfoCard title="Application Statistics" icon={<Activity className="text-indigo-600" size={20} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{serverInfo.application.totalPatients.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Patients</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{serverInfo.application.totalDoctors.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Doctors</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{serverInfo.application.totalAnalyses.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analyses</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{serverInfo.application.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Requests</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{serverInfo.application.totalResults.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Results</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{formatUptime(serverInfo.application.serverUptime)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</div>
          </div>
        </div>
      </InfoCard>

      {/* Detailed Information Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Database Information" icon={<Database className="text-teal-600" size={20} />}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.database.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Size:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatBytes(serverInfo.database.size)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Table Records:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Patients:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.patients.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Doctors:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.doctors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Analyses:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.analyses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Requests:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.requests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Results:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.results.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Configs:</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.database.tables.configs.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Network Information" icon={<Network className="text-cyan-600" size={20} />}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.network.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">External IP:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {serverInfo.network.externalIP.ok ? 
                  serverInfo.network.externalIP.outAddr || 'Connected' : 
                  'Not available'
                }
              </span>
            </div>
            {serverInfo.network.internetConnectivity && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Internet Latency:</span>
                <span className="font-medium text-gray-900 dark:text-white">{serverInfo.network.internetConnectivity}ms</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Network Interfaces:</h4>
              <div className="space-y-2 text-sm">
                {(serverInfo.network.interfaces || []).slice(0, 3).map((iface, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 rounded">
                    <div className="font-medium text-gray-900 dark:text-white">{iface.iface}</div>
                    <div className="text-gray-600 dark:text-gray-400">IP: {iface.ip4}</div>
                    <div className="text-gray-600 dark:text-gray-400">Type: {iface.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* Runtime and Process Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Runtime Environment" icon={<Settings className="text-emerald-600" size={20} />}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Node.js:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.runtime.node}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">NPM:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.runtime.npm || 'N/A'}</span>
            </div>
            {serverInfo.runtime.yarn && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Yarn:</span>
                <span className="font-medium text-gray-900 dark:text-white">{serverInfo.runtime.yarn}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.process.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.process.arch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Process ID:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.process.pid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Working Directory:</span>
              <span className="font-medium text-xs text-gray-900 dark:text-white break-all">{serverInfo.process.cwd}</span>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Security & Users" icon={<Shield className="text-red-600" size={20} />}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
              <span className="font-medium text-gray-900 dark:text-white">{(serverInfo.security.users || []).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Processes:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.security.processes.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Running Processes:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.security.processes.running}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">System Services:</span>
              <span className="font-medium text-gray-900 dark:text-white">{serverInfo.security.services}</span>
            </div>
            {(serverInfo.security.users || []).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Logged in Users:</h4>
                <div className="space-y-1 text-sm">
                  {(serverInfo.security.users || []).slice(0, 3).map((user, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-900 dark:text-white">{user.user}</span>
                      <span className="text-gray-500 dark:text-gray-400">{user.tty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Graphics and Battery Information */}
      {((serverInfo.performance.graphics || []).length > 0 || serverInfo.battery) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(serverInfo.performance.graphics || []).length > 0 && (
            <InfoCard title="Graphics" icon={<Eye className="text-pink-600" size={20} />}>
              <div className="space-y-3">
                {(serverInfo.performance.graphics || []).map((gpu, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded">
                    <div className="font-medium text-gray-900 dark:text-white">{gpu.vendor} {gpu.model}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">VRAM: {formatBytes(gpu.vram)}</div>
                    {gpu.vramDynamic && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">Dynamic VRAM</div>
                    )}
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {serverInfo.battery && (
            <InfoCard title="Battery" icon={<Battery className="text-yellow-600" size={20} />}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Level:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serverInfo.battery.percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${serverInfo.battery.isCharging ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    {serverInfo.battery.isCharging ? 'Charging' : 'Not Charging'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {serverInfo.battery.currentCapacity} / {serverInfo.battery.maxCapacity} {serverInfo.battery.capacityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cycle Count:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serverInfo.battery.cycleCount}</span>
                </div>
                <ProgressBar 
                  percentage={serverInfo.battery.percent} 
                  label="Battery Level" 
                />
              </div>
            </InfoCard>
          )}
        </div>
      )}

      {/* Memory Layout Details */}
      {(serverInfo.performance.memory.layout || []).length > 0 && (
        <InfoCard title="Memory Layout" icon={<MemoryStick className="text-violet-600" size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(serverInfo.performance.memory.layout || []).map((module, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">{module.manufacturer}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Size: {formatBytes(module.size)}</div>
                  <div>Type: {module.type}</div>
                  <div>Speed: {module.clockSpeed} MHz</div>
                  <div>Form: {module.formFactor}</div>
                  <div>Bank: {module.bank}</div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        Last updated: {new Date(serverInfo.timestamp).toLocaleString()} | 
        SIL Lab Management System Server Information
      </div>
    </div>
  );
}