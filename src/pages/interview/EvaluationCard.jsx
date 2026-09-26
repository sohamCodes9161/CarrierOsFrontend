import BulletList from '../../components/common/BulletList.jsx';
import ChipList from '../../components/common/ChipList.jsx';
import { scoreTone } from '../../utils/format.js';

const BAR = { success: 'progress-success', warning: 'progress-warning', error: 'progress-error' };

function ScoreBar({ label, value }) {
  const score = Number.isFinite(value) ? value : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted">{score}/100</span>
      </div>
      <progress className={`progress h-2 w-full ${BAR[scoreTone(score)]}`} value={score} max="100" aria-label={`${label} score`} />
    </div>
  );
}

/** Feedback for a single answered question. */
export default function EvaluationCard({ evaluation }) {
  if (!evaluation) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ScoreBar label="Correctness" value={evaluation.correctnessScore} />
        <ScoreBar label="Communication" value={evaluation.communicationScore} />
      </div>
      {evaluation.feedback && <p className="text-sm leading-relaxed">{evaluation.feedback}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {evaluation.strengths?.length > 0 && (
          <div>
            <p className="eyebrow mb-2">What went well</p>
            <BulletList items={evaluation.strengths} tone="success" />
          </div>
        )}
        {evaluation.weaknesses?.length > 0 && (
          <div>
            <p className="eyebrow mb-2">To improve</p>
            <BulletList items={evaluation.weaknesses} tone="warning" />
          </div>
        )}
      </div>
      {evaluation.missingConcepts?.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Concepts to review</p>
          <ChipList items={evaluation.missingConcepts} tone="warning" />
        </div>
      )}
    </div>
  );
}
