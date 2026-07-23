export type TemplateId =
  | 'kupni-smlouva'
  | 'smlouva-o-dilo'
  | 'plna-moc'
  | 'generalni-plna-moc'
  | 'faktura'
  | 'predavaci-protokol'
  | 'oficialni-dopis'
  | 'predzalobni-vyzva'
  | 'trestni-oznameni'
  | 'uznani-dluhu';

export interface PartyInfo {
  name: string;
  idNumber: string;
  ico: string;
  dic: string;
  address: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  clientName: string;
  templateId: TemplateId;
  templateLabel: string;
  createdAt: string;
  price: number;
  currency: 'CZK';
  partyA: PartyInfo;
  partyB: PartyInfo;
  terms: string;
  itemDescription: string;
  signatureA?: string;
  signatureB?: string;
}

export interface WizardState {
  step: number;
  templateId: TemplateId | null;
  partyA: PartyInfo;
  partyB: PartyInfo;
  terms: string;
  itemDescription: string;
  price: number;
  signatureA: string | null;
  signatureB: string | null;
  documentName: string;
}

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyId: string;
  defaultCurrency: 'CZK';
  darkMode: boolean;
}

export type PlanId = 'free' | 'premium' | 'business' | 'enterprise';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthConsents {
  gdprAcceptedAt?: string;
  marketingAccepted: boolean;
  marketingAcceptedAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  planId: PlanId;
  documentsCreated: number;
  stripeMockCustomerId?: string;
  upgradedAt?: string;
  consents?: AuthConsents;
}
