import { Link } from 'react-router-dom';
import { TEMPLATES } from '../data/templates';
import { FREE_TEMPLATE_IDS } from '../data/features';
import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';

export function Templates() {
  const { can, openUpgrade } = useFeatureAccess();

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Knihovna</p>
          <h1>Šablony dokumentů</h1>
          <p className="page__sub">
            Free tarif obsahuje základní šablony. Rozšířené formuláře odemyká Premium a vyšší.
          </p>
        </div>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((t) => {
          const allowed = can('advancedTemplates') || FREE_TEMPLATE_IDS.has(t.id);
          const card = (
            <Link
              to="/novy"
              className="template-card template-card--link"
              state={{ templateId: t.id }}
              onClick={(e) => {
                if (!allowed) {
                  e.preventDefault();
                  openUpgrade('advancedTemplates');
                }
              }}
            >
              {t.featured && <span className="template-card__badge">Doporučeno</span>}
              <strong>{t.label}</strong>
              <span>{t.description}</span>
              <em className="template-card__cta">Použít šablonu →</em>
            </Link>
          );

          return allowed ? (
            <div key={t.id}>{card}</div>
          ) : (
            <FeatureGate key={t.id} feature="advancedTemplates" className="feature-gate--template">
              {card}
            </FeatureGate>
          );
        })}
      </div>
    </div>
  );
}
