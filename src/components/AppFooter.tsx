import type { LegalDocId } from '../data/legal';

interface AppFooterProps {
  onOpenLegal: (id: LegalDocId) => void;
}

const LINKS: { id: LegalDocId; label: string }[] = [
  { id: 'vop', label: 'VOP' },
  { id: 'gdpr', label: 'GDPR' },
  { id: 'consentProcessing', label: 'Souhlas se zpracováním osobních údajů' },
  { id: 'consentMarketing', label: 'Souhlas se zasíláním obchodních sdělení' },
];

export function AppFooter({ onOpenLegal }: AppFooterProps) {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <strong>DocuFlow</strong>
        <span>Právní dokumenty · ÚOOÚ / GDPR · Česká republika</span>
      </div>
      <nav className="app-footer__links" aria-label="Právní dokumenty">
        {LINKS.map((link) => (
          <button key={link.id} type="button" className="app-footer__link" onClick={() => onOpenLegal(link.id)}>
            {link.label}
          </button>
        ))}
      </nav>
    </footer>
  );
}
