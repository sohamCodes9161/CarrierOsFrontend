/** Items carry an `order` field but the backend does not re-sort the arrays. */
export function sortByOrder(items = []) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (a.item.order ?? 0) - (b.item.order ?? 0) || a.index - b.index)
    .map((entry) => entry.item);
}

/** Portfolio dates are free-form strings, typically "YYYY-MM" or "YYYY-MM-DD". */
export function formatPortfolioDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3] || 1)));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function formatDateRange(start, end, { current = false } = {}) {
  const from = formatPortfolioDate(start);
  const to = current ? 'Present' : formatPortfolioDate(end);
  if (from && to) return `${from} – ${to}`;
  return from || to || '';
}

export function publicPortfolioUrl(slug) {
  return `${window.location.origin}/p/${slug}`;
}

/** Portfolio links are user-supplied and shown publicly, so only http(s) URLs are ever rendered as links. */
export function safeHref(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

export function safeColor(value, fallback = '#2563EB') {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value.trim()) ? value.trim() : fallback;
}
