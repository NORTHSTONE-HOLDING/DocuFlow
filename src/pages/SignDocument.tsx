import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkflowDoc, upsertWorkflowDoc } from '../utils/erpStorage';
import { formatCurrency } from '../utils/format';
import { KIND_LABELS } from '../types/erp';
import type { WorkflowDocument } from '../types/erp';
import { buildSpdPayload, mockQrSvg } from '../utils/payments';

type Phase = 'sign' | 'pay' | 'done';

export function SignDocument() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<WorkflowDocument | null>(null);
  const [phase, setPhase] = useState<Phase>('sign');
  const [paying, setPaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getWorkflowDoc(id);
    setDoc(found || null);
    if (found?.status === 'paid') setPhase('done');
    else if (found?.signatureClient) setPhase('pay');
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'sign') return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
  }, [phase, doc]);

  if (!doc) {
    return (
      <div className="sign-page">
        <div className="sign-card">
          <h1>Dokument nenalezen</h1>
          <p>Odkaz pro podpis je neplatný nebo dokument byl smazán.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
            Zpět do DocuFlow
          </button>
        </div>
      </div>
    );
  }

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (!ctx) return;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasStroke(false);
  };

  const confirmSign = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    const signature = canvas.toDataURL('image/png');
    const next: WorkflowDocument = {
      ...doc,
      signatureClient: signature,
      signedAt: new Date().toISOString(),
      status: 'signed',
    };
    upsertWorkflowDoc(next);
    setDoc(next);
    setPhase('pay');
  };

  const pay = async (method: string) => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 900));
    const next: WorkflowDocument = {
      ...doc,
      status: 'paid',
      paidAt: new Date().toISOString(),
      notes: `${doc.notes}\n\nÚhrada: ${method}`.trim(),
    };
    upsertWorkflowDoc(next);
    setDoc(next);
    setPaying(false);
    setPhase('done');
  };

  const spd = buildSpdPayload({
    accountNumber: doc.supplier.accountNumber || '123456789',
    bankCode: doc.supplier.bankCode || '0800',
    amount: doc.totals.total,
    variableSymbol: doc.variableSymbol,
    message: `${doc.number} ${doc.client.name}`.slice(0, 60),
  });
  const qr = mockQrSvg(spd, 200);

  return (
    <div className="sign-page">
      <div className="sign-card">
        <div className="sign-brand">DocuFlow · Digitální podpis</div>
        <h1>
          {KIND_LABELS[doc.kind]} {doc.number}
        </h1>
        <p className="sign-meta">
          {doc.supplier.companyName || 'Dodavatel'} → {doc.client.name || 'Klient'} ·{' '}
          {formatCurrency(doc.totals.total)}
        </p>

        {phase === 'sign' && (
          <>
            <div className="sign-preview">
              <p>
                <strong>Předmět:</strong> {doc.items.map((i) => i.name).filter(Boolean).join(', ') || '—'}
              </p>
              <p className="sign-terms">{doc.terms}</p>
            </div>
            <h2>Váš podpis</h2>
            <canvas
              ref={canvasRef}
              className="sign-canvas"
              onPointerDown={(e) => {
                drawing.current = true;
                canvasRef.current?.setPointerCapture(e.pointerId);
                const ctx = canvasRef.current?.getContext('2d');
                const p = pos(e);
                ctx?.beginPath();
                ctx?.moveTo(p.x, p.y);
              }}
              onPointerMove={(e) => {
                if (!drawing.current) return;
                const ctx = canvasRef.current?.getContext('2d');
                const p = pos(e);
                ctx?.lineTo(p.x, p.y);
                ctx?.stroke();
                setHasStroke(true);
              }}
              onPointerUp={() => {
                drawing.current = false;
              }}
            />
            <div className="sign-actions">
              <button type="button" className="btn btn--ghost" onClick={clear}>
                Vymazat
              </button>
              <button type="button" className="btn btn--primary" disabled={!hasStroke} onClick={confirmSign}>
                Potvrdit a aplikovat podpis
              </button>
            </div>
          </>
        )}

        {phase === 'pay' && (
          <div className="pay-screen fade-in">
            <div className="pay-screen__hero">
              <span>✍️</span>
              <h2>Dokument byl úspěšně podepsán.</h2>
              <p>Pro dokončení zbývá uhradit fakturu.</p>
            </div>

            <div className="pay-grid">
              <div className="pay-qr">
                <div
                  className="pay-qr__img"
                  dangerouslySetInnerHTML={{ __html: qr }}
                  aria-label="QR Platba"
                />
                <strong>QR Platba</strong>
                <p>
                  Částka: {formatCurrency(doc.totals.total)}
                  <br />
                  VS: {doc.variableSymbol}
                  <br />
                  Účet: {doc.supplier.accountNumber || '—'}/{doc.supplier.bankCode || '—'}
                </p>
              </div>
              <div className="pay-methods">
                <button type="button" className="pay-method pay-method--apple" disabled={paying} onClick={() => void pay('Apple Pay')}>
                  Apple Pay
                </button>
                <button type="button" className="pay-method pay-method--google" disabled={paying} onClick={() => void pay('Google Pay')}>
                  Google Pay
                </button>
                <button type="button" className="btn btn--primary btn--lg" disabled={paying} onClick={() => void pay('Stripe karta')}>
                  {paying ? 'Zpracovávám…' : 'Zaplatit kartou přes Stripe'}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="pay-done fade-in">
            <h2>Hotovo — děkujeme</h2>
            <p>
              Dokument {doc.number} je podepsán a označen jako uhrazený
              {doc.paidAt ? ` (${new Date(doc.paidAt).toLocaleString('cs-CZ')})` : ''}.
            </p>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
              Otevřít DocuFlow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
