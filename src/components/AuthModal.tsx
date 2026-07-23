import { useEffect, useId, useState } from 'react';
import type { LegalDocId } from '../data/legal';

export interface SignupConsents {
  gdpr: boolean;
  marketing: boolean;
}

interface AuthModalProps {
  open: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
  onSignIn: (email: string, password: string, name?: string) => void | Promise<void>;
  onSignUp: (
    name: string,
    email: string,
    password: string,
    consents: SignupConsents,
  ) => void | Promise<void>;
  onOpenLegal: (id: LegalDocId) => void;
}

export function AuthModal({
  open,
  mode = 'login',
  onClose,
  onSignIn,
  onSignUp,
  onOpenLegal,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    if (open) {
      setTab(mode);
      setError(null);
      setConsentGdpr(false);
      setConsentMarketing(false);
    }
  }, [open, mode]);

  if (!open) return null;

  const registerLocked = tab === 'signup' && !consentGdpr;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Vyplňte e-mail a heslo.');
      return;
    }
    try {
      if (tab === 'signup') {
        if (!name.trim()) {
          setError('Zadejte jméno.');
          return;
        }
        if (!consentGdpr) {
          setError('Pro registraci je nutný souhlas se zpracováním osobních údajů (GDPR).');
          return;
        }
        await onSignUp(name.trim(), email.trim(), password, {
          gdpr: true,
          marketing: consentMarketing,
        });
      } else {
        await onSignIn(email.trim(), password, name.trim() || undefined);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Přihlášení selhalo.');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3 id={`${id}-title`}>PaperFlow účet</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>
        <p className="modal__lead">
          Přihlášení je lokální (LocalStorage) — ideální pro demo a offline provoz bez backendu. Registrace
          vyžaduje povinný souhlas dle ÚOOÚ / GDPR.
        </p>

        <div className="auth-tabs">
          <button type="button" className={tab === 'login' ? 'is-active' : ''} onClick={() => setTab('login')}>
            Přihlášení
          </button>
          <button type="button" className={tab === 'signup' ? 'is-active' : ''} onClick={() => setTab('signup')}>
            Registrace
          </button>
        </div>

        <form className="modal__form" onSubmit={(e) => void submit(e)}>
          {tab === 'signup' && (
            <label htmlFor={`${id}-name`}>
              Jméno
              <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Novák" autoFocus />
            </label>
          )}
          <label htmlFor={`${id}-email`}>
            E-mail
            <input
              id={`${id}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vy@firma.cz"
              autoFocus={tab === 'login'}
              required
            />
          </label>
          <label htmlFor={`${id}-pass`}>
            Heslo
            <input
              id={`${id}-pass`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </label>

          {tab === 'signup' && (
            <div className="auth-consents">
              <label className="auth-consent">
                <input
                  type="checkbox"
                  checked={consentGdpr}
                  onChange={(e) => setConsentGdpr(e.target.checked)}
                  required
                />
                <span>
                  <strong>Povinné:</strong> Souhlasím se zpracováním osobních údajů pro účely plnění smlouvy a
                  registrace (GDPR).{' '}
                  <button
                    type="button"
                    className="auth-consent__link"
                    onClick={() => onOpenLegal('consentProcessing')}
                  >
                    Zobrazit souhlas
                  </button>
                </span>
              </label>
              <label className="auth-consent auth-consent--optional">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                />
                <span>
                  <strong>Volitelné:</strong> Souhlasím se zasíláním obchodních sdělení, novinek a marketingových
                  nabídek e-mailem.{' '}
                  <button
                    type="button"
                    className="auth-consent__link"
                    onClick={() => onOpenLegal('consentMarketing')}
                  >
                    Zobrazit souhlas
                  </button>
                </span>
              </label>
            </div>
          )}

          {error && <div className="alert alert--error">{error}</div>}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Zrušit
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={registerLocked}
              title={registerLocked ? 'Nejprve potvrďte povinný souhlas se zpracováním osobních údajů' : undefined}
            >
              {tab === 'login' ? 'Přihlásit se' : 'Registrovat se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
