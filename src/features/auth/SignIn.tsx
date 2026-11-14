import { IonRouterLink } from '@ionic/react';
import { AuthField } from './AuthField';
import { AuthPage, AuthSubmit } from './AuthPage';
import { useSignInForm } from './useSignInForm';

/** Email/password sign-in for the household. */
export function SignIn() {
  const f = useSignInForm();

  return (
    <AuthPage title="Holiday Hue" subtitle="Sign in to run the lights.">
      <AuthField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={f.email}
        onChange={f.setEmail}
        testId="signin-email"
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={f.password}
        onChange={f.setPassword}
        testId="signin-password"
      />
      <AuthSubmit
        error={f.error}
        busy={f.busy}
        idle="Sign in"
        working="Signing in…"
        onClick={f.submit}
        testId="signin-submit"
      />
      <p className="auth__alt">
        <IonRouterLink className="auth__alt-link" routerLink="/reset" data-testid="signin-forgot">
          Forgot password?
        </IonRouterLink>
      </p>
      <p className="auth__alt">
        New here?{' '}
        <IonRouterLink className="auth__alt-link" routerLink="/signup" data-testid="signin-signup">
          Create an account
        </IonRouterLink>
      </p>
    </AuthPage>
  );
}
