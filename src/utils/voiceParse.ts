import type { LineItem, VatRate } from '../types/erp';
import { createId } from './storage';

const CZECH_NUMBERS: Record<string, number> = {
  nula: 0,
  jeden: 1,
  jedna: 1,
  jedno: 1,
  dva: 2,
  dvě: 2,
  tri: 3,
  tři: 3,
  ctyri: 4,
  čtyři: 4,
  pet: 5,
  pět: 5,
  sest: 6,
  šest: 6,
  sedm: 7,
  osm: 8,
  devet: 9,
  devět: 9,
  deset: 10,
  jedenact: 11,
  jedenáct: 11,
  dvanact: 12,
  dvanáct: 12,
  trinact: 13,
  třináct: 13,
  ctrnact: 14,
  čtrnáct: 14,
  patnact: 15,
  patnáct: 15,
  sestnact: 16,
  šestnáct: 16,
  sedmnact: 17,
  sedmnáct: 17,
  osmnact: 18,
  osmnáct: 18,
  devatenact: 19,
  devatenáct: 19,
  dvacet: 20,
  tricet: 30,
  třicet: 30,
  ctyricet: 40,
  čtyřicet: 40,
  padesat: 50,
  padesát: 50,
  sedesat: 60,
  šedesát: 60,
  sedmdesat: 70,
  sedmdesát: 70,
  osmdesat: 80,
  osmdesát: 80,
  devadesat: 90,
  devadesát: 90,
  sto: 100,
  dve: 2,
  sta: 100,
  set: 100,
  tisic: 1000,
  tisíc: 1000,
  tisice: 1000,
  tisíce: 1000,
};

function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse Czech spoken/written amounts like "patnáct tisíc", "10 000", "dvanáctiprocentním". */
export function parseCzechAmount(phrase: string): number | null {
  const cleaned = phrase.toLowerCase().replace(/\s+/g, ' ').trim();
  const digits = cleaned.replace(/[^\d]/g, '');
  if (digits && /^\d+$/.test(digits) && digits.length >= 2) {
    return Number(digits);
  }

  // "patnáct tisíc" / "deset tisíc"
  const parts = cleaned.split(/[\s-]+/).filter(Boolean);
  let total = 0;
  let current = 0;
  for (const part of parts) {
    const key = part
      .replace(/iprocent.*/, '')
      .replace(/procent.*/, '')
      .replace(/ti$/, '')
      .replace(/ků$/, '')
      .replace(/ku$/, '');
    if (CZECH_NUMBERS[part] != null) {
      const n = CZECH_NUMBERS[part];
      if (n === 1000) {
        current = (current || 1) * 1000;
        total += current;
        current = 0;
      } else if (n === 100) {
        current = (current || 1) * 100;
      } else {
        current += n;
      }
    } else if (CZECH_NUMBERS[key] != null) {
      current += CZECH_NUMBERS[key];
    }
  }
  total += current;
  return total > 0 ? total : null;
}

export function detectVatRate(segment: string): VatRate {
  const s = segment.toLowerCase();
  if (
    s.includes('12') ||
    s.includes('dvanáct') ||
    s.includes('dvanact') ||
    s.includes('snížen') ||
    s.includes('snizen')
  ) {
    return 12;
  }
  if (
    s.includes('0 %') ||
    s.includes('nula') ||
    s.includes('přenesen') ||
    s.includes('prenesen')
  ) {
    return 0;
  }
  if (
    s.includes('21') ||
    s.includes('jednadvac') ||
    s.includes('jednadvacet') ||
    s.includes('základ') ||
    s.includes('zaklad')
  ) {
    return 21;
  }
  return 21;
}

/**
 * Parse natural Czech speech into line items.
 * Example: "Přidej zednické práce za patnáct tisíc s dvanáctiprocentním DPH a materiál za deset tisíc s jednadvacítkou"
 */
export function parseCzechVoiceToItems(transcript: string): LineItem[] {
  const text = normalizeSpeech(transcript);
  if (!text) return [];

  // Split on " a " / " plus " / ";" when followed by another item-ish chunk
  const chunks = text
    .replace(/^přidej\s+|^pridej\s+|^dej\s+|^vlož\s+|^vloz\s+/i, '')
    .split(/\s+a\s+|\s+plus\s+|;\s*|\.\s+(?=[a-záčďéěíňóřšťúůýž])/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 3);

  const items: LineItem[] = [];

  for (const chunk of chunks) {
    const vat = detectVatRate(chunk);
    // "X za Y" or "X za Y Kč"
    const zaMatch = chunk.match(/^(.+?)\s+za\s+(.+?)(?:\s+(?:s|se|se\s+sazbou|dph|d\.?\s*p\.?\s*h\.?).*)?$/i);
    let name = chunk;
    let amount: number | null = null;

    if (zaMatch) {
      name = zaMatch[1]
        .replace(/^(položku|polozku|řádek|radek)\s+/i, '')
        .trim();
      amount = parseCzechAmount(zaMatch[2]);
    } else {
      // trailing number
      const numMatch = chunk.match(/(\d[\d\s]*|\w+(?:\s+\w+){0,3}\s+tisíc\w*)/i);
      if (numMatch) {
        amount = parseCzechAmount(numMatch[1]);
        name = chunk.replace(numMatch[0], '').replace(/\s+(s|se)\s+.*/i, '').trim();
      }
    }

    // Clean name from VAT phrases
    name = name
      .replace(/\s+(s|se)\s+.*/i, '')
      .replace(/\s+dph.*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name) name = 'Položka z hlasu';
    if (amount == null || amount <= 0) amount = 1000;

    items.push({
      id: createId(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      qty: 1,
      unitPrice: amount,
      vatRate: vat,
    });
  }

  // Fallback single item if parsing failed
  if (!items.length) {
    items.push({
      id: createId(),
      name: 'Zakázka dle hlasového zadání',
      qty: 1,
      unitPrice: parseCzechAmount(text) || 15000,
      vatRate: detectVatRate(text),
    });
  }

  return items;
}

export type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function getSpeechRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}
