import { hasOpenAiKey } from './ai';

export interface AuditSection {
  items: string[];
}

export interface LegalAuditResult {
  risks: string[];
  warnings: string[];
  summary: string;
  source: 'openai' | 'simulation';
  scannedAt: string;
}

const AUDIT_SYSTEM_PROMPT =
  'Jseš elitní český korporátní právník. Zanalyzuj text této smlouvy a vytvoř kritický audit. Najdi skryté právní pasti, nevýhodné smluvní pokuty, neférové výpovědní lhůty nebo vágní formulace. Tvůj výstup musí být rozdělen na 3 sekce v češtině: 🔴 VELKÁ RIZIKA (Vážné právní pasti a pokuty), 🟡 UPOZORNĚNÍ (Na co si dát pozor), 🟢 SHRNUTÍ LIDSKOU ŘEČÍ (Stručně co z této smlouvy pro uživatele vyplývá).';

function buildMockAudit(contractText: string): LegalAuditResult {
  const text = contractText.toLowerCase();
  const risks: string[] = [];
  const warnings: string[] = [];

  if (text.includes('pokut') || text.includes('sankc') || text.includes('0,5 %') || text.includes('0.5 %')) {
    risks.push(
      'Smluvní pokuta vypadá nepřiměřeně agresivní — u denní sazby nad ~0,1 % z ceny plnění hrozí spor o snížení dle § 2051 OZ.',
    );
  }
  if (text.includes('výpověd') || text.includes('vypoved') || text.includes('okamžit')) {
    risks.push(
      'Výpovědní podmínky mohou být jednostranně nevýhodné (krátká / okamžitá výpověď bez odpovídající ochrany druhé strany).',
    );
  }
  if (text.includes('bez náhrady') || text.includes('vzdává se') || text.includes('vylučuje odpovědnost')) {
    risks.push(
      'Klauzule o vyloučení odpovědnosti / vzdání se nároků může být v B2C neplatná a v B2B přinejmenším riziková při úmyslu či hrubé nedbalosti.',
    );
  }
  if (text.includes('mlčenliv') || text.includes('konkuren')) {
    warnings.push('Ustanovení o mlčenlivosti / konkurenční doložce — zkontrolujte dobu trvání, územní rozsah a sankce.');
  }
  if (text.includes('automaticky') || text.includes('prolong')) {
    warnings.push('Automatická prolongace smlouvy — ověřte, jak a dokdy lze smlouvu vypovědět před prodloužením.');
  }
  if (text.includes('vágní') || text.includes('přiměřen') || text.includes('dle uvážení')) {
    warnings.push('Objevují se vágní formulace („dle uvážení“, „přiměřeně“) — doporučujeme konkretizovat měřitelná kritéria.');
  }
  if (!risks.length) {
    risks.push(
      'Nalezena potenciální asymetrie práv: jedna strana má širší právo odstoupit / sankcionovat bez zrcadlového protiplnění.',
    );
    risks.push(
      'Chybí jasný strop smluvních pokut — při kumulaci denních sankcí může celkový nárok převýšit cenu plnění.',
    );
  }
  if (!warnings.length) {
    warnings.push('Definice předmětu plnění není dostatečně konkrétní — spor o rozsah „díla“ je častý.');
    warnings.push('Doporučujeme doplnit rozhodné právo a příslušnost soudu (např. soudy ČR / konkrétní okres).');
    warnings.push('Zkontrolujte, zda jsou přílohy (cenová nabídka, SLA) výslovně začleněny do smlouvy.');
  }

  const preview = contractText.trim().slice(0, 80).replace(/\s+/g, ' ');
  return {
    source: 'simulation',
    scannedAt: new Date().toISOString(),
    risks,
    warnings,
    summary: `Smlouva („${preview}${contractText.trim().length > 80 ? '…' : ''}“) vypadá na první pohled standardně, ale obsahuje místa, kde můžete tratit peníze nebo čas — zejména u sankcí, výpovědi a odpovědnosti. Než podepíšete, vyjednejte strop pokut, symetrické výpovědní lhůty a jasný popis plnění. Toto je testovací audit (bez OpenAI klíče); po doplnění VITE_OPENAI_API_KEY získáte hlubší analýzu modelem gpt-4o-mini.`,
  };
}

