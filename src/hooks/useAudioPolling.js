import { useEffect, useState } from 'react';

import { interviewApi } from '../services/api/index.js';

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60s. Background TTS is usually done in 10-20s but can be slower.
const RECENT_WINDOW_MS = 5 * 60 * 1000;

/**
 * With voice enabled the backend responds first and generates audio afterwards,
 * so audio URLs are null at first. This reports which pieces are still missing.
 */
export function getPendingAudio(interview) {
  const none = { greeting: false, question: false, report: false };
  if (!interview || !interview.voiceEnabled) return none;

  // Old interviews whose audio failed long ago should not trigger polling.
  const touched = new Date(interview.updatedAt || interview.createdAt).getTime();
  if (Number.isFinite(touched) && Date.now() - touched > RECENT_WINDOW_MS) return none;

  const questions = interview.questions || [];
  const current = questions[questions.length - 1];
  return {
    greeting: interview.status === 'in_progress' && questions.length === 1 && !interview.greetingAudioUrl,
    question: interview.status === 'in_progress' && Boolean(current) && !current.questionAudioUrl,
    report: interview.status === 'completed' && Boolean(interview.finalReport) && !interview.finalReport.audioUrl,
  };
}

function answeredCount(interview) {
  return (interview.questions || []).filter((q) => q.answerText !== null && q.answerText !== undefined).length;
}

/** Guards against a slow poll response overwriting a newer answer submission. */
function isNewerOrSame(previous, fresh) {
  if (!previous) return true;
  const prevLen = previous.questions?.length || 0;
  const freshLen = fresh.questions?.length || 0;
  if (freshLen !== prevLen) return freshLen > prevLen;
  if (previous.status === 'completed' && fresh.status !== 'completed') return false;
  return answeredCount(fresh) >= answeredCount(previous);
}

/** Polls GET /interviews/:id until pending audio shows up (or gives up). */
export function useAudioPolling(interview, id, setInterview) {
  const pending = getPendingAudio(interview);
  const anyPending = pending.greeting || pending.question || pending.report;
  const [gaveUpKey, setGaveUpKey] = useState('');

  const key = interview ? `${interview._id}:${interview.questions?.length}:${interview.status}` : '';
  const gaveUp = gaveUpKey === key;

  useEffect(() => {
    if (!anyPending || gaveUp) return undefined;
    let cancelled = false;
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await interviewApi.getInterview(id);
        if (!cancelled) setInterview((prev) => (isNewerOrSame(prev, fresh) ? fresh : prev));
      } catch {
        // Transient failure: keep trying until attempts run out.
      }
      if (attempts >= MAX_ATTEMPTS && !cancelled) {
        clearInterval(timer);
        setGaveUpKey(key);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [anyPending, gaveUp, key, id, setInterview]);

  return { pending, polling: anyPending && !gaveUp, gaveUp: anyPending && gaveUp };
}
