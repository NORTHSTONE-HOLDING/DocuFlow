import type { ClientParty, LineItem } from '../types/erp';
import { hasOpenAiKey } from './ai';
import { createId } from './storage';
import { parseCzechVoiceToItems } from './voiceParse';

export interface VisionScanResult {
  client: Partial<ClientParty>;
  items: LineItem[];
  notes: string;
  source: 'openai' | 'simulation';
  rawText?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Soubor se nepodařilo načíst.'));
    reader.readAsDataURL(file);
  });
}

function mockVisionFromFilename(file: File): VisionScanResult {
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  return {
    source: 'simulation',
    notes: `Simulace Vision API pro soubor „${file.name}". Doplňte VITE_OPENAI_API_KEY pro ostré OCR (gpt-4o).`,
    client: {
      name: /firma|sro|a\.s/i.test(base) ? base : 'Klient ze skici',
      address: 'Staveniště / adresa z fotky (mock)',
    },
    items: [
      {
        id: createId(),
        name: 'Zednické práce dle skici',
        qty: 1,
        unitPrice: 15000,
        vatRate: 12,
      },
      {
        id: createId(),
        name: 'Materiál a doprava',
        qty: 1,
        unitPrice: 10000,
        vatRate: 21,
      },
      {
        id: createId(),
        name: base || 'Další položka z rozpočtu',
        qty: 1,
        unitPrice: 3500,
        vatRate: 21,
      },
    ],
  };
}

async function callOpenAiVision(dataUrl: string): Promise<VisionScanResult> {
  const apiKey = String(import.meta.env.VITE_OPENAI_API_KEY).trim();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Jsi OCR asistent pro české stavební rozpočty a skici. Z obrázku vytáhni klienta a položky. Vrať JSON: {"clientName":"","clientAddress":"","clientIco":"","items":[{"name":"","qty":1,"unitPrice":0,"vatRate":21|12|0}],"notes":""}. Částky v CZK, DPH 21/12/0. Odpovídej jen JSON.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Přečti rozpočet / skicu / ručně psaný list a vytěž položky + klienta.',
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Vision API chyba (${res.status})`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Vision API nevrátila data.');

  const parsed = JSON.parse(content) as {
    clientName?: string;
    clientAddress?: string;
    clientIco?: string;
    items?: Array<{ name?: string; qty?: number; unitPrice?: number; vatRate?: number }>;
    notes?: string;
  };

  const items: LineItem[] = (parsed.items || []).map((i) => ({
    id: createId(),
    name: i.name || 'Položka z fotky',
    qty: Number(i.qty) || 1,
    unitPrice: Number(i.unitPrice) || 0,
    vatRate: ([21, 12, 0].includes(Number(i.vatRate)) ? Number(i.vatRate) : 21) as 21 | 12 | 0,
  }));

  if (!items.length) {
    items.push(...parseCzechVoiceToItems(parsed.notes || 'rozpočet ze skici za deset tisíc s jednadvacítkou'));
  }

  return {
    source: 'openai',
    notes: parsed.notes || 'Načteno přes OpenAI Vision (gpt-4o).',
    rawText: content,
    client: {
      name: parsed.clientName || '',
      address: parsed.clientAddress || '',
      ico: parsed.clientIco || '',
    },
    items,
  };
}

/**
 * Scan JPG/PNG budget/sketch via OpenAI Vision (gpt-4o) or 2s mock fallback.
 */
export async function scanBudgetImage(file: File): Promise<VisionScanResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Nahrajte prosím obrázek JPG nebo PNG.');
  }

  if (!hasOpenAiKey()) {
    await new Promise((r) => setTimeout(r, 2000));
    return mockVisionFromFilename(file);
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    return await callOpenAiVision(dataUrl);
  } catch {
    await new Promise((r) => setTimeout(r, 2000));
    const mock = mockVisionFromFilename(file);
    return {
      ...mock,
      notes: `${mock.notes} (OpenAI Vision nedostupné — záložní simulace.)`,
    };
  }
}
