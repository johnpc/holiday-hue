import { IonRouterLink } from '@ionic/react';
import { AuthField } from './AuthField';
import { AuthPage, AuthSubmit } from './AuthPage';
import { useResetPasswordForm } from './useResetPasswordForm';

/** Forgot password: request a code by email, then choose a new password. */
export function ResetPassword() {
  const f = useResetPasswordForm();

  if (f.phase === 'confirm') {
    return (
      <AuthPage title="Check your email" subtitle={`Enter the code we sent to ${f.email}.`}>
        <AuthField
          label="Reset code"
          type="text"
          inputMode="numeric"
          value={f.code}
          onChange={f.setCode}
          testId="reset-code"
        />
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={f.password}
          onChange={f.setPassword}
          testId="reset-password"
        />
        <AuthSubmit
          error={f.error}
          busy={f.busy}
          idle="Set new password"
          working="Saving…"
          onClick={f.submitNewPassword}
          testId="reset-confirm"
        />
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Reset your password" subtitle="We’ll email you a code to choose a new one.">
      <AuthField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={f.email}
        onChange={f.setEmail}
        testId="reset-email"
      />
      <AuthSubmit
        error={f.error}
        busy={f.busy}
        idle="Send reset code"
        working="Sending…"
        onClick={f.submitEmail}
        testId="reset-submit"
      />
      <p className="auth__alt">
        Remembered it?{' '}
        <IonRouterLink className="auth__alt-link" routerLink="/signin" data-testid="reset-signin">
          Back to sign in
        </IonRouterLink>
      </p>
    </AuthPage>
  );
}
