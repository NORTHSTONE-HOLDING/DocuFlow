import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TEMPLATES, getTemplate } from '../data/templates';
import type { DocumentRecord, PartyInfo, TemplateId, WizardState } from '../types/document';
import { createId } from '../utils/storage';
import { downloadPdf, openMailto, printDocument } from '../utils/pdf';
import { formatCurrency } from '../utils/format';
import { SignaturePad } from '../components/SignaturePad';
import { EmailModal } from '../components/EmailModal';

const emptyParty = (): PartyInfo => ({ name: '', idNumber: '', address: '' });

function buildInitialWizard(templateId?: TemplateId | null): WizardState {
  const base: WizardState = {
    step: 1,
    templateId: null,
    partyA: emptyParty(),
    partyB: emptyParty(),
    terms: '',
    itemDescription: '',
    price: 0,
    signatureA: null,
    signatureB: null,
    documentName: '',
  };
  if (!templateId) return base;
  const t = getTemplate(templateId);
  return {
    ...base,
    templateId,
    terms: t.defaultTerms,
    documentName: t.defaultName,
    itemDescription:
      templateId === 'faktura'
        ? 'Fakturované plnění dle objednávky.'
        : templateId === 'plna-moc'
          ? 'Zastupování ve věci uvedené níže.'
          : 'Předmět smlouvy dle dohody stran.',
  };
}

interface NewDocumentProps {
  onSave: (doc: DocumentRecord) => void;
}

