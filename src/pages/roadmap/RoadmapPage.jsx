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
      toast.success('Roadmap generated successfully.');
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
    const exists = roadmaps.some((r) => normalizeRole(r.targetRole) === normalizeRole(trimmed));
    if (exists) setConfirmReplace(true);
    else runGenerate();
  }

  return (
    <div className="pb-12">
      <PageHeader
        title="Learning Roadmaps"
        description="A prioritized, ordered curriculum tailored to your target role, skipping the skills you already know."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <SectionCard title="Generate new roadmap" className="self-start lg:col-span-2 shadow-sm border-primary/20 bg-surface-2/50">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                placeholder="e.g. Frontend Engineer, DevOps"
                maxLength={100}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (roleError) setRoleError('');
                }}
                disabled={generate.loading}
              />
            </FormField>

            <FormField id="targetSkills" label="Specific skills to include (optional)" hint="Press Enter after each skill. Up to 30.">
              <TagInput
                id="targetSkills"
                value={skills}
                onChange={setSkills}
                max={30}
                placeholder="e.g. React, Kubernetes"
                disabled={generate.loading}
                aria-describedby="targetSkills-hint"
              />
            </FormField>

            <div className="rounded-lg bg-info/5 border border-info/20 p-3 flex gap-3 items-start">
              <Icon name="info" className="h-4 w-4 text-info mt-0.5 shrink-0" />
              <p className="text-xs text-info/90 leading-relaxed">
                We use your Career Profile to ensure the generated roadmap skips skills you already possess, focusing only on your skill gaps.
              </p>
            </div>

            {generate.loading ? (
              <AiWaitNotice title="Curating your curriculum…" description="Analyzing your profile and structuring topics. This takes 20–60 seconds." />
            ) : (
              <Button type="submit" className="w-full h-11 text-base">
                <Icon name="sparkles" className="h-4 w-4" />
                Generate Roadmap
              </Button>
            )}
          </form>
        </SectionCard>

        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold text-white">Your Roadmaps</h2>
          {list.loading ? (
            <SkeletonRows rows={3} />
          ) : list.error ? (
            <ErrorState error={list.error} onRetry={() => list.reload()} />
          ) : roadmaps.length === 0 ? (
            <div className="surface rounded-2xl border-dashed border-base-300 p-8">
              <EmptyState icon="map" title="No roadmaps yet" description="Generate a learning path for the role you’re working toward to get started." />
            </div>
          ) : (
            <ul className="space-y-4">
              {roadmaps.map((r) => (
                <li key={r._id}>
                  <Link 
                    to={`/roadmap/${r._id}`} 
                    className="group flex items-center gap-5 rounded-2xl border border-base-300 bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-base-200/50 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content shadow-sm">
                      <Icon name="map" className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold text-white group-hover:text-primary transition-colors">{r.targetRole}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-3">
                        <Badge tone="info" className="bg-info/10 text-info border-info/20">
                          <Icon name="clock" className="h-3 w-3 mr-1" />
                          ~{formatDurationDays(r.totalEstimatedDurationDays)}
                        </Badge>
                        <span className="text-xs font-medium text-muted">Updated {formatDate(r.updatedAt || r.generatedAt)}</span>
                      </span>
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-200 transition-colors group-hover:bg-primary/20">
                      <Icon name="arrow-right" className="h-4 w-4 text-muted group-hover:text-primary" />
                    </div>
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
        description={`You already have a roadmap for “${role.trim()}”. Generating it again will replace the existing one and reset your learning progress.`}
        confirmLabel="Replace and generate"
        danger
        onConfirm={runGenerate}
        onCancel={() => setConfirmReplace(false)}
      />
    </div>
  );
}