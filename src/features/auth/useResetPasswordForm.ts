import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useAuthForm } from './useAuthForm';

type Phase = 'request' | 'confirm';

/**
 * Forgot-password: request an emailed code, then set a new password with it and
 * land the user signed in (like sign-up's finish). `password` holds the NEW one.
 */
export function useResetPasswordForm() {
  const { resetPassword, confirmResetPassword } = useAuth();
  const { run, finish, ...fields } = useAuthForm();
  const [phase, setPhase] = useState<Phase>('request');
  const [code, setCode] = useState('');
  const { email, password } = fields;

  const submitEmail = useCallback(
    () =>
      run(async () => {
        await resetPassword(email);
        setPhase('confirm');
      }, 'Could not start the reset.'),
    [run, resetPassword, email],
  );

  const submitNewPassword = useCallback(
    () =>
      run(async () => {
        await confirmResetPassword(email, code, password);
        await finish();
      }, 'Reset failed.'),
    [run, confirmResetPassword, email, code, password, finish],
  );

  return { ...fields, phase, code, setCode, submitEmail, submitNewPassword };
}