function TemplateIcon({ icon }: { icon: string }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const;
  switch (icon) {
    case 'contract':
      return (
        <svg {...common}>
          <path d="M8 3h7l4 4v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M15 3v4h4M9 12h6M9 16h4" strokeLinecap="round" />
        </svg>
      );
    case 'work':
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" strokeLinecap="round" />
        </svg>
      );
    case 'power':
      return (
        <svg {...common}>
          <path d="M12 3v6M8 7a6 6 0 1 0 8 0" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function NewDocument({ onSave }: NewDocumentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const presetTemplate = (location.state as { templateId?: TemplateId } | null)?.templateId ?? null;
  const [wizard, setWizard] = useState<WizardState>(() => buildInitialWizard(presetTemplate));
  const [savedDoc, setSavedDoc] = useState<DocumentRecord | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const steps = ['Šablona', 'Strany', 'Specifikace', 'Podpisy'];

  const selectTemplate = (id: TemplateId) => {
    const t = getTemplate(id);
    setWizard((w) => ({
      ...w,
      templateId: id,
      terms: t.defaultTerms,
      documentName: t.defaultName,
      itemDescription:
        id === 'faktura'
          ? 'Fakturované plnění dle objednávky.'
          : id === 'plna-moc'
            ? 'Zastupování ve věci uvedené níže.'
            : 'Předmět smlouvy dle dohody stran.',
    }));
  };

  const validateStep = (step: number): boolean => {
    setErrors(null);
    if (step === 1 && !wizard.templateId) {
      setErrors('Vyberte prosím šablonu dokumentu.');
      return false;
    }
    if (step === 2) {
      if (!wizard.partyA.name.trim() || !wizard.partyB.name.trim()) {
        setErrors('Vyplňte jména obou stran.');
        return false;
      }
    }
    if (step === 3) {
      if (!wizard.itemDescription.trim()) {
        setErrors('Doplňte popis předmětu.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep(wizard.step)) return;
    setWizard((w) => ({ ...w, step: Math.min(4, w.step + 1) }));
  };

  const back = () => setWizard((w) => ({ ...w, step: Math.max(1, w.step - 1) }));

  const finalize = () => {
    if (!wizard.templateId) return;
    if (!wizard.signatureA || !wizard.signatureB) {
      setErrors('Obě strany musí dokument podepsat.');
      return;
    }
    const t = getTemplate(wizard.templateId);
    const doc: DocumentRecord = {
      id: createId(),
      name: wizard.documentName || t.label,
      clientName: wizard.partyB.name,
      templateId: wizard.templateId,
      templateLabel: t.label,
      createdAt: new Date().toISOString(),
      price: Number(wizard.price) || 0,
      currency: 'CZK',
      partyA: wizard.partyA,
      partyB: wizard.partyB,
      terms: wizard.terms,
      itemDescription: wizard.itemDescription,
      signatureA: wizard.signatureA,
      signatureB: wizard.signatureB,
    };
    onSave(doc);
    setSavedDoc(doc);
  };

  const previewDoc = useMemo(() => {
    if (!wizard.templateId) return null;
    const t = getTemplate(wizard.templateId);
    return {
      id: 'preview',
      name: wizard.documentName || t.label,
      clientName: wizard.partyB.name,
      templateId: wizard.templateId,
      templateLabel: t.label,
      createdAt: new Date().toISOString(),
      price: wizard.price,
      currency: 'CZK' as const,
      partyA: wizard.partyA,
      partyB: wizard.partyB,
      terms: wizard.terms,
      itemDescription: wizard.itemDescription,
      signatureA: wizard.signatureA ?? undefined,
      signatureB: wizard.signatureB ?? undefined,
    };
  }, [wizard]);

  if (savedDoc) {
    return (
      <div className="page fade-in">
        <div className="success-panel">
          <div className="success-panel__badge">Hotovo</div>
          <h1>Dokument připraven</h1>
          <p>
            <strong>{savedDoc.name}</strong> byl uložen do lokální historie. Vyberte akci níže.
          </p>
          <div className="success-panel__meta">
            <span>{savedDoc.templateLabel}</span>
            <span>{savedDoc.clientName}</span>
            <span>{formatCurrency(savedDoc.price)}</span>
          </div>
          <div className="action-engine">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await downloadPdf(savedDoc);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Stáhnout PDF
            </button>
            <button type="button" className="btn btn--secondary btn--lg" onClick={() => setEmailOpen(true)}>
              Poslat e-mailem
            </button>
            <button type="button" className="btn btn--ghost btn--lg" onClick={() => printDocument(savedDoc)}>
              Vytisknout
            </button>
          </div>
          <div className="success-panel__footer">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/')}>
              Zpět na nástěnku
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setSavedDoc(null);
                setWizard(buildInitialWizard());
              }}
            >
              Další dokument
            </button>
          </div>
        </div>
        <EmailModal
          open={emailOpen}
          documentName={savedDoc.name}
          onClose={() => setEmailOpen(false)}
          onSend={(email) => openMailto(email, savedDoc)}
        />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Průvodce</p>
          <h1>Nový dokument</h1>
          <p className="page__sub">Čtyři kroky k formálnímu českému dokumentu s podpisy.</p>
        </div>
      </div>

      <ol className="wizard-steps">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className={`wizard-steps__item ${wizard.step === n ? 'is-active' : ''} ${wizard.step > n ? 'is-done' : ''}`}>
              <span className="wizard-steps__num">{wizard.step > n ? '✓' : n}</span>
              <span className="wizard-steps__label">{label}</span>
            </li>
          );
        })}
      </ol>

      {errors && <div className="alert alert--error">{errors}</div>}

      {wizard.step === 1 && (
        <section className="wizard-panel">
          <h2>Výběr šablony</h2>
          <p className="wizard-panel__sub">Vyberte typ dokumentu — velké interaktivní karty s náhledem.</p>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`template-card ${wizard.templateId === t.id ? 'is-selected' : ''}`}
                onClick={() => selectTemplate(t.id)}
              >
                <span className="template-card__icon">
                  <TemplateIcon icon={t.icon} />
                </span>
                <strong>{t.label}</strong>
                <span>{t.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {wizard.step === 2 && (
        <section className="wizard-panel">
          <h2>Smluvní strany</h2>
          <p className="wizard-panel__sub">Údaje strany A a strany B — vedle sebe na desktopu, pod sebou na mobilu.</p>
          <div className="parties-grid">
            <PartyForm
              title="Strana A"
              party={wizard.partyA}
              onChange={(partyA) => setWizard((w) => ({ ...w, partyA }))}
            />
            <PartyForm
              title="Strana B (klient)"
              party={wizard.partyB}
              onChange={(partyB) => setWizard((w) => ({ ...w, partyB }))}
            />
          </div>
        </section>
      )}

      {wizard.step === 3 && (
        <section className="wizard-panel">
          <h2>Specifikace smlouvy</h2>
          <p className="wizard-panel__sub">Dynamická pole pro podmínky, popis a cenu v CZK.</p>
          <div className="form-stack">
            <label>
              Název dokumentu
              <input
                value={wizard.documentName}
                onChange={(e) => setWizard((w) => ({ ...w, documentName: e.target.value }))}
              />
            </label>
            <label>
              Popis předmětu / položky
              <textarea
                rows={4}
                value={wizard.itemDescription}
                onChange={(e) => setWizard((w) => ({ ...w, itemDescription: e.target.value }))}
              />
            </label>
            <label>
              Smluvní ustanovení / podmínky
              <textarea
                rows={6}
                value={wizard.terms}
                onChange={(e) => setWizard((w) => ({ ...w, terms: e.target.value }))}
              />
            </label>
            <label>
              Cena / hodnota (CZK)
              <input
                type="number"
                min={0}
                step={100}
                value={wizard.price || ''}
                onChange={(e) => setWizard((w) => ({ ...w, price: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>
        </section>
      )}

      {wizard.step === 4 && (
        <section className="wizard-panel">
          <h2>Stanice podpisů</h2>
          <p className="wizard-panel__sub">
            Vysoké rozlišení HTML5 Canvas. Na mobilu se otevře celoobrazovkový režim pro podpis prstem.
          </p>
          <div className="sig-grid">
            <SignaturePad
              label="Podpis strany A"
              partyName={wizard.partyA.name}
              value={wizard.signatureA}
              onChange={(signatureA) => setWizard((w) => ({ ...w, signatureA }))}
            />
            <SignaturePad
              label="Podpis strany B"
              partyName={wizard.partyB.name}
              value={wizard.signatureB}
              onChange={(signatureB) => setWizard((w) => ({ ...w, signatureB }))}
            />
          </div>
          {previewDoc && (
            <p className="wizard-panel__note">
              Po dokončení se dokument uloží do LocalStorage a aktivuje se motor akcí (PDF / e-mail / tisk).
            </p>
          )}
        </section>
      )}

      <div className="wizard-footer">
        <button type="button" className="btn btn--ghost" onClick={back} disabled={wizard.step === 1}>
          Zpět
        </button>
        {wizard.step < 4 ? (
          <button type="button" className="btn btn--primary" onClick={next}>
            Pokračovat
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={finalize}>
            Dokončit a podepsat
          </button>
        )}
      </div>
    </div>
  );
}

function PartyForm({
  title,
  party,
  onChange,
}: {
  title: string;
  party: PartyInfo;
  onChange: (p: PartyInfo) => void;
}) {
  return (
    <fieldset className="party-form">
      <legend>{title}</legend>
      <label>
        Jméno / firma
        <input value={party.name} onChange={(e) => onChange({ ...party, name: e.target.value })} required />
      </label>
      <label>
        RČ / IČO
        <input value={party.idNumber} onChange={(e) => onChange({ ...party, idNumber: e.target.value })} />
      </label>
      <label>
        Adresa
        <textarea rows={3} value={party.address} onChange={(e) => onChange({ ...party, address: e.target.value })} />
      </label>
    </fieldset>
  );
}
