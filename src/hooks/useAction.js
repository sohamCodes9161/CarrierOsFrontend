import { useCallback, useRef, useState } from 'react';

/**
 * Wraps an async function (usually an API call) with loading/error state.
 * `run` never throws; it resolves to `{ ok: true, data }` or `{ ok: false, error }`.
 */
export function useAction(fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fnRef.current(...args);
      return { ok: true, data };
    } catch (err) {
      setError(err);
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { run, loading, error, reset };
}
