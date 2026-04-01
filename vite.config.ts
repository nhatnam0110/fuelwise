import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Dev-only proxy: forwards /api/generate to Anthropic server-side so the
// API key is never bundled into client code.
// For production deploy, replace this with a serverless function
// (e.g. Vercel /api/generate.ts or Netlify function) that does the same.
function anthropicProxyPlugin(): Plugin {
  return {
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/generate',
        (req: IncomingMessage, res: ServerResponse) => {
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env' }))
            return
          }

          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body)
              const upstream = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                  'content-type': 'application/json',
                },
                body: JSON.stringify(payload),
              })
              const data = await upstream.json()
              res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            } catch {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Proxy error' }))
            }
          })
        }
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), anthropicProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/off': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/off/, ''),
      },
    },
  },
})
