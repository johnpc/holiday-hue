import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Where every auth flow lands once the user is signed in. */
const AFTER_AUTH_PATH = '/lights';

/**
 * Shared plumbing for the auth forms: email/password fields, an error line, a
 * busy flag, and `run(action, fallbackMessage)` which executes an async step
 * and routes any failure into the error line. Also exposes `finish()` — sign
 * the user in with the current fields and route into the app.
 */
export function useAuthForm() {
  const { signIn } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>, fallback: string) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setBusy(false);
    }
  }, []);

  const finish = useCallback(async () => {
    await signIn(email, password);
    history.replace(AFTER_AUTH_PATH);
  }, [email, password, signIn, history]);

  return { email, setEmail, password, setPassword, error, busy, run, finish };
}
