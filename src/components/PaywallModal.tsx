import { Link } from 'react-router-dom';
import { PLANS, formatPlanPrice } from '../data/plans';

interface PaywallModalProps {
  open: boolean;
  documentsCreated: number;
  onClose: () => void;
  onUpgrade: (planId: 'premium' | 'business' | 'enterprise') => void;
}

export function PaywallModal({ open, documentsCreated, onClose, onUpgrade }: PaywallModalProps) {
  if (!open) return null;

  const paid = PLANS.filter((p) => p.id !== 'free');

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal paywall-modal" role="dialog" aria-modal="true" aria-labelledby="paywall-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 id="paywall-title">Limit Free plánu dosažen</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>
        <p className="modal__lead">
          Vytvořili jste již <strong>{documentsCreated}</strong> z 3 dokumentů zdarma. Upgradujte pro
          neomezené smlouvy, ARES lookup a AI asistenta.
        </p>

        <div className="paywall-grid">
          {paid.map((plan) => (
            <article key={plan.id} className={`paywall-card ${plan.highlighted ? 'is-hot' : ''}`}>
              <header>
                <strong>{plan.name}</strong>
                <span>{formatPlanPrice(plan)}</span>
              </header>
              <p>{plan.tagline}</p>
              <ul>
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn ${plan.highlighted ? 'btn--primary' : 'btn--secondary'} btn--sm`}
                onClick={() => {
                  onUpgrade(plan.id as 'premium' | 'business' | 'enterprise');
                  onClose();
                }}
              >
                Upgrade přes Stripe
              </button>
            </article>
          ))}
        </div>

        <div className="modal__actions" style={{ marginTop: '1rem' }}>
          <Link to="/cenik" className="btn btn--ghost" onClick={onClose}>
            Zobrazit kompletní ceník
          </Link>
        </div>
      </div>
    </div>
  );
}
