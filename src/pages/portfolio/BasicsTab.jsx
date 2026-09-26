import { useState } from 'react';

import SectionCard from '../../components/common/SectionCard.jsx';
import FormField, { fieldProps, inputClass, textareaClass } from '../../components/forms/FormField.jsx';
import TagInput from '../../components/forms/TagInput.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { portfolioApi } from '../../services/api/index.js';
import { LIMITS, THEME_COLORS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import { safeColor } from '../../utils/portfolio.js';
import { validateEmail, validateUrl } from '../../utils/validation.js';
import AiImprove from './AiImprove.jsx';

const CONTACT_FIELDS = [
  { name: 'email', label: 'Public email', type: 'email', placeholder: 'you@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000', max: 30 },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country', max: 100 },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://yoursite.com' },
  { name: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/you' },
  { name: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/you' },
  { name: 'twitter', label: 'Twitter / X', type: 'url', placeholder: 'https://x.com/you' },
];

function initialValues(portfolio) {
  const contact = portfolio.contact || {};
  return {
    headline: portfolio.headline || '',
    bio: portfolio.bio || '',
    skills: portfolio.skills || [],
    themeColor: portfolio.themeColor || '',
    contact: Object.fromEntries(CONTACT_FIELDS.map((f) => [f.name, contact[f.name] || ''])),
  };
}

export default function BasicsTab({ portfolio, onChange }) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(portfolio));
  const [errors, setErrors] = useState({});
  const save = useAction(portfolioApi.updatePortfolio);

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }
  function setContact(name, value) {
    setValues((v) => ({ ...v, contact: { ...v.contact, [name]: value } }));
    if (errors[`contact.${name}`]) setErrors((e) => ({ ...e, [`contact.${name}`]: '' }));
  }

  function validate() {
    const next = {};
    if (values.headline.trim().length > LIMITS.headline) next.headline = `Headline must be ${LIMITS.headline} characters or fewer.`;
    if (values.bio.trim().length > LIMITS.bio) next.bio = `Bio must be ${LIMITS.bio} characters or fewer.`;
    if (values.skills.length > 50) next.skills = 'Add at most 50 skills.';
    for (const field of CONTACT_FIELDS) {
      const v = values.contact[field.name].trim();
      let problem = '';
      if (field.type === 'email' && v) problem = validateEmail(v);
      else if (field.type === 'url') problem = validateUrl(v);
      else if (field.max && v.length > field.max) problem = `Must be ${field.max} characters or fewer.`;
      if (problem) next[`contact.${field.name}`] = problem;
    }
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload = {
      headline: values.headline.trim(),
      bio: values.bio.trim(),
      skills: values.skills,
      contact: Object.fromEntries(Object.entries(values.contact).map(([k, v]) => [k, v.trim()])),
    };
    if (values.themeColor) payload.themeColor = values.themeColor;

    const result = await save.run(payload);
    if (result.ok) {
      onChange(result.data);
      toast.success('Portfolio saved.');
    }
  }

  const accent = safeColor(values.themeColor);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <ErrorAlert error={save.error} />

      <SectionCard title="Introduction" description="The first thing visitors see on your public page.">
        <div className="space-y-4">
          <FormField
            id="headline"
            label="Headline"
            error={errors.headline}
            counter={`${values.headline.length}/${LIMITS.headline}`}
            hint="A short tagline, e.g. “Full-stack developer building reliable web apps”."
          >
            <input
              {...fieldProps('headline', errors.headline, true)}
              type="text"
              className={inputClass(errors.headline)}
              value={values.headline}
              onChange={(e) => set('headline', e.target.value)}
              disabled={save.loading}
            />
            <AiImprove section="headline" text={values.headline} onApply={(t) => set('headline', t.slice(0, LIMITS.headline))} disabled={save.loading} />
          </FormField>

          <FormField id="bio" label="Bio" error={errors.bio} counter={`${values.bio.length}/${LIMITS.bio}`}>
            <textarea
              {...fieldProps('bio', errors.bio)}
              rows={6}
              className={textareaClass(errors.bio)}
              value={values.bio}
              onChange={(e) => set('bio', e.target.value)}
              disabled={save.loading}
            />
            <AiImprove section="bio" text={values.bio} onApply={(t) => set('bio', t)} disabled={save.loading} />
          </FormField>

          <FormField id="skills" label="Skills" error={errors.skills} hint="Press Enter after each skill. Up to 50.">
            <TagInput id="skills" value={values.skills} onChange={(s) => set('skills', s)} max={50} placeholder="e.g. React, Node.js" disabled={save.loading} error={errors.skills} aria-describedby="skills-hint" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Contact and links" description="Only what you fill in is shown publicly.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((field) => {
            const id = `contact-${field.name}`;
            const error = errors[`contact.${field.name}`];
            return (
              <FormField key={field.name} id={id} label={field.label} error={error}>
                <input
                  {...fieldProps(id, error)}
                  type={field.type}
                  inputMode={field.type === 'url' ? 'url' : undefined}
                  className={inputClass(error)}
                  placeholder={field.placeholder}
                  maxLength={field.max}
                  value={values.contact[field.name]}
                  onChange={(e) => setContact(field.name, e.target.value)}
                  disabled={save.loading}
                />
              </FormField>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Appearance" description="Accent color for your public page.">
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Accent color">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set('themeColor', color)}
              aria-label={`Use color ${color}`}
              aria-pressed={accent.toLowerCase() === color.toLowerCase() && Boolean(values.themeColor)}
              className={cn(
                'h-9 w-9 rounded-full border-2 border-base-100 ring-2 ring-offset-2 ring-offset-base-100 transition-transform hover:scale-110',
                values.themeColor && accent.toLowerCase() === color.toLowerCase() ? 'ring-base-content' : 'ring-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="color"
              value={accent}
              onChange={(e) => set('themeColor', e.target.value.toUpperCase())}
              className="h-9 w-12 cursor-pointer rounded border border-base-300 bg-base-100 p-0.5"
              aria-label="Custom accent color"
            />
            Custom
          </label>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" loading={save.loading}>
          {save.loading ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
