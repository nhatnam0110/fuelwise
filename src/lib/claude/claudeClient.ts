const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1600

/**
 * Sends a system/user prompt pair to Claude through the `/api/generate`
 * proxy (a serverless function that injects the API key server-side so it
 * never reaches the browser) and returns the model's raw text reply.
 */
export async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Request failed (${res.status})`)
  }

  const message = await res.json()
  const raw = message.content?.[0]
  if (!raw || raw.type !== 'text') {
    throw new Error('Unexpected response format from Claude API.')
  }

  return raw.text as string
}
