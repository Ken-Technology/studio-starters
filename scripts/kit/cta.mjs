// `{% render 'ken/cta', label: 'Book 20 min', kind: 'booking' %}` or `{% render 'ken/cta', label: 'Read more', href: '...' %}`,
// ported from ken-backend Ken.Redirector.Edge/src/studio/kit/cta.ts. `id` names the CTA for click tracking
// (data-ken-cta); `variant: 'link'` drops the button styling. Renders nothing when there is no safe destination,
// except a booking CTA in a preview with no booking link: the same button with no href.
import { brandPrimary, escapeKitHtml, isAbsoluteWebUrl, isPreview, safeHref, slugId, text } from './html.mjs';

export const DEFAULT_CTA_COLOR = '#111827';

export function renderCta(scope) {
  const kind = text(scope.get(['kind']));
  const booking = kind === 'booking';
  const href = booking ? safeHref(scope.get(['link', 'booking_url'])) : safeHref(scope.get(['href']));
  if (!href && !(booking && isPreview(scope))) return '';
  const label = text(scope.get(['label'])) ?? (booking ? 'Book a time' : 'Learn more');
  const ctaId = slugId(scope.get(['id']), booking ? 'booking' : 'primary');
  const button = text(scope.get(['variant'])) !== 'link';
  const style = button
    ? ` style="display:inline-block;padding:12px 20px;border-radius:8px;background:${brandPrimary(scope, DEFAULT_CTA_COLOR)};color:#fff;text-decoration:none;font-weight:600"`
    : '';
  if (!href) {
    return `<a class="ken-cta" data-ken-cta="${escapeKitHtml(ctaId)}" data-ken-preview aria-disabled="true" title="Preview: the live page links the booking page here"${style}>${escapeKitHtml(label)}</a>`;
  }
  const external = isAbsoluteWebUrl(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="ken-cta" data-ken-cta="${escapeKitHtml(ctaId)}" href="${escapeKitHtml(href)}"${external}${style}>${escapeKitHtml(label)}</a>`;
}
