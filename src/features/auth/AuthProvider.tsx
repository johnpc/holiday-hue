import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { retryUntil } from '../../lib/retry';
import * as authClient from './authClient';
import type { AuthState } from './types';

const SIGNED_OUT: AuthState = { status: 'unauthenticated', email: null, groups: [] };

/** Provides Cognito session state (email + groups) and auth actions via AuthContext. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...SIGNED_OUT, status: 'loading' });

  const refresh = useCallback(async () => {
    const email = await authClient.currentEmail();
    if (!email) {
      setState(SIGNED_OUT);
      return;
    }
    // Right after signIn the id token can lag the user record by a beat (seen in
    // e2e as a member reading as "not in the household"); re-read briefly.
    const groups = await retryUntil(authClient.currentGroups, (g) => g.length > 0);
    setState({ status: 'authenticated', email, groups });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authClient.signIn(email, password);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setState(SIGNED_OUT);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp: authClient.signUp,
        confirmSignUp: authClient.confirmSignUp,
        resetPassword: authClient.resetPassword,
        confirmResetPassword: authClient.confirmResetPassword,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
