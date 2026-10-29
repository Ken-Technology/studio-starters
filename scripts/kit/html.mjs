// Helpers for the kit ports, ported from ken-backend Ken.Redirector.Edge/src/studio/kit/html.ts.

// The parts of the edge's policy.json the kit reads.
export const POLICY = {
  chart: { types: ['bar', 'funnel', 'line', 'pie'], maxLabelLength: 28, maxPoints: 50 },
  forms: {
    fieldTypes: ['text', 'email', 'tel', 'url', 'number', 'date', 'textarea', 'select', 'checkbox'],
    maxFields: 12,
    deniedFieldNamePatterns: [
      'pass(word|code|phrase)?',
      '[a-z]*passw(or)?d',
      'pwd',
      'pin',
      '(credit|debit)?card(number|num|no|holder|code|exp|expiry)?',
      'cc-?(number|num|no|exp|csc|cvv|cvc)',
      'cvv',
      'cvc',
      'ccv',
      'security-?code',
      'iban',
      'routing(number|num|no)?',
      'account-?(number|num|no)',
      'ssn',
      'social-?security',
      'tax-?id',
      'national-?id',
      'passport',
      "driver'?s?-?licen[cs]e",
    ],
  },
};

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

// The entities escapeHtml writes.
const OWN_ENTITY = /&amp;(amp|lt|gt|quot|#39);/g;

// escapeHtml for kit tags: keeps the entities escapeHtml writes, so an escaped slot fallback is not escaped twice.
export function escapeKitHtml(value) {
  return escapeHtml(value).replace(OWN_ENTITY, '&$1;');
}

// A string or finite number as trimmed text, else null.
export function text(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function truncate(value, maxLength) {
  const characters = Array.from(value);
  return characters.length > maxLength ? `${characters.slice(0, maxLength - 1).join('')}…` : value;
}

// https, http, mailto and tel URLs, or a same-host path or fragment. Never javascript:.
export function safeHref(value) {
  const candidate = text(value);
  if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate)) return null;
  if (candidate.startsWith('#')) return candidate;
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol)) return null;
  if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && (parsed.username || parsed.password)) return null;
  return candidate;
}

export function isAbsoluteWebUrl(href) {
  return /^https?:\/\//i.test(href);
}

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function color(value, fallback) {
  const candidate = text(value);
  return candidate && COLOR.test(candidate) ? candidate : fallback;
}

// [a-z0-9-] identifier for data attributes, from free text.
export function slugId(value, fallback) {
  const candidate = text(value);
  const slug = candidate?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return slug ? slug : fallback;
}

// True in a builder preview (_ken.preview). render.mjs always sets it.
export function isPreview(scope) {
  return scope.get(['_ken', 'preview']) === true;
}

export function brandPrimary(scope, fallback) {
  return color(scope.get(['color']) ?? scope.get(['brand', 'colors', 'primary']), fallback);
}
