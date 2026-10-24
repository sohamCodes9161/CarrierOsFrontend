import { useEffect, useRef } from 'react';
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
export function playHumanLikeAudio(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // 1. Exact matches for the most human-like cloud voices across browsers
  const preferredVoiceNames = [
    "Microsoft Aria Online (Natural) - English (United States)", // Edge (Best)
    "Microsoft Guy Online (Natural) - English (United States)",  // Edge
    "Google US English",                                         // Chrome
    "Google UK English Female",                                  // Chrome
    "Samantha",                                                  // macOS standard
    "Daniel"                                                     // macOS UK
  ];

  let bestVoice = null;
  for (const name of preferredVoiceNames) {
    bestVoice = voices.find((v) => v.name === name);
    if (bestVoice) break;
  }

  // 2. Fallback to any voice labeled "Natural" or "Premium"
  if (!bestVoice) {
    bestVoice = voices.find((v) => v.name.includes('Natural') || v.name.includes('Premium'));
  }

  // 3. Final fallback to any English voice
  if (!bestVoice) {
    bestVoice = voices.find((v) => v.lang.startsWith('en'));
  }

  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  // Dropping the rate to 0.9 makes it sound much more conversational and less rushed
  utterance.rate = 0.9; 
  utterance.pitch = 1.0; // Altering pitch usually makes it sound MORE robotic, keep at 1

  window.speechSynthesis.speak(utterance);
}

// Force Chrome to load cloud voices on mount
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

  useDocumentTitle(interview ? `${interview.role} interview` : 'Interview');

  const questions = interview?.questions || [];
  const completed = interview?.status === 'completed';
  const current = questions[questions.length - 1];

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
        
        playHumanLikeAudio(textToSpeak);
      }
    }
  }, [interview?.voiceEnabled, completed, current, interview?.role, questions.length]);

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
    const result = await sendText.run(text);
    if (result.ok) {
      // Safely extract the interview object whether it is nested or returned directly
      const updatedInterview = result.data.interview || result.data;
      
      setData(updatedInterview);
      toast.success(updatedInterview.status === 'completed' ? 'Interview complete. Your report is ready.' : 'Answer recorded.');
    }
  }

  async function handleSubmitAudio(file) {
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="current-question" className="eyebrow">
              Question {current.questionNumber}
            </h2>
            <Badge tone="neutral">{current.focusArea}</Badge>
          </div>
          <p className="mt-3 text-lg leading-relaxed">{current.questionText}</p>
          
          {interview.voiceEnabled && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => playHumanLikeAudio(current.questionText)}
              >
                🔊 Listen Again
              </Button>
            </div>
          )}
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