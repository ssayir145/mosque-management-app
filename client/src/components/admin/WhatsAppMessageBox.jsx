import { useState } from 'react';
import { buildWaLink, copyToClipboard } from '../../lib/whatsapp';
import { useToast } from '../shared/Toast';

export function WhatsAppMessageBox({ phone, message: initialMessage, title = 'WhatsApp Message' }) {
  const [message, setMessage] = useState(initialMessage);
  const { showToast } = useToast();

  const handleCopy = async () => {
    const success = await copyToClipboard(message);
    showToast(
      success ? 'Message copied to clipboard.' : 'Could not copy automatically — please copy manually.',
      success ? 'success' : 'error'
    );
  };

  return (
    <div className="no-print space-y-3 rounded-xl border border-sage-200 bg-sage-50 p-4">
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      <textarea
        className="input min-h-[140px] bg-white font-mono text-xs"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" type="button" onClick={handleCopy}>
          📋 Copy to Clipboard
        </button>
        <a className="btn-primary" href={buildWaLink(phone, message)} target="_blank" rel="noreferrer">
          💬 Open in WhatsApp
        </a>
      </div>
    </div>
  );
}
