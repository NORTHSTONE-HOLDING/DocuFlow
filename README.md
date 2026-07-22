# DocuFlow

Prémiová klientská webová aplikace pro generování českých smluv a dokumentů.
Aplikace běží kompletně v prohlížeči (LocalStorage) — bez backendu.

## Struktura (multi-file)

```
index.html                 # Vite entry HTML → /src/main.tsx
vite.config.js             # Vite + React + SPA routing
package.json               # scripts: dev / build / preview
src/
  main.tsx                 # Entry point
  App.tsx                  # Router shell
  index.css                # Global styles & theme
  components/              # Logo, AppShell, SignaturePad, EmailModal
  pages/                   # Dashboard, NewDocument, Templates, Settings
  data/                    # Czech document templates
  hooks/                   # LocalStorage document/settings hooks
  types/                   # TypeScript models
  utils/                   # PDF, print, mailto, storage, format
public/
  favicon.svg
```

## Spuštění na localhost

Z kořene projektu:

```bash
npm install
npm run dev
```

Otevřete v prohlížeči adresu, kterou Vite vypíše (typicky):

```
http://localhost:5173/
```

`npm run dev` spouští `vite --host`, takže je aplikace dostupná i v síti (Network URL).

### OpenAI (volitelné)

Bez klíče běží AI Asistent v chytré simulaci (1,5 s „AI přemýšlí…“ + mock právní text).

Pro ostré generování:

```bash
cp .env.example .env
# doplňte: VITE_OPENAI_API_KEY=sk-...
npm run dev
```

### Build / preview

```bash
npm run build
npm run preview
```

## Funkce

- **Nástěnka** s historií dokumentů v LocalStorage
- **Auth + ceník**: Free (3 dok.) / Premium 390 Kč / Business 890 Kč / Enterprise 1490 Kč
- **Vícekrokový průvodce**: šablona → strany → specifikace → podpisy
- **České šablony**: předávací protokol, úřední žádost, smlouva o dílo, generální plná moc…
- **ARES IČO lookup** s autofillem (mock fallback při CORS)
- **AI Asistent** pro doplnění smluvních klauzulí
- **HTML5 Canvas podpisy** (mobilní fullscreen modal)
- **Akce**: Stáhnout PDF, Poslat e-mailem, Vytisknout
- Responzivní layout + tmavý/světlý korporátní režim
