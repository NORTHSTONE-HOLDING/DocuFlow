import { useEffect, useMemo, useState } from 'react';
import type { Project, WorkflowDocument } from '../types/erp';
import { formatCurrency } from '../utils/format';
import { buildWhatsAppShareUrl } from '../utils/payments';
import {
  buildFormalDebtWhatsAppText,
  buildSoftDebtReminderText,
  ensurePredzalobniNotice,
  isInvoiceOverdue,
} from '../utils/legalNotices';

interface DebtCollectorModalProps {
  open: boolean;
  project: Project;
  invoice: WorkflowDocument;
  onClose: () => void;
}

export function DebtCollectorModal({ open, project, invoice, onClose }: DebtCollectorModalProps) {
  const overdue = isInvoiceOverdue(invoice);
  const [mode, setMode] = useState<'soft' | 'legal'>(overdue ? 'legal' : 'soft');

  useEffect(() => {
    if (open) setMode(overdue ? 'legal' : 'soft');
  }, [open, overdue]);

  const payLink = useMemo(() => `${window.location.origin}/sign/${invoice.id}`, [invoice.id]);
  const legalUrl = useMemo(() => `${window.location.origin}/view-legal/mock-id`, []);

  const message = useMemo(() => {
    if (mode === 'legal') {
      ensurePredzalobniNotice(project, invoice, 'mock-id');
      return buildFormalDebtWhatsAppText({
        legalUrl,
        invoiceNumber: invoice.number,
        amount: invoice.totals.total,
      });
    }
    return buildSoftDebtReminderText(invoice, payLink);
  }, [mode, project, invoice, legalUrl, payLink]);

  const wa = invoice.client.phone || project.client.phone
    ? buildWhatsAppShareUrl(invoice.client.phone || project.client.phone, invoice.number, payLink)
    : null;

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
          {overdue ? <em className="debt-badge debt-badge--overdue">Po splatnosti</em> : <em className="debt-badge">Neuhrazeno</em>}
        </div>

        <div className="debt-mode-tabs" role="tablist" aria-label="Režim vymáhání">
          <button
            type="button"
            role="tab"
            className={mode === 'soft' ? 'is-active' : ''}
            onClick={() => setMode('soft')}
          >
            Zdvořilá připomínka
          </button>
          <button
            type="button"
            role="tab"
            className={mode === 'legal' ? 'is-active' : ''}
            disabled={!overdue}
            title={overdue ? undefined : 'Právní režim se odemkne u faktur Po splatnosti'}
            onClick={() => overdue && setMode('legal')}
          >
            Formální právní režim WhatsApp
          </button>
        </div>

        <p className="modal__lead">
          {mode === 'legal'
            ? 'Neúprosná oficiální předžalobní výzva s odkazem na dokument v inkasním rejstříku.'
            : 'Chytrá, zdvořilá a profesionální připomínka platby v češtině — připravená k odeslání na WhatsApp.'}
        </p>

        {mode === 'legal' && (
          <div className="debt-legal-banner">
            Dokument: <a href={legalUrl} target="_blank" rel="noreferrer">{legalUrl}</a>
          </div>
        )}

        <label className="debt-modal__label">
          Text {mode === 'legal' ? 'právní výzvy' : 'připomínky'}
          <textarea rows={7} readOnly value={message} />
        </label>

        <div className="modal__actions debt-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Zavřít
          </button>
          {waExact || wa ? (
            <a className="btn btn--whatsapp" href={waExact || wa!} target="_blank" rel="noreferrer">
              {mode === 'legal' ? 'Odeslat předžalobní výzvu na WhatsApp' : 'Odeslat připomínku na WhatsApp'}
            </a>
          ) : (
            <button type="button" className="btn btn--whatsapp" disabled title="Doplňte telefon klienta v zakázce">
              Odeslat na WhatsApp
            </button>
          )}
        </div>
        {!invoice.client.phone && !project.client.phone && (
          <p className="debt-modal__hint">Doplňte telefon klienta v detailu zakázky (+420), aby šlo odeslat WhatsApp.</p>
        )}
        {!overdue && (
          <p className="debt-modal__hint">
            Tip: označte fakturu jako „Po splatnosti“ v detailu zakázky pro odemčení formálního právního režimu.
          </p>
        )}
      </div>
    </div>
  );
}
