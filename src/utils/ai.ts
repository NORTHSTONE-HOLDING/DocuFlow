export interface AiSuggestion {
  mode: 'append' | 'rewrite';
  text: string;
  note: string;
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

/**
 * Client-side AI drafting simulation for Czech contract text.
 * Produces formal legal-sounding Czech clauses from a natural-language prompt.
 */
export async function generateContractAssistance(
  prompt: string,
  currentTerms: string,
): Promise<AiSuggestion> {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
  const intent = detectIntent(prompt);

  switch (intent) {
    case 'sanctions':
      return {
        mode: 'append',
        note: 'Doplněna klauzule o sankcích za pozdní dodání.',
        text:
          'V případě prodlení zhotovitele s termínem dodání či dokončení díla je objednatel oprávněn požadovat smluvní pokutu ve výši 0,1 % z celkové ceny díla za každý i započatý den prodlení, maximálně však do výše 10 % ceny díla. Zaplacením smluvní pokuty není dotčen nárok na náhradu škody.',
      };
    case 'formal':
      return {
        mode: 'rewrite',
        note: 'Odstavec přepsán formálnějším právním jazykem.',
        text: formalize(currentTerms.split(/\n\n+/).pop() || currentTerms),
      };
    case 'payment':
      return {
        mode: 'append',
        note: 'Doplněny platební podmínky.',
        text:
          'Cena je splatná na základě daňového dokladu se splatností 14 kalendářních dnů ode dne doručení. Platba se považuje za provedenou připsáním částky na účet oprávněné strany. Při prodlení s platbou vzniká nárok na zákonný úrok z prodlení.',
      };
    case 'warranty':
      return {
        mode: 'append',
        note: 'Doplněna záruční klauzule.',
        text:
          'Zhotovitel poskytuje záruku za jakost díla v délce 24 měsíců ode dne protokolárního předání. Objednatel je povinen reklamovat vady bez zbytečného odkladu. Zhotovitel odstraní oprávněně reklamované vady v přiměřené lhůtě dohodnuté stranami.',
      };
    default:
      return {
        mode: 'append',
        note: 'Vygenerován obecný doplňující odstavec dle vašeho zadání.',
        text: `S ohledem na požadavek „${prompt.trim()}“ se smluvní strany dohodly, že příslušná práva a povinnosti budou vykonávány poctivě a v souladu s účelem této smlouvy. Neplatnost jednotlivého ustanovení nemá vliv na platnost ostatních ustanovení.`,
      };
  }
}
