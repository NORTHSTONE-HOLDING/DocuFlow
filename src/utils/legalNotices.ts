import type { Project, WorkflowDocument } from '../types/erp';
import { formatCurrency } from './format';
import { getTemplate } from '../data/templates';

const KEY = 'paperflow_legal_notices_v1';

export type InkasoTemplateId = 'predzalobni-vyzva' | 'trestni-oznameni' | 'uznani-dluhu';

export interface LegalNotice {
  id: string;
  templateId: InkasoTemplateId;
  title: string;
  body: string;
  createdAt: string;
  projectId?: string;
  invoiceId?: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  supplierName: string;
}

export function loadLegalNotices(): LegalNotice[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegalNotice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLegalNotices(notices: LegalNotice[]): void {
  localStorage.setItem(KEY, JSON.stringify(notices));
}

export function getLegalNotice(id: string): LegalNotice | undefined {
  return loadLegalNotices().find((n) => n.id === id) ?? (id === 'mock-id' ? buildMockPredzalobni() : undefined);
}

export function upsertLegalNotice(notice: LegalNotice): void {
  const all = loadLegalNotices();
  const idx = all.findIndex((n) => n.id === notice.id);
  if (idx >= 0) all[idx] = notice;
  else all.unshift(notice);
  saveLegalNotices(all);
}

function addDaysIso(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isInvoiceOverdue(invoice: WorkflowDocument): boolean {
  if (invoice.status === 'paid') return false;
  if (invoice.status === 'overdue') return true;
  if (!invoice.dueDate) return false;
  return new Date(invoice.dueDate).getTime() < Date.now();
}

export function defaultDueDate(fromIso = new Date().toISOString(), days = 14): string {
  return addDaysIso(fromIso, days);
}

/** Build / refresh the canonical mock-id předžalobní notice for WhatsApp legal mode. */
export function ensurePredzalobniNotice(
  project: Project,
  invoice: WorkflowDocument,
  id = 'mock-id',
): LegalNotice {
  const template = getTemplate('predzalobni-vyzva');
  const amount = invoice.totals.total;
  const client = invoice.client.name || project.clientName || 'Dlužník';
  const supplier = invoice.supplier.companyName || 'Věřitel';
  const dueHint = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('cs-CZ')
    : 'dle faktury';

  const body = `${template.defaultTerms}

———
Identifikace pohledávky
Věřitel: ${supplier}
IČO věřitele: ${invoice.supplier.ico || '—'}
Dlužník: ${client}
IČO dlužníka: ${invoice.client.ico || '—'}
Číslo faktury: ${invoice.number}
Variabilní symbol: ${invoice.variableSymbol}
Dlužná částka: ${formatCurrency(amount)}
Splatnost: ${dueHint}
Zakázka: ${project.name}

Lhůta k úhradě: 7 dnů ode dne doručení této výzvy.
Platební údaje: ${invoice.supplier.accountNumber || '—'}/${invoice.supplier.bankCode || '—'}
`;

  const notice: LegalNotice = {
    id,
    templateId: 'predzalobni-vyzva',
    title: template.defaultName,
    body,
    createdAt: new Date().toISOString(),
    projectId: project.id,
    invoiceId: invoice.id,
    clientName: client,
    invoiceNumber: invoice.number,
    amount,
    supplierName: supplier,
  };
  upsertLegalNotice(notice);
  return notice;
}

function buildMockPredzalobni(): LegalNotice {
  const template = getTemplate('predzalobni-vyzva');
  return {
    id: 'mock-id',
    templateId: 'predzalobni-vyzva',
    title: template.defaultName,
    body: `${template.defaultTerms}

———
Ukázkový dokument PaperFlow (mock-id)
Dlužná částka: 25 000 Kč
Číslo faktury: F2026001
Variabilní symbol: 2026001
`,
    createdAt: new Date().toISOString(),
    clientName: 'Ukázkový dlužník',
    invoiceNumber: 'F2026001',
    amount: 25000,
    supplierName: 'PaperFlow Systems s.r.o.',
  };
}

export function buildFormalDebtWhatsAppText(opts: {
  clientHonorific?: string;
  legalUrl: string;
  invoiceNumber: string;
  amount: number;
}): string {
  return `Vážený pane/paní, z důvodu neuhrazení faktury ${opts.invoiceNumber} (${formatCurrency(opts.amount)}) Vám zasíláme oficiální Předžalobní výzvu. Odkaz na dokument: ${opts.legalUrl}`;
}

export function buildSoftDebtReminderText(invoice: WorkflowDocument, payLink: string): string {
  return `Dobrý den, v příloze zakázky ${invoice.number} evidujeme neuhrazenou fakturu na částku ${Math.round(invoice.totals.total)} Kč. Pro hladký průběh prací a odeslání materiálů klikněte na odkaz pro okamžitou platbu přes Apple Pay/QR kód: ${payLink}`;
}
