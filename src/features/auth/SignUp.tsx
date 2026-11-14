import { IonRouterLink } from '@ionic/react';
import { AuthField } from './AuthField';
import { AuthPage, AuthSubmit } from './AuthPage';
import { useSignUpForm } from './useSignUpForm';

/** Cognito email sign-up: collect details, then confirm the emailed code. */
export function SignUp() {
  const f = useSignUpForm();

  if (f.phase === 'confirm') {
    return (
      <AuthPage title="Check your email" subtitle={`Enter the code we sent to ${f.email}.`}>
        <AuthField
          label="Confirmation code"
          type="text"
          inputMode="numeric"
          value={f.code}
          onChange={f.setCode}
          testId="signup-code"
        />
        <AuthSubmit
          error={f.error}
          busy={f.busy}
          idle="Confirm"
          working="Confirming…"
          onClick={f.submitCode}
          testId="signup-confirm"
        />
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title="Create your account"
      subtitle="A household member will need to add you before you can run the lights."
    >
      <AuthField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={f.email}
        onChange={f.setEmail}
        testId="signup-email"
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={f.password}
        onChange={f.setPassword}
        testId="signup-password"
      />
      <AuthSubmit
        error={f.error}
        busy={f.busy}
        idle="Create account"
        working="Creating…"
        onClick={f.submitDetails}
        testId="signup-submit"
      />
      <p className="auth__alt">
        Already have an account?{' '}
        <IonRouterLink className="auth__alt-link" routerLink="/signin" data-testid="signup-signin">
          Sign in
        </IonRouterLink>
      </p>
    </AuthPage>
  );
}
