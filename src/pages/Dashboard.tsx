import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DocumentRecord } from '../types/document';
import { formatCurrency, formatDate } from '../utils/format';
import { downloadPdf, openMailto, printDocument } from '../utils/pdf';
import { EmailModal } from '../components/EmailModal';

interface DashboardProps {
  documents: DocumentRecord[];
  onDelete: (id: string) => void;
}

export function Dashboard({ documents, onDelete }: DashboardProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [emailDoc, setEmailDoc] = useState<DocumentRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = documents.length;
    const value = documents.reduce((s, d) => s + (d.price || 0), 0);
    const month = documents.filter((d) => {
      const dt = new Date(d.createdAt);
      const now = new Date();
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;
    return { total, value, month };
  }, [documents]);

  const handleDownload = async (doc: DocumentRecord) => {
    setBusyId(doc.id);
    setMenuId(null);
    try {
      await downloadPdf(doc);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Nástěnka</p>
          <h1>Vaše dokumenty</h1>
          <p className="page__sub">Historie generovaných smluv uložená lokálně v prohlížeči.</p>
        </div>
        <Link to="/novy" className="btn btn--primary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Nový dokument
        </Link>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span>Celkem dokumentů</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat">
          <span>Tento měsíc</span>
          <strong>{stats.month}</strong>
        </div>
        <div className="stat">
          <span>Celková hodnota</span>
          <strong>{formatCurrency(stats.value)}</strong>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8 3h7l4 4v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <path d="M15 3v4h4M9 12h6M9 16h4" strokeLinecap="round" />
            </svg>
          </div>
          <h2>Zatím žádné dokumenty</h2>
          <p>Vytvořte první smlouvu nebo fakturu — vše zůstane uloženo lokálně.</p>
          <Link to="/novy" className="btn btn--primary">
            Spustit průvodce
          </Link>
        </div>
      ) : (
        <>
          <div className="docs-table docs-table--desktop">
            <div className="docs-table__head">
              <span>Dokument</span>
              <span>Klient</span>
              <span>Datum</span>
              <span>Hodnota</span>
              <span>Akce</span>
            </div>
            {documents.map((doc) => (
              <div className="docs-table__row" key={doc.id}>
                <div className="docs-table__name">
                  <strong>{doc.name}</strong>
                  <span>{doc.templateLabel}</span>
                </div>
                <span>{doc.clientName || '—'}</span>
                <span>{formatDate(doc.createdAt)}</span>
                <span className="docs-table__price">{formatCurrency(doc.price)}</span>
                <div className="docs-table__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={busyId === doc.id}
                    onClick={() => handleDownload(doc)}
                    title="Stáhnout PDF"
                  >
                    Stáhnout
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEmailDoc(doc)}>
                    E-mail
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => printDocument(doc)}>
                    Tisk
                  </button>
                  <div className="actions-menu">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Další akce"
                      onClick={() => setMenuId(menuId === doc.id ? null : doc.id)}
                    >
                      ⋮
                    </button>
                    {menuId === doc.id && (
                      <div className="actions-menu__dropdown">
                        <button type="button" onClick={() => { onDelete(doc.id); setMenuId(null); }}>
                          Smazat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="docs-cards docs-cards--mobile">
            {documents.map((doc) => (
              <article className="doc-card" key={doc.id}>
                <header>
                  <strong>{doc.name}</strong>
                  <span>{doc.templateLabel}</span>
                </header>
                <dl>
                  <div>
                    <dt>Klient</dt>
                    <dd>{doc.clientName || '—'}</dd>
                  </div>
                  <div>
                    <dt>Datum</dt>
                    <dd>{formatDate(doc.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Hodnota</dt>
                    <dd>{formatCurrency(doc.price)}</dd>
                  </div>
                </dl>
                <footer className="doc-card__actions">
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => handleDownload(doc)}>
                    Stáhnout
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEmailDoc(doc)}>
                    E-mail
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => printDocument(doc)}>
                    Tisk
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => onDelete(doc.id)}>
                    Smazat
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      <EmailModal
        open={!!emailDoc}
        documentName={emailDoc?.name ?? ''}
        onClose={() => setEmailDoc(null)}
        onSend={(email) => {
          if (emailDoc) openMailto(email, emailDoc);
        }}
      />
    </div>
  );
}
