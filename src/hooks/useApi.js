import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader on mount (and whenever `deps` change) and tracks
 * loading / error state. Stale responses from superseded requests are ignored.
 *
 *   const { data, error, loading, reload, setData } = useApi(() => resumeApi.listAnalyses(), []);
 *
 * `reload({ silent: true })` refetches without flipping back to the loading state.
 */
export function useApi(loader, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const requestId = useRef(0);

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (id === requestId.current) setState((prev) => ({ data: silent ? prev.data : null, error, loading: false }));
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, reload: load, setData };
}
