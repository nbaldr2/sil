import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModuleContextType {
  moduleVersion: number;
  refreshModules: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moduleVersion, setModuleVersion] = useState(0);

  const refreshModules = useCallback(() => {
    setModuleVersion(prev => prev + 1);
  }, []);

  return (
    <ModuleContext.Provider value={{ moduleVersion, refreshModules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};