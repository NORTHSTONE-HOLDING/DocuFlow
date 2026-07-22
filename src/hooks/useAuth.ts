import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthState, PlanId } from '../types/document';
import { getPlan } from '../data/plans';
import {
  canCreateDocument,
  freeRemaining,
  incrementDocumentsCreated,
  loadAuth,
  saveAuth,
  signInLocal,
  signOutLocal,
  signUpLocal,
  upgradePlanLocal,
} from '../utils/auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
    setReady(true);
  }, []);

  const persist = useCallback((next: AuthState) => {
    saveAuth(next);
    setAuth(next);
  }, []);

  const signUp = useCallback(
    (name: string, email: string, password: string) => {
      persist(signUpLocal(name, email, password));
    },
    [persist],
  );

  const signIn = useCallback(
    (email: string, password: string, name?: string) => {
      persist(signInLocal(email, password, name));
    },
    [persist],
  );

  const signOut = useCallback(() => {
    persist(signOutLocal());
  }, [persist]);

  const upgradePlan = useCallback(
    (planId: PlanId) => {
      persist(upgradePlanLocal(planId));
    },
    [persist],
  );

  const recordDocumentCreated = useCallback(() => {
    persist(incrementDocumentsCreated());
  }, [persist]);

  const plan = useMemo(() => getPlan(auth.planId), [auth.planId]);
  const allowed = canCreateDocument(auth);
  const remaining = freeRemaining(auth);

  return {
    auth,
    ready,
    plan,
    canCreate: allowed,
    freeRemaining: remaining,
    signUp,
    signIn,
    signOut,
    upgradePlan,
    recordDocumentCreated,
  };
}
