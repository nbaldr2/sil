import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Star, Download, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  rating: number;
  downloads: number;
  installed: boolean;
  isCompatible: boolean;
  tags: string[];
  lastUpdated: string;
  installedAt: string | null;
  updatedAt: string | null;
}

export const PluginStore: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [
    { id: 'all', name: 'All Plugins' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'reports', name: 'Reports & Export' },
    { id: 'interface', name: 'Interface' },
    { id: 'integration', name: 'Integrations' }
  ];

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
import { API_BASE_URL } from '../../config/api';

// ... existing code ...

      const response = await axios.get(`${API_BASE_URL}/plugins`);
      setPlugins(response.data);
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
    setLoading(false);
  };

  const handleInstall = async (plugin: Plugin) => {
    try {
      await axios.post(`${API_BASE_URL}/plugins/install/${plugin.id}`);
      fetchPlugins();
    } catch (error) {
      console.error('Error installing plugin:', error);
    }
  };

  const handleUninstall = async (plugin: Plugin) => {
    try {
      await axios.delete(`${API_BASE_URL}/plugins/${plugin.id}/uninstall`);
      fetchPlugins();
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || plugin.tags.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plugin Marketplace</h1>
              <p className="text-gray-600 dark:text-gray-400">Enhance your lab management system with powerful add-ons</p>
            </div>
            <button 
              onClick={fetchPlugins}
              className="flex items-center px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plugin Grid */}
              {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <div 
            key={plugin.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                      {plugin.name}
                      {!plugin.isCompatible && (
                        <span title="Compatibility warning">
                          <AlertCircle size={16} className="text-amber-500 ml-2" />
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Star size={14} className="text-yellow-400 mr-1" />
                        {plugin.rating.toFixed(1)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <Download size={14} className="mr-1" />
                        {plugin.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {plugin.installed ? (
                    <button
                      onClick={() => handleUninstall(plugin)}
                      className="inline-flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X size={14} className="mr-1" />
                      Uninstall
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(plugin)}
                      className={`inline-flex items-center px-3 py-1 text-sm rounded-lg ${
                        plugin.isCompatible
                          ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!plugin.isCompatible}
                    >
                      <Check size={14} className="mr-1" />
                      Install
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plugin.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {plugin.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
                  <span>By {plugin.author}</span>
                  <span>v{plugin.version} • Updated {new Date(plugin.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};
