import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField, { fieldProps, inputClass, selectClass } from '../../components/forms/FormField.jsx';
import TagInput from '../../components/forms/TagInput.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { interviewApi } from '../../services/api/index.js';
import { DIFFICULTIES, INTERVIEW_TYPES } from '../../utils/constants.js';

export default function InterviewNew() {
  useDocumentTitle('New interview');
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({
    role: '',
    interviewType: 'technical',
    difficulty: 'medium',
    targetSkills: [],
    totalQuestions: 5,
    voiceEnabled: false,
  });
  const [errors, setErrors] = useState({});
  const start = useAction(interviewApi.startInterview);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const role = values.role.trim();
    const count = Number(values.totalQuestions);
    return {
      role: role.length < 2 ? 'Enter the role you’re interviewing for (at least 2 characters).' : role.length > 100 ? 'Role must be 100 characters or fewer.' : '',
      totalQuestions: !Number.isInteger(count) || count < 1 || count > 20 ? 'Choose a whole number from 1 to 20.' : '',
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const result = await start.run({
      role: values.role.trim(),
      difficulty: values.difficulty,
      interviewType: values.interviewType,
      targetSkills: values.targetSkills,
      totalQuestions: Number(values.totalQuestions),
      voiceEnabled: values.voiceEnabled,
    });
    if (result.ok) {
      toast.success('Interview ready. Good luck!');
      navigate(`/interviews/${result.data._id}`, { replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        backTo="/interviews"
        backLabel="All interviews"
        title="New mock interview"
        description="Questions adapt to your previous answers. You’ll get feedback after each one and a full report at the end."
      />

      <SectionCard>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <ErrorAlert error={start.error} />

          <FormField id="role" label="Role" required error={errors.role} hint="Any role works, e.g. “Python Developer” or “Frontend Engineer”.">
            <input
              {...fieldProps('role', errors.role, true)}
              type="text"
              className={inputClass(errors.role)}
              placeholder="e.g. Backend Developer"
              maxLength={100}
              value={values.role}
              onChange={(e) => set('role', e.target.value)}
              disabled={start.loading}
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="interviewType" label="Interview type">
              <select
                id="interviewType"
                className={selectClass('')}
                value={values.interviewType}
                onChange={(e) => set('interviewType', e.target.value)}
                disabled={start.loading}
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="totalQuestions" label="Number of questions" error={errors.totalQuestions}>
              <input
                {...fieldProps('totalQuestions', errors.totalQuestions)}
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                className={inputClass(errors.totalQuestions)}
                value={values.totalQuestions}
                onChange={(e) => set('totalQuestions', e.target.value)}
                disabled={start.loading}
              />
            </FormField>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Difficulty</legend>
            <div className="join w-full" role="radiogroup" aria-label="Difficulty">
              {DIFFICULTIES.map((d) => (
                <input
                  key={d.value}
                  type="radio"
                  name="difficulty"
                  aria-label={d.label}
                  className="btn join-item flex-1 checked:!border-primary checked:!bg-primary checked:!text-primary-content"
                  checked={values.difficulty === d.value}
                  onChange={() => set('difficulty', d.value)}
                  disabled={start.loading}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">{DIFFICULTIES.find((d) => d.value === values.difficulty)?.hint}</p>
          </fieldset>

          <FormField id="targetSkills" label="Focus skills (optional)" hint="Press Enter after each skill. Up to 15.">
            <TagInput
              id="targetSkills"
              value={values.targetSkills}
              onChange={(skills) => set('targetSkills', skills)}
              max={15}
              placeholder="e.g. Node.js, PostgreSQL"
              disabled={start.loading}
              aria-describedby="targetSkills-hint"
            />
          </FormField>

          <label className="flex cursor-pointer items-start gap-3 rounded-btn border border-base-300 p-3">
            <input
              type="checkbox"
              className="toggle toggle-primary mt-0.5"
              checked={values.voiceEnabled}
              onChange={(e) => set('voiceEnabled', e.target.checked)}
              disabled={start.loading}
            />
            <span>
              <span className="block text-sm font-medium">Voice mode</span>
              <span className="block text-xs text-muted">
                Questions are read aloud, and you can answer by speaking. Audio can take a few seconds to appear after each question.
              </span>
            </span>
          </label>

          {start.loading ? (
            <AiWaitNotice title="Preparing your interview…" description="Generating your first question. This can take up to a minute." />
          ) : (
            <Button type="submit" className="w-full sm:w-auto">
              <Icon name="play" className="h-4 w-4" />
              Start interview
            </Button>
          )}
        </form>
      </SectionCard>
    </div>
  );
}
