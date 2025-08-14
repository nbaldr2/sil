import  React, { useState } from 'react';
import { Plus, Edit, Trash, Shield, X } from 'lucide-react';
import { useAuth } from '../App';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'biologist' | 'technician' | 'secretary';
  status: 'active' | 'inactive';
  permissions: string[];
}

export default function UserManagement() {
  const { language } = useAuth();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const t = {
    fr: {
      title: 'Gestion des Utilisateurs',
      newUser: 'Nouvel Utilisateur',
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      permissions: 'Permissions',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      admin: 'Administrateur',
      biologist: 'Biologiste',
      technician: 'Technicien',
      secretary: 'Secrétaire',
      close: 'Fermer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      confirmDelete: 'Confirmer la suppression'
    },
    en: {
      title: 'User Management',
      newUser: 'New User',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      permissions: 'Permissions',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      admin: 'Administrator',
      biologist: 'Biologist',
      technician: 'Technician',
      secretary: 'Secretary',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Confirm deletion'
    }
  }[language];

  const [users] = useState<UserData[]>([
    {
      id: '1',
      name: 'Dr. Admin',
      email: 'admin@lab.fr',
      role: 'admin',
      status: 'active',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Dr. Biologiste',
      email: 'bio@lab.fr',
      role: 'biologist',
      status: 'active',
      permissions: ['validate_results', 'view_all_requests']
    },
    {
      id: '3',
      name: 'Tech Support',
      email: 'tech@lab.fr',
      role: 'technician',
      status: 'active',
      permissions: ['enter_results', 'manage_samples']
    }
  ]);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      biologist: 'bg-blue-100 text-blue-800',
      technician: 'bg-green-100 text-green-800',
      secretary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', selectedUser?.id);
    setShowDeleteModal(false);
  };

  const NewUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.newUser}</h3>
          <button onClick={() => setShowNewModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option>Sélectionner un rôle</option>
            <option value="admin">Administrateur</option>
            <option value="biologist">Biologiste</option>
            <option value="technician">Technicien</option>
            <option value="secretary">Secrétaire</option>
          </select>
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => setShowNewModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );

  const EditUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modifier utilisateur</h3>
          <button onClick={() => setShowEditModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {selectedUser && (
          <div className="space-y-4">
            <input
              type="text"
              defaultValue={selectedUser.name}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="email"
              defaultValue={selectedUser.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <select 
              defaultValue={selectedUser.role}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="admin">Administrateur</option>
              <option value="biologist">Biologiste</option>
              <option value="technician">Technicien</option>
              <option value="secretary">Secrétaire</option>
            </select>
            <select 
              defaultValue={selectedUser.status}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.confirmDelete}</h3>
          <button onClick={() => setShowDeleteModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.name} ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t.cancel}
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          {t.newUser}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.name}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.email}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.role}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.permissions}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {t[user.role as keyof typeof t]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status === 'active' ? t.active : t.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span className="inline-flex items-center">
                    <Shield size={16} className="mr-1" />
                    {user.permissions.length}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && <NewUserModal />}
      {showEditModal && <EditUserModal />}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
}
 