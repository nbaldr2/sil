import  React from 'react';
import { useAuth } from '../App';
import { Lock } from 'lucide-react';

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleBasedAccess({ allowedRoles, children, fallback }: RoleBasedAccessProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Accès Restreint
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
 