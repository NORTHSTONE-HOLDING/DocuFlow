import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';
import { ItemManager } from '../components/ItemManager';
import { PhotoScanDropzone } from '../components/PhotoScanDropzone';
import type { CompanyProfile, Project, WorkflowDocument, WorkflowStage } from '../types/erp';
import { KIND_LABELS, STAGE_LABELS } from '../types/erp';
import { fetchAresCompany } from '../utils/ares';
import { formatCurrency, formatDate } from '../utils/format';
import { calculateTotals } from '../utils/vat';
import { buildWhatsAppShareUrl } from '../utils/payments';
import {
  convertContractToAdvance,
  convertHandoverToFinal,
  convertQuoteToContract,
  convertToHandover,
} from '../utils/workflow';
import { getWorkflowDoc, upsertProject, upsertWorkflowDoc } from '../utils/erpStorage';

interface ProjectDetailProps {
  profile: CompanyProfile;
  projects: Project[];
  onRefresh: () => void;
  canCreate: boolean;
  onBlocked: () => void;
  onDocumentCreated: () => void;
}

export function ProjectDetail({
  profile,
  projects,
  onRefresh,
  canCreate,
  onBlocked,
  onDocumentCreated,
}: ProjectDetailProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { require } = useFeatureAccess();
  const project = projects.find((p) => p.id === projectId);
  const [doc, setDoc] = useState<WorkflowDocument | null>(null);
  const [aresLoading, setAresLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const activeDocId = useMemo(() => {
    if (!project) return undefined;
    return (
      project.finalId ||
      project.handoverId ||
      project.advanceId ||
      project.contractId ||
      project.quoteId
    );
  }, [project]);

  useEffect(() => {
    if (!activeDocId) return;
    const found = getWorkflowDoc(activeDocId);
    if (found) {
      setDoc({
        ...found,
        supplier: found.supplier.companyName ? found.supplier : { ...profile },
      });
    }
  }, [activeDocId, profile]);

  if (!project || !doc) {
    return (
      <div className="page">
        <p>Zakázka nenalezena.</p>
        <Link to="/" className="btn btn--primary">
          Nástěnka
        </Link>
      </div>
    );
  }

  const persist = (next: WorkflowDocument, nextProject?: Project) => {
    next.totals = calculateTotals(next.items);
    upsertWorkflowDoc(next);
    if (nextProject) upsertProject({ ...nextProject, value: next.totals.total, client: next.client, clientName: next.client.name });
    else {
      upsertProject({
        ...project,
        value: Math.max(project.value, next.totals.total),
        client: next.client,
        clientName: next.client.name || project.clientName,
        updatedAt: new Date().toISOString(),
      });
    }
    setDoc(next);
    onRefresh();
  };

  const convert = (fn: () => { project: Project; doc: WorkflowDocument }, label: string) => {
    if (!canCreate) {
      onBlocked();
      return;
    }
    const result = fn();
    onDocumentCreated();
    setMsg(`${label} vytvořeno: ${result.doc.number}`);
    onRefresh();
    navigate(`/zakazka/${result.project.id}`);
  };

  const signUrl = `${window.location.origin}/sign/${doc.id}`;
  const wa = doc.client.phone
    ? buildWhatsAppShareUrl(doc.client.phone, doc.number, signUrl)
    : null;

  const stages: WorkflowStage[] = [1, 2, 3, 4, 5];

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Zakázka</p>
          <h1>{project.name}</h1>
          <p className="page__sub">
            {KIND_LABELS[doc.kind]} <strong>{doc.number}</strong> · {formatDate(doc.createdAt)} ·{' '}
            {formatCurrency(doc.totals.total)}
          </p>
        </div>
        <Link to="/" className="btn btn--ghost">
          ← Nástěnka
        </Link>
      </div>

      <ol className="pipeline">
        {stages.map((s) => (
          <li key={s} className={`pipeline__step ${project.stage === s ? 'is-active' : ''} ${project.stage > s ? 'is-done' : ''}`}>
            <span>{s}</span>
            <strong>{STAGE_LABELS[s]}</strong>
          </li>
        ))}
      </ol>

      <div className="convert-bar">
        {doc.kind === 'quote' && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => convert(() => convertQuoteToContract(doc, project), 'Smlouva')}
          >
            One-Click: Nabídka → Smlouva
          </button>
        )}
        {doc.kind === 'contract' && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() =>
              convert(() => convertContractToAdvance(doc, project, doc.advancePercent || 40), 'Zálohová faktura')
            }
          >
            One-Click: Smlouva → Záloha {doc.advancePercent || 40} %
          </button>
        )}
        {(doc.kind === 'advance_invoice' || doc.kind === 'contract') && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => convert(() => convertToHandover(doc, project), 'Předávací protokol')}
          >
            One-Click: Hotovo → Předávací protokol
          </button>
        )}
        {doc.kind === 'handover' && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              const contract = project.contractId ? getWorkflowDoc(project.contractId) : undefined;
              const advance = project.advanceId ? getWorkflowDoc(project.advanceId) : undefined;
              convert(() => convertHandoverToFinal(doc, project, contract, advance), 'Doplatková faktura');
            }}
          >
            One-Click: Protokol → Doplatková faktura
          </button>
        )}
      </div>

      {msg && <div className="alert alert--ok">{msg}</div>}

      {(doc.kind === 'quote' || doc.kind === 'contract') && (
        <section className="ai-intake-panel">
          <div className="ai-intake-panel__copy">
            <h2>AI načtení zakázky</h2>
            <p>Nahrajte fotku rozpočtu / skici ze stavby — položky a klient se doplní automaticky.</p>
          </div>
          <FeatureGate feature="photoScan">
            <PhotoScanDropzone
              onResult={({ items, client, notes }) => {
                persist({
                  ...doc,
                  items,
                  notes: notes || doc.notes,
                  client: {
                    ...doc.client,
                    name: client.name || doc.client.name,
                    address: client.address || doc.client.address,
                    ico: client.ico || doc.client.ico,
                  },
                });
                setMsg('Položky načteny z fotky / skici.');
              }}
            />
          </FeatureGate>
        </section>
      )}

      <div className="project-grid">
        <section className="settings-card">
          <h2>Klient</h2>
          <div className="form-stack">
            <label>
              Název firmy / jméno
              <input
                value={doc.client.name}
                onChange={(e) => persist({ ...doc, client: { ...doc.client, name: e.target.value } })}
              />
            </label>
            <label>
              IČO
              <div className="ico-row">
                <input
                  value={doc.client.ico}
                  onChange={(e) => persist({ ...doc, client: { ...doc.client, ico: e.target.value } })}
                />
                <FeatureGate feature="ares" compact className="feature-gate--inline">
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={aresLoading}
                    onClick={async () => {
                      if (!require('ares')) return;
                      setAresLoading(true);
                      try {
                        const c = await fetchAresCompany(doc.client.ico);
                        persist({
                          ...doc,
                          client: {
                            ...doc.client,
                            name: c.name,
                            ico: c.ico,
                            dic: c.dic || doc.client.dic,
                            address: c.address,
                          },
                        });
                      } finally {
                        setAresLoading(false);
                      }
                    }}
                  >
                    {aresLoading ? '…' : 'Načíst z ARES'}
                  </button>
                </FeatureGate>
              </div>
            </label>
            <label>
              DIČ
              <input
                value={doc.client.dic}
                onChange={(e) => persist({ ...doc, client: { ...doc.client, dic: e.target.value } })}
              />
            </label>
            <label>
              Adresa
              <textarea
                rows={2}
                value={doc.client.address}
                onChange={(e) => persist({ ...doc, client: { ...doc.client, address: e.target.value } })}
              />
            </label>
            <label>
              Telefonní číslo klienta (+420)
              <div className="ico-row">
                <span className="phone-prefix">+420</span>
                <input
                  value={doc.client.phone.replace(/^(\+?420)?/, '')}
                  onChange={(e) =>
                    persist({
                      ...doc,
                      client: { ...doc.client, phone: e.target.value.replace(/\D/g, '') },
                    })
                  }
                  placeholder="777123456"
                />
              </div>
            </label>
            {wa ? (
              <a className="btn btn--whatsapp" href={wa} target="_blank" rel="noreferrer">
                Poslat k podpisu na WhatsApp
              </a>
            ) : (
              <button type="button" className="btn btn--whatsapp" disabled>
                Poslat k podpisu na WhatsApp
              </button>
            )}
            <Link to={`/sign/${doc.id}`} className="btn btn--ghost">
              Otevřít obrazovku podpisu
            </Link>
          </div>
        </section>

        <section className="settings-card">
          <h2>Dodavatel (z profilu)</h2>
          <dl className="supplier-dl">
            <div>
              <dt>Firma</dt>
              <dd>{doc.supplier.companyName || profile.companyName || '— doplňte v Profilu'}</dd>
            </div>
            <div>
              <dt>IČO / DIČ</dt>
              <dd>
                {doc.supplier.ico || profile.ico || '—'} / {doc.supplier.dic || profile.dic || '—'}
              </dd>
            </div>
            <div>
              <dt>Sídlo</dt>
              <dd>{doc.supplier.address || profile.address || '—'}</dd>
            </div>
            <div>
              <dt>Účet</dt>
              <dd>
                {doc.supplier.accountNumber || profile.accountNumber || '—'}/
                {doc.supplier.bankCode || profile.bankCode || '—'}
              </dd>
            </div>
          </dl>
          {(doc.kind === 'contract' || doc.kind === 'advance_invoice') && (
            <label className="advance-field">
              Záloha %
              <input
                type="number"
                min={10}
                max={90}
                value={doc.advancePercent}
                onChange={(e) => persist({ ...doc, advancePercent: Number(e.target.value) || 40 })}
              />
            </label>
          )}
          <label>
            Smluvní / fakturační text
            <textarea rows={5} value={doc.terms} onChange={(e) => persist({ ...doc, terms: e.target.value })} />
          </label>
        </section>
      </div>

      <ItemManager
        items={doc.items}
        onChange={(items) => persist({ ...doc, items })}
        enableVoice={doc.kind === 'quote' || doc.kind === 'contract'}
      />
    </div>
  );
}
