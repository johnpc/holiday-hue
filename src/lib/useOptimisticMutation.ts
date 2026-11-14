import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Optimistic mutation over ONE react-query cache entry: apply the change at
 * press time, roll back on error, and NEVER invalidate-refetch on success (the
 * read path reconciles via subscription / focus refetch). Avoids the gray-out
 * freeze where every button waits on a post-write refetch.
 */
export function useOptimisticMutation<V, T>(
  key: readonly string[],
  mutationFn: (v: V) => Promise<void>,
  apply: (current: T | undefined, v: V) => T | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (v: V) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T>(key);
      qc.setQueryData<T>(key, (current) => apply(current, v));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev);
    },
  });
}
