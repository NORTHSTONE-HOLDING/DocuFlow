import { Link } from 'react-router-dom';
import { TEMPLATES } from '../data/templates';

export function Templates() {
  return (
    <div className="page fade-in">
      <div className="page__header">
        <div>
          <p className="eyebrow">Knihovna</p>
          <h1>Šablony dokumentů</h1>
          <p className="page__sub">Připravené formální české formuláře pro rychlé spuštění průvodce.</p>
        </div>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <Link key={t.id} to="/novy" className="template-card template-card--link" state={{ templateId: t.id }}>
            <span className="template-card__badge">Šablona</span>
            <strong>{t.label}</strong>
            <span>{t.description}</span>
            <em className="template-card__cta">Použít šablonu →</em>
          </Link>
        ))}
      </div>
    </div>
  );
}
