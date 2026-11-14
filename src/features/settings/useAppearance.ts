import { useCallback, useEffect, useState } from 'react';
import { type Appearance, applyAppearance, readAppearance, writeAppearance } from './appearance';

/** The current appearance choice + a setter that persists and applies it. Also
 * applies the stored choice on mount, so call it once near the app root. */
export function useAppearance() {
  const [appearance, setState] = useState<Appearance>(readAppearance);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  const setAppearance = useCallback((value: Appearance) => {
    writeAppearance(value);
    setState(value);
  }, []);

  return { appearance, setAppearance };
}
