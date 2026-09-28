import { useEffect, useRef, useState } from 'react';

/**
 * A single shared AudioContext for the whole app. Browsers start these "suspended"
 * until a user gesture resumes them (autoplay policy), and creating many contexts
 * triggers console warnings, so we reuse one.
 */
let sharedCtx = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Impl = window.AudioContext || window.webkitAudioContext;
  if (!Impl) return null;
  if (!sharedCtx || sharedCtx.state === 'closed') sharedCtx = new Impl();
  return sharedCtx;
}

/** Call from a user-gesture handler (a click) to unlock audio for autoplay. */
export async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* still locked; caller falls back to a manual play button */
    }
  }
  return ctx;
}

export const audioLevelSupported = typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);

/**
 * Unlocks the shared AudioContext on the very first real user interaction anywhere in the
 * app (a page load or an auto-advancing question is NOT a gesture, so autoplay'd AI audio
 * would otherwise stay silent until something happens to call resumeAudioContext()). Call
 * this once, e.g. from the app root, before any audio needs to play.
 */
export function installAudioUnlockListener() {
  if (typeof window === 'undefined') return () => {};
  const events = ['pointerdown', 'keydown', 'touchstart'];
  const unlock = () => {
    resumeAudioContext();
    events.forEach((event) => window.removeEventListener(event, unlock));
  };
  events.forEach((event) => window.addEventListener(event, unlock, { once: true, passive: true }));
  return () => events.forEach((event) => window.removeEventListener(event, unlock));
}

/** Tracks whether the shared AudioContext is actually 'running' (vs 'suspended'/'closed'). */
export function useAudioContextRunning() {
  const [running, setRunning] = useState(() => getAudioContext()?.state === 'running');

  useEffect(() => {
    const ctx = getAudioContext();
    if (!ctx) return undefined;
    setRunning(ctx.state === 'running');
    const handleChange = () => setRunning(ctx.state === 'running');
    ctx.addEventListener('statechange', handleChange);
    // Also poll briefly after mount: resume() attempts elsewhere may succeed without firing
    // a statechange event we're subscribed to yet (e.g. a resume kicked off before this ran).
    const poll = setInterval(handleChange, 500);
    return () => {
      ctx.removeEventListener('statechange', handleChange);
      clearInterval(poll);
    };
  }, []);

  return running;
}

/** Runs a requestAnimationFrame loop reading `setup()`'s analyser into a smoothed 0-1 level. */
function useLevelLoop(setup, deps) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const result = setup();
    if (!result) {
      setLevel(0);
      return undefined;
    }
    const { analyser, cleanup } = result;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    let cancelled = false;
    let smoothed = 0;

    function tick() {
      if (cancelled) return;
      analyser.getByteFrequencyData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i += 1) sumSquares += data[i] * data[i];
      const rms = Math.sqrt(sumSquares / data.length) / 255; // 0..1
      smoothed += (rms - smoothed) * 0.35;
      setLevel(smoothed);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanup?.();
      setLevel(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return level;
}

/** Live microphone level (0-1) for a MediaStream, e.g. while recording an answer. */
export function useMicLevel(stream) {
  return useLevelLoop(() => {
    const ctx = getAudioContext();
    if (!ctx || !stream || stream.getAudioTracks().every((t) => !t.enabled || t.readyState === 'ended')) return null;
    let source;
    try {
      source = ctx.createMediaStreamSource(stream);
    } catch {
      return null;
    }
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    return {
      analyser,
      cleanup: () => {
        try {
          source.disconnect();
        } catch {
          /* already torn down */
        }
        try {
          analyser.disconnect();
        } catch {
          /* already torn down */
        }
      },
    };
  }, [stream]);
}

// createMediaElementSource can only be called once per <audio> element ever, and once
// called, the element's sound ONLY reaches speakers via this node -> destination, so
// that connection must be kept alive for the life of the element (never disconnected).
const wiredSources = new WeakMap();

/**
 * Live playback level (0-1) for an <audio> element while it is actually playing.
 *
 * IMPORTANT: this only wires the element through the Web Audio graph once the shared
 * AudioContext is actually 'running'. Routing audio through a *suspended* context makes
 * it silent even though the element itself is happily "playing" (play() resolves, time
 * advances) — the context just never delivers samples to the speakers. Skipping the wiring
 * while suspended means the element keeps using its normal, unmodified output path, so
 * playback is always audible regardless of whether the visualizer can run yet.
 */
export function useElementLevel(audioRef, active) {
  return useLevelLoop(() => {
    const ctx = getAudioContext();
    const el = audioRef.current;
    if (!ctx || !el || !active) return null;
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {
        /* not unlocked yet; playback still works since we haven't touched the element */
      });
      return null;
    }

    let source = wiredSources.get(el);
    if (!source) {
      try {
        source = ctx.createMediaElementSource(el);
        source.connect(ctx.destination);
        wiredSources.set(el, source);
      } catch {
        return null; // e.g. already wired to a different context; audio still plays normally
      }
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser); // tap off the persistent source; safe to add/remove taps freely

    return {
      analyser,
      cleanup: () => {
        try {
          source.disconnect(analyser); // only removes this tap, not source -> destination
        } catch {
          /* already torn down */
        }
        try {
          analyser.disconnect();
        } catch {
          /* already torn down */
        }
      },
    };
  }, [audioRef.current, active]);
}
