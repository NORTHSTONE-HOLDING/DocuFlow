export type LegalDocId = 'vop' | 'gdpr' | 'consentProcessing' | 'consentMarketing';

export interface LegalDocument {
  id: LegalDocId;
  title: string;
  shortTitle: string;
  filename: string;
  updatedAt: string;
  sections: { heading: string; body: string }[];
}

const CONTROLLER = `Správce osobních údajů:
NORTHSTONE HOLDING (provozovatel aplikace DocuFlow)
E-mail kontaktní osoby: podpora@docuflow.cz
Účel: poskytování SaaS služeb tvorby a správy obchodních dokumentů.`;

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'vop',
    title: 'Všeobecné obchodní podmínky (VOP)',
    shortTitle: 'VOP',
    filename: 'DocuFlow-VOP',
    updatedAt: '2026-07-22',
    sections: [
      {
        heading: '1. Úvodní ustanovení',
        body: `Tyto Všeobecné obchodní podmínky (dále jen „VOP“) upravují práva a povinnosti mezi provozovatelem aplikace DocuFlow a uživatelem při užívání webové aplikace, registraci účtu a využívání tarifů Free, Premium, Business a Full Enterprise.

${CONTROLLER}

Uzavřením smlouvy o užívání služby (registrací účtu a/nebo úhradou předplatného) uživatel potvrzuje, že se s těmito VOP seznámil a souhlasí s nimi.`,
      },
      {
        heading: '2. Předmět služby',
        body: `DocuFlow umožňuje vytváření, úpravu, ukládání a sdílení obchodních dokumentů (cenové nabídky, smlouvy, faktury, protokoly), včetně volitelných funkcí AI asistence, ARES lookup a souvisejících nástrojů dle zvoleného tarifu.

Služba je poskytována „jak stojí a leží“ v rozsahu dostupném v daném tarifu. Provozovatel si vyhrazuje právo funkce rozšiřovat, omezovat či dočasně omezit při údržbě.`,
      },
      {
        heading: '3. Registrace a účet',
        body: `Pro plné užívání služby je nutná registrace. Uživatel je povinen uvádět pravdivé a aktuální údaje. Přístupové údaje je povinen chránit před zneužitím třetími osobami.

Provozovatel není odpověden za škodu vzniklou v důsledku vyzrazení hesla či neoprávněného přístupu způsobeného uživatelem.`,
      },
      {
        heading: '4. Předplatné a platby',
        body: `Tarify a ceny jsou uvedeny v ceníku aplikace v CZK. Platba předplatného probíhá prostřednictvím platební brány (v demoverzi simulovaně). Předplatné se obnovuje měsíčně, není-li ukončeno.

Neuhrazení po splatnosti opravňuje provozovatele omezit placené funkce do doby úhrady.`,
      },
      {
        heading: '5. Odpovědnost a omezení',
        body: `Výstupy AI modulů mají informativní charakter a nenahrazují odborné právní, daňové ani účetní poradenství. Uživatel odpovídá za finální obsah dokumentů před jejich použitím vůči třetím osobám.

Provozovatel neodpovídá za nepřímou škodu, ušlý zisk ani škodu způsobenou výpadkem třetích služeb (např. OpenAI API, ARES, platební brána).`,
      },
      {
        heading: '6. Závěrečná ustanovení',
        body: `VOP se řídí právním řádem České republiky. Případné spory budou řešeny přednostně smírně; příslušným je soud dle sídla provozovatele, nevylučuje-li kogentní norma jinak.

Aktualizace VOP nabývá účinnosti zveřejněním v aplikaci. Pokračováním v užívání služby po zveřejnění změny uživatel s novým zněním souhlasí, nevyžaduje-li zákon výslovný souhlas.`,
      },
    ],
  },
  {
    id: 'gdpr',
    title: 'Informace o zpracování osobních údajů (GDPR)',
    shortTitle: 'GDPR',
    filename: 'DocuFlow-GDPR-Informace',
    updatedAt: '2026-07-22',
    sections: [
      {
        heading: '1. Správce a právní rámec',
        body: `${CONTROLLER}

Zpracování osobních údajů probíhá v souladu s nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR), zákonem č. 110/2019 Sb., o zpracování osobních údajů, a pokyny Úřadu pro ochranu osobních údajů (ÚOOÚ).`,
      },
      {
        heading: '2. Kategorie zpracovávaných údajů',
        body: `V rámci služby mohou být zpracovávány zejména:
• identifikační a kontaktní údaje (jméno, e-mail, telefon),
• firemní údaje (IČO, DIČ, adresa sídla, číslo účtu),
• obsah dokumentů a podpisů vytvořených v aplikaci,
• technické údaje o užívání (např. stav předplatného, lokalní identifikátory),
• údaje nezbytné pro provoz AI funkcí (texty smluv, hlasové vstupy, nahrané skeny).`,
      },
      {
        heading: '3. Účely a právní základy',
        body: `Osobní údaje zpracováváme za účelem:
a) plnění smlouvy o poskytování služby a registrace účtu (čl. 6 odst. 1 písm. b) GDPR),
b) plnění právních povinností (např. účetní a daňové) (čl. 6 odst. 1 písm. c) GDPR),
c) oprávněných zájmů správce (bezpečnost, prevence zneužití) (čl. 6 odst. 1 písm. f) GDPR),
d) na základě souhlasu, zejména pro zasílání obchodních sdělení (čl. 6 odst. 1 písm. a) GDPR).`,
      },
      {
        heading: '4. Doba uchování a práva subjektu',
        body: `Údaje uchováváme po dobu trvání smluvního vztahu a poté po dobu nutnou k ochraně právních nároků, nejdéle však v souladu s právními předpisy.

Subjekt údajů má právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost, námitku a právo podat stížnost u ÚOOÚ (www.uoou.cz). Souhlas se zasíláním obchodních sdělení lze kdykoli odvolat.`,
      },
      {
        heading: '5. Příjemci a předávání',
        body: `Údaje mohou být předávány zpracovatelům zajišťujícím hosting, autentizaci, AI zpracování a doručování e-mailů, výhradně na základě smlouvy o zpracování a při dodržení vhodných záruk. Podrobnosti o Supabase a OpenAI jsou uvedeny v dokumentu „Souhlas se zpracováním osobních údajů“.`,
      },
    ],
  },
  {
    id: 'consentProcessing',
    title: 'Souhlas se zpracováním osobních údajů',
    shortTitle: 'Souhlas se zpracováním',
    filename: 'DocuFlow-Souhlas-zpracovani-OU',
    updatedAt: '2026-07-22',
    sections: [
      {
        heading: '1. Předmět souhlasu',
        body: `Uděluji správci osobních údajů (provozovateli aplikace DocuFlow) souhlas se zpracováním mých osobních údajů v rozsahu nezbytném pro registraci uživatelského účtu, plnění smlouvy o poskytování služby a řádné fungování aplikace, a to v souladu s GDPR a zákonem č. 110/2019 Sb.

Tento souhlas je podmínkou registrace. Bez jeho udělení nelze účet zřídit.`,
      },
      {
        heading: '2. Úložiště dat — Supabase',
        body: `Beru na vědomí, že údaje účtu a související provozní data mohou být ukládána a zpracovávána prostřednictvím platformy Supabase (cloudová databáze, autentizace a související infrastruktura).

V hybridním / offline režimu mohou být údaje dočasně uchovávány také lokálně v prohlížeči (LocalStorage) na zařízení uživatele. Uživatel odpovídá za zabezpečení svého zařízení.`,
      },
      {
        heading: '3. Zpracování prostřednictvím OpenAI API',
        body: `Beru na vědomí, že při aktivaci AI funkcí (např. AI asistent smluv, AI Právní Audit, hlasové zadávání, načtení z fotky/skici, AI vymahač) mohou být odesílány relevantní vstupy (texty, přepisy hlasu, obrazové podklady) k zpracování prostřednictvím rozhraní OpenAI API (modelové služby třetí strany).

Účelem je výhradně poskytnutí požadované AI funkce uživateli. Provozovatel doporučuje nevkládat do AI modulů citlivé údaje nad rámec nezbytnosti.`,
      },
      {
        heading: '4. Rozsah, doba a odvolatelnost',
        body: `Zpracování pro plnění smlouvy probíhá po dobu trvání účtu a dále po dobu nutnou k ochraně oprávněných nároků správce.

Souhlas, je-li právním základem nad rámec plnění smlouvy, mohu odvolat zasláním žádosti na kontakt správce; odvolání nemá vliv na zákonnost zpracování před odvoláním ani na zpracování nezbytné pro plnění smlouvy.`,
      },
      {
        heading: '5. Potvrzení',
        body: `Prohlášením „Souhlasím se zpracováním osobních údajů pro účely plnění smlouvy a registrace (GDPR)“ potvrzuji, že jsem se seznámil/a s tímto dokumentem i s Informacemi o zpracování osobních údajů (GDPR) a že údaje poskytuji dobrovolně a pravdivě.`,
      },
    ],
  },
  {
    id: 'consentMarketing',
    title: 'Souhlas se zasíláním obchodních sdělení',
    shortTitle: 'Obchodní sdělení',
    filename: 'DocuFlow-Souhlas-obchodni-sdeleni',
    updatedAt: '2026-07-22',
    sections: [
      {
        heading: '1. Předmět souhlasu',
        body: `Uděluji správci (provozovateli DocuFlow) dobrovolný a odvolatelný souhlas se zasíláním obchodních sdělení, novinek o produktu, tipů k používání aplikace a marketingových nabídek týkajících se služeb DocuFlow na e-mailovou adresu uvedenou při registraci, a to v souladu se zákonem č. 480/2004 Sb., o některých službách informační společnosti, a GDPR (čl. 6 odst. 1 písm. a)).`,
      },
      {
        heading: '2. Dobrovolnost',
        body: `Tento souhlas není podmínkou registrace ani užívání základní funkcionality služby. Jeho neudělení nemá vliv na uzavření či plnění smlouvy o poskytování DocuFlow.`,
      },
      {
        heading: '3. Obsah a frekvence',
        body: `Obchodní sdělení mohou zahrnovat informace o nových funkcích, tarifních akcích, vzdělávacím obsahu a relevantních tipách pro české podnikatele. Frekvence je přiměřená; správce se zavazuje nezasílat nevyžádaná sdělení v rozporu s právními předpisy.`,
      },
      {
        heading: '4. Odvolání souhlasu',
        body: `Souhlas mohu kdykoli odvolat:
• odkazem pro odhlášení (unsubscribe) v patičce každého e-mailu,
• žádostí na e-mail podpora@docuflow.cz,
• úpravou preferencí v nastavení účtu (je-li k dispozici).

Odvolání je účinné bez zbytečného odkladu a nemá vliv na zákonnost zpracování před odvoláním.`,
      },
      {
        heading: '5. Potvrzení',
        body: `Zaškrtnutím pole „Souhlasím se zasíláním obchodních sdělení, novinek a marketingových nabídek e-mailem.“ potvrzuji, že jsem se s tímto dokumentem seznámil/a a souhlas uděluji svobodně a informovaně.`,
      },
    ],
  },
];

export function getLegalDocument(id: LegalDocId): LegalDocument {
  return LEGAL_DOCUMENTS.find((d) => d.id === id) ?? LEGAL_DOCUMENTS[0];
}

export function legalDocumentPlainText(doc: LegalDocument): string {
  const lines = [
    doc.title,
    `DocuFlow · Verze ke dni ${doc.updatedAt}`,
    '',
    ...doc.sections.flatMap((s) => [s.heading, '', s.body, '']),
    '— Konec dokumentu —',
    'Tento soubor je elektronickým výpisem právního textu aplikace DocuFlow (simulace stažení PDF/DOCX).',
  ];
  return lines.join('\n');
}
