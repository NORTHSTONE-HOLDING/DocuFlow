import type { TemplateId } from '../types/document';

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
  icon: 'contract' | 'work' | 'power' | 'invoice' | 'handover' | 'letter';
  defaultTerms: string;
  defaultName: string;
  defaultItem: string;
  featured?: boolean;
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
];

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function getFeaturedTemplates(): TemplateMeta[] {
  return TEMPLATES.filter((t) => t.featured);
}
