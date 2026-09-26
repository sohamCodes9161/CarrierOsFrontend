import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField, { fieldProps, inputClass } from '../../components/forms/FormField.jsx';
import TagInput from '../../components/forms/TagInput.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { SkeletonRows } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { roadmapApi } from '../../services/api/index.js';
import { formatDate, formatDurationDays } from '../../utils/format.js';

const normalizeRole = (role) => role.trim().toLowerCase().replace(/\s+/g, ' ');

export default function RoadmapPage() {
  useDocumentTitle('Learning roadmap');
  const navigate = useNavigate();
  const toast = useToast();

  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [roleError, setRoleError] = useState('');
  const [confirmReplace, setConfirmReplace] = useState(false);

  const list = useApi(() => roadmapApi.listRoadmaps(), []);
  const generate = useAction(roadmapApi.generateRoadmap);

  const roadmaps = list.data || [];
  const needsProfile = generate.error?.status === 400 && /career profile/i.test(generate.error.message);

  async function runGenerate() {
    setConfirmReplace(false);
    const result = await generate.run({ targetRole: role.trim(), targetSkills: skills });
    if (result.ok) {
      toast.success('Roadmap generated.');
      navigate(`/roadmap/${result.data._id}`);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = role.trim();
    if (trimmed.length < 2) {
      setRoleError('Enter the role you’re aiming for (at least 2 characters).');
      return;
    }
    if (trimmed.length > 100) {
      setRoleError('Role must be 100 characters or fewer.');
      return;
    }
    setRoleError('');
    // One roadmap exists per target role: generating again replaces it (and its progress).
    const exists = roadmaps.some((r) => normalizeRole(r.targetRole) === normalizeRole(trimmed));
    if (exists) setConfirmReplace(true);
    else runGenerate();
  }

  return (
    <div>
      <PageHeader
        title="Learning roadmap"
        description="A prioritized, ordered plan for a target role that skips what you already know."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="Generate a roadmap" className="self-start lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <ErrorAlert error={generate.error}>
              {needsProfile && (
                <Button as={Link} to="/career-profile" variant="outline" size="xs" className="mt-2 bg-base-100">
                  Go to career profile
                </Button>
              )}
            </ErrorAlert>

            <FormField id="targetRole" label="Target role" required error={roleError}>
              <input
                {...fieldProps('targetRole', roleError)}
                type="text"
                className={inputClass(roleError)}
                placeholder="e.g. Full-stack Developer"
                maxLength={100}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (roleError) setRoleError('');
                }}
                disabled={generate.loading}
              />
            </FormField>

            <FormField id="targetSkills" label="Skills to include (optional)" hint="Press Enter after each skill. Up to 30.">
              <TagInput
                id="targetSkills"
                value={skills}
                onChange={setSkills}
                max={30}
                placeholder="e.g. Docker, GraphQL"
                disabled={generate.loading}
                aria-describedby="targetSkills-hint"
              />
            </FormField>

            <p className="text-xs text-muted">Requires a career profile so the roadmap can skip skills you already have.</p>

            {generate.loading ? (
              <AiWaitNotice title="Building your roadmap…" description="This usually takes 20–60 seconds." />
            ) : (
              <Button type="submit" className="w-full">
                <Icon name="sparkles" className="h-4 w-4" />
                Generate roadmap
              </Button>
            )}
          </form>
        </SectionCard>

        <div className="lg:col-span-3">
          <h2 className="mb-3 text-base font-semibold">Your roadmaps</h2>
          {list.loading ? (
            <SkeletonRows rows={3} />
          ) : list.error ? (
            <ErrorState error={list.error} onRetry={() => list.reload()} />
          ) : roadmaps.length === 0 ? (
            <div className="surface">
              <EmptyState icon="map" title="No roadmaps yet" description="Generate one for the role you’re working toward." />
            </div>
          ) : (
            <ul className="space-y-3">
              {roadmaps.map((r) => (
                <li key={r._id}>
                  <Link to={`/roadmap/${r._id}`} className="surface lift flex items-center gap-4 p-4">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon name="map" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.targetRole}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">~{formatDurationDays(r.totalEstimatedDurationDays)}</Badge>
                        <span className="text-xs text-muted">Updated {formatDate(r.updatedAt || r.generatedAt)}</span>
                      </span>
                    </span>
                    <Icon name="arrow-right" className="h-4 w-4 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReplace}
        title="Replace existing roadmap?"
        description={`You already have a roadmap for “${role.trim()}”. Generating it again replaces it and resets your progress.`}
        confirmLabel="Replace and generate"
        danger
        onConfirm={runGenerate}
        onCancel={() => setConfirmReplace(false)}
      />
    </div>
  );
}
