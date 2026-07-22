import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANS, formatPlanPrice } from '../data/plans';
import type { PlanId } from '../types/document';

interface PricingProps {
  currentPlanId: PlanId;
  onUpgrade: (planId: PlanId) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export function Pricing({ currentPlanId, onUpgrade, isLoggedIn, onOpenAuth }: PricingProps) {
  const [toast, setToast] = useState<string | null>(null);

  const mockStripe = (planId: PlanId) => {
    if (planId === 'free') {
      onUpgrade('free');
      setToast('Přepnuto na Free plán.');
      return;
    }
    if (!isLoggedIn) {
      onOpenAuth();
      setToast('Nejprve se přihlaste — poté dokončíme mock Stripe checkout.');
      return;
    }
    // Simulated Stripe Checkout success
    setToast('Přesměrování na Stripe Checkout…');
    window.setTimeout(() => {
      onUpgrade(planId);
      setToast(`Platba simulována. Aktivován tarif ${PLANS.find((p) => p.id === planId)?.name}.`);
    }, 900);
  };

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Ceník</p>
          <h1>Tarify DocuFlow</h1>
          <p className="page__sub">
            Transparentní měsíční plány v CZK. Upgrade probíhá přes simulovaný Stripe checkout (lokálně).
          </p>
        </div>
        <Link to="/nastaveni" className="btn btn--ghost">
          Nastavení účtu
        </Link>
      </div>

      {toast && <div className="alert alert--ok">{toast}</div>}

      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const current = currentPlanId === plan.id;
          return (
            <article key={plan.id} className={`pricing-card ${plan.highlighted ? 'is-hot' : ''} ${current ? 'is-current' : ''}`}>
              {plan.highlighted && <span className="pricing-card__ribbon">Nejoblíbenější</span>}
              <h2>{plan.name}</h2>
              <p className="pricing-card__price">
                {plan.priceCzk === 0 ? '0 Kč' : `${plan.priceCzk.toLocaleString('cs-CZ')} Kč`}
                <small> / {plan.period}</small>
              </p>
              <p className="pricing-card__tag">{plan.tagline}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn ${plan.highlighted ? 'btn--primary' : 'btn--secondary'}`}
                disabled={current}
                onClick={() => mockStripe(plan.id)}
              >
                {current ? 'Aktivní tarif' : plan.id === 'free' ? 'Zvolit Free' : 'Upgrade přes Stripe'}
              </button>
              <p className="pricing-card__meta">{formatPlanPrice(plan)}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
