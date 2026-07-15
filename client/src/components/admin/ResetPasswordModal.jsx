import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { useResetHouseholdPassword } from '../../hooks/useHouseholds';
import { useToast } from '../shared/Toast';

export function ResetPasswordModal({ household, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const resetPassword = useResetHouseholdPassword();
  const { showToast } = useToast();

  if (!household) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword.mutateAsync({ id: household.id, new_password: newPassword });
      showToast(`Password reset for ${household.name}.`);
      setNewPassword('');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Modal open={!!household} onClose={onClose} title={`Reset Password — ${household.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-500">
          Set a new login password for this household (login is by phone number: {household.phone}).
        </p>
        <div>
          <label className="label">New Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Saving…' : 'Reset Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
