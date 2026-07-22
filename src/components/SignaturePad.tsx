import { useCallback, useEffect, useRef, useState } from 'react';

interface SignaturePadProps {
  label: string;
  partyName?: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = () => setMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return mobile;
}

function drawSetup(canvas: HTMLCanvasElement, dpr: number) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // light paper background for signatures
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, rect.width, rect.height);
  return ctx;
}

function useSignatureCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  value: string | null,
  onChange: (dataUrl: string | null) => void,
  enabled: boolean,
) {
  const drawing = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const paintValue = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = drawSetup(canvas, dpr);
    ctxRef.current = ctx;
    if (!ctx || !value) return;
    const img = new Image();
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = value;
  }, [canvasRef, enabled, value]);

  useEffect(() => {
    if (!enabled) return;
    paintValue();
    const onResize = () => paintValue();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled, paintValue]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ctxRef.current) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(p.x, p.y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !ctxRef.current) return;
    e.preventDefault();
    const p = pos(e);
    ctxRef.current.lineTo(p.x, p.y);
    ctxRef.current.stroke();
  };

  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    paintValueEmpty();
    onChange(null);
  };

  const paintValueEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctxRef.current = drawSetup(canvas, dpr);
  };

  return { onPointerDown, onPointerMove, endStroke, clear, paintValue };
}

export function SignaturePad({ label, partyName, value, onChange }: SignaturePadProps) {
  const isMobile = useIsMobile();
  const inlineRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLCanvasElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const inline = useSignatureCanvas(inlineRef, value, onChange, !isMobile || !modalOpen);
  const modal = useSignatureCanvas(modalRef, value, onChange, modalOpen);

  useEffect(() => {
    if (modalOpen) {
      // slight delay for layout
      const t = setTimeout(() => modal.paintValue(), 50);
      return () => clearTimeout(t);
    }
  }, [modalOpen, modal]);

  const openModal = () => {
    if (isMobile) setModalOpen(true);
  };

  return (
    <div className="sig-pad">
      <div className="sig-pad__head">
        <div>
          <h4>{label}</h4>
          {partyName && <p>{partyName}</p>}
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => (modalOpen ? modal.clear() : inline.clear())}>
          Vymazat
        </button>
      </div>

      {isMobile ? (
        <button type="button" className="sig-pad__preview" onClick={openModal}>
          {value ? (
            <img src={value} alt={`Podpis ${label}`} />
          ) : (
            <span>Klepněte pro podpis prstem</span>
          )}
        </button>
      ) : (
        <canvas
          ref={inlineRef}
          className="sig-pad__canvas"
          onPointerDown={inline.onPointerDown}
          onPointerMove={inline.onPointerMove}
          onPointerUp={inline.endStroke}
          onPointerLeave={inline.endStroke}
        />
      )}

      {modalOpen && (
        <div className="sig-modal" role="dialog" aria-modal="true" aria-label={`Podpis — ${label}`}>
          <div className="sig-modal__bar">
            <strong>{label}</strong>
            <div className="sig-modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={modal.clear}>
                Reset
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setModalOpen(false)}>
                Hotovo
              </button>
            </div>
          </div>
          <canvas
            ref={modalRef}
            className="sig-modal__canvas"
            onPointerDown={modal.onPointerDown}
            onPointerMove={modal.onPointerMove}
            onPointerUp={modal.endStroke}
            onPointerLeave={modal.endStroke}
          />
          <p className="sig-modal__hint">Podepište prstem — plynulé anti-aliasované kreslení</p>
        </div>
      )}
    </div>
  );
}
