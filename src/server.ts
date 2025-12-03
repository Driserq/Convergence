import Fastify from 'fastify'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyCors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import fastifyStatic from '@fastify/static'
import fastifyRawBody from 'fastify-raw-body'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
config({ path: '.env' })

const clientDistPath = path.join(__dirname, '..', 'dist', 'client')

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
  }
})

// Register plugins
const registerPlugins = async (): Promise<void> => {
  // Enable CORS
  await server.register(fastifyCors, {
    origin: process.env.NODE_ENV === 'development' ? true : (process.env.FRONTEND_URL || 'http://localhost:3000')
  })

  await server.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true
  })

  // Environment validation
  await server.register(fastifyEnv, {
    confKey: 'config',
    schema: {
      type: 'object',
      required: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GOOGLE_AI_API_KEY'],
      properties: {
        SUPABASE_URL: { type: 'string' },
        SUPABASE_ANON_KEY: { type: 'string' },
        GOOGLE_AI_API_KEY: { type: 'string' },
        SUPADATA_API_KEY: { type: 'string' },
        NODE_ENV: { type: 'string', default: 'development' },
        PORT: { type: 'string', default: '3001' },
        HOST: { type: 'string', default: 'localhost' }
      }
    }
  })

  // Serve Vite build output (assets + PWA artifacts)
  await server.register(fastifyStatic, {
    root: clientDistPath,
    prefix: '/',
    serve: false,
    setHeaders: (res, filePath) => {
      const relativePath = path.relative(clientDistPath, filePath)
      const isAssetFile = relativePath.startsWith(`assets${path.sep}`)
      const fileName = path.basename(filePath)

      if (isAssetFile) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        return
      }

      if (['index.html', 'sw.js', 'manifest.webmanifest'].includes(fileName)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        return
      }

      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    },
  })

  console.log('[Server] Serving static files from:', clientDistPath)
  console.log('[Server] All plugins registered successfully')
}

// Register API routes
const registerRoutes = async (): Promise<void> => {
  // Health check route
  server.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  })

  // Register blueprint API routes
  const blueprintRoutes = await import('./routes/blueprint.js')
  await server.register(blueprintRoutes.default)

  const transcriptRoutes = await import('./routes/transcript.js')
  await server.register(transcriptRoutes.default)

  const trackingRoutes = await import('./routes/tracking.js')
  await server.register(trackingRoutes.default)

  const subscriptionRoutes = await import('./routes/subscription.js')
  await server.register(subscriptionRoutes.default)

  const billingRoutes = await import('./routes/billing.js')
  await server.register(billingRoutes.default)

  const webhookRoutes = await import('./routes/webhook.js')
  await server.register(webhookRoutes.default)

  const retryWorker = await import('./plugins/geminiRetryWorker.js')
  await server.register(retryWorker.default)

  server.get('/*', async (request, reply) => {
    if (request.url.startsWith('/api') || request.url.startsWith('/health')) {
      reply.code(404).send({ error: 'Not found' })
      return
    }

    return reply
      .code(200)
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .type('text/html')
      .sendFile('index.html', clientDistPath)
  })

  console.log('[Server] Routes registered successfully')
}

// Start server
const start = async (): Promise<void> => {
  try {
    console.log('[Server] Starting Consum application...')
    
    await registerPlugins()
    await registerRoutes()

    const host = process.env.HOST || '0.0.0.0'
    const port = parseInt(process.env.PORT || '3001')

    await server.listen({ host, port })
    
    console.log(`[Server] ✅ Server running at http://${host}:${port}`)
    console.log('[Server] Environment:', process.env.NODE_ENV)
    console.log('[Server] Supabase URL:', process.env.SUPABASE_URL)
    
  } catch (error) {
    console.error('[Server] Error starting server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] Received SIGTERM, shutting down gracefully...')
  try {
    await server.close()
    console.log('[Server] Shutdown complete')
    process.exit(0)
  } catch (err) {
    console.error('[Server] Error during shutdown:', err)
    process.exit(1)
  }
})

process.on('SIGINT', async () => {
  console.log('[Server] Received SIGINT, shutting down gracefully...')
  try {
    await server.close()
    console.log('[Server] Shutdown complete')
    process.exit(0)
  } catch (err) {
    console.error('[Server] Error during shutdown:', err)
    process.exit(1)
  }
})

// Start the server
start()
