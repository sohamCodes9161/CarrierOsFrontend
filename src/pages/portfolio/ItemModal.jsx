import { useState } from 'react';

import FormField, { fieldProps, inputClass, textareaClass } from '../../components/forms/FormField.jsx';
import TagInput from '../../components/forms/TagInput.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAction } from '../../hooks/useAction.js';
import AiImprove from './AiImprove.jsx';
import { toFormValues, toPayload, validateItem } from './sectionConfig.js';

function ItemForm({ config, item, onSave, onClose }) {
  const [values, setValues] = useState(() => toFormValues(config, item));
  const [errors, setErrors] = useState({});
  const save = useAction(onSave);

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateItem(config, values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    const result = await save.run(toPayload(config, values));
    if (result.ok) onClose();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <ErrorAlert error={save.error} />

      {config.fields.map((field) => {
        const id = `field-${field.name}`;
        const error = errors[field.name];
        const value = values[field.name];
        const half = ['month', 'end-month'].includes(field.type);

        let control;
        if (field.type === 'textarea') {
          control = (
            <>
              <textarea
                {...fieldProps(id, error)}
                rows={5}
                className={textareaClass(error)}
                placeholder={field.placeholder}
                maxLength={field.max}
                value={value}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={save.loading}
              />
              {field.ai && config.aiSection && (
                <AiImprove section={config.aiSection} text={value} onApply={(text) => set(field.name, text)} disabled={save.loading} />
              )}
            </>
          );
        } else if (field.type === 'tags') {
          control = (
            <TagInput id={id} value={value} onChange={(tags) => set(field.name, tags)} max={field.max} placeholder={field.placeholder} disabled={save.loading} error={error} />
          );
        } else if (field.type === 'checkbox') {
          control = (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                id={id}
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={Boolean(value)}
                onChange={(e) => set(field.name, e.target.checked)}
                disabled={save.loading}
              />
              <span className="text-sm">{field.label}</span>
            </label>
          );
        } else if (field.type === 'end-month') {
          const current = value === null;
          control = (
            <div className="space-y-2">
              <input
                {...fieldProps(id, error)}
                type="month"
                className={inputClass(error)}
                value={current ? '' : value}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={save.loading || current}
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-xs"
                  checked={current}
                  onChange={(e) => set(field.name, e.target.checked ? null : '')}
                  disabled={save.loading}
                />
                I currently work here
              </label>
            </div>
          );
        } else {
          const type = field.type === 'url' ? 'url' : field.type === 'month' ? 'month' : field.type === 'date' ? 'date' : 'text';
          control = (
            <input
              {...fieldProps(id, error, field.hint)}
              type={type}
              inputMode={field.type === 'url' ? 'url' : undefined}
              className={inputClass(error)}
              placeholder={field.placeholder}
              maxLength={field.max}
              value={value}
              onChange={(e) => set(field.name, e.target.value)}
              disabled={save.loading}
              autoFocus={field === config.fields[0]}
            />
          );
        }

        if (field.type === 'checkbox') return <div key={field.name}>{control}</div>;

        return (
          <FormField
            key={field.name}
            id={id}
            label={field.label}
            required={field.required}
            error={error}
            hint={field.hint}
            counter={field.type === 'textarea' ? `${(value || '').length}/${field.max}` : undefined}
            className={half ? 'sm:max-w-xs' : ''}
          >
            {control}
          </FormField>
        );
      })}

      <div className="modal-action">
        <Button variant="ghost" onClick={onClose} disabled={save.loading}>
          Cancel
        </Button>
        <Button type="submit" loading={save.loading}>
          {item ? 'Save changes' : `Add ${config.singular.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}

/** Add/edit dialog shared by all four portfolio sections. */
export default function ItemModal({ open, config, item, onSave, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title={`${item ? 'Edit' : 'Add'} ${config.singular.toLowerCase()}`}>
      <ItemForm config={config} item={item} onSave={onSave} onClose={onClose} />
    </Modal>
  );
}
