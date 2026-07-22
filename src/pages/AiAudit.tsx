import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../data/templates';
import { hasOpenAiKey } from '../utils/ai';
import { AUDIT_SCAN_STEPS, runLegalAudit, type LegalAuditResult } from '../utils/legalAudit';
import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';

const SAMPLE_CONTRACT = `SMLOUVA O DÍLO
uzavřená dle § 2586 a násl. občanského zákoníku

1. Zhotovitel se zavazuje zhotovit dílo dle pokynů objednatele. Rozsah díla může zhotovitel jednostranně upravit dle svého uvážení.
2. Za každé i započaté prodlení s termínem dodání je objednatel povinen zaplatit smluvní pokutu 0,5 % z ceny díla denně, bez omezení horní hranice.
3. Objednatel se vzdává jakýchkoli nároků na náhradu škody vzniklé v souvislosti s dílem.
4. Smlouva se automaticky prolonguje o další rok, pokud není vypovězena 90 dní předem. Zhotovitel může smlouvu vypovědět okamžitě bez udání důvodu.
5. Veškeré spory rozhodne rozhodce určený výhradně zhotovitelem.`;

export function AiAudit() {
  const { can, require } = useFeatureAccess();
  const allowed = can('aiAudit');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<LegalAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const live = hasOpenAiKey();

  const stepLabel = useMemo(() => AUDIT_SCAN_STEPS[Math.min(stepIdx, AUDIT_SCAN_STEPS.length - 1)], [stepIdx]);

  useEffect(() => {
    if (!scanning) return;
    setStepIdx(0);
    setProgress(8);
    const stepTimer = window.setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, AUDIT_SCAN_STEPS.length - 1));
      setProgress((p) => Math.min(p + 18, 92));
    }, 550);
    return () => window.clearInterval(stepTimer);
  }, [scanning]);

  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setFileName(`${t.label}.txt`);
    setText(`${t.defaultName.toUpperCase()}\n\n${t.defaultItem}\n\n${t.defaultTerms}`);
    setResult(null);
    setError(null);
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv') || file.type.startsWith('text/')) {
      setText(await file.text());
      return;
    }
    setError('Pro audit nahrajte textový soubor (.txt / .md), nebo vložte text smlouvy ručně.');
  };

  const startAudit = async () => {
    if (!require('aiAudit')) return;
    setError(null);
    setResult(null);
    setScanning(true);
    try {
      const audit = await runLegalAudit(text);
      setProgress(100);
      setResult(audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit se nezdařil.');
    } finally {
      setScanning(false);
    }
  };

  const workspace = (
    <>
      <div className="audit-hero">
        <div className="audit-hero__copy">
          <h2>AI Audit cizí smlouvy</h2>
          <p>
            Vložte text, nahrajte soubor nebo načtěte šablonu. Jedním kliknutím spustíte kritický právní sken
            v češtině — rizika, upozornění a srozumitelné shrnutí.
          </p>
          <ul className="audit-hero__bullets">
            <li>Skryté smluvní pokuty a sankce</li>
            <li>Neférové výpovědní lhůty</li>
            <li>Vágní formulace a pastičky v odpovědnosti</li>
          </ul>
        </div>
        <div className="audit-hero__badge">
          <strong>od 390 Kč</strong>
          <span>Dostupné v tarifu Premium a vyšším</span>
        </div>
      </div>

      <section className="audit-workspace">
        <div className="audit-toolbar">
          <div className="audit-tabs" role="tablist" aria-label="Režim vstupu">
            <span className="audit-tabs__active">AI Audit cizí smlouvy</span>
            <Link to="/novy" className="audit-tabs__link">
              Vytvořit nový dokument →
            </Link>
          </div>
          <div className="audit-toolbar__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
              Nahrát soubor
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setText(SAMPLE_CONTRACT);
                setFileName('ukazkova-smlouva.txt');
                setResult(null);
              }}
            >
              Vložit ukázku
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,text/plain"
              hidden
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <label className="audit-template-select">
          Nebo načíst z české šablony
          <select defaultValue="" onChange={(e) => e.target.value && loadTemplate(e.target.value)}>
            <option value="" disabled>
              — Vyberte šablonu —
            </option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {fileName && (
          <p className="audit-filename">
            Soubor: <strong>{fileName}</strong>
          </p>
        )}

        <label className="audit-textarea-label">
          Text smlouvy
          <textarea
            className="audit-textarea"
            rows={14}
            value={text}
            disabled={scanning || !allowed}
            onChange={(e) => setText(e.target.value)}
            placeholder="Vložte sem celý text cizí smlouvy ke kontrole…"
          />
        </label>

        <button
          type="button"
          className="btn btn--primary btn--lg audit-scan-btn"
          disabled={scanning || text.trim().length < 40 || !allowed}
          onClick={() => void startAudit()}
        >
          {scanning ? (
            <>
              <span className="ai-spinner ai-spinner--dark" aria-hidden />
              AI skenuje…
            </>
          ) : (
            <>🔍 Prověřit smlouvu umělou inteligencí</>
          )}
        </button>

        {error && <div className="alert alert--error">{error}</div>}

        {scanning && (
          <div className="audit-scan" role="status" aria-live="polite">
            <div className="audit-scan__radar" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="audit-scan__copy">
              <strong>{stepLabel}</strong>
              <p>Elitní AI právník hledá pastičky, pokuty a nefér podmínky…</p>
              <div className="audit-scan__bar">
                <div style={{ width: `${progress}%` }} />
              </div>
              <ul className="audit-scan__steps">
                {AUDIT_SCAN_STEPS.map((s, i) => (
                  <li key={s} className={i <= stepIdx ? 'is-done' : ''}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result && !scanning && (
          <div className="audit-results fade-in">
            <div className="audit-results__head">
              <div>
                <h2>Výsledek AI auditu</h2>
                <p>
                  Zdroj: {result.source === 'openai' ? 'OpenAI gpt-4o-mini' : 'Testovací simulace'} ·{' '}
                  {new Date(result.scannedAt).toLocaleString('cs-CZ')}
                </p>
              </div>
              {!live && (
                <div className="ai-dev-banner audit-results__banner">
                  ⚠️ Běží testovací režim. Pro ostré generování doplňte klíč do .env souboru.
                </div>
              )}
            </div>

            <article className="audit-card audit-card--risk">
              <header>
                <span className="audit-card__icon">🔴</span>
                <div>
                  <h3>VELKÁ RIZIKA</h3>
                  <p>Vážné právní pasti a pokuty</p>
                </div>
              </header>
              <ul>
                {result.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="audit-card audit-card--warn">
              <header>
                <span className="audit-card__icon">🟡</span>
                <div>
                  <h3>UPOZORNĚNÍ</h3>
                  <p>Na co si dát pozor</p>
                </div>
              </header>
              <ul>
                {result.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="audit-card audit-card--ok">
              <header>
                <span className="audit-card__icon">🟢</span>
                <div>
                  <h3>SHRNUTÍ LIDSKOU ŘEČÍ</h3>
                  <p>Co z této smlouvy pro vás vyplývá</p>
                </div>
              </header>
              <p className="audit-card__summary">{result.summary}</p>
            </article>
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="page fade-in audit-page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Killer Feature</p>
          <h1>AI Právní Audit</h1>
          <p className="page__sub">
            Nahrajte cizí smlouvu a nechte elitního AI právníka odhalit skryté háčky, pokuty a nefér podmínky —
            dostupné od tarifu Premium.
          </p>
        </div>
        <span className={`plan-chip ${allowed ? 'plan-chip--premium' : 'plan-chip--locked'}`}>
          {allowed ? 'Premium+ odemčeno' : 'Vyžaduje Premium'}
        </span>
      </div>

      {allowed ? workspace : <FeatureGate feature="aiAudit">{workspace}</FeatureGate>}
    </div>
  );
}
