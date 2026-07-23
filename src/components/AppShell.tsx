import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { PlanSwitcher } from './PlanSwitcher';
import { AppFooter } from './AppFooter';
import { useFeatureAccess } from './FeatureGate';
import { lockBadgeLabel, type FeatureKey } from '../data/features';
import type { LegalDocId } from '../data/legal';
import type { PlanId } from '../types/document';

const NAV = [
  { to: '/', label: 'Nástěnka', icon: 'dashboard' },
  { to: '/profil', label: 'Můj Profil / Firma', icon: 'profile' },
  { to: '/novy', label: 'Nový dokument', icon: 'new' },
  { to: '/audit', label: 'AI Právní Audit', icon: 'audit', feature: 'aiAudit' as FeatureKey },
  { to: '/sablony', label: 'Šablony', icon: 'templates' },
  { to: '/cenik', label: 'Ceník', icon: 'pricing' },
  { to: '/nastaveni', label: 'Nastavení', icon: 'settings' },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleMobile: () => void;
  planName: string;
  planId: PlanId;
  userName: string | null;
  freeRemaining: number;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onSignOut: () => void;
  onChangePlan: (planId: PlanId) => void;
  onOpenLegal: (id: LegalDocId) => void;
  supabaseReady?: boolean;
}

function NavIcon({ name }: { name: (typeof NAV)[number]['icon'] }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
        </svg>
      );
    case 'new':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    case 'audit':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5M9 11h4M11 9v4" strokeLinecap="round" />
        </svg>
      );
    case 'templates':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M16 4v4h4M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      );
    case 'pricing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v18M16 8H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H7" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export function AppShell({
  children,
  mobileOpen,
  onCloseMobile,
  onToggleMobile,
  planName,
  planId,
  userName,
  freeRemaining,
  onOpenLogin,
  onOpenSignup,
  onSignOut,
  onChangePlan,
  onOpenLegal,
  supabaseReady = false,
}: AppShellProps) {
  const { can, openUpgrade } = useFeatureAccess();

  return (
    <div className="shell">
      <div className="shell__glow shell__glow--a" aria-hidden />
      <div className="shell__glow shell__glow--b" aria-hidden />

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Logo />
          <button type="button" className="sidebar__close" onClick={onCloseMobile} aria-label="Zavřít menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="premium-badge" title="Stav předplatného">
          <span className="premium-badge__dot" />
          <span>{planName}</span>
          <em>{planId === 'free' ? `Zbývá ${freeRemaining === Infinity ? '∞' : freeRemaining}` : 'Active'}</em>
        </div>

        <PlanSwitcher planId={planId} onChange={onChangePlan} compact />

        <nav className="sidebar__nav" aria-label="Hlavní navigace">
          {NAV.map((item) => {
            const feature = 'feature' in item ? item.feature : undefined;
            const locked = feature ? !can(feature) : false;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link--active' : ''} ${locked ? 'nav-link--locked' : ''}`
                }
                onClick={(e) => {
                  if (locked && feature) {
                    e.preventDefault();
                    openUpgrade(feature);
                  }
                  onCloseMobile();
                }}
              >
                <span className="nav-link__icon">
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
                {locked && feature && <em className="nav-lock-badge">{lockBadgeLabel(feature)}</em>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__auth">
          {userName ? (
            <>
              <p>{userName}</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onSignOut}>
                Odhlásit
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--primary btn--sm" onClick={onOpenLogin}>
                Přihlásit
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onOpenSignup}>
                Registrace
              </button>
            </>
          )}
        </div>

        <div className="sidebar__footer">
          <p>{supabaseReady ? 'Supabase připraven' : 'Lokální / Hybrid režim'}</p>
          <span>{supabaseReady ? 'Cloud auth aktivní' : 'LocalStorage · offline OK'}</span>
          <nav className="sidebar__legal" aria-label="Právní dokumenty">
            <button type="button" onClick={() => onOpenLegal('vop')}>
              VOP
            </button>
            <button type="button" onClick={() => onOpenLegal('gdpr')}>
              GDPR
            </button>
            <button type="button" onClick={() => onOpenLegal('consentProcessing')}>
              Souhlas OÚ
            </button>
            <button type="button" onClick={() => onOpenLegal('consentMarketing')}>
              Obchodní sdělení
            </button>
          </nav>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="sidebar__backdrop" aria-label="Zavřít" onClick={onCloseMobile} />}

      <div className="shell__main">
        <header className="topbar">
          <button type="button" className="topbar__menu" onClick={onToggleMobile} aria-label="Otevřít menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="topbar__brand">
            <Logo compact />
            <span className="topbar__title">DocuFlow</span>
          </div>
          <div className="topbar__plan">
            <PlanSwitcher planId={planId} onChange={onChangePlan} compact />
            <div className="premium-badge premium-badge--mobile">
              <span className="premium-badge__dot" />
              {planName}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
        <AppFooter onOpenLegal={onOpenLegal} />
      </div>
    </div>
  );
}
