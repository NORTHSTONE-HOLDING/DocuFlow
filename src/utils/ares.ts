export interface AresCompany {
  ico: string;
  dic?: string;
  name: string;
  address: string;
  source: 'ares' | 'mock';
}

const MOCK_REGISTRY: Record<string, AresCompany> = {
  '00006947': {
    ico: '00006947',
    dic: 'CZ00006947',
    name: 'Ministerstvo financí',
    address: 'Letenská 525/15, 118 00 Praha 1 - Malá Strana',
    source: 'mock',
  },
  '27074358': {
    ico: '27074358',
    dic: 'CZ27074358',
    name: 'Seznam.cz, a.s.',
    address: 'Radlická 3294/10, 150 00 Praha 5 - Smíchov',
    source: 'mock',
  },
  '26168685': {
    ico: '26168685',
    dic: 'CZ26168685',
    name: 'Alza.cz a.s.',
    address: 'Jankovcova 1522/53, 170 00 Praha 7 - Holešovice',
    source: 'mock',
  },
  '12345678': {
    ico: '12345678',
    dic: 'CZ12345678',
    name: 'Demo Firma s.r.o.',
    address: 'Václavské náměstí 1, 110 00 Praha 1',
    source: 'mock',
  },
};

function normalizeIco(ico: string): string {
  const digits = ico.replace(/\D/g, '');
  return digits.padStart(8, '0').slice(-8);
}

function formatAddressFromAres(sidlo: Record<string, unknown> | undefined): string {
  if (!sidlo) return '';
  const street = [sidlo.nazevUlice, sidlo.cisloDomovni, sidlo.cisloOrientacni]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const city = String(sidlo.nazevObce || sidlo.nazevMestskeCastiObvodu || '');
  const zip = String(sidlo.psc || '');
  const zipFmt = zip ? `${zip.slice(0, 3)} ${zip.slice(3)}`.trim() : '';
  return [street || sidlo.textovaAdresa, zipFmt, city].filter(Boolean).join(', ');
}

function mockFallback(ico: string): AresCompany {
  const key = normalizeIco(ico);
  if (MOCK_REGISTRY[key]) return { ...MOCK_REGISTRY[key] };
  return {
    ico: key,
    dic: `CZ${key}`,
    name: `Firma IČO ${key} s.r.o.`,
    address: `Ukázková 1, 110 00 Praha 1`,
    source: 'mock',
  };
}

/**
 * Live ARES lookup with CORS/network mock fallback.
 * Official REST: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}
 */
export async function fetchAresCompany(icoRaw: string): Promise<AresCompany> {
  const ico = normalizeIco(icoRaw);
  if (!/^\d{8}$/.test(ico)) {
    throw new Error('IČO musí obsahovat 8 číslic.');
  }

  const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`ARES HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      ico?: string;
      obchodniJmeno?: string;
      dic?: string;
      sidlo?: Record<string, unknown>;
    };

    const name = data.obchodniJmeno?.trim();
    const address = formatAddressFromAres(data.sidlo) || String(data.sidlo?.textovaAdresa || '');

    if (!name) {
      throw new Error('ARES nevrátil název firmy.');
    }

    return {
      ico: normalizeIco(String(data.ico || ico)),
      dic: data.dic,
      name,
      address,
      source: 'ares',
    };
  } catch {
    // CORS / network blocked in local browser — use deterministic mock
    await new Promise((r) => setTimeout(r, 450));
    return mockFallback(ico);
  }
}
