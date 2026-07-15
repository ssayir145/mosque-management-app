import { useState } from 'react';
import { useSubmitFeedback } from '../../hooks/useFeedback';
import { useAuth } from '../../lib/auth/useAuth';

const CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'event', label: 'Events' },
  { value: 'fund', label: 'Fund / Donations' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' },
];

export function FeedbackForm({ onSubmitted }) {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const submit = useSubmitFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit.mutateAsync({ category, message, name: name || undefined, contact: contact || undefined });
    setMessage('');
    setName('');
    setContact('');
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Your suggestion or feedback</label>
        <textarea
          className="input min-h-[100px]"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your idea with the committee…"
        />
      </div>
      {!isAuthenticated && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name (optional)</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Contact (optional)</label>
            <input
              className="input"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone or email"
            />
          </div>
        </div>
      )}
      {submit.isError && <p className="text-sm text-red-600">{submit.error.message}</p>}
      {submit.isSuccess && (
        <p className="text-sm text-sage-700">Jazakallahu Khairun! Your feedback has been received.</p>
      )}
      <button className="btn-primary" type="submit" disabled={submit.isPending}>
        {submit.isPending ? 'Sending…' : 'Submit Feedback'}
      </button>
    </form>
  );
}
