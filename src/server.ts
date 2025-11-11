import Fastify from 'fastify'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyCors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import fastifyStatic from '@fastify/static'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
config({ path: '.env' })

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

  // Serve static files from Vite build
  const clientDistPath = path.join(__dirname, '..', 'dist', 'client')
  await server.register(fastifyStatic, {
    root: path.join(clientDistPath, 'assets'),
    prefix: '/assets',
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

  server.get('/favicon.ico', async (request, reply) => {
    return reply.sendFile('favicon.ico', path.join(__dirname, '..', 'dist', 'client'))
  })

  server.get('/*', async (request, reply) => {
    if (request.url.startsWith('/api/') || request.url.startsWith('/health')) {
      reply.code(404).send({ error: 'Not found' })
      return
    }

    const urlPath = request.url.split('?')[0]
    const hasFileExtension = Boolean(path.extname(urlPath))

    if (hasFileExtension) {
      reply.code(404).send({ error: 'Not found' })
      return
    }

    return reply.code(200).type('text/html').sendFile('index.html', path.join(__dirname, '..', 'dist', 'client'))
  })

  console.log('[Server] Routes registered successfully')
}

// Start server
const start = async (): Promise<void> => {
  try {
    console.log('[Server] Starting Convergence application...')
    
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
