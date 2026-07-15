import { useState } from 'react';
import { AnnouncementsManager } from '../../components/admin/AnnouncementsManager';
import { AnnouncementFormModal } from '../../components/admin/AnnouncementFormModal';

export default function AdminAnnouncementsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Announcements</h2>
          <p className="text-sm text-ink-500">Manage news, events, and community updates.</p>
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + New Announcement
        </button>
      </div>

      <AnnouncementsManager
        onEdit={(a) => {
          setEditing(a);
          setFormOpen(true);
        }}
      />

      <AnnouncementFormModal open={formOpen} announcement={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}
