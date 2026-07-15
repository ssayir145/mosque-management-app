import { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { useCreateHousehold, useUpdateHousehold } from '../../hooks/useHouseholds';
import { useToast } from '../shared/Toast';

export function HouseholdFormModal({ open, household, onClose }) {
  const isEdit = !!household;
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [password, setPassword] = useState('');
  const create = useCreateHousehold();
  const update = useUpdateHousehold();
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setName(household?.name || '');
      setContactPerson(household?.contact_person || '');
      setPhone(household?.phone || '');
      setAddress(household?.address || '');
      setMonthlyContribution(household ? String(household.monthly_contribution) : '');
      setPassword('');
    }
  }, [open, household]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await update.mutateAsync({
          id: household.id,
          name,
          contact_person: contactPerson,
          phone,
          address,
          monthly_contribution: Number(monthlyContribution) || 0,
        });
        showToast('Household updated.');
      } else {
        await create.mutateAsync({
          name,
          contact_person: contactPerson,
          phone,
          address,
          monthly_contribution: Number(monthlyContribution) || 0,
          password,
        });
        showToast('Household created.');
      }
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Household' : 'Add Household'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Household Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Contact Person</label>
          <input className="input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (used for login)</label>
          <input
            className="input"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+15550001111"
          />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="label">Monthly Contribution (₹)</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />
        </div>
        {!isEdit && (
          <div>
            <label className="label">Initial Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
