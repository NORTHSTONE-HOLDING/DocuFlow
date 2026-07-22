import type { AppSettings } from '../types/document';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Účet</p>
          <h1>Nastavení / Fakturace</h1>
          <p className="page__sub">Lokální profil společnosti a stav Premium Active předplatného.</p>
        </div>
      </div>

      <div className="settings-layout">
        <section className="settings-card">
          <h2>Firemní profil</h2>
          <div className="form-stack">
            <label>
              Název společnosti
              <input
                value={settings.companyName}
                onChange={(e) => onUpdate({ companyName: e.target.value })}
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => onUpdate({ companyEmail: e.target.value })}
              />
            </label>
            <label>
              IČO / identifikátor
              <input value={settings.companyId} onChange={(e) => onUpdate({ companyId: e.target.value })} />
            </label>
            <label>
              Měna
              <input value="CZK — Česká koruna" disabled />
            </label>
          </div>
        </section>

        <section className="settings-card settings-card--billing">
          <div className="billing-hero">
            <span className="premium-badge">
              <span className="premium-badge__dot" />
              Premium Active
            </span>
            <h2>Enterprise Local Storage</h2>
            <p>
              Všechna data zůstávají ve vašem prohlížeči. Žádný backend, žádná cloudová databáze — ideální
              pro citlivé smlouvy.
            </p>
          </div>
          <ul className="billing-features">
            <li>Neomezené generování PDF</li>
            <li>Dvojité HTML5 podpisy + mobilní modal</li>
            <li>Historie dokumentů v LocalStorage</li>
            <li>Tisk a mailto dispatch bez serveru</li>
          </ul>
          <div className="billing-price">
            <strong>0 Kč</strong>
            <span>/ měsíc · lokální licence</span>
          </div>
        </section>
      </div>
    </div>
  );
}
