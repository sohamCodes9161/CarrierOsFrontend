import { useState } from 'react';

import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useAction } from '../../hooks/useAction.js';
import { portfolioApi } from '../../services/api/index.js';

/**
 * Suggest-only AI rewrite. The suggestion is never applied automatically:
 * "Use suggestion" fills the field, and the user still has to save.
 */
export default function AiImprove({ section, text, onApply, disabled = false }) {
  const [suggestion, setSuggestion] = useState(null);
  const improve = useAction(portfolioApi.improveContent);
  const trimmed = (text || '').trim();

  async function handleImprove() {
    setSuggestion(null);
    const result = await improve.run({ section, text: trimmed });
    if (result.ok) setSuggestion(result.data);
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="xs"
        onClick={handleImprove}
        loading={improve.loading}
        disabled={disabled || !trimmed || trimmed.length > 2000}
      >
        <Icon name="sparkles" className="h-4 w-4" />
        {improve.loading ? 'Improving…' : 'Improve with AI'}
      </Button>

      {improve.error && (
        <p role="alert" className="mt-1.5 text-sm text-error">
          {improve.error.message}
        </p>
      )}

      {suggestion && (
        <div className="mt-2 rounded-btn border border-primary/25 bg-primary/5 p-3">
          <p className="eyebrow">Suggested wording</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{suggestion.improvedText}</p>
          {suggestion.changesSummary && <p className="mt-2 text-xs text-muted">{suggestion.changesSummary}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              size="xs"
              onClick={() => {
                onApply(suggestion.improvedText);
                setSuggestion(null);
              }}
            >
              Use suggestion
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setSuggestion(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
