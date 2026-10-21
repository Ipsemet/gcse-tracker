/**
 * Claude API proxy for Harry's GCSE Command Centre.
 *
 * Keeps the Anthropic key server-side so it never reaches the browser. Deploy to
 * Cloudflare Workers (free tier is ample) and put the resulting URL into the app's
 * Settings under AI > Proxy URL.
 *
 *   npx wrangler deploy
 *   npx wrangler secret put ANTHROPIC_API_KEY
 *
 * Set ALLOWED_ORIGIN in wrangler.toml to the app's origin so the endpoint is not
 * an open relay to your account. SHARED_SECRET is optional belt-and-braces: set
 * it and the app must send the same value as `x-app-secret`.
 */

const MODELS = new Set(['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5-20251001'])
const MAX_TOKENS_CEILING = 2048
const MAX_BODY_BYTES = 100_000

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const allowed = (env.ALLOWED_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    const originOk = allowed.length === 0 || allowed.includes(origin)
    const cors = {
      'Access-Control-Allow-Origin': originOk && origin ? origin : (allowed[0] ?? '*'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, x-app-secret',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    }

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, cors)
    if (!originOk) return json({ error: 'Origin not allowed' }, 403, cors)

    if (env.SHARED_SECRET && request.headers.get('x-app-secret') !== env.SHARED_SECRET) {
      return json({ error: 'Bad or missing app secret' }, 401, cors)
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Worker has no ANTHROPIC_API_KEY secret set' }, 500, cors)
    }

    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Request too large' }, 413, cors)

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors)
    }

    // Only let through the shape the app actually sends, with capped limits.
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: 'messages required' }, 400, cors)
    }
    if (body.model && !MODELS.has(body.model)) {
      return json({ error: `Unsupported model: ${body.model}` }, 400, cors)
    }

    const payload = {
      model: body.model ?? 'claude-sonnet-5',
      max_tokens: Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CEILING),
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.3,
      messages: body.messages.slice(-20).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content ?? '').slice(0, 20_000),
      })),
      ...(body.system ? { system: String(body.system).slice(0, 8_000) } : {}),
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'content-type': 'application/json' },
    })
  },
}

const json = (data, status, cors) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  })
