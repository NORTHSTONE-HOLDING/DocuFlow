import type { AppSettings, AuthState, PlanId } from '../types/document';
import { getPlan, formatPlanPrice } from '../data/plans';
import { Link } from 'react-router-dom';
import { PlanSwitcher } from '../components/PlanSwitcher';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  auth: AuthState;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onUpgrade: (planId: PlanId) => void;
}

export function Settings({ settings, onUpdate, auth, onOpenAuth, onSignOut, onUpgrade }: SettingsProps) {
  const plan = getPlan(auth.planId);

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Účet</p>
          <h1>Nastavení / Fakturace</h1>
          <p className="page__sub">Lokální profil společnosti a stav předplatného.</p>
        </div>
      </div>

      <section className="settings-card plan-switcher-card">
        <h2>Aktuální tarif</h2>
        <p className="wizard-panel__sub">Simulace předplatného — okamžitě mění dostupnost funkcí v aplikaci.</p>
        <PlanSwitcher planId={auth.planId} onChange={onUpgrade} />
      </section>

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
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => onUpdate({ darkMode: e.target.checked })}
              />
              Tmavý korporátní režim
            </label>
          </div>
        </section>

        <section className="settings-card settings-card--billing">
          <div className="billing-hero">
            <span className={`plan-chip plan-chip--${plan.id}`}>{plan.name}</span>
            <h2>{formatPlanPrice(plan)}</h2>
            <p>
              {auth.user
                ? `Účet: ${auth.user.name} · ${auth.user.email}`
                : 'Nejste přihlášeni. Registrace je lokální a volitelná.'}
            </p>
            {auth.stripeMockCustomerId && (
              <p className="settings-muted">Stripe zákazník (mock): {auth.stripeMockCustomerId}</p>
            )}
          </div>
          <ul className="billing-features">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="settings-actions">
            {auth.user ? (
              <button type="button" className="btn btn--ghost" onClick={onSignOut}>
                Odhlásit
              </button>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={onOpenAuth}>
                Přihlásit / Registrovat
              </button>
            )}
            <Link to="/cenik" className="btn btn--primary">
              Zobrazit ceník
            </Link>
            {auth.planId !== 'premium' && (
              <button type="button" className="btn btn--ghost" onClick={() => onUpgrade('premium')}>
                Rychlý upgrade na Premium
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
