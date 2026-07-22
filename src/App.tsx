import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthModal } from './components/AuthModal';
import { PaywallModal } from './components/PaywallModal';
import { useDocuments, useSettings } from './hooks/useDocuments';
import { useAuth } from './hooks/useAuth';
import { useCompanyProfile, useProjects } from './hooks/useErp';
import { Dashboard } from './pages/Dashboard';
import { NewDocument } from './pages/NewDocument';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Pricing } from './pages/Pricing';
import { AiAudit } from './pages/AiAudit';
import { Profile } from './pages/Profile';
import { ProjectDetail } from './pages/ProjectDetail';
import { SignDocument } from './pages/SignDocument';
import type { PlanId } from './types/document';
import { isSupabaseConfigured } from './utils/supabase';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const location = useLocation();

  const { documents, save } = useDocuments();
  const { settings, update } = useSettings();
  const { profile, save: saveProfile } = useCompanyProfile();
  const { projects, refresh, removeProject } = useProjects();
  const {
    auth,
    plan,
    canCreate,
    freeRemaining,
    signIn,
    signUp,
    signOut,
    upgradePlan,
    recordDocumentCreated,
  } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', !settings.darkMode);
  }, [settings.darkMode]);

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const isSignRoute = location.pathname.startsWith('/sign/');

  if (isSignRoute) {
    return (
      <Routes>
        <Route path="/sign/:id" element={<SignDocument />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell
      mobileOpen={mobileOpen}
      onCloseMobile={() => setMobileOpen(false)}
      onToggleMobile={() => setMobileOpen((v) => !v)}
      planName={plan.name}
      planId={auth.planId}
      userName={auth.user?.name ?? null}
      freeRemaining={freeRemaining}
      onOpenLogin={() => openAuth('login')}
      onOpenSignup={() => openAuth('signup')}
      onSignOut={signOut}
      supabaseReady={isSupabaseConfigured()}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              documentsCountLegacy={documents.length}
              projects={projects}
              profile={profile}
              auth={auth}
              canCreate={canCreate}
              onBlocked={() => setPaywallOpen(true)}
              onDocumentCreated={recordDocumentCreated}
              onRefresh={refresh}
              onDeleteProject={removeProject}
            />
          }
        />
        <Route
          path="/zakazka/:projectId"
          element={
            <ProjectDetail
              profile={profile}
              projects={projects}
              onRefresh={refresh}
              canCreate={canCreate}
              onBlocked={() => setPaywallOpen(true)}
              onDocumentCreated={recordDocumentCreated}
            />
          }
        />
        <Route path="/profil" element={<Profile profile={profile} onSave={saveProfile} />} />
        <Route
          path="/novy"
          element={
            <NewDocument
              onSave={save}
              canCreate={canCreate}
              onBlocked={() => setPaywallOpen(true)}
              onDocumentCreated={recordDocumentCreated}
            />
          }
        />
        <Route path="/sablony" element={<Templates />} />
        <Route path="/audit" element={<AiAudit planId={auth.planId} onUpgradeHint={() => undefined} />} />
        <Route
          path="/cenik"
          element={
            <Pricing
              currentPlanId={auth.planId}
              onUpgrade={(id: PlanId) => upgradePlan(id)}
              isLoggedIn={!!auth.user}
              onOpenAuth={() => openAuth('signup')}
            />
          }
        />
        <Route
          path="/nastaveni"
          element={
            <Settings
              settings={settings}
              onUpdate={update}
              auth={auth}
              onOpenAuth={() => openAuth('login')}
              onSignOut={signOut}
              onUpgrade={(id) => upgradePlan(id)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
      <PaywallModal
        open={paywallOpen}
        documentsCreated={auth.documentsCreated}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={(id) => upgradePlan(id)}
      />
    </AppShell>
  );
}
