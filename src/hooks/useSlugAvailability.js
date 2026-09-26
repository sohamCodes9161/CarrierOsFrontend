import { useEffect, useRef, useState } from 'react';

import { portfolioApi } from '../services/api/index.js';
import { SLUG_REGEX } from '../utils/validation.js';

/**
 * Debounced, cached slug availability check.
 * The endpoint is public and rate-limited (60/hour), so requests only fire for
 * well-formed slugs, after the user pauses typing, and never twice for the same value.
 *
 * status: idle | current | invalid | checking | available | unavailable | unknown
 */
export function useSlugAvailability(slug, currentSlug) {
  const [state, setState] = useState({ status: 'idle' });
  const cache = useRef(new Map());

  useEffect(() => {
    const value = (slug || '').trim().toLowerCase();

    if (!value) {
      setState({ status: 'idle' });
      return undefined;
    }
    if (value === currentSlug) {
      setState({ status: 'current' });
      return undefined;
    }
    if (!SLUG_REGEX.test(value)) {
      setState({ status: 'invalid' });
      return undefined;
    }
    if (cache.current.has(value)) {
      setState(cache.current.get(value));
      return undefined;
    }

    setState({ status: 'checking' });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await portfolioApi.checkSlugAvailability(value, { signal: controller.signal });
        const next = result.available ? { status: 'available' } : { status: 'unavailable', reason: result.reason };
        cache.current.set(value, next);
        setState(next);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setState({ status: 'unknown' });
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug, currentSlug]);

  return state;
}
