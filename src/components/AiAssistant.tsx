import { useState } from 'react';
import { generateContractAssistance } from '../utils/ai';

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

  const run = async (value = prompt) => {
    if (!value.trim()) return;
    setLoading(true);
    setNote(null);
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
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="ai-fab" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="ai-fab__glow" />
        AI Asistent
      </button>

      {open && (
        <aside className="ai-panel" aria-label="AI asistent smlouvy">
          <div className="ai-panel__head">
            <div>
              <strong>AI Asistent</strong>
              <p>Lokální generátor právních klauzulí (simulace)</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Zavřít">
              ×
            </button>
          </div>

          <div className="ai-panel__chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => { setPrompt(s); void run(s); }}>
                {s}
              </button>
            ))}
          </div>

          <label className="ai-panel__prompt">
            Váš požadavek
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Doplň do smlouvy sankce za pozdní dodání…"
            />
          </label>

          <button type="button" className="btn btn--primary" disabled={loading || !prompt.trim()} onClick={() => void run()}>
            {loading ? 'Generuji…' : 'Vygenerovat text'}
          </button>

          {note && <p className="ai-panel__note">{note}</p>}
        </aside>
      )}
    </>
  );
}
