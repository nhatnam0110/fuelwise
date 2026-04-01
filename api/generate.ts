export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY not configured on server' }, 500)
  }

  try {
    const body = await req.json()
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    return json(data, upstream.status)
  } catch {
    return json({ error: 'Proxy error' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
