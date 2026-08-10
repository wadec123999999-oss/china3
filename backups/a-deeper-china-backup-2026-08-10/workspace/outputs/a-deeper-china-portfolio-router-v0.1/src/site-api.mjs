import { CITY_UNITS } from './portfolio.mjs';
import { startConversation } from './conversation.mjs';
import { buildRuntimeInput } from './runtime-input.mjs';
import { dispatchRuntime, renderRuntimeRoadbook } from './runtime-dispatch.mjs';
import { createRoadbookBrief } from './roadbook-brief.mjs';
import { createPublicRoadbook } from './roadbook-enhancer.mjs';
import { generateRoutePreview } from '../bin/client-roadbook.mjs';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function readBody(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return null;
  }
}

function publicDestinations() {
  return CITY_UNITS.map(unit => ({
    id: unit.id,
    name: unit.name,
    min_nights: unit.minNights,
    themes: unit.themes,
    product_status: unit.status,
    summary: unit.summary,
    cautions: unit.cautions
  }));
}

/**
 * Framework-neutral API adapter for a Vercel/Next.js route.
 * It deliberately returns route drafts and review states, never raw database
 * records, supplier data, bookings or payment instructions.
 */
export async function handleSiteApiRequest(request) {
  const method = String(request?.method || 'GET').toUpperCase();
  const url = new URL(request?.url || 'http://localhost/api/health');
  const path = url.pathname.replace(/\/$/, '') || '/';

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (method === 'GET' && path === '/api/health') return json({ ok: true, service: 'a-deeper-china-router', version: '0.1' });
  if (method === 'GET' && path === '/api/destinations') return json({ destinations: publicDestinations() });
  if (method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const body = await readBody(request);
  if (body === null) return json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);

  if (path === '/api/route-direction') {
    if (typeof body.message !== 'string' || !body.message.trim()) return json({ error: 'message_required' }, 400);
    return json(startConversation(body.message));
  }
  if (path === '/api/route-preview') return json(await generateRoutePreview(body));
  if (path === '/api/runtime-input') return json(buildRuntimeInput(body));
  if (path === '/api/dispatch-runtime') {
    const result = await dispatchRuntime(body);
    if (result.valid) {
      result.roadbook_markdown = await renderRuntimeRoadbook(body);
      result.public_roadbook = createPublicRoadbook({
        runtime: body.runtime,
        decision: result,
        tripContext: body.trip_context || null,
        markdown: result.roadbook_markdown
      });
    }
    return json(result);
  }
  if (path === '/api/roadbook-brief') return json(createRoadbookBrief(body));
  return json({ error: 'not_found' }, 404);
}

export { publicDestinations };
