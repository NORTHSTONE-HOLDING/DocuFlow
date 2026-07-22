import type { PlanId } from '../types/document';
import { PLANS, formatPlanPrice } from '../data/plans';

interface PlanSwitcherProps {
  planId: PlanId;
  onChange: (planId: PlanId) => void;
  compact?: boolean;
}

/** Simulated tarif toggle for local testing of feature gates */
export function PlanSwitcher({ planId, onChange, compact = false }: PlanSwitcherProps) {
  return (
    <label className={`plan-switcher ${compact ? 'plan-switcher--compact' : ''}`}>
      <span>Aktuální tarif</span>
      <select value={planId} onChange={(e) => onChange(e.target.value as PlanId)} aria-label="Aktuální tarif">
        {PLANS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {formatPlanPrice(p)}
          </option>
        ))}
      </select>
    </label>
  );
}
