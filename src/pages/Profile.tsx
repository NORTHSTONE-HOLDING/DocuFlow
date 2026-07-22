import { useEffect, useState } from 'react';
import type { CompanyProfile } from '../types/erp';
import type { PlanId } from '../types/document';
import { fetchAresCompany } from '../utils/ares';
import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';
import { PlanSwitcher } from '../components/PlanSwitcher';

interface ProfileProps {
  profile: CompanyProfile;
  onSave: (profile: CompanyProfile) => void;
  planId: PlanId;
  onChangePlan: (planId: PlanId) => void;
}

export function Profile({ profile, onSave, planId, onChangePlan }: ProfileProps) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [aresLoading, setAresLoading] = useState(false);
  const [aresMsg, setAresMsg] = useState<string | null>(null);
  const { require } = useFeatureAccess();

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const set = (partial: Partial<CompanyProfile>) => setForm((f) => ({ ...f, ...partial }));

  const loadAres = async () => {
    if (!require('ares')) return;
    setAresLoading(true);
    setAresMsg(null);
    try {
      const c = await fetchAresCompany(form.ico);
      set({ companyName: c.name, ico: c.ico, dic: c.dic || form.dic, address: c.address });
      setAresMsg(c.source === 'ares' ? 'Načteno z ARES.' : 'ARES mock fallback (CORS/síť).');
    } catch (e) {
      setAresMsg(e instanceof Error ? e.message : 'ARES selhalo.');
    } finally {
      setAresLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Identita</p>
          <h1>Můj Profil / Moje Firma</h1>
          <p className="page__sub">
            Údaje dodavatele se automaticky předvyplní do hlavičky všech nabídek, smluv a faktur.
          </p>
        </div>
      </div>

      <section className="settings-card plan-switcher-card">
        <h2>Aktuální tarif</h2>
        <p className="wizard-panel__sub">
          Simulace předplatného pro testování omezení funkcí. Změna se uloží lokálně.
        </p>
        <PlanSwitcher planId={planId} onChange={onChangePlan} />
      </section>

      <section className="settings-card">
        <h2>Firemní údaje</h2>
        <div className="form-stack">
          <label>
            Název firmy / Jméno
            <input value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} />
          </label>
          <label>
            IČO
            <div className="ico-row">
              <input value={form.ico} onChange={(e) => set({ ico: e.target.value })} placeholder="12345678" />
              <FeatureGate feature="ares" compact className="feature-gate--inline">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={aresLoading}
                  onClick={() => void loadAres()}
                >
                  {aresLoading ? 'Načítám…' : 'Načíst z ARES'}
                </button>
              </FeatureGate>
            </div>
          </label>
          <label>
            DIČ
            <input value={form.dic} onChange={(e) => set({ dic: e.target.value })} placeholder="CZ…" />
          </label>
          <label>
            Sídlo (Adresa)
            <textarea rows={3} value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </label>
          <div className="form-grid-2">
            <label>
              Číslo účtu
              <input value={form.accountNumber} onChange={(e) => set({ accountNumber: e.target.value })} placeholder="123456789" />
            </label>
            <label>
              Kód banky
              <input value={form.bankCode} onChange={(e) => set({ bankCode: e.target.value })} placeholder="0800" />
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              E-mail
              <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </label>
            <label>
              Telefon
              <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+420…" />
            </label>
          </div>
          {aresMsg && <p className="ares-msg">{aresMsg}</p>}
          {saved && <div className="alert alert--ok">Profil uložen do LocalStorage.</div>}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              onSave(form);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            }}
          >
            Uložit profil firmy
          </button>
        </div>
      </section>
    </div>
  );
}
