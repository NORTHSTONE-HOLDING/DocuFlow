export interface AiSuggestion {
  mode: 'append' | 'rewrite';
  text: string;
  note: string;
  source: 'openai' | 'simulation';
}

export function hasOpenAiKey(): boolean {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 && key.trim() !== 'sk-...';
}

function detectIntent(prompt: string): 'sanctions' | 'formal' | 'payment' | 'warranty' | 'generic' {
  const p = prompt.toLowerCase();
  if (p.includes('sankc') || p.includes('pokut') || p.includes('pozdní') || p.includes('prodlen')) {
    return 'sanctions';
  }
  if (p.includes('formál') || p.includes('prepis') || p.includes('přepis') || p.includes('vylepš')) {
    return 'formal';
  }
  if (p.includes('platb') || p.includes('faktur') || p.includes('splat')) {
    return 'payment';
  }
  if (p.includes('záruk') || p.includes('reklam')) {
    return 'warranty';
  }
  return 'generic';
}

function formalize(paragraph: string): string {
  const cleaned = paragraph.trim();
  if (!cleaned) {
    return 'Smluvní strany prohlašují, že si tuto smlouvu přečetly, s jejím obsahem souhlasí a na důkaz toho připojují své podpisy.';
  }
  return (
    cleaned
      .replace(/\bchci\b/gi, 'požaduji')
      .replace(/\bmáme\b/gi, 'smluvní strany mají')
      .replace(/\bdáme\b/gi, 'poskytnou')
      .replace(/\bOK\b/g, 'v pořádku') +
    (cleaned.endsWith('.') ? '' : '.') +
    ' Ustanovení se vykládá v souladu s právním řádem České republiky.'
  );
}

function buildSimulation(prompt: string, currentTerms: string): AiSuggestion {
  const intent = detectIntent(prompt);

  switch (intent) {
    case 'sanctions':
      return {
        mode: 'append',
        source: 'simulation',
        note: 'Doplněna klauzule o smluvních sankcích (testovací režim).',
        text:
          'V případě prodlení zhotovitele s termínem dodání či dokončení díla je objednatel oprávněn požadovat smluvní pokutu ve výši 0,1 % z celkové ceny díla za každý i započatý den prodlení, maximálně však do výše 10 % ceny díla. Zaplacením smluvní pokuty není dotčen nárok na náhradu škody vzniklé v důsledku prodlení. Smluvní pokuta je splatná do 14 dnů od doručení výzvy k její úhradě.',
      };
    case 'formal':
      return {
        mode: 'rewrite',
        source: 'simulation',
        note: 'Odstavec přepsán formálnějším právním jazykem (testovací režim).',
        text: formalize(currentTerms.split(/\n\n+/).pop() || currentTerms),
      };
    case 'payment':
      return {
        mode: 'append',
        source: 'simulation',
        note: 'Doplněny platební podmínky (testovací režim).',
        text:
          'Cena je splatná na základě daňového dokladu (faktury) se splatností 14 kalendářních dnů ode dne jeho doručení. Platba se považuje za provedenou okamžikem připsání celé částky na účet oprávněné strany. Při prodlení s platbou vzniká nárok na zákonný úrok z prodlení a oprávněná strana je oprávněna pozastavit další plnění do úplného vyrovnání dlužné částky.',
      };
    case 'warranty':
      return {
        mode: 'append',
        source: 'simulation',
        note: 'Doplněna záruční klauzule (testovací režim).',
        text:
          'Zhotovitel poskytuje záruku za jakost díla v délce 24 měsíců ode dne protokolárního předání a převzetí. Objednatel je povinen reklamovat vady bez zbytečného odkladu poté, co je zjistil nebo při náležité péči zjistit mohl. Zhotovitel odstraní oprávněně reklamované vady v přiměřené lhůtě dohodnuté stranami, nejpozději do 30 dnů, ledaže povaha vady vyžaduje lhůtu delší.',
      };
    default:
      return {
        mode: 'append',
        source: 'simulation',
        note: 'Vygenerován doplňující odstavec dle vašeho zadání (testovací režim).',
        text: `S ohledem na požadavek „${prompt.trim()}“ se smluvní strany dohodly na následujícím: příslušná práva a povinnosti budou vykonávány poctivě, v souladu s účelem této smlouvy a s obecně závaznými právními předpisy České republiky. Neplatnost nebo nevymahatelnost jednotlivého ustanovení nemá vliv na platnost ostatních ustanovení; namísto neplatného ustanovení nastoupí úprava, která se hospodářskému účelu neplatného ustanovení nejvíce blíží.`,
      };
  }
}

async function callOpenAi(prompt: string, currentTerms: string): Promise<AiSuggestion> {
  const apiKey = String(import.meta.env.VITE_OPENAI_API_KEY).trim();
  const system = [
    'Jsi právně zaměřený asistent pro české obchodní smlouvy v aplikaci DocuFlow.',
    'Odpovídej výhradně česky, formálním právním stylem vhodným do smlouvy.',
    'Vrať POUZE JSON objekt ve tvaru: {"mode":"append"|"rewrite","text":"...","note":"..."}',
    'mode=append: nový odstavec k doplnění; mode=rewrite: přepracovaný poslední odstavec.',
    'Bez markdownu, bez uvozovek okolo celého JSON, bez komentářů.',
  ].join(' ');

  const user = [
    `Požadavek uživatele: ${prompt.trim()}`,
    '',
    'Aktuální smluvní ustanovení:',
    currentTerms.trim() || '(zatím prázdné)',
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenAI API chyba (${res.status}): ${detail.slice(0, 180) || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenAI nevrátila žádný text.');
  }

  let parsed: { mode?: string; text?: string; note?: string };
  try {
    parsed = JSON.parse(content) as { mode?: string; text?: string; note?: string };
  } catch {
    return {
      mode: 'append',
      source: 'openai',
      text: content,
      note: 'Text vygenerován modelem gpt-4o-mini.',
    };
  }

  return {
    mode: parsed.mode === 'rewrite' ? 'rewrite' : 'append',
    source: 'openai',
    text: (parsed.text || content).trim(),
    note: parsed.note?.trim() || 'Text vygenerován modelem gpt-4o-mini.',
  };
}

/**
 * OpenAI-ready contract assistant.
 * - With VITE_OPENAI_API_KEY → real gpt-4o-mini call
 * - Without key → smart Czech simulation (1.5s) — never crashes
 */
export async function generateContractAssistance(
  prompt: string,
  currentTerms: string,
): Promise<AiSuggestion> {
  if (!prompt.trim()) {
    throw new Error('Zadejte prosím požadavek pro AI asistenta.');
  }

  if (!hasOpenAiKey()) {
    await new Promise((r) => setTimeout(r, 1500));
    return buildSimulation(prompt, currentTerms);
  }

  try {
    return await callOpenAi(prompt, currentTerms);
  } catch (err) {
    // Soft fallback so the UI never crashes if the key is invalid / network fails
    await new Promise((r) => setTimeout(r, 1500));
    const fallback = buildSimulation(prompt, currentTerms);
    return {
      ...fallback,
      note: `${fallback.note} (OpenAI nedostupné: ${err instanceof Error ? err.message : 'chyba'})`,
    };
  }
}
