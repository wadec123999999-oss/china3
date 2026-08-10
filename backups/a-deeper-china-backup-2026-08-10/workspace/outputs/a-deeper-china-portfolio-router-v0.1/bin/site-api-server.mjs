import http from 'node:http';
import { handleSiteApiRequest } from '../src/site-api.mjs';

const port = Number(process.env.A_DEEPER_CHINA_API_PORT || process.argv[2] || 8787);
const host = process.env.A_DEEPER_CHINA_API_HOST || '127.0.0.1';

async function readIncomingBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const server = http.createServer(async (request, response) => {
  try {
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await readIncomingBody(request);
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(', '));
      else if (value !== undefined) headers.set(key, value);
    }
    const apiRequest = new Request(`http://${request.headers.host || `${host}:${port}`}${request.url || '/'}`, {
      method: request.method,
      headers,
      body: body?.length ? body : undefined
    });
    const apiResponse = await handleSiteApiRequest(apiRequest);
    response.statusCode = apiResponse.status;
    for (const [key, value] of apiResponse.headers) response.setHeader(key, value);
    const payload = Buffer.from(await apiResponse.arrayBuffer());
    response.end(payload);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' }));
  }
});

server.listen(port, host, () => {
  console.log(`A Deeper China router API listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
