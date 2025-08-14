import  React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, CreditCard, Settings, FileText, Users, Printer, Upload, Plus, CheckCircle } from 'lucide-react';
import { useAuth } from '../App';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Tableau de Bord', icon: Home, roles: ['admin', 'biologist', 'technician', 'secretary'] }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { path: '/requests', label: 'Demandes', icon: Database, roles: ['admin'] },
        { path: '/patients', label: 'Patients', icon: Users, roles: ['admin'] },
        { path: '/results', label: 'Résultats', icon: FileText, roles: ['admin'] },
        { path: '/billing', label: 'Facturation', icon: CreditCard, roles: ['admin'] },
        { path: '/printing', label: 'Impression', icon: Printer, roles: ['admin'] },
        { path: '/import-export', label: 'Import/Export', icon: Upload, roles: ['admin'] },
        { path: '/config', label: 'Configuration', icon: Settings, roles: ['admin'] },
        { path: '/users', label: 'Utilisateurs', icon: Users, roles: ['admin'] }
      ];
    }

    if (user?.role === 'biologist') {
      return [
        ...baseItems,
        { path: '/validation', label: 'Validation', icon: CheckCircle, roles: ['biologist'] },
        { path: '/results', label: 'Résultats', icon: FileText, roles: ['biologist'] },
        { path: '/patients', label: 'Patients', icon: Users, roles: ['biologist'] },
        { path: '/printing', label: 'Impression', icon: Printer, roles: ['biologist'] }
      ];
    }

    if (user?.role === 'secretary') {
      return [
        ...baseItems,
        { path: '/new-request', label: 'Nouvelle Demande', icon: Plus, roles: ['secretary'] },
        { path: '/requests', label: 'Demandes', icon: Database, roles: ['secretary'] },
        { path: '/patients', label: 'Patients', icon: Users, roles: ['secretary'] },
        { path: '/billing', label: 'Facturation', icon: CreditCard, roles: ['secretary'] }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems(); 

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">SIL - Système d'Information de Laboratoire</h1>
          <div className="flex space-x-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path ? 'bg-blue-700' : 'hover:bg-blue-500'
                }`}
              >
                <item.icon size={16} className="mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
 