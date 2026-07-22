import type { DocumentRecord } from '../types/document';
import { formatCurrency, formatDateLong } from './format';

export function buildDocumentHtml(doc: DocumentRecord): string {
  const sigA = doc.signatureA
    ? `<img src="${doc.signatureA}" alt="Podpis A" style="max-width:220px;max-height:80px;" />`
    : '<div style="height:80px;border-bottom:1px solid #94a3b8;"></div>';
  const sigB = doc.signatureB
    ? `<img src="${doc.signatureB}" alt="Podpis B" style="max-width:220px;max-height:80px;" />`
    : '<div style="height:80px;border-bottom:1px solid #94a3b8;"></div>';

  return `
    <div class="print-document" style="
      font-family: 'Times New Roman', Georgia, serif;
      color: #0f172a;
      background: #fff;
      padding: 48px 56px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.55;
      border: 2px solid #0f172a;
      box-sizing: border-box;
    ">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;border-bottom:2px solid #10B981;padding-bottom:16px;">
        <div>
          <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #10B981; font-weight: 700;">DocuFlow</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Elektronický dokument · Lokální režim</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#64748b;">
          <div>Datum: ${formatDateLong(doc.createdAt)}</div>
          <div>ID: ${doc.id}</div>
        </div>
      </div>

      <h1 style="text-align:center;font-size:26px;margin:0 0 8px;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(doc.templateLabel)}</h1>
      <p style="text-align:center;margin:0 0 32px;color:#475569;font-size:14px;">${escapeHtml(doc.name)}</p>

      <h2 style="font-size:15px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin:24px 0 12px;">I. Smluvní strany</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:14px;">
        <div style="border:1px solid #e2e8f0;padding:14px;border-radius:4px;">
          <strong style="display:block;margin-bottom:8px;color:#0f172a;">Strana A</strong>
          <div><strong>Název / jméno:</strong> ${escapeHtml(doc.partyA.name)}</div>
          <div><strong>IČO:</strong> ${escapeHtml(doc.partyA.ico || doc.partyA.idNumber || '—')}</div>
          <div><strong>DIČ:</strong> ${escapeHtml(doc.partyA.dic || '—')}</div>
          <div><strong>Adresa sídla:</strong> ${escapeHtml(doc.partyA.address)}</div>
        </div>
        <div style="border:1px solid #e2e8f0;padding:14px;border-radius:4px;">
          <strong style="display:block;margin-bottom:8px;color:#0f172a;">Strana B (klient)</strong>
          <div><strong>Název / jméno:</strong> ${escapeHtml(doc.partyB.name)}</div>
          <div><strong>IČO:</strong> ${escapeHtml(doc.partyB.ico || doc.partyB.idNumber || '—')}</div>
          <div><strong>DIČ:</strong> ${escapeHtml(doc.partyB.dic || '—')}</div>
          <div><strong>Adresa sídla:</strong> ${escapeHtml(doc.partyB.address)}</div>
        </div>
      </div>

      <h2 style="font-size:15px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin:28px 0 12px;">II. Předmět</h2>
      <p style="font-size:14px;white-space:pre-wrap;margin:0 0 16px;">${escapeHtml(doc.itemDescription || '—')}</p>

      <h2 style="font-size:15px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin:28px 0 12px;">III. Cena</h2>
      <p style="font-size:18px;font-weight:700;margin:0 0 16px;">${formatCurrency(doc.price)}</p>

      <h2 style="font-size:15px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin:28px 0 12px;">IV. Ustanovení</h2>
      <p style="font-size:14px;white-space:pre-wrap;margin:0 0 32px;">${escapeHtml(doc.terms || '—')}</p>

      <h2 style="font-size:15px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin:28px 0 20px;">V. Podpisy</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:8px;">
        <div>
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Strana A — ${escapeHtml(doc.partyA.name)}</div>
          ${sigA}
          <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Podpis / razítko</div>
        </div>
        <div>
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Strana B — ${escapeHtml(doc.partyB.name)}</div>
          ${sigB}
          <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Podpis / razítko</div>
        </div>
      </div>

      <p style="margin-top:40px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px;">
        Dokument vygenerován v DocuFlow · Premium Active · Enterprise Local Storage
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function downloadPdf(doc: DocumentRecord): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;
  const container = document.createElement('div');
  container.innerHTML = buildDocumentHtml(doc);
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const filename = `${sanitizeFilename(doc.name || doc.templateLabel)}.pdf`;

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container.firstElementChild as HTMLElement)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

export function printDocument(doc: DocumentRecord): void {
  const html = buildDocumentHtml(doc);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000');
  if (!win) {
    alert('Prohlížeč zablokoval vyskakovací okno. Povolte pop-upy pro tisk.');
    return;
  }
  win.document.write(`<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"/><title>${escapeHtml(doc.name)}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { margin: 0; background: #fff; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head><body>${html}<script>window.onload=function(){setTimeout(function(){window.print();},250);}<\\/script></body></html>`);
  win.document.close();
}

export function openMailto(email: string, doc: DocumentRecord): void {
  const subject = encodeURIComponent(`DocuFlow: ${doc.name}`);
  const body = encodeURIComponent(
    `Dobrý den,\n\nv příloze / odkazu naleznete dokument „${doc.name}" (${doc.templateLabel}).\nKlient: ${doc.clientName}\nHodnota: ${formatCurrency(doc.price)}\nDatum: ${formatDateLong(doc.createdAt)}\n\nDokument byl připraven v DocuFlow (lokální Premium Active režim).\n\nS pozdravem`,
  );
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\u00C0-\u024F\s-]/gi, '').trim().replace(/\s+/g, '_') || 'dokument';
}
