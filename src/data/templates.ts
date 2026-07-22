import type { TemplateId } from '../types/document';

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
  icon: 'contract' | 'work' | 'power' | 'invoice';
  defaultTerms: string;
  defaultName: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'kupni-smlouva',
    label: 'Kupní smlouva',
    description: 'Formální smlouva o převodu vlastnictví movité či nemovité věci.',
    icon: 'contract',
    defaultName: 'Kupní smlouva',
    defaultTerms:
      'Prodávající prohlašuje, že je výlučným vlastníkem předmětu koupě a že tento není zatížen právy třetích osob. Kupující nabývá vlastnické právo k předmětu koupě úplným zaplacením kupní ceny. Smluvní strany se dohodly, že veškeré spory budou řešeny přednostně smírně.',
  },
  {
    id: 'smlouva-o-dilo',
    label: 'Smlouva o dílo',
    description: 'Dohoda o zhotovení díla dle § 2586 a násl. občanského zákoníku.',
    icon: 'work',
    defaultName: 'Smlouva o dílo',
    defaultTerms:
      'Zhotovitel se zavazuje zhotovit dílo řádně a včas dle specifikace uvedené v této smlouvě. Objednatel se zavazuje dílo převzít a zaplatit sjednanou cenu. Záruka za jakost díla činí 24 měsíců od předání.',
  },
  {
    id: 'plna-moc',
    label: 'Plná moc',
    description: 'Oprávnění zastupovat zmocnitele v právních i obchodních jednáních.',
    icon: 'power',
    defaultName: 'Plná moc',
    defaultTerms:
      'Zmocnitel uděluje zmocněnci plnou moc k zastupování ve všech právních jednáních souvisejících s níže uvedeným předmětem. Zmocněnec je oprávněn jednat jménem zmocnitele a podepisovat související dokumenty. Tato plná moc je udělena na dobu neurčitou a lze ji odvolat písemně.',
  },
  {
    id: 'faktura',
    label: 'Faktura',
    description: 'Daňový doklad / faktura s údaji o plnění a splatnosti.',
    icon: 'invoice',
    defaultName: 'Faktura',
    defaultTerms:
      'Datum splatnosti: 14 dní od vystavení. Platební údaje budou uvedeny na faktuře. V případě prodlení s platbou je dodavatel oprávněn účtovat zákonný úrok z prodlení.',
  },
];

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
