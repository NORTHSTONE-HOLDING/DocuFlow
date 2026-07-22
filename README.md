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

### Build / preview

```bash
npm run build
npm run preview
```

## Funkce

- **Nástěnka** s historií dokumentů v LocalStorage
- **Vícekrokový průvodce**: šablona → strany → specifikace → podpisy
- **HTML5 Canvas podpisy** (mobilní fullscreen modal)
- **Akce**: Stáhnout PDF, Poslat e-mailem, Vytisknout
- Responzivní layout (desktop / tablet / mobil)
- Tmavý emerald/mint korporátní vzhled (komplementární k FeedFlow)
