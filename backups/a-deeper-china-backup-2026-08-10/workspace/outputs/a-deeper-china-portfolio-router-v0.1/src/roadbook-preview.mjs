import { productCatalog } from '../../shared/product-standard.mjs';

function sectionBody(markdown, heading) {
  const lines = String(markdown || '').split('\n');
  const start = lines.findIndex(line => line.trim() === heading);
  if (start < 0) return [];
  const headingLevel = (heading.match(/^#+/) || ['##'])[0].length;
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const nextHeading = line.match(/^(#+)\s/);
    if (nextHeading && nextHeading[1].length <= headingLevel) break;
    body.push(line.trim());
  }
  return body.filter(Boolean);
}

function firstBullets(markdown, heading, limit = 3) {
  return sectionBody(markdown, heading)
    .filter(line => /^-\s+/.test(line))
    .map(line => line.replace(/^-\s+/, '').replace(/\*\*/g, '').trim())
    .slice(0, limit);
}

function firstMatching(markdown, heading, expression) {
  return sectionBody(markdown, heading).find(line => expression.test(line))?.replace(/^-\s+/, '').trim() || null;
}

function shapeModules(markdown) {
  const line = String(markdown || '').split('\n').find(item => item.startsWith('**Shape:**'));
  if (!line) return [];
  return line.replace(/^\*\*Shape:\*\*\s*/, '').split(' · ').slice(1).map(item => item.trim()).filter(Boolean).slice(0, 2);
}

function previewCity(full, input) {
  return full?.release_assessment?.city
    || full?.city_unit
    || input?.runtime_city
    || input?.city_unit
    || 'City';
}

/**
 * A deliberately incomplete lead-generation artifact. It exposes the route
 * direction and the reasoning hook, but never the complete day-by-day route.
 */
export function createRoutePreview({ full, input = {} } = {}) {
  if (!full?.valid) return { valid: false, errors: full?.errors || ['A valid roadbook draft is required.'] };
  const markdown = full.markdown || '';
  const hypotheses = Array.isArray(full.hypotheses_to_confirm) ? full.hypotheses_to_confirm : [];
  const product = productCatalog.products.find(item => item.id === 'route_preview');
  return {
    valid: true,
    schema_version: '1.0',
    status: 'preview_only',
    product_id: 'route_preview',
    city: previewCity(full, input),
    route_thesis: sectionBody(markdown, '## The route thesis')[0] || 'A route direction will be shaped around the confirmed travel question.',
    what_we_heard: firstBullets(markdown, '### What we heard', 3),
    what_we_are_protecting: firstMatching(markdown, '### What we heard', /^-\s+Avoidances:/i),
    candidate_modules: shapeModules(markdown),
    why_this_route_fits: firstBullets(markdown, '## Why this route fits', 2),
    hypotheses_to_confirm: hypotheses.map(item => item.confirmation_question || item.question).filter(Boolean).slice(0, 2),
    deliberately_not_included: product.excludes,
    commercial: {
      payment_allowed: false,
      quote_allowed: false,
      product_name: product.name,
      upgrade_product_id: 'deep_roadbook',
      upgrade_reason: 'The paid roadbook adds the complete day-by-day route, decision ledger, fallback branches and human review scope.'
    },
    delivery_boundary: 'This preview is a fit-check and lead-generation artifact. It is not a complete itinerary, booking, live availability check or experience quote.'
  };
}

export { sectionBody, firstBullets, shapeModules };
