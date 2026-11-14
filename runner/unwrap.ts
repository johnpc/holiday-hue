/** Amplify resolves (never rejects) failed calls with `{ data, errors }`; throw
 * so a transient auth/network failure never masquerades as "no scene". */
export function unwrapData<T>(result: { data: T; errors?: readonly { message: string }[] }): T {
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  return result.data;
}
