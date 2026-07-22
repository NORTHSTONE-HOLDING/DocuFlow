import { useEffect, useId, useState } from 'react';

interface AuthModalProps {
  open: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
  onSignIn: (email: string, password: string, name?: string) => void | Promise<void>;
  onSignUp: (name: string, email: string, password: string) => void | Promise<void>;
}

export function AuthModal({ open, mode = 'login', onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    if (open) {
      setTab(mode);
      setError(null);
    }
  }, [open, mode]);

  if (!open) return null;

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
        await onSignUp(name.trim(), email.trim(), password);
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
      <div className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 id={`${id}-title`}>DocuFlow účet</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            ×
          </button>
        </div>
        <p className="modal__lead">
          Přihlášení je lokální (LocalStorage) — ideální pro demo a offline provoz bez backendu.
        </p>

        <div className="auth-tabs">
          <button type="button" className={tab === 'login' ? 'is-active' : ''} onClick={() => setTab('login')}>
            Přihlášení
          </button>
          <button type="button" className={tab === 'signup' ? 'is-active' : ''} onClick={() => setTab('signup')}>
            Registrace
          </button>
        </div>

        <form className="modal__form" onSubmit={submit}>
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
          {error && <div className="alert alert--error">{error}</div>}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn--primary">
              {tab === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
