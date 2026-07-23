import { Link, useParams } from 'react-router-dom';
import { getLegalNotice } from '../utils/legalNotices';
import { formatCurrency } from '../utils/format';
import { Logo } from '../components/Logo';

export function ViewLegal() {
  const { id } = useParams<{ id: string }>();
  const notice = getLegalNotice(id || 'mock-id');

  if (!notice) {
    return (
      <div className="view-legal view-legal--empty">
        <Logo />
        <h1>Dokument nenalezen</h1>
        <p>Právní dokument s tímto identifikátorem neexistuje nebo byl odstraněn.</p>
        <Link to="/" className="btn btn--primary">
          Zpět do PaperFlow
        </Link>
      </div>
    );
  }

  const download = () => {
    const blob = new Blob([`${notice.title}\n\n${notice.body}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaperFlow-${notice.templateId}-${notice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="view-legal fade-in">
      <header className="view-legal__head">
        <Logo />
        <div>
          <p className="eyebrow">Inkasní rejstřík · Oficiální dokument</p>
          <h1>{notice.title}</h1>
          <p>
            {notice.clientName} · {notice.invoiceNumber} · {formatCurrency(notice.amount)}
          </p>
        </div>
        <button type="button" className="btn btn--download" onClick={download}>
          📥 Stáhnout jako dokument
        </button>
      </header>

      <article className="view-legal__paper">
        <div className="view-legal__meta">
          <span>ID: {notice.id}</span>
          <span>{new Date(notice.createdAt).toLocaleString('cs-CZ')}</span>
          <span>Věřitel: {notice.supplierName}</span>
        </div>
        <pre className="view-legal__body">{notice.body}</pre>
      </article>

      <footer className="view-legal__footer">
        <p>PaperFlow Systems s.r.o. · IČO 4205190 · DIČ CZ4205190 · © 2026</p>
        <Link to="/" className="btn btn--ghost btn--sm">
          Otevřít aplikaci
        </Link>
      </footer>
    </div>
  );
}
