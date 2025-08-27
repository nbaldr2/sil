import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Auth Context Types
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
  isAuthenticated: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sil_lab_theme', theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('sil_lab_language', language);
  }, [language]);

  // Listen for system theme changes
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
      }
      return false;
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const authValue: AuthContextType = {
    user,
    login,
    logout,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;