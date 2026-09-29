import { Link } from 'react-router-dom';

import BulletList from '../../components/common/BulletList.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import AudioPlayer from '../../components/ui/AudioPlayer.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ScoreRing from '../../components/ui/ScoreRing.jsx';
import AnsweredQuestion from './AnsweredQuestion.jsx';

export default function InterviewReport({ interview, audio }) {
  const report = interview.finalReport;
  const answered = (interview.questions || []).filter((q) => q.answerText !== null && q.answerText !== undefined);

  return (
    <div className="space-y-6">
      {report ? (
        <>
          <div className="surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <ScoreRing value={report.overallScore} size={96} label="Overall score" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Final report</h2>
                <Badge tone={report.readyForRole ? 'success' : 'warning'}>
                  {report.readyForRole ? 'Ready for this role' : 'Not ready yet'}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{report.summary}</p>
              {interview.voiceEnabled && (
                <div className="mt-3">
                  <AudioPlayer
                    url={report.audioUrl}
                    preparing={audio.pending.report && audio.polling}
                    unavailable={audio.pending.report && audio.gaveUp}
                    label="Spoken summary of your report"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SectionCard title="Strengths">
              <BulletList items={report.strengths} tone="success" />
            </SectionCard>
            <SectionCard title="Weaknesses">
              <BulletList items={report.weaknesses} tone="warning" />
            </SectionCard>
          </div>

          <SectionCard title="Recommendation">
            <p className="text-sm leading-relaxed">{report.recommendation}</p>
          </SectionCard>
        </>
      ) : (
        <div className="surface p-5 text-sm text-muted">This interview is complete, but no report is available.</div>
      )}

      {answered.length > 0 && (
        <section aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="mb-3 text-base font-semibold">
            Question breakdown
          </h2>
          <div className="space-y-3">
            {answered.map((q) => (
              <AnsweredQuestion key={q._id || q.questionNumber} question={q} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Button as={Link} to="/interviews/new">
          <Icon name="plus" className="h-4 w-4" />
          Start another interview
        </Button>
        <Button as={Link} to="/career-profile" variant="outline">
          Update career profile
        </Button>
      </div>
    </div>
  );
}
