import Badge from '../../components/ui/Badge.jsx';
import EvaluationCard from './EvaluationCard.jsx';

/** Collapsible question / answer / feedback block. */
export default function AnsweredQuestion({ question, defaultOpen = false }) {
  return (
    <div className="collapse collapse-arrow surface">
      <input type="checkbox" defaultChecked={defaultOpen} aria-label={`Toggle question ${question.questionNumber}`} />
      <div className="collapse-title pr-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Question {question.questionNumber}</span>
          <Badge tone="neutral">{question.focusArea}</Badge>
          {question.evaluation && (
            <span className="text-xs text-muted">
              Correctness {question.evaluation.correctnessScore} · Communication {question.evaluation.communicationScore}
            </span>
          )}
        </div>
      </div>
      <div className="collapse-content space-y-4">
        <div>
          <p className="eyebrow">Question</p>
          <p className="mt-1 text-sm leading-relaxed">{question.questionText}</p>
        </div>
        <div>
          <p className="eyebrow">Your answer</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{question.answerText}</p>
        </div>
        <div className="border-t border-base-300 pt-4">
          <EvaluationCard evaluation={question.evaluation} />
        </div>
      </div>
    </div>
  );
}
