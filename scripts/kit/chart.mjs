// `{% render 'ken/chart', type: 'bar', data: data.funnel, title: 'Pipeline' %}`, ported line for line from
// ken-backend Ken.Redirector.Edge/src/studio/kit/chart.ts: the same data gives the same SVG as a live page.
// Inline SVG, no script. `data` is a list of {label, value}; labels are cut to 28 characters and negative values count as 0.
import { POLICY, brandPrimary, escapeKitHtml, text, truncate } from './html.mjs';

export const DEFAULT_CHART_COLOR = '#2563eb';

const WIDTH = 640;
const LABEL_WIDTH = 210;
const ROW_HEIGHT = 26;
const ROW_GAP = 10;
const INK = '#374151';
const MUTED = '#9ca3af';
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

function points(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const item of value.slice(0, POLICY.chart.maxPoints)) {
    if (!item || typeof item !== 'object') continue;
    const label = text(item.label) ?? '';
    const raw = typeof item.value === 'string' ? Number(item.value) : item.value;
    const numeric = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, raw) : 0;
    result.push({ label: truncate(label, POLICY.chart.maxLabelLength), value: numeric });
  }
  return result;
}

function round(value) {
  return String(Math.round(value * 10) / 10);
}

function svg(height, title, body, marked) {
  const label = title ? ` aria-label="${escapeKitHtml(title)}"` : '';
  const heading = title ? `<title>${escapeKitHtml(title)}</title>` : '';
  const mark = marked ? ' data-ken-chart' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="100%" role="img"${label} style="max-width:${WIDTH}px;height:auto" font-family="inherit" font-size="13"${mark}>${heading}${body}</svg>`;
}

function bar(data, fill) {
  const max = Math.max(...data.map((point) => point.value), 0);
  const area = WIDTH - LABEL_WIDTH - 70;
  let body = '';
  data.forEach((point, index) => {
    const y = 8 + index * (ROW_HEIGHT + ROW_GAP);
    const width = max > 0 ? Math.max(1, (point.value / max) * area) : 1;
    body += `<text x="${LABEL_WIDTH - 10}" y="${round(y + ROW_HEIGHT / 2 + 4)}" text-anchor="end" fill="${INK}">${escapeKitHtml(point.label)}</text>`;
    body += `<rect x="${LABEL_WIDTH}" y="${y}" width="${round(width)}" height="${ROW_HEIGHT}" rx="4" fill="${fill}"/>`;
    body += `<text x="${round(LABEL_WIDTH + width + 8)}" y="${round(y + ROW_HEIGHT / 2 + 4)}" fill="${INK}">${escapeKitHtml(numberFormat.format(point.value))}</text>`;
  });
  return { height: 16 + data.length * (ROW_HEIGHT + ROW_GAP), body };
}

function funnel(data, fill) {
  const top = data[0]?.value ?? 0;
  const max = Math.max(...data.map((point) => point.value), 0);
  const area = WIDTH - LABEL_WIDTH - 110;
  const centre = LABEL_WIDTH + area / 2;
  let body = '';
  data.forEach((point, index) => {
    const y = 8 + index * (ROW_HEIGHT + ROW_GAP);
    const width = max > 0 ? Math.max(2, (point.value / max) * area) : 2;
    const share = top > 0 ? ` (${Math.round((point.value / top) * 100)}%)` : '';
    body += `<text x="${LABEL_WIDTH - 10}" y="${round(y + ROW_HEIGHT / 2 + 4)}" text-anchor="end" fill="${INK}">${escapeKitHtml(point.label)}</text>`;
    body += `<rect x="${round(centre - width / 2)}" y="${y}" width="${round(width)}" height="${ROW_HEIGHT}" rx="3" fill="${fill}" fill-opacity="${round(1 - (index / Math.max(data.length, 1)) * 0.5)}"/>`;
    body += `<text x="${LABEL_WIDTH + area + 10}" y="${round(y + ROW_HEIGHT / 2 + 4)}" fill="${INK}">${escapeKitHtml(numberFormat.format(point.value) + share)}</text>`;
  });
  return { height: 16 + data.length * (ROW_HEIGHT + ROW_GAP), body };
}

function line(data, stroke) {
  const height = 280;
  const left = 48;
  const right = 24;
  const plotTop = 16;
  const plotBottom = height - 56;
  const max = Math.max(...data.map((point) => point.value), 0) || 1;
  const step = data.length > 1 ? (WIDTH - left - right) / (data.length - 1) : 0;
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));
  const coordinates = data.map((point, index) => ({
    x: data.length > 1 ? left + index * step : WIDTH / 2,
    y: plotBottom - (point.value / max) * (plotBottom - plotTop),
    point,
  }));
  let body = `<line x1="${left}" y1="${plotBottom}" x2="${WIDTH - right}" y2="${plotBottom}" stroke="${MUTED}"/>`;
  body += `<text x="${left - 8}" y="${plotTop + 4}" text-anchor="end" fill="${MUTED}">${escapeKitHtml(numberFormat.format(max))}</text>`;
  body += `<text x="${left - 8}" y="${plotBottom + 4}" text-anchor="end" fill="${MUTED}">0</text>`;
  body += `<polyline fill="none" stroke="${stroke}" stroke-width="2.5" points="${coordinates.map((c) => `${round(c.x)},${round(c.y)}`).join(' ')}"/>`;
  coordinates.forEach((c, index) => {
    body += `<circle cx="${round(c.x)}" cy="${round(c.y)}" r="3.5" fill="${stroke}"><title>${escapeKitHtml(`${c.point.label}: ${numberFormat.format(c.point.value)}`)}</title></circle>`;
    if (index % labelEvery === 0 || index === coordinates.length - 1) {
      body += `<text x="${round(c.x)}" y="${plotBottom + 20}" text-anchor="middle" fill="${INK}">${escapeKitHtml(c.point.label)}</text>`;
    }
  });
  return { height, body };
}

function pie(data, fill) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  if (total <= 0) return null;
  const radius = 110;
  const cx = 130;
  const cy = 130;
  const height = Math.max(260, 20 + data.length * 24);
  let body = '';
  let angle = -Math.PI / 2;
  data.forEach((point, index) => {
    const opacity = round(1 - (index / Math.max(data.length, 1)) * 0.75);
    const share = point.value / total;
    if (share >= 0.9999) {
      body += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" fill-opacity="${opacity}"/>`;
    } else if (share > 0) {
      const end = angle + share * Math.PI * 2;
      const large = share > 0.5 ? 1 : 0;
      const x1 = cx + radius * Math.cos(angle);
      const y1 = cy + radius * Math.sin(angle);
      const x2 = cx + radius * Math.cos(end);
      const y2 = cy + radius * Math.sin(end);
      body += `<path d="M${cx} ${cy}L${round(x1)} ${round(y1)}A${radius} ${radius} 0 ${large} 1 ${round(x2)} ${round(y2)}Z" fill="${fill}" fill-opacity="${opacity}" stroke="#fff" stroke-width="1"/>`;
      angle = end;
    }
    const y = 20 + index * 24;
    body += `<rect x="290" y="${y - 11}" width="12" height="12" rx="2" fill="${fill}" fill-opacity="${opacity}"/>`;
    body += `<text x="310" y="${y}" fill="${INK}">${escapeKitHtml(`${point.label} · ${numberFormat.format(point.value)} (${Math.round(share * 100)}%)`)}</text>`;
  });
  return { height, body };
}

export function renderChart(scope) {
  const requested = text(scope.get(['type'])) ?? 'bar';
  const type = POLICY.chart.types.includes(requested) ? requested : 'bar';
  const data = points(scope.get(['data']));
  if (data.length === 0) return '';
  const title = text(scope.get(['title']));
  const fill = brandPrimary(scope, DEFAULT_CHART_COLOR);
  const drawn = type === 'funnel' ? funnel(data, fill)
    : type === 'line' ? line(data, fill)
      : type === 'pie' ? pie(data, fill)
        : bar(data, fill);
  if (!drawn) return '';
  const caption = title ? `<figcaption>${escapeKitHtml(title)}</figcaption>` : '';
  const marked = scope.get(['_ken', 'purpose']) === 'export';
  return `<figure class="ken-chart" data-ken-chart="${type}">${svg(drawn.height, title, drawn.body, marked)}${caption}</figure>`;
}
