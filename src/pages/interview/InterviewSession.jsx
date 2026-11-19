import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { interviewApi } from '../../services/api/index.js';
import { humanize } from '../../utils/format.js';
import AnsweredQuestion from './AnsweredQuestion.jsx';
import AnswerComposer from './AnswerComposer.jsx';
import InterviewReport from './InterviewReport.jsx';

// --- Web Speech API TTS Utility ---
export function playHumanLikeAudio(text, { onStart, onEnd } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  const preferredVoiceNames = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Google US English',
    'Google UK English Female',
    'Samantha',
    'Daniel',
  ];

  let bestVoice = null;
  for (const name of preferredVoiceNames) {
    bestVoice = voices.find((v) => v.name === name);
    if (bestVoice) break;
  }

  if (!bestVoice) {
    bestVoice = voices.find((v) => v.name.includes('Natural') || v.name.includes('Premium'));
  }

  if (!bestVoice) {
    bestVoice = voices.find((v) => v.lang.startsWith('en'));
  }

  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
// ---------------------------------

export default function InterviewSession() {
  const { id } = useParams();
  const toast = useToast();
  const { data: interview, error, loading, reload, setData } = useApi(() => interviewApi.getInterview(id), [id]);
  const sendText = useAction((text) => interviewApi.submitAnswer(id, text));
  const sendAudio = useAction((file) => interviewApi.submitAudioAnswer(id, file));

  const lastSpokenQuestionId = useRef(null);
  // 'idle' | 'speaking' | 'paused'
  const [speechStatus, setSpeechStatus] = useState('idle');

  useDocumentTitle(interview ? `${interview.role} interview` : 'Interview');

  const questions = interview?.questions || [];
  const completed = interview?.status === 'completed';
  const current = questions[questions.length - 1];

  const speakText = useCallback((textToSpeak) => {
    playHumanLikeAudio(textToSpeak, {
      onStart: () => setSpeechStatus('speaking'),
      onEnd: () => setSpeechStatus('idle'),
    });
  }, []);

  function handleToggleSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speechStatus === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechStatus('paused');
    } else if (speechStatus === 'paused') {
      window.speechSynthesis.resume();
      setSpeechStatus('speaking');
    } else if (current?.questionText) {
      speakText(current.questionText);
    }
  }

  function handleRestartSpeech() {
    if (current?.questionText) {
      speakText(current.questionText);
    }
  }

  // Auto-play TTS when a new question arrives
  useEffect(() => {
    if (interview?.voiceEnabled && !completed && current?.questionText) {
      const questionIdentifier = current._id || current.questionNumber;

      if (lastSpokenQuestionId.current !== questionIdentifier) {
        lastSpokenQuestionId.current = questionIdentifier;

        let textToSpeak = current.questionText;
        if (questions.length === 1) {
          textToSpeak = `Welcome to your ${interview.role} interview. Let's get started. ${current.questionText}`;
        }

        speakText(textToSpeak);
      }
    }
  }, [interview?.voiceEnabled, completed, current, interview?.role, questions.length, speakText]);

  // Auto-pause AI speech if the user starts recording their answer
  useEffect(() => {
    const handleMicStart = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setSpeechStatus('paused');
      }
    };
    window.addEventListener('careeros:mic-recording-start', handleMicStart);
    return () => window.removeEventListener('careeros:mic-recording-start', handleMicStart);
  }, []);

  // Cleanup TTS if the user navigates away
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (loading) return <PageSkeleton label="Loading interview…" />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/interviews" backLabel="Back to interviews" />;
  if (!interview) return null;

  const answered = questions.filter((q) => q.answerText !== null && q.answerText !== undefined);
  const submitting = sendText.loading || sendAudio.loading;
  const submitError = sendText.error || sendAudio.error;

  async function handleSubmitText(text) {
    window.speechSynthesis?.cancel();
    setSpeechStatus('idle');
    const result = await sendText.run(text);
    if (result.ok) {
      const updatedInterview = result.data.interview || result.data;
      setData(updatedInterview);
      toast.success(updatedInterview.status === 'completed' ? 'Interview complete. Your report is ready.' : 'Answer recorded.');
    }
  }

  async function handleSubmitAudio(file) {
    window.speechSynthesis?.cancel();
    setSpeechStatus('idle');
    const result = await sendAudio.run(file);
    if (result.ok) {
      const updatedInterview = result.data.interview || result.data;
      setData(updatedInterview);
      toast.success(updatedInterview.status === 'completed' ? 'Interview complete. Your report is ready.' : 'Answer recorded.');
    }
  }

  const header = (
    <PageHeader
      backTo="/interviews"
      backLabel="All interviews"
      title={interview.role}
      description={`${humanize(interview.interviewType)} · ${humanize(interview.difficulty)} · ${interview.totalQuestions} questions`}
      actions={
        <>
          {interview.voiceEnabled && <Badge tone="secondary">Voice mode</Badge>}
          <Badge tone={completed ? 'success' : 'warning'}>{completed ? 'Completed' : 'In progress'}</Badge>
        </>
      }
    />
  );

  if (completed) {
    return (
      <div className="mx-auto max-w-4xl">
        {header}
        <InterviewReport interview={interview} />
      </div>
    );
  }

  const progressValue = answered.length;

  return (
    <div className="mx-auto max-w-3xl">
      {header}

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">
            Question {questions.length} of {interview.totalQuestions}
          </span>
          <span className="text-muted">{progressValue} answered</span>
        </div>
        <progress
          className="progress progress-primary h-2 w-full"
          value={progressValue}
          max={interview.totalQuestions}
          aria-label="Interview progress"
        />
      </div>

      {current && (
        <section className="surface mb-4 p-5" aria-labelledby="current-question">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="current-question" className="eyebrow">
                Question {current.questionNumber}
              </h2>
              <Badge tone="neutral">{current.focusArea}</Badge>
            </div>

            {interview.voiceEnabled && (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`btn btn-xs rounded-full px-3 font-medium transition-all ${
                    speechStatus === 'speaking'
                      ? 'btn-primary'
                      : speechStatus === 'paused'
                        ? 'btn-outline border-primary/60 text-primary'
                        : 'btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200'
                  }`}
                >
                  {speechStatus === 'speaking'
                    ? '⏸ Pause'
                    : speechStatus === 'paused'
                      ? '▶ Resume'
                      : '🔊 Listen Again'}
                </button>

                {(speechStatus === 'speaking' || speechStatus === 'paused') && (
                  <button
                    type="button"
                    onClick={handleRestartSpeech}
                    title="Restart question audio"
                    aria-label="Restart question audio"
                    className="btn btn-ghost btn-xs btn-circle text-muted hover:text-base-content"
                  >
                    ↻
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="mt-3 text-lg leading-relaxed">{current.questionText}</p>
        </section>
      )}

      <section className="surface mb-6 p-5" aria-label="Your answer">
        {submitError && (
          <div className="mb-4">
            <ErrorAlert error={submitError}>
              {submitError.status === 409 && (
                <Button variant="outline" size="xs" className="mt-2" onClick={() => reload({ silent: true })}>
                  Refresh interview
                </Button>
              )}
            </ErrorAlert>
          </div>
        )}
        {submitting && (
          <div className="mb-4">
            <AiWaitNotice
              title="Evaluating your answer…"
              description="Scoring it and preparing what comes next. This usually takes a few seconds."
            />
          </div>
        )}
        <AnswerComposer
          key={current?._id || questions.length}
          voiceEnabled={interview.voiceEnabled}
          disabled={submitting}
          onSubmitText={handleSubmitText}
          onSubmitAudio={handleSubmitAudio}
        />
      </section>

      {answered.length > 0 && (
        <section aria-labelledby="previous-heading">
          <h2 id="previous-heading" className="mb-3 text-base font-semibold">
            Previous answers
          </h2>
          <div className="space-y-3">
            {[...answered].reverse().map((q, index) => (
              <AnsweredQuestion key={q._id || q.questionNumber} question={q} defaultOpen={index === 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}