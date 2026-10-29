// `{% render 'ken/booking' %}` as a preview. A live page shows Ken's scheduler or the sender's booking page in a frame
// (ken-backend Ken.Redirector.Edge/src/studio/kit/booking.ts); a preview has neither, so this draws a calendar-shaped
// placeholder the size of that frame, with the booking CTA under it. `height` and `title` work as on the edge.
import { DEFAULT_CTA_COLOR, renderCta } from './cta.mjs';
import { brandPrimary, escapeKitHtml, text } from './html.mjs';

// A month grid with a few open weekdays, in the brand color. Static, so the same page gives the same bytes.
function calendar(accent) {
  let cells = '';
  for (let week = 0; week < 5; week++) {
    for (let day = 0; day < 7; day++) {
      const open = day > 0 && day < 6 && (week * 7 + day) % 3 === 1;
      cells += `<rect x="${14 + day * 37}" y="${58 + week * 30}" width="31" height="24" rx="4" fill="${open ? accent : '#e5e7eb'}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 216" width="288" role="img" aria-label="Calendar" style="max-width:100%;height:auto"><rect x="0.5" y="0.5" width="287" height="215" rx="10" fill="#fff" stroke="#d1d5db"/><rect x="14" y="16" width="112" height="14" rx="4" fill="${accent}"/><rect x="236" y="16" width="38" height="14" rx="4" fill="#e5e7eb"/>${cells}</svg>`;
}

export function renderBooking(scope) {
  const requested = Number(scope.get(['height']));
  const height = Number.isFinite(requested) ? Math.min(1200, Math.max(320, Math.round(requested))) : 700;
  const title = text(scope.get(['title'])) ?? 'Book a time';
  const cta = renderCta({ get: (path) => (path.length === 1 && path[0] === 'kind' ? 'booking' : scope.get(path)) });
  return `<div class="ken-booking" data-ken-booking="preview" style="box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;width:100%;height:${height}px;padding:24px;border:1px dashed currentColor;border-radius:8px;text-align:center"><strong>${escapeKitHtml(title)}</strong>${calendar(brandPrimary(scope, DEFAULT_CTA_COLOR))}${cta}<span style="font-size:13px;opacity:.7">Preview: the live page shows the booking calendar here.</span></div>`;
}
