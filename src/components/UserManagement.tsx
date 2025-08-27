import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { authService } from '../services/integrations';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BIOLOGIST' | 'TECHNICIAN' | 'SECRETARY';
  createdAt: string;
}

interface NewUserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface EditUserData {
  name: string;
  email: string;
  role: string;
}

// Separate Modal Components
const NewUserModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  newUserData: NewUserData;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  language: string;
  t: any;
}>(({ isOpen, onClose, newUserData, onNameChange, onEmailChange, onRoleChange, onPasswordChange, onSubmit, loading, error, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.newUser}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder={language === 'fr' ? 'Nom complet (min. 2 caractères)' : 'Full name (min. 2 characters)'}
              value={newUserData.name}
              onChange={onNameChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={newUserData.email}
              onChange={onEmailChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select 
              value={newUserData.role}
              onChange={onRoleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">{language === 'fr' ? 'Sélectionner un rôle' : 'Select a role'}</option>
              <option value="ADMIN">{t.admin}</option>
              <option value="BIOLOGIST">{t.biologist}</option>
              <option value="TECHNICIAN">{t.technician}</option>
              <option value="SECRETARY">{t.secretary}</option>
            </select>
          </div>
          <div>
            <input
              type="password"
              placeholder={language === 'fr' ? 'Mot de passe (min. 6 caractères)' : 'Password (min. 6 characters)'}
              value={newUserData.password}
              onChange={onPasswordChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (language === 'fr' ? 'Création...' : 'Creating...') : t.create}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

const EditUserModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  editUserData: EditUserData;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  language: string;
  t: any;
}>(({ isOpen, onClose, editUserData, onNameChange, onEmailChange, onRoleChange, onSubmit, loading, error, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.editUser}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={language === 'fr' ? 'Nom complet' : 'Full name'}
            value={editUserData.name}
            onChange={onNameChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={editUserData.email}
            onChange={onEmailChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <select 
            value={editUserData.role}
            onChange={onRoleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">{language === 'fr' ? 'Sélectionner un rôle' : 'Select a role'}</option>
            <option value="ADMIN">{t.admin}</option>
            <option value="BIOLOGIST">{t.biologist}</option>
            <option value="TECHNICIAN">{t.technician}</option>
            <option value="SECRETARY">{t.secretary}</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (language === 'fr' ? 'Mise à jour...' : 'Updating...') : t.update}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

const DeleteModal = React.memo<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  language: string;
  t: any;
}>(({ isOpen, onClose, onConfirm, selectedUser, loading, error, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.confirmDelete}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t.deleteMessage}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (language === 'fr' ? 'Suppression...' : 'Deleting...') : t.delete}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

const UserManagement: React.FC = () => {
  const { language } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState<NewUserData>({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const [editUserData, setEditUserData] = useState<EditUserData>({
    name: '',
    email: '',
    role: ''
  });

  const t = {
    title: language === 'fr' ? 'Gestion des Utilisateurs' : 'User Management',
    newUser: language === 'fr' ? 'Nouvel Utilisateur' : 'New User',
    editUser: language === 'fr' ? 'Modifier Utilisateur' : 'Edit User',
    confirmDelete: language === 'fr' ? 'Confirmer la Suppression' : 'Confirm Delete',
    deleteMessage: language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?' : 'Are you sure you want to delete this user?',
    name: language === 'fr' ? 'Nom' : 'Name',
    email: 'Email',
    role: language === 'fr' ? 'Rôle' : 'Role',
    actions: language === 'fr' ? 'Actions' : 'Actions',
    admin: language === 'fr' ? 'Administrateur' : 'Admin',
    biologist: language === 'fr' ? 'Biologiste' : 'Biologist',
    technician: language === 'fr' ? 'Technicien' : 'Technician',
    secretary: language === 'fr' ? 'Secrétaire' : 'Secretary',
    create: language === 'fr' ? 'Créer' : 'Create',
    update: language === 'fr' ? 'Mettre à jour' : 'Update',
    delete: language === 'fr' ? 'Supprimer' : 'Delete',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    edit: language === 'fr' ? 'Modifier' : 'Edit',
    createdAt: language === 'fr' ? 'Créé le' : 'Created'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await authService.getUsers();
      console.log('Fetched users:', userList);
      setUsers(userList || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);
    try {
      await authService.deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // Validate required fields
    if (!newUserData.name || !newUserData.email || !newUserData.role || !newUserData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate field lengths
    if (newUserData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (newUserData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Creating user with data:', newUserData);
      const createdUser = await authService.createUser(newUserData);
      console.log('Created user response:', createdUser);
      setUsers(prev => [createdUser, ...prev]);
      setNewUserData({ name: '', email: '', role: '', password: '' });
      setShowNewModal(false);
    } catch (e: any) {
      console.error('Create user error:', e);
      let errorMessage = 'Failed to create user';
      if (e?.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !editUserData.name || !editUserData.email || !editUserData.role) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateUser(selectedUser.id, editUserData);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers with useCallback for stable references
  const handleNewUserNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleNewUserEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleNewUserRoleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewUserData(prev => ({ ...prev, role: e.target.value }));
  }, []);

  const handleNewUserPasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData(prev => ({ ...prev, password: e.target.value }));
  }, []);

  const handleCloseNewModal = React.useCallback(() => {
    setShowNewModal(false);
    setNewUserData({ name: '', email: '', role: '', password: '' });
    setError(null);
  }, []);

  const handleEditUserNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUserData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleEditUserEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUserData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleEditUserRoleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditUserData(prev => ({ ...prev, role: e.target.value }));
  }, []);

  const handleCloseEditModal = React.useCallback(() => {
    setShowEditModal(false);
    setEditUserData({ name: '', email: '', role: '' });
    setError(null);
    setSelectedUser(null);
  }, []);

  const handleCloseDeleteModal = React.useCallback(() => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    setError(null);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t.newUser}</span>
        </button>
      </div>

      {loading && !showNewModal && !showEditModal && !showDeleteModal && (
        <div className="text-center py-4">
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      )}

      {error && !showNewModal && !showEditModal && !showDeleteModal && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.name}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.email}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.role}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.createdAt}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users && users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.role ? (t[user.role.toLowerCase() as keyof typeof t] || user.role) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                  {loading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <NewUserModal
        isOpen={showNewModal}
        onClose={handleCloseNewModal}
        newUserData={newUserData}
        onNameChange={handleNewUserNameChange}
        onEmailChange={handleNewUserEmailChange}
        onRoleChange={handleNewUserRoleChange}
        onPasswordChange={handleNewUserPasswordChange}
        onSubmit={handleCreateUser}
        loading={loading}
        error={error}
        language={language}
        t={t}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        editUserData={editUserData}
        onNameChange={handleEditUserNameChange}
        onEmailChange={handleEditUserEmailChange}
        onRoleChange={handleEditUserRoleChange}
        onSubmit={handleUpdateUser}
        loading={loading}
        error={error}
        language={language}
        t={t}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
        selectedUser={selectedUser}
        loading={loading}
        error={error}
        language={language}
        t={t}
      />
    </div>
  );
};

export default UserManagement;