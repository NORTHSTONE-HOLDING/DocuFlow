import type { PlanId } from './document';

export type VatRate = 21 | 12 | 0;

export type DocKind =
  | 'quote'
  | 'contract'
  | 'advance_invoice'
  | 'handover'
  | 'final_invoice';

export type WorkflowStage = 1 | 2 | 3 | 4 | 5;

export type DocStatus = 'draft' | 'sent' | 'signed' | 'paid';

export interface CompanyProfile {
  companyName: string;
  ico: string;
  dic: string;
  address: string;
  accountNumber: string;
  bankCode: string;
  email: string;
  phone: string;
}

export interface ClientParty {
  name: string;
  ico: string;
  dic: string;
  address: string;
  phone: string;
  email: string;
}

export interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  vatRate: VatRate;
}

export interface VatBucket {
  rate: VatRate;
  base: number;
  vat: number;
}

export interface MoneyTotals {
  subtotal: number;
  vatByRate: VatBucket[];
  vatTotal: number;
  total: number;
}

export interface WorkflowDocument {
  id: string;
  projectId: string;
  kind: DocKind;
  number: string;
  title: string;
  createdAt: string;
  status: DocStatus;
  client: ClientParty;
  supplier: CompanyProfile;
  items: LineItem[];
  terms: string;
  notes: string;
  advancePercent: number;
  relatedAdvanceNumber?: string;
  relatedAdvanceAmount?: number;
  totals: MoneyTotals;
  signatureClient?: string;
  signedAt?: string;
  paidAt?: string;
  variableSymbol: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  client: ClientParty;
  stage: WorkflowStage;
  createdAt: string;
  updatedAt: string;
  quoteId?: string;
  contractId?: string;
  advanceId?: string;
  handoverId?: string;
  finalId?: string;
  value: number;
}

export interface NumberingState {
  year: number;
  cn: number;
  sod: number;
  f: number;
  pp: number;
}

export const STAGE_LABELS: Record<WorkflowStage, string> = {
  1: 'Nabídka',
  2: 'Smlouva',
  3: 'Zálohová faktura',
  4: 'Předávací protokol',
  5: 'Doplatková faktura',
};

export const KIND_LABELS: Record<DocKind, string> = {
  quote: 'Cenová nabídka',
  contract: 'Smlouva o dílo',
  advance_invoice: 'Zálohová faktura',
  handover: 'Předávací protokol',
  final_invoice: 'Doplatková faktura',
};

export const VAT_OPTIONS: { value: VatRate; label: string }[] = [
  { value: 21, label: '21% (Základní)' },
  { value: 12, label: '12% (Snížená)' },
  { value: 0, label: '0% / Přenesená daňová povinnost' },
];

export type { PlanId };
