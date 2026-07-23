import { Link } from 'react-router-dom';
import { TEMPLATES, type TemplateMeta } from '../data/templates';
import { FREE_TEMPLATE_IDS } from '../data/features';
import { FeatureGate, useFeatureAccess } from '../components/FeatureGate';

function TemplateCardGrid({
  items,
  can,
  openUpgrade,
}: {
  items: TemplateMeta[];
  can: (f: 'advancedTemplates') => boolean;
  openUpgrade: (f: 'advancedTemplates') => void;
}) {
  return (
    <div className="template-grid">
      {items.map((t) => {
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
            {t.category === 'inkaso' && <span className="template-card__badge template-card__badge--inkaso">Inkaso</span>}
            {t.featured && t.category !== 'inkaso' && <span className="template-card__badge">Doporučeno</span>}
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
  );
}

export function Templates() {
  const { can, openUpgrade } = useFeatureAccess();
  const standard = TEMPLATES.filter((t) => t.category !== 'inkaso');
  const inkaso = TEMPLATES.filter((t) => t.category === 'inkaso');

  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Knihovna</p>
          <h1>Šablony dokumentů</h1>
          <p className="page__sub">
            Free tarif obsahuje základní šablony. Rozšířené formuláře a inkasní rejstřík (předžalobní výzva,
            trestní oznámení, uznání dluhu) odemyká Premium a vyšší.
          </p>
        </div>
      </div>

      <h2 className="templates-section-title">Standardní dokumenty</h2>
      <TemplateCardGrid items={standard} can={can} openUpgrade={openUpgrade} />

      <h2 className="templates-section-title templates-section-title--inkaso">Inkasní rejstřík · právní šablony</h2>
      <TemplateCardGrid items={inkaso} can={can} openUpgrade={openUpgrade} />
    </div>
  );
}
