import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useAuthForm } from './useAuthForm';

type Phase = 'collect' | 'confirm';

/** Form state + actions for the two-step Cognito sign-up (details, then code). */
export function useSignUpForm() {
  const { signUp, confirmSignUp } = useAuth();
  const { run, finish, ...fields } = useAuthForm();
  const [phase, setPhase] = useState<Phase>('collect');
  const [code, setCode] = useState('');
  const { email, password } = fields;

  const submitDetails = useCallback(
    () =>
      run(async () => {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) setPhase('confirm');
        else await finish();
      }, 'Sign-up failed.'),
    [run, signUp, email, password, finish],
  );

  const submitCode = useCallback(
    () =>
      run(async () => {
        await confirmSignUp(email, code);
        await finish();
      }, 'Confirmation failed.'),
    [run, confirmSignUp, email, code, finish],
  );

  return { ...fields, phase, code, setCode, submitDetails, submitCode };
}
