import type {
  CompanyProfile,
  DocKind,
  Project,
  WorkflowDocument,
  WorkflowStage,
} from '../types/erp';
import { KIND_LABELS } from '../types/erp';
import { createId } from './storage';
import { nextDocumentNumber, variableSymbolFromNumber } from './numbering';
import { calculateTotals, remainingItems, scaleItems } from './vat';
import { newEmptyClient, newLineItem, upsertProject, upsertWorkflowDoc } from './erpStorage';

const DEFAULT_TERMS: Record<DocKind, string> = {
  quote:
    'Nabídka je platná 14 dní od vystavení. Ceny jsou uvedeny bez DPH, není-li uvedeno jinak. Realizace po odsouhlasení nabídky a zálohové faktury.',
  contract:
    'Zhotovitel se zavazuje zhotovit dílo řádně a včas. Objednatel dílo převezme a zaplatí sjednanou cenu. Záloha 40 % při podpisu, doplatek po předání. Záruka 24 měsíců.',
  advance_invoice:
    'Zálohová faktura dle smlouvy. Splatnost 14 dní. Po připsání platby bude zahájena realizace.',
  handover:
    'Zhotovitel předává a objednatel přebírá dílo bez zjevných vad a nedodělků. Případné skryté vady budou řešeny v rámci záruky.',
  final_invoice:
    'Doplatková faktura po předání díla. Odečtena uhrazená záloha. Splatnost 14 dní od vystavení.',
};

function stageForKind(kind: DocKind): WorkflowStage {
  switch (kind) {
    case 'quote':
      return 1;
    case 'contract':
      return 2;
    case 'advance_invoice':
      return 3;
    case 'handover':
      return 4;
    case 'final_invoice':
      return 5;
  }
}

export function createProjectWithQuote(
  supplier: CompanyProfile,
  partial?: { name?: string; clientName?: string },
): { project: Project; doc: WorkflowDocument } {
  const projectId = createId();
  const items = [
    { ...newLineItem(), name: 'Práce / služba dle dohody', qty: 1, unitPrice: 25000, vatRate: 21 as const },
  ];
  const totals = calculateTotals(items);
  const number = nextDocumentNumber('quote');
  const client = { ...newEmptyClient(), name: partial?.clientName || '' };

  const doc: WorkflowDocument = {
    id: createId(),
    projectId,
    kind: 'quote',
    number,
    title: `${KIND_LABELS.quote} ${number}`,
    createdAt: new Date().toISOString(),
    status: 'draft',
    client,
    supplier: { ...supplier },
    items,
    terms: DEFAULT_TERMS.quote,
    notes: '',
    advancePercent: 40,
    totals,
    variableSymbol: variableSymbolFromNumber(number),
  };

  const project: Project = {
    id: projectId,
    name: partial?.name || `Zakázka ${number}`,
    clientName: client.name || 'Nový klient',
    client,
    stage: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quoteId: doc.id,
    value: totals.total,
  };

  upsertWorkflowDoc(doc);
  upsertProject(project);
  return { project, doc };
}

function cloneAsKind(
  source: WorkflowDocument,
  kind: DocKind,
  mutate: (doc: WorkflowDocument) => void,
  project: Project,
): { project: Project; doc: WorkflowDocument } {
  const number = nextDocumentNumber(kind);
  const doc: WorkflowDocument = {
    ...structuredClone(source),
    id: createId(),
    kind,
    number,
    title: `${KIND_LABELS[kind]} ${number}`,
    createdAt: new Date().toISOString(),
    status: 'draft',
    terms: DEFAULT_TERMS[kind],
    signatureClient: undefined,
    signedAt: undefined,
    paidAt: undefined,
    variableSymbol: variableSymbolFromNumber(number),
  };
  mutate(doc);
  doc.totals = calculateTotals(doc.items);

  const nextProject: Project = {
    ...project,
    client: { ...doc.client },
    clientName: doc.client.name || project.clientName,
    stage: stageForKind(kind),
    updatedAt: new Date().toISOString(),
    value: Math.max(project.value, doc.totals.total),
  };

  if (kind === 'quote') nextProject.quoteId = doc.id;
  if (kind === 'contract') nextProject.contractId = doc.id;
  if (kind === 'advance_invoice') nextProject.advanceId = doc.id;
  if (kind === 'handover') nextProject.handoverId = doc.id;
  if (kind === 'final_invoice') nextProject.finalId = doc.id;

  upsertWorkflowDoc(doc);
  upsertProject(nextProject);
  return { project: nextProject, doc };
}

/** Quote -> Contract: transfer items, client, VAT config */
export function convertQuoteToContract(quote: WorkflowDocument, project: Project) {
  return cloneAsKind(quote, 'contract', () => undefined, project);
}

/** Contract -> Advance Invoice: deposit % (default 40) */
export function convertContractToAdvance(
  contract: WorkflowDocument,
  project: Project,
  percent = contract.advancePercent || 40,
) {
  return cloneAsKind(
    contract,
    'advance_invoice',
    (doc) => {
      doc.advancePercent = percent;
      doc.items = scaleItems(contract.items, percent);
      doc.notes = `Záloha ${percent} % z celkové hodnoty zakázky dle smlouvy ${contract.number}.`;
    },
    project,
  );
}

/** Work done -> Handover protocol without defects */
export function convertToHandover(contractOrAdvance: WorkflowDocument, project: Project) {
  const source =
    project.contractId && contractOrAdvance.kind !== 'contract'
      ? contractOrAdvance
      : contractOrAdvance;
  return cloneAsKind(
    source,
    'handover',
    (doc) => {
      doc.items = source.items.map((i) => ({ ...i, id: createId() }));
      doc.notes =
        'Dílo bylo předáno a převzato bez zjevných vad a nedodělků. Objednatel potvrzuje převzetí podpisem.';
      doc.terms = DEFAULT_TERMS.handover;
    },
    project,
  );
}

/** Signed protocol -> Final invoice for remaining balance */
export function convertHandoverToFinal(
  handover: WorkflowDocument,
  project: Project,
  contract: WorkflowDocument | undefined,
  advance: WorkflowDocument | undefined,
) {
  const base = contract || handover;
  const percent = advance?.advancePercent || base.advancePercent || 40;
  return cloneAsKind(
    base,
    'final_invoice',
    (doc) => {
      doc.advancePercent = percent;
      doc.items = remainingItems(base.items, percent);
      doc.relatedAdvanceNumber = advance?.number;
      doc.relatedAdvanceAmount = advance?.totals.total;
      doc.notes = advance
        ? `Doplatek po předání. Odečtena záloha ${advance.number} ve výši ${advance.totals.total.toLocaleString('cs-CZ')} Kč.`
        : `Doplatek ${100 - percent} % po předání díla.`;
    },
    project,
  );
}
