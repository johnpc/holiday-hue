import { useCallback } from 'react';
import { useAuthForm } from './useAuthForm';

/** Form state + action for email/password sign-in. */
export function useSignInForm() {
  const { run, finish, ...fields } = useAuthForm();
  const submit = useCallback(() => run(finish, 'Sign-in failed.'), [run, finish]);
  return { ...fields, submit };
}