function parseAuditJson(content: string): LegalAuditResult | null {
  try {
    const parsed = JSON.parse(content) as {
      risks?: string[];
      warnings?: string[];
      summary?: string;
      velkaRizika?: string[];
      upozorneni?: string[];
      shrnuti?: string;
    };
    const risks = parsed.risks || parsed.velkaRizika || [];
    const warnings = parsed.warnings || parsed.upozorneni || [];
    const summary = parsed.summary || parsed.shrnuti || '';
    if (!risks.length && !warnings.length && !summary) return null;
    return {
      risks,
      warnings,
      summary: summary || 'Shrnutí nebylo modelem vráceno.',
      source: 'openai',
      scannedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function parseAuditFromProse(content: string): LegalAuditResult {
  const risks: string[] = [];
  const warnings: string[] = [];
  let summary = '';

  const riskBlock = content.split(/🟡|UPOZORNĚNÍ|Upozornění/i)[0] || '';
  const afterRisk = content.split(/🟡|UPOZORNĚNÍ|Upozornění/i)[1] || '';
  const warnBlock = afterRisk.split(/🟢|SHRNUTÍ|Shrnutí/i)[0] || '';
  const summaryBlock = afterRisk.split(/🟢|SHRNUTÍ|Shrnutí/i)[1] || '';

  const bulletize = (block: string) =>
    block
      .split('\n')
      .map((l) => l.replace(/^[\s\-•*\d.)]+|^(?:🔴|🟡|🟢)+/u, '').trim())
      .filter((l) => l.length > 12 && !/VELKÁ RIZIKA|UPOZORNĚNÍ|SHRNUTÍ/i.test(l));

  risks.push(...bulletize(riskBlock).slice(0, 6));
  warnings.push(...bulletize(warnBlock).slice(0, 6));
  summary = summaryBlock.replace(/^[\s\-•*:]+/, '').trim() || content.slice(0, 500);

  if (!risks.length) risks.push('Model identifikoval rizikové formulace — doporučujeme ruční právní review.');
  if (!warnings.length) warnings.push('Ověřte výpovědní lhůty, sankce a definici předmětu plnění.');

  return {
    risks,
    warnings,
    summary,
    source: 'openai',
    scannedAt: new Date().toISOString(),
  };
}

async function callOpenAiAudit(contractText: string): Promise<LegalAuditResult> {
  const apiKey = String(import.meta.env.VITE_OPENAI_API_KEY).trim();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `${AUDIT_SYSTEM_PROMPT} Vrať výhradně JSON: {"risks":["..."],"warnings":["..."],"summary":"..."} kde risks = VELKÁ RIZIKA, warnings = UPOZORNĚNÍ, summary = SHRNUTÍ LIDSKOU ŘEČÍ. Každá položka risks/warnings je jedna konkrétní věta česky.`,
        },
        {
          role: 'user',
          content: `Text smlouvy k auditu:\n\n${contractText.slice(0, 12000)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenAI API chyba (${res.status}): ${detail.slice(0, 160) || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('OpenAI nevrátila výsledek auditu.');

  return parseAuditJson(content) || parseAuditFromProse(content);
}

export const AUDIT_SCAN_STEPS = [
  'Načítám text smlouvy…',
  'AI skenuje skryté háčky a rizika…',
  'Kontroluji smluvní pokuty a sankce…',
  'Prověřuji výpovědní lhůty…',
  'Sestavuji kritický audit…',
] as const;

/**
 * AI Právní Audit — OpenAI gpt-4o-mini with smart mock fallback.
 */
export async function runLegalAudit(contractText: string): Promise<LegalAuditResult> {
  const trimmed = contractText.trim();
  if (trimmed.length < 40) {
    throw new Error('Vložte prosím delší text smlouvy (alespoň několik vět).');
  }

  if (!hasOpenAiKey()) {
    await new Promise((r) => setTimeout(r, 2800));
    return buildMockAudit(trimmed);
  }

  try {
    return await callOpenAiAudit(trimmed);
  } catch {
    await new Promise((r) => setTimeout(r, 1800));
    const mock = buildMockAudit(trimmed);
    return {
      ...mock,
      summary: `${mock.summary}\n\n(Pozn.: OpenAI bylo dočasně nedostupné — zobrazen záložní simulační audit.)`,
    };
  }
}

export { AUDIT_SYSTEM_PROMPT };
