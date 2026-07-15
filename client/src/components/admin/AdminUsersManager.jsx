import { useState } from 'react';
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser } from '../../hooks/useAdminUsers';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatDate } from '../../lib/formatters';
import { useToast } from '../shared/Toast';

export function AdminUsersManager() {
  const { data, isLoading, isError, refetch } = useAdminUsers();
  const create = useCreateAdminUser();
  const update = useUpdateAdminUser();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('admin');
  const [password, setPassword] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ email, full_name: fullName, role, password });
      showToast('User created.');
      setEmail('');
      setFullName('');
      setPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggle = async (u) => {
    await update.mutateAsync({ id: u.id, active: !u.active });
    showToast(u.active ? 'User deactivated.' : 'User activated.');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">Add Admin / Caretaker User</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create User'}
        </button>
      </form>

      <div className="card p-5">
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Existing Users</h3>
        {isLoading && <LoadingSpinner />}
        {isError && <ErrorState onRetry={refetch} />}
        <div className="space-y-2">
          {(data || []).map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-ink-100 p-3 text-sm">
              <div>
                <p className="font-medium text-ink-900">{u.full_name || u.email}</p>
                <p className="text-xs text-ink-400">
                  {u.email} · {u.role} · joined {formatDate(u.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${u.active ? 'bg-sage-100 text-sage-700' : 'bg-ink-100 text-ink-500'}`}>
                  {u.active ? 'Active' : 'Inactive'}
                </span>
                <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => handleToggle(u)}>
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
