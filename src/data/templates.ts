import type { TemplateId } from '../types/document';

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
  icon: 'contract' | 'work' | 'power' | 'invoice' | 'handover' | 'letter' | 'legal';
  defaultTerms: string;
  defaultName: string;
  defaultItem: string;
  featured?: boolean;
  category?: 'standard' | 'inkaso';
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'predavaci-protokol',
    label: 'Předávací protokol díla',
    description: 'Oficiální záznam o předání a převzetí hotového díla včetně vad a nedodělků.',
    icon: 'handover',
    featured: true,
    defaultName: 'Předávací protokol díla',
    defaultItem: 'Předmět předání: hotové dílo dle smlouvy o dílo včetně související dokumentace.',
    defaultTerms:
      'Zhotovitel předává a objednatel přebírá dílo uvedené v tomto protokolu. Objednatel potvrzuje, že dílo bylo předáno v dohodnutém rozsahu. Případné vady a nedodělky jsou uvedeny v příloze. Záruční doba běží od data podpisu tohoto protokolu.',
  },
  {
    id: 'oficialni-dopis',
    label: 'Oficiální dopis pro úřady / Žádost',
    description: 'Formální žádost nebo podání určené orgánům veřejné správy.',
    icon: 'letter',
    featured: true,
    defaultName: 'Oficiální žádost / dopis',
    defaultItem: 'Předmět žádosti: uveďte konkrétní požadavek vůči úřadu.',
    defaultTerms:
      'Tímto žádám o vyřízení níže uvedeného požadavku v souladu s platnými právními předpisy. Přílohy jsou přiloženy. Žádám o písemné vyrozumění o výsledku. V případě potřeby doplnění jsem připraven/a poskytnout další podklady.',
  },
  {
    id: 'smlouva-o-dilo',
    label: 'Smlouva o dílo',
    description: 'Dohoda o zhotovení díla dle § 2586 a násl. občanského zákoníku.',
    icon: 'work',
    featured: true,
    defaultName: 'Smlouva o dílo',
    defaultItem: 'Předmět díla dle specifikace a požadavků objednatele.',
    defaultTerms:
      'Zhotovitel se zavazuje zhotovit dílo řádně a včas dle specifikace uvedené v této smlouvě. Objednatel se zavazuje dílo převzít a zaplatit sjednanou cenu. Záruka za jakost díla činí 24 měsíců od předání. V případě prodlení zhotovitele s termínem dokončení je objednatel oprávněn požadovat smluvní pokutu ve výši 0,1 % z ceny díla za každý den prodlení.',
  },
  {
    id: 'generalni-plna-moc',
    label: 'Generální plná moc',
    description: 'Široké oprávnění zastupovat zmocnitele ve všech právních jednáních.',
    icon: 'power',
    featured: true,
    defaultName: 'Generální plná moc',
    defaultItem: 'Zastupování zmocnitele ve všech právních a obchodních věcech.',
    defaultTerms:
      'Zmocnitel uděluje zmocněnci generální plnou moc k zastupování ve všech právních jednáních, včetně uzavírání smluv, jednání před úřady, soudy a třetími osobami. Zmocněnec je oprávněn udělit další plnou moc. Tato plná moc je udělena na dobu neurčitou a nabývá účinnosti dnem podpisu.',
  },
  {
    id: 'kupni-smlouva',
    label: 'Kupní smlouva',
    description: 'Formální smlouva o převodu vlastnictví movité či nemovité věci.',
    icon: 'contract',
    defaultName: 'Kupní smlouva',
    defaultItem: 'Předmět koupě dle dohody stran.',
    defaultTerms:
      'Prodávající prohlašuje, že je výlučným vlastníkem předmětu koupě a že tento není zatížen právy třetích osob. Kupující nabývá vlastnické právo k předmětu koupě úplným zaplacením kupní ceny. Smluvní strany se dohodly, že veškeré spory budou řešeny přednostně smírně.',
  },
  {
    id: 'plna-moc',
    label: 'Plná moc',
    description: 'Oprávnění zastupovat zmocnitele v konkrétních právních jednáních.',
    icon: 'power',
    defaultName: 'Plná moc',
    defaultItem: 'Zastupování ve věci uvedené níže.',
    defaultTerms:
      'Zmocnitel uděluje zmocněnci plnou moc k zastupování ve všech právních jednáních souvisejících s níže uvedeným předmětem. Zmocněnec je oprávněn jednat jménem zmocnitele a podepisovat související dokumenty. Tato plná moc je udělena na dobu neurčitou a lze ji odvolat písemně.',
  },
  {
    id: 'faktura',
    label: 'Faktura',
    description: 'Daňový doklad / faktura s údaji o plnění a splatnosti.',
    icon: 'invoice',
    defaultName: 'Faktura',
    defaultItem: 'Fakturované plnění dle objednávky.',
    defaultTerms:
      'Datum splatnosti: 14 dní od vystavení. Platební údaje budou uvedeny na faktuře. V případě prodlení s platbou je dodavatel oprávněn účtovat zákonný úrok z prodlení.',
  },
  {
    id: 'predzalobni-vyzva',
    label: 'Předžalobní výzva k úhradě (§ 142a OSŘ)',
    description:
      'Oficiální výzva dlužníkovi — 7denní lhůta k úhradě, zákonný úrok z prodlení a upozornění na soudní náklady.',
    icon: 'legal',
    featured: true,
    category: 'inkaso',
    defaultName: 'Předžalobní výzva k úhradě dle § 142a OSŘ',
    defaultItem: 'Předmět: neuhrazená pohledávka z vystavené faktury / smlouvy o dílo.',
    defaultTerms: `PŘEDŽALOBNÍ VÝZVA K ÚHRADĚ
dle § 142a zákona č. 99/1963 Sb., občanský soudní řád, ve znění pozdějších předpisů

Vážený pane / Vážená paní,

tímto Vás v souladu s § 142a OSŘ vyzýváme k úhradě dlužné částky uvedené níže, a to nejpozději do sedmi (7) dnů ode dne doručení této výzvy na účet věřitele.

V případě, že dlužná částka nebude ve stanovené lhůtě uhrazena, budeme nuceni uplatnit svůj nárok soudní cestou. Upozorňujeme, že v soudním řízení budeme požadovat rovněž:
• zákonný úrok z prodlení dle nařízení vlády č. 351/2013 Sb.,
• náhradu nákladů řízení včetně soudního poplatku a nákladů právního zastoupení,
• případné další příslušenství pohledávky.

Tato výzva je současně kvalifikovanou předžalobní výzvou ve smyslu § 142a OSŘ. Její ignorování může mít za následek přiznání práva na náhradu nákladů řízení věřiteli.

Žádáme o bezodkladné potvrzení úhrady a uvedení variabilního symbolu platby.`,
  },
  {
    id: 'trestni-oznameni',
    label: 'Podání trestního oznámení pro podezření na podvod (§ 209 TZ)',
    description:
      'Formální podání na Policii ČR / státní zastupitelství — neuhrazená smlouva a podezření na podvodný úmysl.',
    icon: 'legal',
    featured: true,
    category: 'inkaso',
    defaultName: 'Trestní oznámení — podezření na trestný čin podvodu dle § 209 TZ',
    defaultItem: 'Předmět: škoda vzniklá neuhrazením smluvního plnění a podezření na podvodný úmysl.',
    defaultTerms: `TRESTNÍ OZNÁMENÍ
o podezření ze spáchání trestného činu podvodu dle § 209 zákona č. 40/2009 Sb., trestní zákoník

Adresát:
Policie České republiky / příslušné státní zastupitelství

Oznamovatel výše uvedený tímto podává trestní oznámení pro podezření, že jmenovaný dlužník (obviněný) uvedl oznamovatele v omyl, případně využil jeho omylu, a ke škodě cizího majetku se obohatil tím, že:
1. objednal a převzal plnění (dílo / služby / zboží) na základě smlouvy,
2. zavázal se k úhradě sjednané ceny,
3. přes opakované výzvy dlužnou částku neuhradil a lze mít za to, že již v době uzavření závazku jednal s úmyslem plnění neposkytnout, případně že následně zamlčel podstatné skutečnosti o své platební neschopnosti.

Oznamovatel žádá, aby orgány činné v trestním řízení věc prověřily, zajistily důkazy (smlouva, faktury, komunikace, výzvy k úhradě) a postupovaly dle trestního řádu.

Přílohy: smlouva, faktura, předžalobní výzva, výpis komunikace.`,
  },
  {
    id: 'uznani-dluhu',
    label: 'Uznání dluhu a splátkový kalendář',
    description:
      'Uznání dluhu dle občanského zákoníku včetně závazného splátkového kalendáře a sankcí při prodlení.',
    icon: 'legal',
    featured: true,
    category: 'inkaso',
    defaultName: 'Uznání dluhu a splátkový kalendář',
    defaultItem: 'Předmět: uznání peněžitého dluhu a dohoda o jeho úhradě ve splátkách.',
    defaultTerms: `UZNÁNÍ DLUHU A SPLÁTKOVÝ KALENDÁŘ
dle § 2053 a násl. zákona č. 89/2012 Sb., občanský zákoník

I. Uznání dluhu
Dlužník tímto uznává svůj peněžitý dluh vůči věřiteli ve výši uvedené v tomto dokumentu, vzniklý z neuhrazené faktury / smlouvy o dílo, a to včetně příslušenství.

II. Splátkový kalendář
Dlužník se zavazuje uhradit uznaný dluh v pravidelných měsíčních splátkách dle níže uvedeného kalendáře, vždy nejpozději do uvedeného data splatnosti na účet věřitele pod variabilním symbolem faktury.

Příklad struktury kalendáře (doplňte konkrétní částky a data):
1. splátka — datum — částka CZK
2. splátka — datum — částka CZK
3. splátka — datum — částka CZK
(… další splátky do úplného zaplacení)

III. Prodlení
Pokud dlužník neuhradí kteroukoli splátku řádně a včas, stává se zbývající část dluhu splatnou najednou (ztráta výhody splátek) a věřitel je oprávněn požadovat zákonný úrok z prodlení a náhradu nákladů vymáhání.

IV. Závěrečná ustanovení
Toto uznání dluhu je vykonatelné v rozsahu uznané jistiny. Smluvní strany potvrzují, že text přečetly a s jeho obsahem souhlasí.`,
  },
];

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function getFeaturedTemplates(): TemplateMeta[] {
  return TEMPLATES.filter((t) => t.featured);
}
