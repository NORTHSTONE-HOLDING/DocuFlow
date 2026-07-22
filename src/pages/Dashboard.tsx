import { Link, useNavigate } from 'react-router-dom';
import { BillingWidget } from '../components/BillingWidget';
import type { AuthState } from '../types/document';
import type { CompanyProfile, Project, WorkflowStage } from '../types/erp';
import { STAGE_LABELS } from '../types/erp';
import { formatCurrency, formatDate } from '../utils/format';
import { createProjectWithQuote } from '../utils/workflow';

interface DashboardProps {
  documentsCountLegacy: number;
  projects: Project[];
  profile: CompanyProfile;
  auth: AuthState;
  canCreate: boolean;
  onBlocked: () => void;
  onDocumentCreated: () => void;
  onRefresh: () => void;
  onDeleteProject: (id: string) => void;
}

export function Dashboard({
  projects,
  profile,
  auth,
  canCreate,
  onBlocked,
  onDocumentCreated,
  onRefresh,
  onDeleteProject,
}: DashboardProps) {
  const navigate = useNavigate();

  const startProject = () => {
    if (!canCreate) {
      onBlocked();
      return;
    }
    const { project } = createProjectWithQuote(profile, { name: 'Nová zakázka' });
    onDocumentCreated();
    onRefresh();
    navigate(`/zakazka/${project.id}`);
  };

  const stages: WorkflowStage[] = [1, 2, 3, 4, 5];

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">ERP Workflow</p>
          <h1>Nástěnka zakázek</h1>
          <p className="page__sub">
            Pipeline Nabídka → Smlouva → Záloha → Předání → Doplatek s automatickým číslováním 2026.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={startProject}>
          + Nová nabídka (CN2026…)
        </button>
      </div>

      <BillingWidget auth={auth} />

      <section className="pipeline-legend">
        <h2>Stavový tracker</h2>
        <ol className="pipeline pipeline--legend">
          {stages.map((s) => (
            <li key={s} className="pipeline__step">
              <span>{s}</span>
              <strong>{STAGE_LABELS[s]}</strong>
            </li>
          ))}
        </ol>
      </section>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>Zatím žádné zakázky</h2>
          <p>Vytvořte první cenovou nabídku — systém přidělí číslo CN2026001 a spustí workflow.</p>
          <button type="button" className="btn btn--primary" onClick={startProject}>
            Spustit první nabídku
          </button>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <article key={p.id} className="project-row">
              <div className="project-row__main">
                <Link to={`/zakazka/${p.id}`}>
                  <strong>{p.name}</strong>
                </Link>
                <span>{p.clientName || 'Bez klienta'}</span>
                <ol className="mini-pipeline">
                  {stages.map((s) => (
                    <li key={s} className={p.stage >= s ? 'is-on' : ''} title={STAGE_LABELS[s]}>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="project-row__meta">
                <span>{STAGE_LABELS[p.stage]}</span>
                <strong>{formatCurrency(p.value)}</strong>
                <span>{formatDate(p.updatedAt || p.createdAt)}</span>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => onDeleteProject(p.id)}>
                  Smazat
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="dashboard-links">
        <Link to="/audit" className="btn btn--secondary">
          AI Právní Audit
        </Link>
        <Link to="/profil" className="btn btn--ghost">
          Můj Profil / Moje Firma
        </Link>
        <Link to="/novy" className="btn btn--ghost">
          Klasický průvodce dokumentem
        </Link>
      </div>
    </div>
  );
}
