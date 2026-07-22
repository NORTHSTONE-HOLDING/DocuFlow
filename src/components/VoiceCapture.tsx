import { useEffect, useRef, useState } from 'react';
import type { LineItem } from '../types/erp';
import { getSpeechRecognition, parseCzechVoiceToItems } from '../utils/voiceParse';

interface VoiceCaptureProps {
  onItems: (items: LineItem[], transcript: string) => void;
}

export function VoiceCapture({ onItems }: VoiceCaptureProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);
  const latestRef = useRef('');

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const finishWithText = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setTranscript(cleaned);
    onItems(parseCzechVoiceToItems(cleaned), cleaned);
  };

  const start = () => {
    setError(null);
    setTranscript('');
    latestRef.current = '';
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setListening(true);
      setTranscript('AI poslouchá a analyzuje váš hlas…');
      window.setTimeout(() => {
        const demo =
          'Přidej zednické práce za patnáct tisíc s dvanáctiprocentním DPH a materiál za deset tisíc s jednadvacítkou';
        finishWithText(demo);
        setListening(false);
      }, 2200);
      return;
    }

    recognition.lang = 'cs-CZ';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (ev) => {
      const parts: string[] = [];
      for (let i = 0; i < ev.results.length; i++) {
        parts.push(ev.results[i][0].transcript);
      }
      const text = parts.join(' ').trim();
      latestRef.current = text;
      setTranscript(text);
    };
    recognition.onerror = (ev) => {
      setError(`Mikrofon / rozpoznání: ${ev.error}`);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      if (latestRef.current.trim()) finishWithText(latestRef.current);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('Nepodařilo se spustit mikrofon. Zkuste Chrome nebo povolte oprávnění.');
      setListening(false);
    }
  };

  return (
    <div className="voice-capture">
      <button
        type="button"
        className={`btn btn--voice ${listening ? 'is-listening' : ''}`}
        onClick={() => (listening ? stop() : start())}
        aria-pressed={listening}
      >
        {listening ? (
          <>
            <span className="voice-pulse" aria-hidden />
            AI poslouchá…
          </>
        ) : (
          <>🎙️ Zadat zakázku hlasem</>
        )}
      </button>

      {listening && (
        <div className="voice-capture__status" role="status" aria-live="polite">
          <div className="voice-bars" aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>AI poslouchá a analyzuje váš hlas…</strong>
            <p>
              {supported
                ? 'Mluvte česky — např. „Přidej zednické práce za patnáct tisíc s dvanáctiprocentním DPH…“'
                : 'Web Speech API není v tomto prohlížeči — běží demo simulace.'}
            </p>
          </div>
        </div>
      )}

      {transcript && !listening && (
        <p className="voice-capture__transcript">
          Rozpoznáno: <em>„{transcript}"</em>
        </p>
      )}
      {error && <div className="alert alert--error">{error}</div>}
    </div>
  );
}
