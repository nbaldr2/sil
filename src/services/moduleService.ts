// Module License Management Service
import { API_BASE_URL } from '../config/api';

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
  // Helper method to check if user is authenticated
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('sil_lab_token');
    const user = localStorage.getItem('sil_lab_user');
    return !!(token && user);
  }

  // Helper method to get current user info
  private getCurrentUser() {
    try {
      const userData = localStorage.getItem('sil_lab_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('sil_lab_token');
    
    // Enhanced token validation
    if (!token) {
      console.error('No authentication token found. User may need to log in.');
      console.error('Current authentication status:', {
        hasToken: !!token,
        hasUser: !!localStorage.getItem('sil_lab_user'),
        currentUser: this.getCurrentUser()
      });
      throw new Error('Authentication required. Please log in.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.error('Authentication failed. Token may be expired or invalid.');
          // Clear invalid token
          localStorage.removeItem('sil_lab_token');
          localStorage.removeItem('sil_lab_user');
          throw new Error('Authentication failed. Please log in again.');
        }
        
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

  // Public method to check authentication status
  checkAuthenticationStatus() {
    const token = localStorage.getItem('sil_lab_token');
    const user = localStorage.getItem('sil_lab_user');
    const currentUser = this.getCurrentUser();
    
    console.log('Authentication Status Check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasUser: !!user,
      currentUser: currentUser,
      isAuthenticated: this.isAuthenticated()
    });
    
    return {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!token,
      hasUser: !!user,
      currentUser
    };
  }

  // Test authentication with the server
  async testAuthentication() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sil_lab_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Authentication test successful:', data);
        return { success: true, data };
      } else {
        console.error('Authentication test failed:', response.status, response.statusText);
        return { success: false, status: response.status, statusText: response.statusText };
      }
    } catch (error) {
      console.error('Authentication test error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const moduleService = new ModuleService();