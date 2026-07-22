import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PlanId } from '../types/document';
import {
  FEATURE_LABELS,
  canUseFeature,
  lockBadgeLabel,
  requiredPlanFor,
  type FeatureKey,
} from '../data/features';

interface FeatureAccessValue {
  planId: PlanId;
  can: (feature: FeatureKey) => boolean;
  require: (feature: FeatureKey) => boolean;
  openUpgrade: (feature: FeatureKey) => void;
}

const FeatureAccessContext = createContext<FeatureAccessValue | null>(null);

export function FeatureAccessProvider({
  planId,
  children,
}: {
  planId: PlanId;
  children: ReactNode;
}) {
  const [lockedFeature, setLockedFeature] = useState<FeatureKey | null>(null);

  const can = useCallback((feature: FeatureKey) => canUseFeature(planId, feature), [planId]);

  const openUpgrade = useCallback((feature: FeatureKey) => {
    setLockedFeature(feature);
  }, []);

  const require = useCallback(
    (feature: FeatureKey) => {
      if (canUseFeature(planId, feature)) return true;
      setLockedFeature(feature);
      return false;
    },
    [planId],
  );

  const value = useMemo(
    () => ({ planId, can, require, openUpgrade }),
    [planId, can, require, openUpgrade],
  );

  const required = lockedFeature ? requiredPlanFor(lockedFeature) : null;

  return (
    <FeatureAccessContext.Provider value={value}>
      {children}
      {lockedFeature && required && (
        <div className="modal-backdrop" role="presentation" onClick={() => setLockedFeature(null)}>
          <div
            className="modal upgrade-feature-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-feature-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__head">
              <h3 id="upgrade-feature-title">Funkce uzamčena</h3>
              <button type="button" className="icon-btn" onClick={() => setLockedFeature(null)} aria-label="Zavřít">
                ×
              </button>
            </div>
            <p className="modal__lead">
              Tato funkce je dostupná pouze v tarifu <strong>{required.name}</strong>. Upgradujte své
              předplatné.
            </p>
            <p className="upgrade-feature-modal__feature">{FEATURE_LABELS[lockedFeature]}</p>
            <div className="upgrade-feature-modal__badge">{lockBadgeLabel(lockedFeature)}</div>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setLockedFeature(null)}>
                Zavřít
              </button>
              <Link to="/cenik" className="btn btn--primary" onClick={() => setLockedFeature(null)}>
                Upravit tarif
              </Link>
            </div>
          </div>
        </div>
      )}
    </FeatureAccessContext.Provider>
  );
}

export function useFeatureAccess() {
  const ctx = useContext(FeatureAccessContext);
  if (!ctx) {
    throw new Error('useFeatureAccess must be used within FeatureAccessProvider');
  }
  return ctx;
}

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  className?: string;
  /** Compact badge variant */
  compact?: boolean;
}

/** Blurs/locks children when plan lacks access; click opens upgrade modal */
export function FeatureGate({ feature, children, className = '', compact = false }: FeatureGateProps) {
  const { can, openUpgrade } = useFeatureAccess();
  const allowed = can(feature);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className={`feature-gate ${compact ? 'feature-gate--compact' : ''} ${className}`}>
      <div className="feature-gate__blur" aria-hidden>
        {children}
      </div>
      <button
        type="button"
        className="feature-gate__lock"
        onClick={() => openUpgrade(feature)}
        aria-label={lockBadgeLabel(feature)}
      >
        <span className="feature-gate__badge">{lockBadgeLabel(feature)}</span>
        <span className="feature-gate__hint">Klikněte pro upgrade</span>
      </button>
    </div>
  );
}
