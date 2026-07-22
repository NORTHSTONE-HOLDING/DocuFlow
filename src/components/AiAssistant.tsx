import { useState } from 'react';
import { generateContractAssistance, hasOpenAiKey } from '../utils/ai';

interface AiAssistantProps {
  terms: string;
  onApply: (nextTerms: string) => void;
}

const SUGGESTIONS = [
  'Doplň do smlouvy sankce za pozdní dodání…',
  'Přepiš tento odstavec formálněji…',
  'Přidej platební podmínky se splatností 14 dní…',
  'Doplň záruční ustanovení na 24 měsíců…',
];

export function AiAssistant({ terms, onApply }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<'openai' | 'simulation' | null>(null);
  const liveMode = hasOpenAiKey();

  const run = async (value = prompt) => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setNote(null);
    setError(null);
    try {
      const result = await generateContractAssistance(value, terms);
      if (result.mode === 'rewrite') {
        const parts = terms.trim() ? terms.trim().split(/\n\n+/) : [];
        if (parts.length > 0) {
          parts[parts.length - 1] = result.text;
          onApply(parts.join('\n\n'));
        } else {
          onApply(result.text);
        }
      } else {
        onApply(terms.trim() ? `${terms.trim()}\n\n${result.text}` : result.text);
      }
      setNote(result.note);
      setLastSource(result.source);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generování se nezdařilo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`ai-fab ${loading ? 'is-loading' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-busy={loading}
      >
        <span className="ai-fab__glow" />
        {loading ? (
          <>
            <span className="ai-spinner" aria-hidden />
            AI přemýšlí…
          </>
        ) : (
          'AI Asistent'
        )}
      </button>

      {open && (
        <aside className="ai-panel" aria-label="AI asistent smlouvy">
          <div className="ai-panel__head">
            <div>
              <strong>AI Asistent</strong>
              <p>
                {liveMode
                  ? 'Ostrý režim · model gpt-4o-mini'
                  : 'Testovací režim · chytrá simulace bez API klíče'}
              </p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Zavřít">
              ×
            </button>
          </div>

          <div className="ai-panel__mode">
            <span className={`ai-mode-dot ${liveMode ? 'is-live' : 'is-sim'}`} />
            {liveMode ? 'OpenAI připojeno' : 'Bez klíče · simulace'}
          </div>

          <div className="ai-panel__chips">
            <span className="ai-panel__chips-label">Rychlé tipy</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => {
                  setPrompt(s);
                  void run(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="ai-panel__prompt">
            Váš požadavek
            <textarea
              rows={3}
              value={prompt}
              disabled={loading}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !loading) {
                  e.preventDefault();
                  void run();
                }
              }}
              placeholder="Např. Doplň do smlouvy sankce za pozdní dodání…"
            />
          </label>

          <button
            type="button"
            className="btn btn--primary ai-panel__submit"
            disabled={loading || !prompt.trim()}
            onClick={() => void run()}
          >
            {loading ? (
              <>
                <span className="ai-spinner ai-spinner--dark" aria-hidden />
                AI přemýšlí…
              </>
            ) : (
              'Vygenerovat a vložit text'
            )}
          </button>

          {loading && (
            <div className="ai-panel__loading" role="status" aria-live="polite">
              <span className="ai-spinner" aria-hidden />
              <div>
                <strong>AI přemýšlí…</strong>
                <p>{liveMode ? 'Volám OpenAI gpt-4o-mini' : 'Připravuji kvalitní mock právní odstavec'}</p>
              </div>
            </div>
          )}

          {note && !loading && (
            <p className={`ai-panel__note ${lastSource === 'openai' ? 'is-live' : ''}`}>
              {note}
            </p>
          )}

          {error && !loading && <div className="alert alert--error">{error}</div>}

          {!liveMode && (
            <div className="ai-dev-banner" role="note">
              ⚠️ Běží testovací režim. Pro ostré generování doplňte klíč do .env souboru.
            </div>
          )}
        </aside>
      )}
    </>
  );
}
