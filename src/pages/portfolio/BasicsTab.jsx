import { useState, useRef } from 'react';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField, { fieldProps, inputClass, textareaClass } from '../../components/forms/FormField.jsx';
import TagInput from '../../components/forms/TagInput.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import Icon from '../../components/ui/Icon.jsx'; // <-- Added missing Icon import
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { portfolioApi } from '../../services/api/index.js';
import { LIMITS, THEME_COLORS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import { safeColor } from '../../utils/portfolio.js';
import { validateEmail, validateUrl } from '../../utils/validation.js';
import { Camera } from 'lucide-react';

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

async function compressImage(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    };
  });
}

export default function BasicsTab({ portfolio, onChange }) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(portfolio));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const save = useAction(portfolioApi.updatePortfolio);
  
  // --- AI Curate Action ---
  const curateAction = useAction(portfolioApi.curateSkills);

  async function handleCurateSkills() {
    const result = await curateAction.run();
    if (result.ok) {
      set('skills', result.data.skills);
      onChange(result.data);
      toast.success('Cleaned up skills list with AI!');
    } else {
      toast.error('Failed to curate skills');
    }
  }

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }
  
  function setContact(name, value) {
    setValues((v) => ({ ...v, contact: { ...v.contact, [name]: value } }));
    if (errors[`contact.${name}`]) setErrors((e) => ({ ...e, [`contact.${name}`]: '' }));
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const updatedPortfolio = await portfolioApi.uploadProfilePhoto(compressedFile);
      onChange(updatedPortfolio);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  function validate() {
    const next = {};
    if (values.headline.trim().length > LIMITS.headline) next.headline = `Headline must be ${LIMITS.headline} characters or fewer.`;
    if (values.bio.trim().length > LIMITS.bio) next.bio = `Bio must be ${LIMITS.bio} characters or fewer.`;
    // Enforce 20 skills max
    if (values.skills.length > 20) next.skills = 'Add at most 20 skills. Keep it to high-impact technologies.';
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
        <div className="space-y-6">
          
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-full border-4 border-surface-2 bg-surface-1 overflow-hidden shadow-md">
              {portfolio.profilePhotoUrl ? (
                <img src={portfolio.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-base-300 text-muted">
                  <Camera className="h-8 w-8" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="loading loading-spinner loading-md text-base-content"></span>
                </div>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                Upload Photo
              </Button>
              <p className="text-xs text-muted mt-2">Auto-compressed before upload.</p>
            </div>
          </div>

          <FormField id="headline" label="Headline" error={errors.headline} counter={`${values.headline.length}/${LIMITS.headline}`}>
            <input {...fieldProps('headline', errors.headline, true)} type="text" className={inputClass(errors.headline)} value={values.headline} onChange={(e) => set('headline', e.target.value)} disabled={save.loading} />
          </FormField>

          <FormField id="bio" label="Bio" error={errors.bio} counter={`${values.bio.length}/${LIMITS.bio}`}>
            <textarea {...fieldProps('bio', errors.bio)} rows={6} className={textareaClass(errors.bio)} value={values.bio} onChange={(e) => set('bio', e.target.value)} disabled={save.loading} />
          </FormField>

          <FormField id="skills" label="Skills" error={errors.skills} hint="Press Enter after each skill. Maximum 20 core technologies.">
            
            {/* The new AI Curate Button */}
            <div className="mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCurateSkills}
                loading={curateAction.loading}
                title="Use AI to remove basic keywords like 'array' or 'npm' and keep only top core technologies"
              >
                <Icon name="sparkles" className="h-4 w-4 mr-2 text-primary" />
                AI Clean & Curate
              </Button>
            </div>

            <TagInput 
              id="skills" 
              value={values.skills} 
              onChange={(s) => set('skills', s)} 
              max={20} 
              placeholder="e.g. React.js, Node.js" 
              disabled={save.loading} 
              error={errors.skills} 
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Contact and links" description="Only what you fill in is shown publicly.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((field) => (
            <FormField key={field.name} id={`contact-${field.name}`} label={field.label} error={errors[`contact.${field.name}`]}>
              <input {...fieldProps(`contact-${field.name}`, errors[`contact.${field.name}`])} type={field.type} className={inputClass(errors[`contact.${field.name}`])} placeholder={field.placeholder} value={values.contact[field.name]} onChange={(e) => setContact(field.name, e.target.value)} disabled={save.loading} />
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Terminal Theme Color" description="Accent color for your CLI-styled portfolio.">
        <div className="flex flex-wrap items-center gap-3">
          {THEME_COLORS.map((color) => (
            <button
              key={color} type="button" onClick={() => set('themeColor', color)}
              className={cn('h-9 w-9 rounded-full border-2 border-base-100 ring-2 ring-offset-2 ring-offset-base-100 transition-transform hover:scale-110', values.themeColor && accent.toLowerCase() === color.toLowerCase() ? 'ring-base-content' : 'ring-transparent')}
              style={{ backgroundColor: color }}
            />
          ))}
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