
import { useMemo, DependencyList } from 'react';

/**
 * Custom hook to memoize Firebase references and queries.
 * This prevents unnecessary re-renders when passing refs/queries to useCollection or useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
