import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import DoctorManagement from './components/DoctorManagement';
import RequestManagement from './components/RequestManagement';
import NewAnalysisRequest from './components/NewAnalysisRequest';
import NewRequestWizard from './components/NewRequestWizard';
import ResultEntryPage from './components/ResultEntryPage';
import BiologistValidation from './components/BiologistValidation';
import BillingModule from './components/BillingModule';
import ConfigCenter from './components/ConfigCenter';
import PriceManagement from './components/PriceManagement';
import UserManagement from './components/UserManagement';
import StockDashboard from './components/StockDashboard';
import AddStockEntryPage from './components/AddStockEntryPage';
import CreateProductPage from './components/CreateProductPage';
import UseStockFormPage from './components/UseStockFormPage';
import TransferStock from './components/TransferStock';
import AdjustInventoryPage from './components/AdjustInventoryPage';
import SuppliersManagement from './components/SuppliersManagement';
import OrdersManagement from './components/OrdersManagement';
import { PluginStore } from './components/admin/NewPluginStore';
import { AuditTrail } from './components/admin/AuditTrail';
import { BackupRestore } from './components/admin/BackupRestore';
import AutomateIntegrationPanel from './components/AutomateIntegrationPanel';
import QualityControl from './components/QualityControl';
import ModuleStore from './components/ModuleStore';
import { ModuleProvider } from './contexts/ModuleContext';
import { ModuleManager } from './components/ModuleManager';
import './index.css';
import StockReport from './components/StockReport';

// Auth Context
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'BIOLOGIST' | 'TECHNICIAN' | 'SECRETARY';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'fr' | 'en';
  toggleLanguage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is already logged in from localStorage
    const token = localStorage.getItem('sil_lab_token');
    const userData = localStorage.getItem('sil_lab_user');
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('sil_lab_token');
        localStorage.removeItem('sil_lab_user');
      }
    }
    return null;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('sil_lab_theme');
    if (savedTheme) {
      return savedTheme as 'light' | 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<'fr' | 'en'>(() => {
    return localStorage.getItem('sil_lab_language') as 'fr' | 'en' || 'fr';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sil_lab_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sil_lab_language', language);
  }, [language]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('sil_lab_theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Validate token on app startup
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('sil_lab_token');
      if (token && !user) {
        try {
          const response = await fetch('http://localhost:5001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('sil_lab_user', JSON.stringify(data.user));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('sil_lab_token');
            localStorage.removeItem('sil_lab_user');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('sil_lab_token');
          localStorage.removeItem('sil_lab_user');
        }
      }
    };

    validateToken();
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('sil_lab_token', data.token);
        localStorage.setItem('sil_lab_user', JSON.stringify(data.user));
        return true;
      } else {
        console.error('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sil_lab_token');
    localStorage.removeItem('sil_lab_user');
  };

  const authValue: AuthContextType = {
    user,
    login,
    logout,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthContext.Provider value={authValue}>
      <ModuleProvider>
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {user ? (
          <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <div className={`fixed lg:static z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
              <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <ModuleManager>
                    <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/patients" element={<PatientManagement />} />
                    <Route path="/doctors" element={<DoctorManagement />} />
                    <Route path="/requests" element={<RequestManagement />} />
                    <Route path="/new-request" element={<NewRequestWizard />} />
                    <Route path="/analyses" element={<NewAnalysisRequest />} />
                    <Route path="/results" element={<ResultEntryPage />} />
                    <Route path="/validation" element={<BiologistValidation />} />
                    <Route path="/billing" element={<BillingModule />} />
                    <Route path="/config" element={<ConfigCenter />} />
                    <Route path="/config/prices" element={<PriceManagement />} />
                    <Route path="/config/users" element={<UserManagement />} />
                    <Route path="/config/modules" element={<ModuleStore />} />
                    <Route path="/config/audit" element={<AuditTrail />} />
                    <Route path="/config/backup" element={<BackupRestore />} />

                    {/* Automate Integration Routes */}
                    <Route path="/automates" element={<AutomateIntegrationPanel />} />
                    
                    {/* Quality Control Routes */}
                    <Route path="/quality-control" element={<QualityControl />} />

                    {/* Stock Management Routes */}
                    <Route path="/stock" element={<Navigate to="/stock/dashboard" replace />} />
                    <Route path="/stock/dashboard" element={<StockDashboard />} />
                    <Route path="/stock/add" element={<AddStockEntryPage />} />
                    <Route path="/stock/create-product" element={<CreateProductPage />} />
                    <Route path="/stock/use" element={<UseStockFormPage />} />
                    <Route path="/stock/transfer" element={<TransferStock onClose={() => {}} />} />
                    <Route path="/stock/adjust" element={<AdjustInventoryPage />} />
                    <Route path="/stock/suppliers" element={<SuppliersManagement />} />
                    <Route path="/stock/orders" element={<OrdersManagement />} />
                    <Route path="/stock/reports" element={<StockReport />} />
                    
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  </ModuleManager>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <LoginPage />
        )}
        </div>
      </ModuleProvider>
    </AuthContext.Provider>
  );
}

export default App;
 