import { useEffect, useState } from 'react';
import { authApi } from '../services/api';

export default function UserManagement({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'author', password: '' });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setError('');
    try {
      const result = await authApi.listUsers();
      setUsers(result.users || []);
    } catch (err) {
      setError(err.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEditing = (user) => {
    setMessage('');
    setError('');
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const saveUser = async (id) => {
    setSavingId(id);
    setError('');
    setMessage('');
    try {
      await authApi.updateUser(id, form);
      setEditingId(null);
      setMessage('User updated successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.error || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const removeUser = async (user) => {
    if (user.id === currentUserId) return;
    if (!window.confirm(`Delete ${user.name || user.email}? This cannot be undone.`)) return;

    setError('');
    setMessage('');
    try {
      await authApi.deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage('User deleted successfully.');
    } catch (err) {
      setError(err.error || 'Failed to delete user');
    }
  };

  return (
    <section className="mt-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Manage Users</h2>
        <p className="text-sm text-slate-500 mt-1">Update user details, change roles, reset passwords, or remove accounts.</p>
      </div>
      {error && <p className="px-6 pt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="px-6 pt-4 text-sm text-green-600">{message}</p>}
      {loading ? (
        <p className="p-6 text-slate-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="p-6 text-slate-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs uppercase tracking-wide text-slate-500">Name</th>
                <th className="text-left py-3 px-6 text-xs uppercase tracking-wide text-slate-500">Email</th>
                <th className="text-left py-3 px-6 text-xs uppercase tracking-wide text-slate-500">Role</th>
                <th className="text-left py-3 px-6 text-xs uppercase tracking-wide text-slate-500">Created</th>
                <th className="text-right py-3 px-6 text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const editing = editingId === user.id;
                const isCurrentUser = user.id === currentUserId;
                return (
                  <tr key={user.id} className="border-t border-slate-100 align-top">
                    <td className="py-4 px-6">
                      {editing ? <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full px-2 py-1 border border-slate-300 rounded" /> : <span className="font-medium text-slate-800">{user.name}</span>}
                    </td>
                    <td className="py-4 px-6">
                      {editing ? <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-2 py-1 border border-slate-300 rounded" /> : <span className="text-slate-600">{user.email}</span>}
                    </td>
                    <td className="py-4 px-6">
                      {editing ? (
                        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} disabled={isCurrentUser} className="px-2 py-1 border border-slate-300 rounded">
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">{user.role}</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      {editing && (
                        <div className="mb-2">
                          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="New password (optional)" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        {editing ? (
                          <>
                            <button type="button" onClick={() => saveUser(user.id)} disabled={savingId === user.id} className="px-3 py-1.5 bg-slate-800 text-white rounded text-sm disabled:opacity-50">{savingId === user.id ? 'Saving...' : 'Save'}</button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded text-sm">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => startEditing(user)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100">Edit</button>
                            <button type="button" onClick={() => removeUser(user)} disabled={isCurrentUser} title={isCurrentUser ? 'You cannot delete your own account' : 'Delete user'} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
