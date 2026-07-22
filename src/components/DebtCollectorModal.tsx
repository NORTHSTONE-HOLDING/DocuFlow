import { useMemo } from 'react';
import type { Project, WorkflowDocument } from '../types/erp';
import { formatCurrency } from '../utils/format';
import { buildWhatsAppShareUrl } from '../utils/payments';

interface DebtCollectorModalProps {
  open: boolean;
  project: Project;
  invoice: WorkflowDocument;
  onClose: () => void;
}

export function buildDebtReminderText(_project: Project, invoice: WorkflowDocument, payLink: string): string {
  return `Dobrý den, v příloze zakázky ${invoice.number} evidujeme neuhrazenou fakturu na částku ${Math.round(invoice.totals.total)} Kč. Pro hladký průběh prací a odeslání materiálů klikněte na odkaz pro okamžitou platbu přes Apple Pay/QR kód: ${payLink}`;
}

export function DebtCollectorModal({ open, project, invoice, onClose }: DebtCollectorModalProps) {
  const payLink = useMemo(() => `${window.location.origin}/sign/${invoice.id}`, [invoice.id]);
  const message = useMemo(() => buildDebtReminderText(project, invoice, payLink), [project, invoice, payLink]);
  const wa = invoice.client.phone || project.client.phone
    ? buildWhatsAppShareUrl(invoice.client.phone || project.client.phone, invoice.number, payLink)
    : null;

  // Override default WA template with exact reminder text
  const waExact = useMemo(() => {
    const phone = (invoice.client.phone || project.client.phone || '').replace(/\D/g, '');
    if (!phone) return null;
    const normalized = phone.startsWith('420') ? phone : `420${phone.replace(/^0+/, '')}`;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  }, [invoice.client.phone, project.client.phone, message]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal debt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3 id="debt-title">🤖 AI Vymahač neplatičů</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>

        <div className="debt-modal__meta">
          <span>{project.name}</span>
          <span>{invoice.number}</span>
          <strong>{formatCurrency(invoice.totals.total)}</strong>
        </div>

        <p className="modal__lead">
          Chytrá, zdvořilá a profesionální připomínka platby v češtině — připravená k odeslání na WhatsApp.
        </p>

        <label className="debt-modal__label">
          Text připomínky
          <textarea rows={7} readOnly value={message} />
        </label>

        <div className="modal__actions debt-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Zavřít
          </button>
          {waExact || wa ? (
            <a className="btn btn--whatsapp" href={waExact || wa!} target="_blank" rel="noreferrer">
              Odeslat připomínku na WhatsApp
            </a>
          ) : (
            <button type="button" className="btn btn--whatsapp" disabled title="Doplňte telefon klienta v zakázce">
              Odeslat připomínku na WhatsApp
            </button>
          )}
        </div>
        {!invoice.client.phone && !project.client.phone && (
          <p className="debt-modal__hint">Doplňte telefon klienta v detailu zakázky (+420), aby šlo odeslat WhatsApp.</p>
        )}
      </div>
    </div>
  );
}
