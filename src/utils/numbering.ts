import type { DocKind, NumberingState } from '../types/erp';

const KEY = 'paperflow_numbering_v1';
export const NUMBERING_YEAR = 2026;

const DEFAULT: NumberingState = {
  year: NUMBERING_YEAR,
  cn: 0,
  sod: 0,
  f: 0,
  pp: 0,
};

export function loadNumbering(): NumberingState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as NumberingState;
    if (parsed.year !== NUMBERING_YEAR) return { ...DEFAULT };
    return { ...DEFAULT, ...parsed, year: NUMBERING_YEAR };
  } catch {
    return { ...DEFAULT };
  }
}

function saveNumbering(state: NumberingState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

/** Allocate next sequential number for document kind (year locked to 2026). */
export function nextDocumentNumber(kind: DocKind): string {
  const state = loadNumbering();
  switch (kind) {
    case 'quote': {
      state.cn += 1;
      saveNumbering(state);
      return `CN${NUMBERING_YEAR}${pad(state.cn)}`;
    }
    case 'contract': {
      state.sod += 1;
      saveNumbering(state);
      return `SOD${NUMBERING_YEAR}${pad(state.sod)}`;
    }
    case 'advance_invoice':
    case 'final_invoice': {
      state.f += 1;
      saveNumbering(state);
      return `F${NUMBERING_YEAR}${pad(state.f)}`;
    }
    case 'handover': {
      state.pp += 1;
      saveNumbering(state);
      return `PP${NUMBERING_YEAR}${pad(state.pp)}`;
    }
  }
}

export function variableSymbolFromNumber(docNumber: string): string {
  const digits = docNumber.replace(/\D/g, '');
  return digits.slice(-10) || '2026001';
}
