import { useEffect, useId, useState } from 'react';

interface EmailModalProps {
  open: boolean;
  defaultEmail?: string;
  documentName: string;
  onClose: () => void;
  onSend: (email: string) => void;
}

export function EmailModal({ open, defaultEmail = '', documentName, onClose, onSend }: EmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const id = useId();

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setSending(false);
      setDone(false);
    }
  }, [open, defaultEmail]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    // Simulated secure client-side dispatch
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setDone(true);
    onSend(email.trim());
    setTimeout(onClose, 700);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3 id={`${id}-title`}>Poslat e-mailem</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>
        <p className="modal__lead">
          Simulované zabezpečené odeslání dokumentu <strong>{documentName}</strong> přímo z prohlížeče
          (mailto / lokální dispatch).
        </p>
        <form onSubmit={handleSubmit} className="modal__form">
          <label htmlFor={`${id}-email`}>E-mail klienta</label>
          <input
            id={`${id}-email`}
            type="email"
            required
            placeholder="klient@firma.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn--primary" disabled={sending || done}>
              {done ? 'Odesláno' : sending ? 'Odesílám…' : 'Odeslat bezpečně'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
