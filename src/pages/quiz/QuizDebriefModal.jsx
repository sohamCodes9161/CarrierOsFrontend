import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function QuizDebriefModal({ attempt, isOpen, onClose }) {
  if (!isOpen || !attempt) return null;

  const {
    topic = 'Quiz Assessment',
    score = 0,
    accuracyPercentage = 0,
    totalTimeSpentSeconds = 0,
    timeBonusMultiplier = 1.0,
    totalQuestions = 0,
    userResponses = [],
    aiDebrief = {},
  } = attempt;

  const failedList = aiDebrief.failedQuestionBreakdown || [];
  const correctResponsesCount = userResponses.filter((r) => r.isCorrect).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-base-300 bg-surface-3 shadow-2xl overflow-hidden">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-base-300 bg-surface-3 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Attempt Details & AI Review</h3>
            <p className="text-xs text-muted">Topic: <strong className="text-white">{topic}</strong></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-1 text-muted hover:bg-surface-2 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Metric Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-base-300 bg-surface-2 p-5">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary bg-surface-1 font-black shadow-pop">
              <span className="text-xl text-white">{accuracyPercentage}%</span>
              <span className="text-[9px] uppercase tracking-wider text-muted">Accuracy</span>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-2xl font-black text-white">{score} Points</span>
                {timeBonusMultiplier > 1.0 && (
                  <Badge variant="success" className="text-xs">
                    ⚡ {timeBonusMultiplier}x Speed Bonus Applied!
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted">
                Correct Answers: <strong className="text-success">{correctResponsesCount}</strong> / {totalQuestions || userResponses.length || 5} • Time Spent:{' '}
                <strong className="text-white">{totalTimeSpentSeconds}s</strong>
              </p>

              {aiDebrief.speedAnalysis && (
                <p className="text-xs italic text-muted-foreground">{aiDebrief.speedAnalysis}</p>
              )}
            </div>
          </div>

          {/* AI Narrative Summary */}
          {aiDebrief.summary && (
            <div className="rounded-xl border border-base-300 bg-surface-1 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">AI Debrief Summary</h4>
              <p className="mt-1 text-sm font-medium text-white">{aiDebrief.summary}</p>
            </div>
          )}

          {/* Strengths & Growth Areas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {aiDebrief.strengths?.length > 0 && (
              <div className="space-y-2 rounded-xl border border-success/30 bg-success/5 p-4">
                <h4 className="text-xs font-bold uppercase text-success">Mastered Strengths</h4>
                <div className="flex flex-col gap-1.5">
                  {aiDebrief.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-start gap-1.5 rounded-lg bg-success/15 px-2.5 py-1.5 text-xs font-medium text-success leading-relaxed"
                    >
                      <span className="shrink-0 font-bold">✓</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiDebrief.growthAreas?.length > 0 && (
              <div className="space-y-2 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <h4 className="text-xs font-bold uppercase text-warning">Recommended Focus Areas</h4>
                <div className="flex flex-col gap-1.5">
                  {aiDebrief.growthAreas.map((area, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-start gap-1.5 rounded-lg bg-warning/15 px-2.5 py-1.5 text-xs font-medium text-warning leading-relaxed"
                    >
                      <span className="shrink-0 font-bold">▲</span>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Missed Questions Breakdown */}
          {failedList.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Missed Question Analysis ({failedList.length})</h4>
              <div className="space-y-3">
                {failedList.map((item, idx) => (
                  <div key={idx} className="space-y-2 rounded-xl border border-base-300 bg-surface-1 p-4 text-xs">
                    <p className="font-semibold text-white">{item.questionText}</p>

                    <div className="grid gap-1">
                      <p className="text-error">
                        <strong className="font-bold">❌ Your Answer:</strong> {item.yourAnswer}
                      </p>
                      <p className="text-success">
                        <strong className="font-bold">✅ Correct Answer:</strong> {item.correctAnswer}
                      </p>
                    </div>

                    {item.explanation && (
                      <div className="mt-2 rounded-lg bg-surface-2 p-2.5 text-muted">
                        <strong className="text-white">💡 AI Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-success/10 border border-success/30 p-4 text-center text-xs text-success font-semibold">
              🎉 Perfect Score! All questions were answered correctly.
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-base-300 bg-surface-3 p-4">
          <Button onClick={onClose} className="w-full rounded-xl">
            Close Review
          </Button>
        </div>

      </div>
    </div>
  );
}