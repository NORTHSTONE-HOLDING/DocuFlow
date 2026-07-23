import type { AppSettings, DocumentRecord } from '../types/document';

const DOCS_KEY = 'paperflow_documents_v1';
const SETTINGS_KEY = 'paperflow_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'PaperFlow Enterprise',
  companyEmail: 'dokumenty@paperflow.cz',
  companyId: 'IČO 12345678',
  defaultCurrency: 'CZK',
  darkMode: true,
};

function normalizeParty(party: DocumentRecord['partyA'] | undefined): DocumentRecord['partyA'] {
  return {
    name: party?.name ?? '',
    idNumber: party?.idNumber ?? '',
    ico: party?.ico ?? party?.idNumber ?? '',
    dic: party?.dic ?? '',
    address: party?.address ?? '',
  };
}

export function loadDocuments(): DocumentRecord[] {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocumentRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((doc) => ({
      ...doc,
      partyA: normalizeParty(doc.partyA),
      partyB: normalizeParty(doc.partyB),
    }));
  } catch {
    return [];
  }
}

export function saveDocuments(docs: DocumentRecord[]): void {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function upsertDocument(doc: DocumentRecord): DocumentRecord[] {
  const docs = loadDocuments();
  const idx = docs.findIndex((d) => d.id === doc.id);
  if (idx >= 0) docs[idx] = doc;
  else docs.unshift(doc);
  saveDocuments(docs);
  return docs;
}

export function deleteDocument(id: string): DocumentRecord[] {
  const docs = loadDocuments().filter((d) => d.id !== id);
  saveDocuments(docs);
  return docs;
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as AppSettings) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function createId(): string {
  return `df_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
