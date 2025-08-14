import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Backup {
  id: string;
  date: string;
  filename: string;
  status: string;
  size: number;
  createdBy: string;
  createdAt: string;
}

export const BackupRestore = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await axios.get('/api/backups');
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      await axios.post('/api/backup');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
        <button
          onClick={createBackup}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Creating Backup...' : 'Create Backup'}
        </button>
      </div>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Date</th>
              <th className="px-6 py-3 border-b">Size</th>
              <th className="px-6 py-3 border-b">Status</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.id}>
                <td className="px-6 py-4">{new Date(backup.date).toLocaleString()}</td>
                <td className="px-6 py-4">{formatSize(backup.size)}</td>
                <td className="px-6 py-4">{backup.status}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:underline mr-4">Download</button>
                  <button className="text-green-500 hover:underline">Restore</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return size.toFixed(2) + ' ' + sizes[i];
};
