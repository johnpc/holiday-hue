import { MutationCache, QueryClient } from '@tanstack/react-query';
import { showToast } from '../features/shell/toastBus';

/** App-wide react-query client. A global mutation onError surfaces a toast so a
 * failed write (the optimistic cache already rolled back) is never silent. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
  mutationCache: new MutationCache({
    onError: () => showToast('Something went wrong. Check your connection and try again.'),
  }),
});
