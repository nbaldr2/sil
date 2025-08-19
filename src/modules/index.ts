// Module Registry
import { BackupModule } from './BackupModule';
import { QualityControlModule } from './QualityControlModule';

export interface ModuleDefinition {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  version: string;
  category: string;
  icon: any;
  color: string;
  features: {
    fr: string[];
    en: string[];
  };
  permissions: string[];
  routes: Array<{
    path: string;
    component: React.ComponentType<any>;
    name: {
      fr: string;
      en: string;
    };
  }>;
  menuItems: Array<{
    name: {
      fr: string;
      en: string;
    };
    path: string;
    icon: any;
    permissions: string[];
  }>;
  dashboardWidgets?: Array<{
    id: string;
    name: {
      fr: string;
      en: string;
    };
    component: React.ComponentType<any>;
    size: 'small' | 'medium' | 'large';
    permissions: string[];
  }>;
  quickActions?: Array<{
    name: {
      fr: string;
      en: string;
    };
    icon: any;
    action: string;
    color: string;
    permissions: string[];
  }>;
  notifications?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    condition: string;
    message: {
      fr: string;
      en: string;
    };
    actions: Array<{
      label: {
        fr: string;
        en: string;
      };
      action: string;
    }>;
  }>;
  settings?: Array<{
    key: string;
    name: {
      fr: string;
      en: string;
    };
    type: 'boolean' | 'string' | 'number' | 'select';
    options?: Array<{
      value: string;
      label: {
        fr: string;
        en: string;
      };
    }>;
    min?: number;
    max?: number;
    default: any;
    description?: {
      fr: string;
      en: string;
    };
  }>;
  dependencies: string[];
  author: string;
  license: string;
  documentation: {
    fr: string;
    en: string;
  };
}

// Registry of all available modules
export const moduleRegistry: Record<string, ModuleDefinition> = {
  'backup-manager': BackupModule,
  'quality-control': QualityControlModule
};

// Get module by ID
export const getModule = (id: string): ModuleDefinition | undefined => {
  return moduleRegistry[id];
};

// Get all modules
export const getAllModules = (): ModuleDefinition[] => {
  return Object.values(moduleRegistry);
};

// Get modules by category
export const getModulesByCategory = (category: string): ModuleDefinition[] => {
  return getAllModules().filter(module => module.category === category);
};

// Get modules by permission
export const getModulesByPermission = (userRole: string): ModuleDefinition[] => {
  return getAllModules().filter(module => 
    module.permissions.includes(userRole) || module.permissions.includes('ALL')
  );
};

// Check if user has access to module
export const hasModuleAccess = (moduleId: string, userRole: string): boolean => {
  const module = getModule(moduleId);
  if (!module) return false;
  
  return module.permissions.includes(userRole) || module.permissions.includes('ALL');
};

// Get module routes for React Router
export const getModuleRoutes = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.routes);
};

// Get module menu items for navigation
export const getModuleMenuItems = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.menuItems)
    .filter(item => item.permissions.includes(userRole) || item.permissions.includes('ALL'));
};

// Get dashboard widgets
export const getModuleDashboardWidgets = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.dashboardWidgets || [])
    .filter(widget => widget.permissions.includes(userRole) || widget.permissions.includes('ALL'));
};

// Get quick actions
export const getModuleQuickActions = (userRole: string) => {
  return getAllModules()
    .filter(module => hasModuleAccess(module.id, userRole))
    .flatMap(module => module.quickActions || [])
    .filter(action => action.permissions.includes(userRole) || action.permissions.includes('ALL'));
};

export default moduleRegistry;