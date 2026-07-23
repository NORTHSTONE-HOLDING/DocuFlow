import { useEffect, useId } from 'react';
import { getLegalDocument, type LegalDocId } from '../data/legal';
import { downloadLegalDocument, openLegalPrintView } from '../utils/legalDownload';

interface LegalModalProps {
  docId: LegalDocId | null;
  onClose: () => void;
}

export function LegalModal({ docId, onClose }: LegalModalProps) {
  const id = useId();

  useEffect(() => {
    if (!docId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docId, onClose]);

  if (!docId) return null;

  const doc = getLegalDocument(docId);

  return (
    <div className="modal-backdrop legal-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3 id={`${id}-title`}>{doc.title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>

        <div className="legal-modal__toolbar">
          <button
            type="button"
            className="btn btn--download"
            onClick={() => downloadLegalDocument(doc.id)}
          >
            📥 Stáhnout jako dokument (PDF/DOCX)
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => openLegalPrintView(doc.id)}>
            Tisková verze
          </button>
        </div>
        <p className="legal-modal__meta">Aktualizováno ke dni {doc.updatedAt} · Elektronický výpis právního textu</p>

        <div className="legal-modal__body">
          {doc.sections.map((section) => (
            <section key={section.heading} className="legal-section">
              <h4>{section.heading}</h4>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Rozumím
          </button>
        </div>
      </div>
    </div>
  );
}
