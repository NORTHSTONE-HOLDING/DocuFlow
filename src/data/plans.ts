import type { PlanId } from '../types/document';

export type { PlanId };

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  priceCzk: number;
  period: 'měsíc';
  tagline: string;
  features: string[];
  highlighted?: boolean;
  documentLimit: number | null; // null = unlimited
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceCzk: 0,
    period: 'měsíc',
    tagline: 'Vyzkoušejte PaperFlow zdarma',
    documentLimit: 3,
    features: [
      '3 dokumenty zdarma',
      'Základní šablony',
      'Lokální úložiště',
      'PDF stažení a tisk',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceCzk: 390,
    period: 'měsíc',
    tagline: 'Neomezené dokumenty pro jednotlivce',
    documentLimit: null,
    highlighted: true,
    features: [
      'Neomezené dokumenty',
      'ARES IČO lookup',
      'AI Právní Audit',
      'Rozšířené šablony',
      'AI asistent smluv',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    priceCzk: 890,
    period: 'měsíc',
    tagline: 'Hlasové zadávání a AI vymahač',
    documentLimit: null,
    features: [
      'Vše z Premium',
      '🎙️ Hlasové zadávání',
      '🤖 AI Vymahač neplatičů',
      'Týmová analytika',
      'Prioritní šablony',
    ],
  },
  {
    id: 'enterprise',
    name: 'Full Enterprise',
    priceCzk: 1490,
    period: 'měsíc',
    tagline: 'Kompletní balíček včetně Vision skenu',
    documentLimit: null,
    features: [
      'Vše z Business',
      '📸 Načíst z fotky / skici',
      'Multi-user tým',
      'Prioritní podpora',
      'API přístup',
    ],
  },
];

export function getPlan(id: PlanId): SubscriptionPlan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function formatPlanPrice(plan: SubscriptionPlan): string {
  if (plan.priceCzk === 0) return 'Zdarma';
  return `${plan.priceCzk.toLocaleString('cs-CZ')} Kč / ${plan.period}`;
}
