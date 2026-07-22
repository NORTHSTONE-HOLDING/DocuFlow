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
    tagline: 'Vyzkoušejte DocuFlow zdarma',
    documentLimit: 3,
    features: [
      '3 dokumenty zdarma',
      'Základní české šablony',
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
      'AI asistent smluv',
      'Všechny české šablony',
      'E-mail a tisk',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    priceCzk: 890,
    period: 'měsíc',
    tagline: 'Pro týmy se základní analytikou',
    documentLimit: null,
    features: [
      'Vše z Premium',
      'AI Právní Audit cizích smluv',
      'Týmové použití',
      'Základní analytika na nástěnce',
      'Prioritní šablony',
    ],
  },
  {
    id: 'enterprise',
    name: 'Full Enterprise',
    priceCzk: 1490,
    period: 'měsíc',
    tagline: 'Kompletní balíček s API a podporou',
    documentLimit: null,
    features: [
      'Vše z Business',
      'Neomezený AI Právní Audit',
      'Prioritní podpora',
      'API přístup (mock)',
      'SLA a auditní log',
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
