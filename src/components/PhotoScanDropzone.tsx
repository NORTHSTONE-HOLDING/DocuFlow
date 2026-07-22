import { useRef, useState } from 'react';
import type { ClientParty, LineItem } from '../types/erp';
import { scanBudgetImage } from '../utils/visionScan';
import { hasOpenAiKey } from '../utils/ai';

interface PhotoScanDropzoneProps {
  onResult: (payload: { items: LineItem[]; client: Partial<ClientParty>; notes: string }) => void;
}

export function PhotoScanDropzone({ onResult }: PhotoScanDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const live = hasOpenAiKey();

  const process = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const result = await scanBudgetImage(file);
      onResult({
        items: result.items,
        client: result.client,
        notes: result.notes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skenování selhalo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="photo-scan">
      <button
        type="button"
        className={`photo-scan__zone ${dragging ? 'is-dragging' : ''} ${loading ? 'is-loading' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void process(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          hidden
          onChange={(e) => void process(e.target.files?.[0] ?? null)}
        />
        {loading ? (
          <div className="photo-scan__loading">
            <span className="ai-spinner" aria-hidden />
            <div>
              <strong>AI čte text z obrázku…</strong>
              <p>{live ? 'OpenAI Vision (gpt-4o)' : 'Simulace 2 s — doplňte VITE_OPENAI_API_KEY pro ostré OCR'}</p>
            </div>
          </div>
        ) : (
          <>
            <span className="photo-scan__icon">📸</span>
            <strong>Načíst z fotky / skici</strong>
            <p>JPG/PNG ručně psaný rozpočet, skica nebo list ze stavby — přetáhněte sem nebo klikněte.</p>
            {fileName && <em>Poslední soubor: {fileName}</em>}
          </>
        )}
      </button>
      {error && <div className="alert alert--error">{error}</div>}
    </div>
  );
}
