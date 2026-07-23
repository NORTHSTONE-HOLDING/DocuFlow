import type { AuthState, AuthUser, PlanId } from '../types/document';
import { createId } from './storage';

const AUTH_KEY = 'docuflow_auth_v1';

const DEFAULT_AUTH: AuthState = {
  user: null,
  planId: 'free',
  documentsCreated: 0,
};

export function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { ...DEFAULT_AUTH };
    const parsed = JSON.parse(raw) as AuthState;
    return {
      ...DEFAULT_AUTH,
      ...parsed,
      user: parsed.user ?? null,
      planId: parsed.planId ?? 'free',
      documentsCreated: Number(parsed.documentsCreated) || 0,
    };
  } catch {
    return { ...DEFAULT_AUTH };
  }
}

export function saveAuth(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function signUpLocal(
  name: string,
  email: string,
  _password: string,
  consents?: { gdpr: boolean; marketing: boolean },
): AuthState {
  const now = new Date().toISOString();
  const user: AuthUser = {
    id: createId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    createdAt: now,
  };
  const prev = loadAuth();
  const next: AuthState = {
    ...prev,
    user,
    consents: {
      gdprAcceptedAt: consents?.gdpr ? now : prev.consents?.gdprAcceptedAt,
      marketingAccepted: Boolean(consents?.marketing),
      marketingAcceptedAt: consents?.marketing ? now : undefined,
    },
  };
  saveAuth(next);
  return next;
}

export function signInLocal(email: string, _password: string, nameFallback = 'Uživatel DocuFlow'): AuthState {
  const prev = loadAuth();
  if (prev.user && prev.user.email === email.trim().toLowerCase()) {
    return prev;
  }
  return signUpLocal(nameFallback, email, _password);
}

export function signOutLocal(): AuthState {
  const prev = loadAuth();
  const next: AuthState = { ...prev, user: null };
  saveAuth(next);
  return next;
}

export function upgradePlanLocal(planId: PlanId): AuthState {
  const prev = loadAuth();
  const next: AuthState = {
    ...prev,
    planId,
    upgradedAt: new Date().toISOString(),
    stripeMockCustomerId: `cus_mock_${planId}_${Date.now().toString(36)}`,
  };
  saveAuth(next);
  return next;
}

export function incrementDocumentsCreated(): AuthState {
  const prev = loadAuth();
  const next: AuthState = {
    ...prev,
    documentsCreated: (prev.documentsCreated || 0) + 1,
  };
  saveAuth(next);
  return next;
}

export function canCreateDocument(state: AuthState): boolean {
  if (state.planId !== 'free') return true;
  return (state.documentsCreated || 0) < 3;
}

export function freeRemaining(state: AuthState): number {
  if (state.planId !== 'free') return Infinity;
  return Math.max(0, 3 - (state.documentsCreated || 0));
}
