import { getLegalDocument, legalDocumentPlainText, type LegalDocId } from '../data/legal';

/** Simulate PDF/DOCX download via a UTF-8 text file of the legal document. */
export function downloadLegalDocument(id: LegalDocId): void {
  const doc = getLegalDocument(id);
  const text = legalDocumentPlainText(doc);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.filename}.txt`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Open a print-friendly view of the legal text in a new tab. */
export function openLegalPrintView(id: LegalDocId): void {
  const doc = getLegalDocument(id);
  const text = legalDocumentPlainText(doc);
  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)} · DocuFlow</title>
  <style>
    body { font-family: "Source Serif 4", Georgia, serif; max-width: 720px; margin: 2rem auto; padding: 0 1.25rem; color: #0f172a; line-height: 1.55; }
    h1 { font-size: 1.45rem; color: #065f46; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.95rem; }
    .actions { margin: 1rem 0 1.5rem; }
    button { background: #059669; color: #fff; border: 0; padding: 0.55rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  <div class="actions"><button type="button" onclick="window.print()">Tisknout / Uložit jako PDF</button></div>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
