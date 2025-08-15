// Module License Management Service
const API_BASE_URL = 'http://localhost:5001/api';

export interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  category: string;
  price: number;
  features: string[];
  isInstalled: boolean;
  daysRemaining: number;
  licenseStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL' | null;
  expiresAt: string | null;
}

export interface ModuleLicense {
  id: string;
  moduleId: string;
  licenseKey: string;
  organizationName?: string;
  contactEmail?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL';
  activatedAt: string;
  expiresAt: string;
  daysRemaining: number;
  maxUsers: number;
  features: string[];
}

export interface ModuleAccess {
  hasAccess: boolean;
  daysRemaining: number;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL' | null;
  expiresAt: string | null;
  features: string[];
}

class ModuleService {
  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Network Error for ${url}:`, error);
      throw error;
    }
  }

  // Get all available modules
  async getModules(): Promise<Module[]> {
    return this.apiRequest('/modules');
  }

  // Get installed modules
  async getInstalledModules(): Promise<ModuleLicense[]> {
    return this.apiRequest('/modules/installed');
  }

  // Install module with license key
  async installModule(moduleId: string, licenseKey: string, organizationName?: string, contactEmail?: string): Promise<ModuleLicense> {
    return this.apiRequest('/modules/install', {
      method: 'POST',
      body: JSON.stringify({
        moduleId,
        licenseKey,
        organizationName,
        contactEmail
      })
    });
  }

  // Start trial for module
  async startTrial(moduleId: string, organizationName?: string, contactEmail?: string): Promise<ModuleLicense> {
    return this.apiRequest('/modules/trial', {
      method: 'POST',
      body: JSON.stringify({
        moduleId,
        organizationName,
        contactEmail
      })
    });
  }

  // Check module access
  async checkModuleAccess(moduleName: string): Promise<ModuleAccess> {
    return this.apiRequest(`/modules/access/${moduleName}`);
  }

  // Deactivate module
  async deactivateModule(licenseId: string): Promise<void> {
    return this.apiRequest(`/modules/${licenseId}`, {
      method: 'DELETE'
    });
  }

  // Generate license key (for demo purposes)
  generateLicenseKey(moduleName: string): string {
    const prefix = moduleName.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 15).toUpperCase();
    return `${prefix}-${randomPart.match(/.{4}/g)?.join('-') || randomPart}`;
  }

  // Validate license key format
  isValidLicenseKey(licenseKey: string, moduleName: string): boolean {
    const expectedPrefix = moduleName.substring(0, 3).toUpperCase();
    return licenseKey.startsWith(expectedPrefix) && licenseKey.length >= 15;
  }

  // Format days remaining
  formatDaysRemaining(days: number): string {
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    if (days <= 30) return `${days} days left`;
    if (days <= 365) return `${Math.ceil(days / 30)} months left`;
    return `${Math.ceil(days / 365)} years left`;
  }

  // Get status color
  getStatusColor(status: string, daysRemaining: number): string {
    if (status === 'EXPIRED' || daysRemaining <= 0) return 'text-red-500';
    if (status === 'TRIAL' || daysRemaining <= 7) return 'text-yellow-500';
    if (daysRemaining <= 30) return 'text-orange-500';
    return 'text-green-500';
  }

  // Get status badge color
  getStatusBadgeColor(status: string, daysRemaining: number): string {
    if (status === 'EXPIRED' || daysRemaining <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (status === 'TRIAL') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (daysRemaining <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
}

export const moduleService = new ModuleService();