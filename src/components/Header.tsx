import React from 'react';
import { Sun, Moon, Globe, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../App';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, theme, toggleTheme, language, setLanguage } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      <div className="flex items-center min-w-0">
        <button 
          onClick={onMenuClick}
          className="mr-2 p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
          SIL Laboratory System
        </h1>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
        {/* Mobile theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon size={18} className="text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun size={18} className="text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Desktop controls */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <div className="flex items-center space-x-1">
            <Globe size={18} className="text-gray-600 dark:text-gray-300" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px] lg:max-w-[120px]">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
 