import { useState } from 'react';
import { useParams } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import AudioPlayer from '../../components/ui/AudioPlayer.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useAudioPolling } from '../../hooks/useAudioPolling.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { interviewApi } from '../../services/api/index.js';
import { humanize } from '../../utils/format.js';
import AnsweredQuestion from './AnsweredQuestion.jsx';
import AnswerComposer from './AnswerComposer.jsx';
import InterviewReport from './InterviewReport.jsx';

export default function InterviewSession() {
  const { id } = useParams();
  const toast = useToast();
  const { data: interview, error, loading, reload, setData } = useApi(() => interviewApi.getInterview(id), [id]);
  const audio = useAudioPolling(interview, id, setData);
  const sendText = useAction((text) => interviewApi.submitAnswer(id, text));
  const sendAudio = useAction((file) => interviewApi.submitAudioAnswer(id, file));
  // The welcome message must finish before the first question's audio starts, so the
  // question player's autoplay is held back until the greeting reports itself done
  // (or there's no greeting to wait for in the first place).
  const [greetingPlayed, setGreetingPlayed] = useState(false);

  useDocumentTitle(interview ? `${interview.role} interview` : 'Interview');

  if (loading) return <PageSkeleton label="Loading interview…" />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/interviews" backLabel="Back to interviews" />;
  if (!interview) return null;

  const questions = interview.questions || [];
  const completed = interview.status === 'completed';
  const current = questions[questions.length - 1];
  const expectsGreeting = interview.voiceEnabled && questions.length === 1;
  const greetingSettled = greetingPlayed || (audio.pending.greeting && audio.gaveUp);
  const questionAutoPlay = !expectsGreeting || greetingSettled;
  const answered = questions.filter((q) => q.answerText !== null && q.answerText !== undefined);
  const submitting = sendText.loading || sendAudio.loading;
  const submitError = sendText.error || sendAudio.error;

  async function handleSubmitText(text) {
    const result = await sendText.run(text);
    if (result.ok) {
      setData(result.data);
      toast.success(result.data.status === 'completed' ? 'Interview complete. Your report is ready.' : 'Answer recorded.');
    }
  }

  async function handleSubmitAudio(file) {
    const result = await sendAudio.run(file);
    if (result.ok) {
      setData(result.data.interview);
      toast.success(result.data.interview.status === 'completed' ? 'Interview complete. Your report is ready.' : 'Answer recorded.');
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
        <InterviewReport interview={interview} audio={audio} />
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

      {expectsGreeting && (interview.greetingAudioUrl || audio.pending.greeting) && (
        <div className="surface mb-4 p-4">
          <p className="eyebrow mb-2">Welcome message</p>
          <AudioPlayer
            url={interview.greetingAudioUrl}
            preparing={audio.pending.greeting && audio.polling}
            unavailable={audio.pending.greeting && audio.gaveUp}
            label="Interview welcome message"
            onEnded={() => setGreetingPlayed(true)}
          />
        </div>
      )}

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
              <AudioPlayer
                url={current.questionAudioUrl}
                preparing={audio.pending.question && audio.polling}
                unavailable={audio.pending.question && audio.gaveUp}
                label="Question audio"
                autoPlay={questionAutoPlay}
              />
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
