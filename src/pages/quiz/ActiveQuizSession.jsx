import { useState, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ActiveQuizSession({ quiz, onSubmit, submitting }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(() =>
    quiz.questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: -1,
      timeSpentSeconds: 0,
    }))
  );

  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimitSeconds || 300);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const questionStartTimeRef = useRef(Date.now());

  // Main countdown timer & auto-submit
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function recordQuestionTime() {
    const now = Date.now();
    const duration = Math.round((now - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = now;

    setAnswers((prev) =>
      prev.map((a, idx) =>
        idx === currentIdx ? { ...a, timeSpentSeconds: a.timeSpentSeconds + duration } : a
      )
    );
  }

  function handleSelectOption(optIdx) {
    recordQuestionTime();
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === currentIdx ? { ...a, selectedOptionIndex: optIdx } : a))
    );
  }

  function handleNext() {
    recordQuestionTime();
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  }

  function handlePrev() {
    recordQuestionTime();
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  }

  function handleAutoSubmit() {
    recordQuestionTime();
    onSubmit({
      quizId: quiz._id,
      totalTimeSpentSeconds: totalTimeSpent,
      answers,
    });
  }

  function handleManualSubmit() {
    recordQuestionTime();
    onSubmit({
      quizId: quiz._id,
      totalTimeSpentSeconds: totalTimeSpent,
      answers,
    });
  }

  const currentQ = quiz.questions[currentIdx];
  const currentAnswer = answers[currentIdx]?.selectedOptionIndex;
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Session Progress Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-base-300 bg-surface-2 p-4">
        <div>
          <h3 className="font-bold text-white">{quiz.topic}</h3>
          <p className="text-xs text-muted">
            Question {currentIdx + 1} of {quiz.questions.length} • Difficulty: {currentQ.difficulty || quiz.difficultyLevel}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`font-mono text-xl font-bold ${timeRemaining < 30 ? 'text-error animate-pulse' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </span>
            <p className="text-[10px] text-muted">Time Remaining</p>
          </div>

          <Button
            size="sm"
            variant="error"
            loading={submitting}
            onClick={handleManualSubmit}
            className="rounded-xl"
          >
            End & Submit
          </Button>
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-semibold text-white">{currentQ.questionText}</h4>
          <Badge variant="ghost" className="capitalize text-xs">
            {currentQ.difficulty || 'standard'}
          </Badge>
        </div>

        <div className="grid gap-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`btn justify-start text-left rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'btn-primary shadow-pop'
                    : 'btn-ghost border border-base-300 bg-surface-1 hover:bg-surface-3 text-white'
                }`}
              >
                <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 text-sm font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-base-300/50">
          <Button
            variant="ghost"
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="rounded-xl"
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  recordQuestionTime();
                  setCurrentIdx(idx);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  idx === currentIdx
                    ? 'bg-primary w-6'
                    : answers[idx]?.selectedOptionIndex >= 0
                    ? 'bg-success'
                    : 'bg-base-300'
                }`}
              />
            ))}
          </div>

          {currentIdx === quiz.questions.length - 1 ? (
            <Button loading={submitting} onClick={handleManualSubmit} className="rounded-xl">
              Finish Quiz
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-xl">
              Next Question
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}