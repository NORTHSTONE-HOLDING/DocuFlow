import { Link } from 'react-router-dom';
import type { AuthState } from '../types/document';
import { getPlan, formatPlanPrice } from '../data/plans';
import { freeRemaining } from '../utils/auth';

interface BillingWidgetProps {
  auth: AuthState;
}

export function BillingWidget({ auth }: BillingWidgetProps) {
  const plan = getPlan(auth.planId);
  const remaining = freeRemaining(auth);
  const isFree = auth.planId === 'free';

  return (
    <section className="billing-widget">
      <div className="billing-widget__top">
        <div>
          <p className="eyebrow">Fakturace</p>
          <h2>Stav předplatného</h2>
        </div>
        <span className={`plan-chip plan-chip--${plan.id}`}>{plan.name}</span>
      </div>

      <div className="billing-widget__body">
        <div>
          <span className="billing-widget__label">Tarif</span>
          <strong>{formatPlanPrice(plan)}</strong>
        </div>
        <div>
          <span className="billing-widget__label">Vytvořené dokumenty</span>
          <strong>{auth.documentsCreated}</strong>
        </div>
        <div>
          <span className="billing-widget__label">{isFree ? 'Zbývá ve Free' : 'Limit'}</span>
          <strong>{isFree ? `${remaining} / 3` : 'Neomezeno'}</strong>
        </div>
      </div>

      {isFree && (
        <div className="billing-widget__meter" aria-hidden>
          <div style={{ width: `${Math.min(100, (auth.documentsCreated / 3) * 100)}%` }} />
        </div>
      )}

      <div className="billing-widget__footer">
        <p>
          {auth.user
            ? `Přihlášen: ${auth.user.name} (${auth.user.email})`
            : 'Nejste přihlášeni — účet je volitelný pro lokální demo.'}
        </p>
        <Link to="/cenik" className="btn btn--secondary btn--sm">
          {isFree ? 'Upgradovat' : 'Spravovat tarif'}
        </Link>
      </div>
    </section>
  );
}
