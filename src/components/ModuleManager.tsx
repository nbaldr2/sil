import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Package, 
  Settings, 
  Shield, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../App';
import { moduleService, Module, ModuleLicense } from '../services/moduleService';
import { 
  moduleRegistry, 
  getModule, 
  hasModuleAccess, 
  getModuleRoutes,
  getModuleMenuItems,
  getModuleDashboardWidgets,
  getModuleQuickActions
} from '../modules';

interface ModuleManagerProps {
  children?: React.ReactNode;
}

// Helper function to check if a module is accessible
const isModuleAccessible = (moduleId: string, installedModules: ModuleLicense[]): boolean => {
  return installedModules.some(license => 
    license.moduleId === moduleId && 
    (license.status === 'ACTIVE' || license.status === 'TRIAL') &&
    new Date(license.expiresAt) > new Date()
  );
};

export const ModuleManager: React.FC<ModuleManagerProps> = ({ children }) => {
  const { user, language } = useAuth();
  const [installedModules, setInstalledModules] = useState<ModuleLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalledModules();
  }, []);

  const loadInstalledModules = async () => {
    try {
      const modules = await moduleService.getInstalledModules();
      setInstalledModules(modules);
    } catch (error) {
      console.error('Error loading installed modules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get active module routes based on installed modules and user permissions
  const getActiveRoutes = () => {
    if (!user) return [];

    return getModuleRoutes(user.role).filter(route => {
      // Check if module is installed and active
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.routes.some(r => r.path === route.path);
      });

      if (!moduleId) return false;

      // Check if module is installed and accessible
      return isModuleAccessible(moduleId, installedModules) && hasModuleAccess(moduleId, user.role);
    });
  };

  // Get active menu items
  const getActiveMenuItems = () => {
    if (!user) return [];

    return getModuleMenuItems(user.role).filter(item => {
      // Check if module is installed and active
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.menuItems.some(m => m.path === item.path);
      });

      if (!moduleId) return false;

      return isModuleAccessible(moduleId, installedModules);
    });
  };

  // Get active dashboard widgets
  const getActiveDashboardWidgets = () => {
    if (!user) return [];

    return getModuleDashboardWidgets(user.role).filter(widget => {
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.dashboardWidgets?.some(w => w.id === widget.id);
      });

      if (!moduleId) return false;

      return isModuleAccessible(moduleId, installedModules);
    });
  };

  // Get active quick actions
  const getActiveQuickActions = () => {
    if (!user) return [];

    return getModuleQuickActions(user.role).filter(action => {
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.quickActions?.some(a => a.action === action.action);
      });

      if (!moduleId) return false;

      return isModuleAccessible(moduleId, installedModules);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Module Routes */}
      <Routes>
        {getActiveRoutes().map((route, index) => (
          <Route
            key={`${route.path}-${index}`}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </>
  );
};

// Hook to get module data
export const useModuleManager = () => {
  const { user } = useAuth();
  const [installedModules, setInstalledModules] = useState<ModuleLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalledModules();
  }, []);

  const loadInstalledModules = async () => {
    try {
      const modules = await moduleService.getInstalledModules();
      setInstalledModules(modules);
    } catch (error) {
      console.error('Error loading installed modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleActive = (moduleId: string): boolean => {
    return isModuleAccessible(moduleId, installedModules);
  };

  const getModuleLicense = (moduleId: string): ModuleLicense | undefined => {
    return installedModules.find(license => license.moduleId === moduleId);
  };

  const getActiveMenuItems = () => {
    if (!user) return [];

    return getModuleMenuItems(user.role).filter(item => {
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.menuItems.some(m => m.path === item.path);
      });

      return moduleId && isModuleActive(moduleId);
    });
  };

  const getActiveDashboardWidgets = () => {
    if (!user) return [];

    return getModuleDashboardWidgets(user.role).filter(widget => {
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.dashboardWidgets?.some(w => w.id === widget.id);
      });

      return moduleId && isModuleActive(moduleId);
    });
  };

  const getActiveQuickActions = () => {
    if (!user) return [];

    return getModuleQuickActions(user.role).filter(action => {
      const moduleId = Object.keys(moduleRegistry).find(id => {
        const module = getModule(id);
        return module?.quickActions?.some(a => a.action === action.action);
      });

      return moduleId && isModuleActive(moduleId);
    });
  };

  return {
    installedModules,
    loading,
    isModuleActive,
    getModuleLicense,
    getActiveMenuItems,
    getActiveDashboardWidgets,
    getActiveQuickActions,
    refresh: loadInstalledModules
  };
};

// Module Status Component
export const ModuleStatus: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  const { getModuleLicense, isModuleActive } = useModuleManager();
  const { language } = useAuth();
  
  const license = getModuleLicense(moduleId);
  const isActive = isModuleActive(moduleId);
  const module = getModule(moduleId);

  if (!module) return null;

  const t = {
    fr: {
      active: 'Actif',
      trial: 'Essai',
      expired: 'Expiré',
      daysLeft: 'jours restants',
      notInstalled: 'Non installé'
    },
    en: {
      active: 'Active',
      trial: 'Trial',
      expired: 'Expired',
      daysLeft: 'days left',
      notInstalled: 'Not installed'
    }
  }[language];

  if (!license) {
    return (
      <div className="flex items-center text-gray-500">
        <AlertTriangle size={16} className="mr-1" />
        <span className="text-sm">{t.notInstalled}</span>
      </div>
    );
  }

  const daysRemaining = Math.ceil((new Date(license.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    if (!isActive) return 'text-red-600';
    if (license.status === 'TRIAL') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isActive) return <AlertTriangle size={16} />;
    if (license.status === 'TRIAL') return <Clock size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className={`flex items-center ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-1 text-sm">
        {license.status === 'TRIAL' ? t.trial : isActive ? t.active : t.expired}
        {isActive && daysRemaining > 0 && (
          <span className="ml-1 text-xs">
            ({daysRemaining} {t.daysLeft})
          </span>
        )}
      </span>
    </div>
  );
};

export default ModuleManager;