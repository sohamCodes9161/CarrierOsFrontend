import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BulletList from '../../components/common/BulletList.jsx';
import ChipList from '../../components/common/ChipList.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CopyButton from '../../components/ui/CopyButton.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ScoreRing from '../../components/ui/ScoreRing.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { resumeApi } from '../../services/api/index.js';
import { formatDateTime } from '../../utils/format.js';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: analysis, error, loading, reload } = useApi(() => resumeApi.getAnalysis(id), [id]);
  const remove = useAction(resumeApi.deleteResume);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useDocumentTitle(analysis?.resume?.originalFilename ? `${analysis.resume.originalFilename} · Resume` : 'Resume analysis');

  if (loading) return <PageSkeleton label="Loading analysis…" />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/resume" backLabel="Back to resumes" />;
  if (!analysis) return null;

  const resume = analysis.resume;
  const hasMatch = analysis.jobMatchScore >= 0;

  async function handleDelete() {
    const result = await remove.run(resume?._id);
    if (result.ok) {
      toast.success('Resume deleted.');
      navigate('/resume', { replace: true });
    } else {
      toast.error(result.error);
      setConfirmOpen(false);
    }
  }

  return (
    <div>
      <PageHeader
        backTo="/resume"
        backLabel="All resumes"
        title={resume?.originalFilename || 'Resume analysis'}
        description={`Analyzed ${formatDateTime(analysis.createdAt)}`}
        actions={
          <>
            {resume?.cloudinaryUrl && (
              <Button as="a" href={resume.cloudinaryUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                <Icon name="external" className="h-4 w-4" />
                Open original
              </Button>
            )}
            {resume?._id && (
              <Button variant="danger-outline" size="sm" onClick={() => setConfirmOpen(true)}>
                <Icon name="trash" className="h-4 w-4" />
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface flex items-center gap-4 p-5">
          <ScoreRing value={analysis.atsScore} size={80} label="ATS score" />
          <div>
            <p className="eyebrow">ATS score</p>
            <p className="mt-1 text-sm text-muted">How well applicant tracking systems can read and rank this resume.</p>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          {hasMatch ? (
            <>
              <ScoreRing value={analysis.jobMatchScore} size={80} label="Job match score" />
              <div>
                <p className="eyebrow">Job match</p>
                <p className="mt-1 text-sm text-muted">How closely your resume matches the job description you provided.</p>
              </div>
            </>
          ) : (
            <div>
              <p className="eyebrow">Job match</p>
              <p className="mt-1 text-sm text-muted">No job description was provided. Add one on your next analysis to see a match score.</p>
            </div>
          )}
        </div>
        <div className="surface p-5">
          <p className="eyebrow">Summary</p>
          <p className="mt-1 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard title="Strengths">
          <BulletList items={analysis.strengths} tone="success" empty="No strengths were listed." />
        </SectionCard>
        <SectionCard title="Areas to improve">
          <BulletList items={analysis.weaknesses} tone="warning" empty="No weaknesses were listed." />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {hasMatch && (
          <SectionCard title="Missing keywords" description="Terms from the job description that your resume doesn’t mention.">
            <ChipList items={analysis.missingKeywords} tone="warning" empty="No missing keywords. Nice." />
          </SectionCard>
        )}
        <SectionCard title="Skills found" className={hasMatch ? '' : 'md:col-span-2'}>
          <ChipList items={analysis.extractedSkills} tone="primary" empty="No skills were extracted." />
        </SectionCard>
      </div>

      {analysis.sectionFeedback?.length > 0 && (
        <SectionCard title="Section feedback" className="mt-6" bodyClassName="space-y-2">
          {analysis.sectionFeedback.map((item, index) => (
            <div key={`${item.section}-${index}`} className="collapse collapse-arrow rounded-btn border border-base-300">
              <input type="checkbox" aria-label={`Toggle feedback for ${item.section}`} defaultChecked={index === 0} />
              <div className="collapse-title text-sm font-medium">{item.section}</div>
              <div className="collapse-content text-sm leading-relaxed text-muted">
                <p>{item.feedback}</p>
              </div>
            </div>
          ))}
        </SectionCard>
      )}

      {analysis.suggestedBulletImprovements?.length > 0 && (
        <SectionCard title="Suggested bullet rewrites" description="Review each suggestion. Only use what’s accurate for you." className="mt-6" bodyClassName="space-y-4">
          {analysis.suggestedBulletImprovements.map((item, index) => (
            <div key={index} className="rounded-btn border border-base-300 p-4">
              <p className="eyebrow">Original</p>
              <p className="mt-1 text-sm text-muted">{item.original}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="eyebrow text-success">Improved</p>
                <CopyButton text={item.improved} />
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed">{item.improved}</p>
              {item.reason && <p className="mt-2 text-xs text-muted">Why: {item.reason}</p>}
            </div>
          ))}
        </SectionCard>
      )}

      {analysis.jobDescription && (
        <div className="collapse collapse-arrow surface mt-6">
          <input type="checkbox" aria-label="Toggle job description" />
          <div className="collapse-title text-sm font-semibold">Job description used</div>
          <div className="collapse-content">
            <p className="whitespace-pre-line text-sm text-muted">{analysis.jobDescription}</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Delete this resume?"
        description="This resume and all analyses of it will be permanently deleted."
        confirmLabel="Delete"
        loading={remove.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
