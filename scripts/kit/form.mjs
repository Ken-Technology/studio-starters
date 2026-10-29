// `{% render 'ken/form', id: 'rsvp', fields: 'name*, email*, company', submit: 'Save my seat' %}` as a preview,
// ported from the preview branch of ken-backend Ken.Redirector.Edge/src/studio/kit/form.ts: the same fields, labels
// and submit label, with every field and the submit disabled and a "Preview: not saved" note. No action, so it never posts.
import { DEFAULT_CTA_COLOR } from './cta.mjs';
import { POLICY, brandPrimary, escapeKitHtml, slugId, text } from './html.mjs';

const FIELD_TYPES = new Set(POLICY.forms.fieldTypes);
const DENIED_NAMES = POLICY.forms.deniedFieldNamePatterns.map((pattern) => new RegExp(`(?:^|-)(?:${pattern})(?:$|-)`, 'i'));
const FIELD_NAME = /^[a-z][a-z0-9_-]{0,39}$/;
const DEFAULT_FIELDS = 'name*, email*';

function normalizedName(value) {
  const candidate = text(value)?.toLowerCase().replace(/\s+/g, '_');
  return candidate && FIELD_NAME.test(candidate) ? candidate : null;
}

// Password, card and ID-number field names in any casing or separator style never render.
export function isDeniedFieldName(name) {
  const tokens = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, '-');
  return DENIED_NAMES.some((pattern) => pattern.test(tokens));
}

function inferredType(name) {
  if (/(^|[-_])e?mail($|[-_])/.test(name)) return 'email';
  if (/(^|[-_])(phone|tel|mobile)($|[-_])/.test(name)) return 'tel';
  if (/(^|[-_])(website|url|site)($|[-_])/.test(name)) return 'url';
  if (/(^|[-_])(message|notes?|comments?|question)($|[-_])/.test(name)) return 'textarea';
  return 'text';
}

function humanize(name) {
  const words = name.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function options(value) {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split('|') : [];
  return raw.map((item) => text(item)).filter((item) => item !== null).slice(0, 30);
}

function field(value) {
  if (typeof value === 'string') {
    const required = value.trim().endsWith('*');
    const name = normalizedName(value.trim().replace(/\*$/, ''));
    if (!name) return null;
    return { name, label: humanize(name), type: inferredType(name), required, options: [], placeholder: null };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const name = normalizedName(value.name);
  if (!name) return null;
  const requested = text(value.type)?.toLowerCase();
  const type = requested && FIELD_TYPES.has(requested) ? requested : requested ? null : inferredType(name);
  if (!type) return null;
  return {
    name,
    label: text(value.label) ?? humanize(name),
    type,
    required: value.required === true,
    options: options(value.options),
    placeholder: text(value.placeholder),
  };
}

// Fields from an array of {name, label, type, required, options} or a "name*, email*, company" string.
export function formFields(value) {
  const raw = Array.isArray(value) ? value : (text(value) ?? DEFAULT_FIELDS).split(',');
  const seen = new Set();
  const fields = [];
  for (const item of raw) {
    const parsed = field(item);
    if (!parsed || isDeniedFieldName(parsed.name) || seen.has(parsed.name)) continue;
    if (parsed.type === 'select' && parsed.options.length === 0) continue;
    seen.add(parsed.name);
    fields.push(parsed);
    if (fields.length >= POLICY.forms.maxFields) break;
  }
  return fields;
}

function control(item) {
  const required = item.required ? ' required' : '';
  const placeholder = item.placeholder ? ` placeholder="${escapeKitHtml(item.placeholder)}"` : '';
  const name = escapeKitHtml(item.name);
  if (item.type === 'textarea') return `<textarea name="${name}" rows="4" maxlength="2000"${placeholder}${required} disabled></textarea>`;
  if (item.type === 'select') {
    const choices = item.options.map((option) => `<option value="${escapeKitHtml(option)}">${escapeKitHtml(option)}</option>`).join('');
    return `<select name="${name}"${required} disabled><option value="">Choose…</option>${choices}</select>`;
  }
  return `<input type="${item.type}" name="${name}" maxlength="500"${placeholder}${required} disabled>`;
}

export const FORM_PREVIEW_NOTE = '<p class="ken-form-preview" role="note" style="margin:8px 0 0;font-size:13px;opacity:.7">Preview: not saved</p>';

export function renderForm(scope) {
  const fields = formFields(scope.get(['fields']));
  if (fields.length === 0) return '';
  const formId = escapeKitHtml(slugId(scope.get(['id']), 'form'));
  const submit = text(scope.get(['submit'])) ?? 'Submit';
  const body = fields.map((item) => item.type === 'checkbox'
    ? `<label class="ken-form-field ken-form-check"><input type="checkbox" name="${escapeKitHtml(item.name)}" value="yes"${item.required ? ' required' : ''} disabled> <span>${escapeKitHtml(item.label)}</span></label>`
    : `<label class="ken-form-field"><span>${escapeKitHtml(item.label)}</span>${control(item)}</label>`).join('');
  const button = `<button type="submit" class="ken-form-submit" disabled style="padding:12px 20px;border:0;border-radius:8px;background:${brandPrimary(scope, DEFAULT_CTA_COLOR)};color:#fff;font-weight:600;cursor:not-allowed">${escapeKitHtml(submit)}</button>`;
  return `<form class="ken-form" data-ken-form="${formId}" data-ken-preview><input type="hidden" name="_ken_form" value="${formId}">${body}${button}${FORM_PREVIEW_NOTE}</form>`;
}
