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
import { getSupabase } from '../utils/supabase';
import { createId } from '../utils/storage';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
    setReady(true);

    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const prev = loadAuth();
      const next: AuthState = {
        ...prev,
        user: {
          id: user.id,
          name: (user.user_metadata?.name as string) || user.email || 'Uživatel',
          email: user.email || '',
          createdAt: user.created_at || new Date().toISOString(),
        },
      };
      saveAuth(next);
      setAuth(next);
    });
  }, []);

  const persist = useCallback((next: AuthState) => {
    saveAuth(next);
    setAuth(next);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (!error && data.user) {
          persist({
            ...loadAuth(),
            user: {
              id: data.user.id,
              name,
              email,
              createdAt: data.user.created_at || new Date().toISOString(),
            },
          });
          return;
        }
      }
      // Offline / mock fallback
      persist(signUpLocal(name, email, password));
    },
    [persist],
  );

  const signIn = useCallback(
    async (email: string, password: string, name?: string) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          persist({
            ...loadAuth(),
            user: {
              id: data.user.id,
              name: (data.user.user_metadata?.name as string) || name || 'Uživatel',
              email,
              createdAt: data.user.created_at || new Date().toISOString(),
            },
          });
          return;
        }
      }
      persist(signInLocal(email, password, name));
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
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
    // reserved for future cloud sync session ids
    sessionHint: auth.user?.id || createId(),
  };
}
