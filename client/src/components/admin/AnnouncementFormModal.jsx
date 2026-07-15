import { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncements';
import { compressImageToDataUrl } from '../../lib/imageUtils';
import { useToast } from '../shared/Toast';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'fund', label: 'Fund' },
];

function toDateInputValue(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  return d.toISOString().slice(0, 10);
}

export function AnnouncementFormModal({ open, announcement, onClose }) {
  const isEdit = !!announcement;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [publishAt, setPublishAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setTitle(announcement?.title || '');
      setContent(announcement?.content || '');
      setCategory(announcement?.category || 'general');
      setPublishAt(toDateInputValue(announcement?.publish_at) || toDateInputValue(new Date()));
      setImageUrl(announcement?.image_url || '');
    }
  }, [open, announcement]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      showToast('Could not process image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      category,
      image_url: imageUrl || undefined,
      publish_at: publishAt ? new Date(publishAt).toISOString() : undefined,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: announcement.id, ...payload });
        showToast('Announcement updated.');
      } else {
        await create.mutateAsync(payload);
        showToast('Announcement created.');
      }
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Announcement' : 'New Announcement'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea
            className="input min-h-[120px]"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
            <label className="label">Publish Date</label>
            <input className="input" type="date" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Image (optional)</label>
          <input className="input" type="file" accept="image/*" onChange={handleImageChange} />
          {uploading && <p className="mt-1 text-xs text-ink-400">Processing image…</p>}
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-32 w-full rounded-lg object-cover" />}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={pending || uploading}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
