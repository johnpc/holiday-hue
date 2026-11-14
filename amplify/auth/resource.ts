import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito user pool + identity pool. The `editors` group is the HOUSEHOLD: only
 * its members can read or change the lights. A fresh sign-up is not in the
 * group until an admin adds them (Cognito console / CLI), so a stranger who
 * finds the app gets an account that can see and do nothing.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['editors'],
});
