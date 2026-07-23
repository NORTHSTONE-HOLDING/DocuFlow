import type { LegalDocId } from '../data/legal';

interface AppFooterProps {
  onOpenLegal: (id: LegalDocId) => void;
}

const LINKS: { id: LegalDocId; label: string }[] = [
  { id: 'vop', label: 'VOP' },
  { id: 'gdpr', label: 'GDPR' },
  { id: 'consentProcessing', label: 'Souhlas se zpracováním dat' },
  { id: 'userGuide', label: 'Návod k použití' },
];

export function AppFooter({ onOpenLegal }: AppFooterProps) {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <strong>DocuFlow Systems s.r.o.</strong>
        <span>IČO: 4205190 · DIČ: CZ4205190</span>
        <span>zapsaná u Městského soudu v Praze, sp. zn. C 12345</span>
        <span className="app-footer__copy">© 2026 DocuFlow Systems s.r.o. Veškerá práva vyhrazena.</span>
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
