import { validateUrl } from '../../utils/validation.js';

/**
 * Field definitions for the four portfolio sections. Limits mirror the backend's zod schemas.
 * Field types: text | textarea | tags | url | month | date | checkbox | end-month
 * ('end-month' stores null to mean "present", matching experience.endDate).
 */
export const SECTIONS = {
  projects: {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    aiSection: 'project',
    emptyText: 'Add projects you’re proud of. Quick-start can pull in your top GitHub repositories.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 150, placeholder: 'e.g. Expense tracker app' },
      { name: 'description', label: 'Description', type: 'textarea', max: 2000, ai: true, placeholder: 'What it does, the problem it solves, and the impact.' },
      { name: 'techStack', label: 'Tech stack', type: 'tags', max: 20, placeholder: 'Type a technology and press Enter' },
      { name: 'githubUrl', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/you/project' },
      { name: 'liveUrl', label: 'Live URL', type: 'url', placeholder: 'https://example.com' },
      { name: 'imageUrl', label: 'Image URL', type: 'url', hint: 'Link to a hosted screenshot. Image uploads aren’t supported.', placeholder: 'https://…/screenshot.png' },
      { name: 'featured', label: 'Feature this project', type: 'checkbox' },
    ],
    defaults: { title: '', description: '', techStack: [], githubUrl: '', liveUrl: '', imageUrl: '', featured: false },
  },
  experience: {
    key: 'experience',
    label: 'Experience',
    singular: 'Experience',
    aiSection: 'experience',
    emptyText: 'Add your work history, internships, or freelance roles.',
    fields: [
      { name: 'company', label: 'Company', type: 'text', required: true, max: 150 },
      { name: 'role', label: 'Role', type: 'text', required: true, max: 150 },
      { name: 'startDate', label: 'Start date', type: 'month' },
      { name: 'endDate', label: 'End date', type: 'end-month' },
      { name: 'description', label: 'Description', type: 'textarea', max: 2000, ai: true, placeholder: 'Lead with impact and outcomes.' },
    ],
    defaults: { company: '', role: '', startDate: '', endDate: '', description: '' },
  },
  education: {
    key: 'education',
    label: 'Education',
    singular: 'Education',
    aiSection: null,
    emptyText: 'Add your degrees, courses, or certifications.',
    fields: [
      { name: 'institution', label: 'Institution', type: 'text', required: true, max: 150 },
      { name: 'degree', label: 'Degree', type: 'text', required: true, max: 150, placeholder: 'e.g. B.Tech' },
      { name: 'fieldOfStudy', label: 'Field of study', type: 'text', max: 150, placeholder: 'e.g. Computer Science' },
      { name: 'startDate', label: 'Start date', type: 'month' },
      { name: 'endDate', label: 'End date', type: 'month' },
    ],
    defaults: { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' },
  },
  achievements: {
    key: 'achievements',
    label: 'Achievements',
    singular: 'Achievement',
    aiSection: 'achievement',
    emptyText: 'Add awards, certifications, publications, or milestones.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 150 },
      { name: 'date', label: 'Date', type: 'month' },
      { name: 'description', label: 'Description', type: 'textarea', max: 2000, ai: true },
    ],
    defaults: { title: '', date: '', description: '' },
  },
};

/** Builds initial form values from an existing item (or defaults for a new one). */
export function toFormValues(config, item) {
  const values = { ...config.defaults };
  if (!item) return values;
  for (const field of config.fields) {
    const raw = item[field.name];
    if (field.type === 'end-month') values[field.name] = raw === null ? null : raw ?? '';
    else if (field.type === 'tags') values[field.name] = Array.isArray(raw) ? raw : [];
    else if (field.type === 'checkbox') values[field.name] = Boolean(raw);
    else values[field.name] = raw ?? '';
  }
  return values;
}

/** Converts form values into the request body the API expects. */
export function toPayload(config, values) {
  const payload = {};
  for (const field of config.fields) {
    const value = values[field.name];
    if (field.type === 'tags') payload[field.name] = value;
    else if (field.type === 'checkbox') payload[field.name] = Boolean(value);
    else if (field.type === 'end-month') payload[field.name] = value === null ? null : (value || '').trim();
    else payload[field.name] = (value || '').trim();
  }
  return payload;
}

export function validateItem(config, values) {
  const errors = {};
  for (const field of config.fields) {
    const value = values[field.name];
    if (field.type === 'tags') {
      if ((value || []).length > field.max) errors[field.name] = `Add at most ${field.max}.`;
      continue;
    }
    if (field.type === 'checkbox' || value === null) continue;
    const text = (value || '').trim();
    if (field.required && !text) errors[field.name] = `${field.label} is required.`;
    else if (field.max && text.length > field.max) errors[field.name] = `${field.label} must be ${field.max} characters or fewer.`;
    else if (field.type === 'url') {
      const problem = validateUrl(text);
      if (problem) errors[field.name] = problem;
    }
  }
  const { startDate, endDate } = values;
  if (!errors.endDate && startDate && endDate && endDate < startDate) errors.endDate = 'End date must be after the start date.';
  return errors;
}
