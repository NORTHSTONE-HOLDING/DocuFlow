/**
 * Czech QR Platba (SPD 1.0) payload for Instant Payment QR.
 * Spec: https://qr-platba.cz/
 */
export function buildSpdPayload(opts: {
  accountNumber: string;
  bankCode: string;
  amount: number;
  variableSymbol: string;
  message: string;
  currency?: string;
}): string {
  const acc = normalizeIbanOrDomestic(opts.accountNumber, opts.bankCode);
  const am = opts.amount.toFixed(2);
  const vs = opts.variableSymbol.replace(/\D/g, '').slice(0, 10);
  const msg = opts.message.replace(/[*\n\r]/g, ' ').slice(0, 60);
  return `SPD*1.0*ACC:${acc}*AM:${am}*CC:${opts.currency || 'CZK'}*X-VS:${vs}*MSG:${msg}`;
}

function normalizeIbanOrDomestic(account: string, bankCode: string): string {
  const cleaned = account.replace(/\s+/g, '');
  if (/^CZ\d{22}$/i.test(cleaned)) return cleaned.toUpperCase();
  // Domestic → pseudo IBAN-friendly ACC as bankCode-account for mock display
  const digits = cleaned.replace(/\D/g, '') || '0000000000';
  const bank = (bankCode || '0800').replace(/\D/g, '').padStart(4, '0').slice(0, 4);
  return `${bank}-${digits}`;
}

/** Simple SVG QR-like decorative pattern encoding payload length (mock visual for localhost). */
export function mockQrSvg(payload: string, size = 180): string {
  const cells = 21;
  const cell = size / cells;
  let rects = '';
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = (h * 31 + payload.charCodeAt(i)) >>> 0;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
      const bit = ((h >> ((x * y + x + y) % 16)) ^ (x * 3 + y * 7 + payload.length)) & 1;
      if (finder || bit) {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#0f172a"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/>${rects}</svg>`;
}

export function buildWhatsAppShareUrl(phone: string, docNumber: string, signUrl: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('420') ? digits : `420${digits.replace(/^0+/, '')}`;
  const text = `Dobrý den, zasíláme Vám dokument ${docNumber} ke kontrole a digitálnímu podpisu. Odkaz zde: ${signUrl}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
