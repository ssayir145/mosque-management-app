import { useEffect, useState } from 'react';
import { useMyHousehold, useUpdateMyHousehold, useChangeMyPassword } from '../../hooks/useHouseholds';
import { useToast } from '../shared/Toast';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function ProfileForm() {
  const { data: household, isLoading } = useMyHousehold();
  const updateHousehold = useUpdateMyHousehold();
  const changePassword = useChangeMyPassword();
  const { showToast } = useToast();

  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    if (household) {
      setContactPerson(household.contact_person || '');
      setAddress(household.address || '');
      setRemindersEnabled(household.notification_prefs?.reminders !== false);
    }
  }, [household]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');

  if (isLoading) return <LoadingSpinner label="Loading profile…" />;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateHousehold.mutateAsync({
      contact_person: contactPerson,
      address,
      notification_prefs: { reminders: remindersEnabled },
    });
    showToast('Profile updated.');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    try {
      await changePassword.mutateAsync({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password changed.');
    } catch (err) {
      setPwError(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">Household Information</h3>
        <div>
          <label className="label">Household Name</label>
          <input className="input bg-ink-50" value={household?.name || ''} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input bg-ink-50" value={household?.phone || ''} disabled />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.target.checked)}
          />
          Notify me about prayer time changes &amp; announcements
        </label>
        <button className="btn-primary" type="submit" disabled={updateHousehold.isPending}>
          {updateHousehold.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">Change Password</h3>
        <div>
          <label className="label">Current Password</label>
          <input
            className="input"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
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
        {pwError && <p className="text-sm text-red-600">{pwError}</p>}
        <button className="btn-secondary" type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
