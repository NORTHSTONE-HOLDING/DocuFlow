import type { PlanId } from '../types/document';
import { getPlan } from './plans';

export type FeatureKey =
  | 'ares'
  | 'aiAudit'
  | 'voice'
  | 'photoScan'
  | 'debtCollector'
  | 'advancedTemplates'
  | 'unlimitedDocs';

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  ares: 'ARES lookup',
  aiAudit: 'AI Právní Audit',
  voice: 'Hlasové zadávání',
  photoScan: 'Načíst z fotky / skici',
  debtCollector: 'AI Vymahač neplatičů',
  advancedTemplates: 'Rozšířené šablony',
  unlimitedDocs: 'Neomezené dokumenty',
};

/** Minimum plan required to use each feature */
export const FEATURE_MIN_PLAN: Record<FeatureKey, PlanId> = {
  ares: 'premium',
  aiAudit: 'premium',
  voice: 'business',
  photoScan: 'enterprise',
  debtCollector: 'business',
  advancedTemplates: 'premium',
  unlimitedDocs: 'premium',
};

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  premium: 1,
  business: 2,
  enterprise: 3,
};

export function planMeetsRequirement(current: PlanId, required: PlanId): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export function canUseFeature(planId: PlanId, feature: FeatureKey): boolean {
  return planMeetsRequirement(planId, FEATURE_MIN_PLAN[feature]);
}

export function requiredPlanFor(feature: FeatureKey) {
  return getPlan(FEATURE_MIN_PLAN[feature]);
}

export function lockBadgeLabel(feature: FeatureKey): string {
  const min = FEATURE_MIN_PLAN[feature];
  if (min === 'premium') return 'Vyžaduje Premium';
  if (min === 'business') return 'Vyžaduje Business';
  return 'Vyžaduje Enterprise';
}

/** Free plan: only basic template ids */
export const FREE_TEMPLATE_IDS = new Set([
  'kupni-smlouva',
  'smlouva-o-dilo',
  'plna-moc',
  'faktura',
]);
