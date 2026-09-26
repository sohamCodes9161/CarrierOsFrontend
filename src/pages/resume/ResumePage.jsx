import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FileDropzone from '../../components/forms/FileDropzone.jsx';
import FormField, { fieldProps, textareaClass } from '../../components/forms/FormField.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import ScoreRing from '../../components/ui/ScoreRing.jsx';
import { SkeletonRows } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { resumeApi } from '../../services/api/index.js';
import { LIMITS } from '../../utils/constants.js';
import { formatDate } from '../../utils/format.js';

const ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function validateFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(ext)) return 'Only PDF, DOC, and DOCX files are allowed.';
  if (file.size > LIMITS.resumeBytes) return 'File is too large. The maximum size is 5 MB.';
  return '';
}

export default function ResumePage() {
  useDocumentTitle('Resume analyzer');
  const navigate = useNavigate();
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const history = useApi(() => resumeApi.listAnalyses(), []);
  const analyze = useAction(resumeApi.analyzeResume);
  const remove = useAction(resumeApi.deleteResume);

  function handleFile(next) {
    if (!next) {
      setFile(null);
      setFileError('');
      return;
    }
    const problem = validateFile(next);
    setFileError(problem);
    setFile(problem ? null : next);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setFileError('Choose a resume to analyze.');
      return;
    }
    const result = await analyze.run({ file, jobDescription });
    if (result.ok) {
      toast.success('Resume analyzed.');
      navigate(`/resume/${result.data.analysis._id}`);
    }
  }

  async function confirmDelete() {
    const resumeId = toDelete?.resume?._id;
    if (!resumeId) return;
    const result = await remove.run(resumeId);
    if (result.ok) {
      toast.success('Resume deleted.');
      setToDelete(null);
      history.reload({ silent: true });
    } else {
      toast.error(result.error);
      setToDelete(null);
    }
  }

  const analyses = history.data || [];

  return (
    <div>
      <PageHeader
        title="Resume analyzer"
        description="Upload your resume to get an ATS score, keyword gaps, and suggested rewrites. Add a job description to see how well you match."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="New analysis" className="self-start lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <ErrorAlert error={analyze.error} />

            <div>
              <span className="mb-1.5 block text-sm font-medium">
                Resume file
                <span className="ml-0.5 text-error" aria-hidden="true">
                  *
                </span>
              </span>
              <FileDropzone
                id="resume-file"
                file={file}
                onFile={handleFile}
                accept={ACCEPT}
                hint="PDF, DOC, or DOCX · up to 5 MB"
                prompt="Drop your resume here or click to browse"
                error={fileError}
                disabled={analyze.loading}
              />
            </div>

            <FormField
              id="job-description"
              label="Job description (optional)"
              hint="Paste a job posting to get a match score and missing keywords."
              counter={`${jobDescription.length}/${LIMITS.jobDescription}`}
            >
              <textarea
                {...fieldProps('job-description', '', true)}
                rows={6}
                maxLength={LIMITS.jobDescription}
                className={textareaClass('')}
                placeholder="Paste the job description here…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={analyze.loading}
              />
            </FormField>

            {analyze.loading ? (
              <AiWaitNotice
                title="Analyzing your resume…"
                description="This usually takes 15–40 seconds. Please keep this page open."
              />
            ) : (
              <Button type="submit" className="w-full">
                <Icon name="sparkles" className="h-4 w-4" />
                Analyze resume
              </Button>
            )}
          </form>
        </SectionCard>

        <div className="lg:col-span-3">
          <h2 className="mb-3 text-base font-semibold">Past analyses</h2>

          {history.loading ? (
            <SkeletonRows rows={3} />
          ) : history.error ? (
            <ErrorState error={history.error} onRetry={() => history.reload()} />
          ) : analyses.length === 0 ? (
            <div className="surface">
              <EmptyState
                icon="document"
                title="No analyses yet"
                description="Upload a resume on the left and your results will appear here."
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {analyses.map((analysis) => (
                <li key={analysis._id} className="surface lift flex items-center gap-4 p-4">
                  <ScoreRing value={analysis.atsScore} size={56} label="ATS score" />
                  <Link to={`/resume/${analysis._id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{analysis.resume?.originalFilename || 'Resume'}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{analysis.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{formatDate(analysis.createdAt)}</Badge>
                      {analysis.jobMatchScore >= 0 && <Badge tone="primary">Job match {analysis.jobMatchScore}%</Badge>}
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square text-muted hover:text-error"
                    onClick={() => setToDelete(analysis)}
                    disabled={!analysis.resume?._id}
                    aria-label={`Delete ${analysis.resume?.originalFilename || 'resume'}`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title="Delete this resume?"
        description={`“${toDelete?.resume?.originalFilename || 'This resume'}” and all analyses of it will be permanently deleted.`}
        confirmLabel="Delete"
        loading={remove.loading}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
