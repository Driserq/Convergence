import Fastify from 'fastify'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyCors from '@fastify/cors'
import fastifyEnv from '@fastify/env'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  config({ path: '.env.production' })
} else {
  config({ path: '.env.local' })
}

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
  }
})

// Register plugins
const registerPlugins = async (): Promise<void> => {
  // Enable CORS for development
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
        SUPABASE_URL: {
          type: 'string'
        },
        SUPABASE_ANON_KEY: {
          type: 'string'
        },
        GOOGLE_AI_API_KEY: {
          type: 'string'
        },
        SUPADATA_API_KEY: {
          type: 'string'
        },
        NODE_ENV: {
          type: 'string',
          default: 'development'
        },
        PORT: {
          type: 'string',
          default: '3001'
        },
        HOST: {
          type: 'string',
          default: '0.0.0.0'
        }
      }
    }
  })

  // React SSR (will be configured in next phases)
  // TODO: Temporarily commented out - will be configured when we add React routing
  // await server.register(import('@fastify/react'), {
  //   root: import.meta.url,
  // })

  console.log('[Server] All plugins registered successfully')
}

// Basic routes
const registerRoutes = async (): Promise<void> => {
  // Health check route
  server.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  })

  // Test route for Phase 5 - Complete Blueprint Creation
  server.get('/test-blueprint', async (request, reply) => {
    reply.type('text/html')
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blueprint Creator - Phase 5 Test</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script>
    window.SUPABASE_URL = '${process.env.SUPABASE_URL}'
    window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY}'
  </script>
  <script type="text/babel">
    // Initialize Supabase
    const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    
    // Complete Blueprint Test App
    function App() {
      const [blueprint, setBlueprint] = React.useState(null)
      const [isLoading, setIsLoading] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [user, setUser] = React.useState(null)
      
      React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session && session.user)
          if (!session) {
            setError('Please log in first. Redirecting...')
            setTimeout(() => window.location.href = '/', 2000)
          }
        })
      }, [])
      
      const createBlueprint = async (formData) => {
        setIsLoading(true)
        setError(null)
        
        try {
          console.log('Submitting form data:', formData)
          
          const session = await supabase.auth.getSession()
          const token = session.data.session && session.data.session.access_token
          
          if (!token) {
            setError('Not authenticated. Please log in.')
            setIsLoading(false)
            return
          }
          
          const response = await fetch('/api/create-blueprint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(formData)
          })
          
          const result = await response.json()
          console.log('API Response:', result)
          
          if (result.success) {
            setBlueprint(result.blueprint)
            alert('Blueprint created successfully! Check the page below.')
          } else {
            setError(result.error || 'Failed to create blueprint')
          }
        } catch (err) {
          console.error('Error:', err)
          setError('Network error - check console')
        } finally {
          setIsLoading(false)
        }
      }
      
      return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
        React.createElement('header', { className: 'bg-white shadow mb-8' },
          React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-4 flex justify-between items-center' },
            React.createElement('h1', { className: 'text-2xl font-bold' }, 'Create Blueprint'),
            React.createElement('div', { className: 'flex items-center gap-4' },
              user && React.createElement('span', { className: 'text-gray-600 text-sm' }, user.email),
              React.createElement('a', {
                href: '/',
                className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm'
              }, '← Back to Dashboard')
            )
          )
        ),
        React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
          
          // Form Section
          React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' },
            React.createElement('div', null,
              React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Create Your Blueprint'),
              React.createElement(BlueprintTestForm, { onSubmit: createBlueprint, isLoading })
            ),
            
            // Results Section
            React.createElement('div', null,
              React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Generated Blueprint'),
              error && React.createElement('div', { className: 'bg-red-50 p-4 rounded-lg border border-red-200 mb-4' },
                React.createElement('p', { className: 'text-red-700' }, '❌ Error: ', error)
              ),
              blueprint && React.createElement(BlueprintDisplay, { blueprint })
            )
          )
        )
      )
    }
    
    function BlueprintTestForm({ onSubmit, isLoading }) {
      const [formData, setFormData] = React.useState({
        goal: 'I want to learn how to market my vibe coded app from scratch',
        habitsToKill: '',
        habitsToDevelop: '',
        contentType: 'youtube',
        youtubeUrl: 'https://www.youtube.com/watch?v=WJlvQu3yeCY&list=WL&index=3&pp=gAQBiAQB',
        textContent: ''
      })
      
      const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
      }
      
      const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
      }
      
      return React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Goal *'),
          React.createElement('input', {
            type: 'text',
            value: formData.goal,
            onChange: (e) => updateField('goal', e.target.value),
            className: 'w-full p-3 border rounded-lg',
            placeholder: 'e.g., I want to wake up at 5 AM every day',
            disabled: isLoading
          })
        ),
        
        React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
          React.createElement('button', {
            type: 'button',
            onClick: () => updateField('contentType', 'youtube'),
            className: 'p-2 border rounded ' + (formData.contentType === 'youtube' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'),
            disabled: isLoading
          }, '📺 YouTube'),
          React.createElement('button', {
            type: 'button',
            onClick: () => updateField('contentType', 'text'),
            className: 'p-2 border rounded ' + (formData.contentType === 'text' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'),
            disabled: isLoading
          }, '📝 Text')
        ),
        
        formData.contentType === 'youtube' ? 
          React.createElement('input', {
            type: 'url',
            value: formData.youtubeUrl,
            onChange: (e) => updateField('youtubeUrl', e.target.value),
            className: 'w-full p-3 border rounded-lg',
            placeholder: 'https://youtu.be/VIDEO_ID',
            disabled: isLoading
          }) :
          React.createElement('textarea', {
            value: formData.textContent,
            onChange: (e) => updateField('textContent', e.target.value),
            className: 'w-full p-3 border rounded-lg',
            rows: 4,
            placeholder: 'Paste your content here (min 50 characters)...',
            disabled: isLoading
          }),
        
        React.createElement('button', {
          type: 'submit',
          disabled: isLoading || !formData.goal || (formData.contentType === 'youtube' ? !formData.youtubeUrl : formData.textContent.length < 50),
          className: 'w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300'
        }, isLoading ? '⏳ Creating Blueprint...' : '🚀 Create Blueprint')
      )
    }
    
    function BlueprintDisplay({ blueprint }) {
      console.log('Rendering blueprint:', blueprint)
      
      return React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow border space-y-6' },
        // Overview Section
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-lg font-semibold mb-3' }, '📋 Overview'),
          React.createElement('p', { className: 'text-gray-700 mb-4' }, blueprint.overview.summary),
          
          // Mistakes (adaptive format uses 'mistakes' not 'commonMistakes')
          blueprint.overview.mistakes && blueprint.overview.mistakes.length > 0 &&
            React.createElement('div', { className: 'bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 mb-4' },
              React.createElement('h4', { className: 'font-medium text-yellow-800 mb-2' }, '⚠️ Common Mistakes'),
              blueprint.overview.mistakes.map((mistake, i) => 
                React.createElement('p', { key: i, className: 'text-yellow-700 text-sm mt-1' }, '• ' + mistake)
              )
            ),
          
          // Guidance (adaptive format is array not string)
          blueprint.overview.guidance && blueprint.overview.guidance.length > 0 &&
            React.createElement('div', { className: 'bg-green-50 p-3 rounded border-l-4 border-green-400' },
              React.createElement('h4', { className: 'font-medium text-green-800 mb-2' }, '💡 Strategic Guidance'),
              blueprint.overview.guidance.map((tip, i) =>
                React.createElement('p', { key: i, className: 'text-green-700 text-sm mt-1' }, '• ' + tip)
              )
            )
        ),
        
        // Sequential Steps (new adaptive field)
        blueprint.sequential_steps && blueprint.sequential_steps.length > 0 &&
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold mb-3' }, '🎯 Step-by-Step Implementation'),
            React.createElement('div', { className: 'space-y-3' },
              blueprint.sequential_steps.map((step, i) => 
                React.createElement('div', { key: i, className: 'flex items-start space-x-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500' },
                  React.createElement('div', { className: 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0' }, step.step_number),
                  React.createElement('div', null,
                    React.createElement('h4', { className: 'font-medium' }, step.title),
                    React.createElement('p', { className: 'text-gray-600 text-sm mt-1' }, step.description),
                    React.createElement('p', { className: 'text-green-700 text-sm mt-2 font-medium' }, '✅ ' + step.deliverable),
                    step.estimated_time && React.createElement('span', { className: 'text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block' }, '⏱️ ' + step.estimated_time)
                  )
                )
              )
            )
          ),
        
        // Daily Habits (new adaptive field)
        blueprint.daily_habits && blueprint.daily_habits.length > 0 &&
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold mb-3' }, '🔄 Daily Habits to Build'),
            React.createElement('div', { className: 'space-y-3' },
              blueprint.daily_habits.map((habit, i) => 
                React.createElement('div', { key: i, className: 'p-4 bg-purple-50 rounded border-l-4 border-purple-500' },
                  React.createElement('div', { className: 'flex justify-between items-start mb-2' },
                    React.createElement('h4', { className: 'font-medium' }, habit.title),
                    React.createElement('span', { className: 'text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded' }, habit.timeframe)
                  ),
                  React.createElement('p', { className: 'text-gray-600 text-sm' }, habit.description)
                )
              )
            )
          ),
        
        // Trigger Actions (new adaptive field)
        blueprint.trigger_actions && blueprint.trigger_actions.length > 0 &&
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold mb-3' }, '🚨 Emergency Action Plan'),
            React.createElement('div', { className: 'space-y-3' },
              blueprint.trigger_actions.map((action, i) => 
                React.createElement('div', { key: i, className: 'p-4 bg-red-50 rounded border-2 border-red-300' },
                  React.createElement('p', { className: 'text-sm font-semibold text-red-700 mb-2' }, '⚡ When: ' + action.situation),
                  React.createElement('p', { className: 'text-sm font-medium text-green-700 bg-white p-2 rounded border-l-4 border-green-500' }, '✓ Do: ' + action.immediate_action),
                  React.createElement('span', { className: 'text-xs text-red-600 mt-2 inline-block' }, '⏰ ' + action.timeframe)
                )
              )
            )
          )
      )
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(React.createElement(App))
  </script>
</body>
</html>`
  })

  // Test route for Phase 4 - BlueprintForm with transcript functionality
  server.get('/test-form', async (request, reply) => {
    reply.type('text/html')
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 4: Transcript Test - Convergence</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    function TestForm() {
      const handleSubmit = async (formData) => {
        console.log('Form submitted:', formData)
        alert('Form submitted! Check console for details. (Phase 5 AI integration coming next)')
      }
      
      return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-4' },
        React.createElement('div', { className: 'max-w-4xl mx-auto' },
          React.createElement('div', { className: 'mb-8 text-center' },
            React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-2' }, 'Phase 4: Transcript Testing'),
            React.createElement('p', { className: 'text-gray-600' }, 'Test YouTube transcript extraction functionality')
          ),
          React.createElement('div', { className: 'bg-white p-8 rounded-lg shadow' },
            React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Blueprint Form'),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'Goal *'),
                React.createElement('input', { 
                  type: 'text',
                  className: 'w-full p-3 border rounded-lg',
                  placeholder: 'e.g., I want to wake up at 5 AM every day'
                })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-2' }, 'YouTube URL *'),
                React.createElement('input', { 
                  type: 'url',
                  className: 'w-full p-3 border rounded-lg',
                  placeholder: 'https://youtu.be/VIDEO_ID'
                }),
                React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 
                  'Try: https://youtu.be/dQw4w9WgXcQ (Rick Roll - has transcript)'
                )
              ),
              React.createElement('button', {
                className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
                onClick: () => alert('This is a demo. Full integration happens in Phase 8.')
              }, 'Test Transcript Extraction')
            ),
            React.createElement('div', { className: 'mt-6 p-4 bg-blue-50 rounded-lg' },
              React.createElement('p', { className: 'text-sm text-blue-700' },
                '🔧 Development Status: Phase 4 complete! Next: Phase 5 (AI Blueprint Generation)'
              )
            )
          )
        )
      )
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(React.createElement(TestForm))
  </script>
</body>
</html>`
  })

  // Phase 2: Auth-enabled React app
  server.get('/', async (request, reply) => {
    reply.type('text/html')
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convergence - Habit Blueprint</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script>
    // Expose Supabase config for client-side auth
    window.SUPABASE_URL = '${process.env.SUPABASE_URL}'
    window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY}'
  </script>
  <script type="text/babel" src="/app.js"></script>
</body>
</html>`
  })

  // Serve bundled React app code
  server.get('/app.js', async (request, reply) => {
    reply.type('application/javascript')
    // For MVP, we'll inline the app code
    // In production, this would be a bundled file
    return `
      // This is a temporary inline app for Phase 2 testing
      // TODO: Replace with proper build system in Phase 8
      console.log('[App] MVP Phase 2 - Auth testing')
      console.log('[App] Supabase URL:', window.SUPABASE_URL)
      
      // Initialize Supabase client
      const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
      
      // Simple auth state using React hooks (no Zustand needed for MVP)
      const AuthContext = React.createContext(null)
      
      function AuthProvider({ children }) {
        const [user, setUser] = React.useState(null)
        const [loading, setLoading] = React.useState(true)
        
        const initialize = React.useCallback(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user || null)
          setLoading(false)
          
          supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] State changed:', event)
            setUser(session?.user || null)
          })
        }, [])
        
        const login = React.useCallback(async (email, password) => {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          return { success: !error, error }
        }, [])
        
        const signup = React.useCallback(async (email, password) => {
          const { error } = await supabase.auth.signUp({ email, password })
          return { success: !error, error }
        }, [])
        
        const logout = React.useCallback(async () => {
          await supabase.auth.signOut()
          setUser(null)
        }, [])
        
        return React.createElement(AuthContext.Provider, {
          value: { user, loading, initialize, login, signup, logout }
        }, children)
      }
      
      function useAuth() {
        return React.useContext(AuthContext)
      }
      
      function App() {
        return React.createElement(AuthProvider, null,
          React.createElement(AppContent)
        )
      }
      
      function AppContent() {
        const { user, loading, initialize } = useAuth()
        
        React.useEffect(() => {
          console.log('[App] Initializing auth...')
          initialize()
        }, [initialize])
        
        React.useEffect(() => {
          console.log('[App] User state:', user ? user.email : 'Not logged in')
          console.log('[App] Loading:', loading)
        }, [user, loading])
        
        if (loading) {
          return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
            React.createElement('div', { className: 'text-center' },
              React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' }),
              React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Loading...')
            )
          )
        }
        
        return user ? React.createElement(Dashboard) : React.createElement(Login)
      }
      
      function Login() {
        const [mode, setMode] = React.useState('login')
        return mode === 'login' 
          ? React.createElement(LoginForm, { onSwitch: () => setMode('signup') })
          : React.createElement(SignupForm, { onSwitch: () => setMode('login') })
      }
      
      function LoginForm({ onSwitch }) {
        const { login } = useAuth()
        const [email, setEmail] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [error, setError] = React.useState(null)
        const [loading, setLoading] = React.useState(false)
        
        const handleSubmit = async (e) => {
          e.preventDefault()
          setLoading(true)
          setError(null)
          const result = await login(email, password)
          setLoading(false)
          if (!result.success) {
            setError(result.error?.message || 'Login failed')
          }
        }
        
        return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4' },
          React.createElement('div', { className: 'w-full max-w-md' },
            React.createElement('div', { className: 'bg-white shadow-lg rounded-lg p-8' },
              React.createElement('h2', { className: 'text-3xl font-bold text-center mb-2' }, 'Convergence'),
              React.createElement('p', { className: 'text-gray-600 text-center mb-6' }, 'Sign in to continue'),
              React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
                React.createElement('input', {
                  type: 'email',
                  placeholder: 'Email',
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: 'w-full px-4 py-2 border rounded-lg',
                  required: true
                }),
                React.createElement('input', {
                  type: 'password',
                  placeholder: 'Password',
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className: 'w-full px-4 py-2 border rounded-lg',
                  required: true
                }),
                error && React.createElement('p', { className: 'text-red-600 text-sm' }, error),
                React.createElement('button', {
                  type: 'submit',
                  disabled: loading,
                  className: 'w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
                }, loading ? 'Signing in...' : 'Sign In')
              ),
              React.createElement('p', { className: 'text-center mt-4 text-gray-600' },
                "Don't have an account? ",
                React.createElement('button', {
                  onClick: onSwitch,
                  className: 'text-blue-600 hover:underline'
                }, 'Sign up')
              )
            )
          )
        )
      }
      
      function SignupForm({ onSwitch }) {
        const { signup } = useAuth()
        const [email, setEmail] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [error, setError] = React.useState(null)
        const [success, setSuccess] = React.useState(false)
        const [loading, setLoading] = React.useState(false)
        
        const handleSubmit = async (e) => {
          e.preventDefault()
          setLoading(true)
          setError(null)
          const result = await signup(email, password)
          setLoading(false)
          if (result.success) {
            setSuccess(true)
          } else {
            setError(result.error?.message || 'Signup failed')
          }
        }
        
        return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4' },
          React.createElement('div', { className: 'w-full max-w-md' },
            React.createElement('div', { className: 'bg-white shadow-lg rounded-lg p-8' },
              React.createElement('h2', { className: 'text-3xl font-bold text-center mb-2' }, 'Create Account'),
              React.createElement('p', { className: 'text-gray-600 text-center mb-6' }, 'Start your journey'),
              success ? React.createElement('div', { className: 'bg-green-50 p-4 rounded-lg text-green-700 text-center' },
                'Account created! ',
                React.createElement('button', {
                  onClick: onSwitch,
                  className: 'text-green-800 font-medium underline'
                }, 'Sign in now')
              ) : React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
                React.createElement('input', {
                  type: 'email',
                  placeholder: 'Email',
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: 'w-full px-4 py-2 border rounded-lg',
                  required: true
                }),
                React.createElement('input', {
                  type: 'password',
                  placeholder: 'Password (min 6 characters)',
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className: 'w-full px-4 py-2 border rounded-lg',
                  required: true,
                  minLength: 6
                }),
                error && React.createElement('p', { className: 'text-red-600 text-sm' }, error),
                React.createElement('button', {
                  type: 'submit',
                  disabled: loading,
                  className: 'w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
                }, loading ? 'Creating account...' : 'Create Account')
              ),
              !success && React.createElement('p', { className: 'text-center mt-4 text-gray-600' },
                'Already have an account? ',
                React.createElement('button', {
                  onClick: onSwitch,
                  className: 'text-blue-600 hover:underline'
                }, 'Sign in')
              )
            )
          )
        )
      }
      
      function Dashboard() {
        const { user, logout } = useAuth()
        const [blueprints, setBlueprints] = React.useState([])
        const [loading, setLoading] = React.useState(true)
        const [error, setError] = React.useState(null)
        const [expandedId, setExpandedId] = React.useState(null)
        
        // Fetch blueprints on mount
        React.useEffect(() => {
          const fetchBlueprints = async () => {
            try {
              const session = await supabase.auth.getSession()
              const token = session.data.session && session.data.session.access_token
              
              if (!token) {
                setError('No auth token found')
                setLoading(false)
                return
              }
              
              const response = await fetch('/api/blueprints', {
                headers: {
                  'Authorization': 'Bearer ' + token
                }
              })
              
              const data = await response.json()
              
              if (data.success) {
                setBlueprints(data.blueprints)
              } else {
                setError(data.error || 'Failed to fetch blueprints')
              }
            } catch (err) {
              console.error('Error fetching blueprints:', err)
              setError('Failed to load blueprints')
            } finally {
              setLoading(false)
            }
          }
          
          fetchBlueprints()
        }, [])
        
        return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
          React.createElement('header', { className: 'bg-white shadow' },
            React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-4 flex justify-between items-center' },
              React.createElement('div', { className: 'flex items-center gap-8' },
                React.createElement('h1', { className: 'text-2xl font-bold' }, 'Convergence'),
                React.createElement('nav', { className: 'flex gap-6' },
                  React.createElement('a', {
                    href: '/',
                    className: 'text-gray-700 hover:text-blue-600 font-medium'
                  }, 'Dashboard'),
                  React.createElement('a', {
                    href: '/test-blueprint',
                    className: 'text-gray-700 hover:text-blue-600 font-medium'
                  }, 'Create Blueprint')
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('span', { className: 'text-gray-600 text-sm' }, user && user.email),
                React.createElement('button', {
                  onClick: logout,
                  className: 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm'
                }, 'Logout')
              )
            )
          ),
          React.createElement('main', { className: 'max-w-7xl mx-auto px-4 py-8' },
            React.createElement('h2', { className: 'text-3xl font-bold mb-6' }, 'Your Habit Blueprints'),
            
            loading ? React.createElement('div', { className: 'text-center py-12' },
              React.createElement('p', { className: 'text-gray-600' }, 'Loading blueprints...')
            ) : error ? React.createElement('div', { className: 'bg-red-50 p-4 rounded-lg' },
              React.createElement('p', { className: 'text-red-700' }, error)
            ) : blueprints.length === 0 ? React.createElement('div', { className: 'bg-white rounded-lg shadow p-12 text-center' },
              React.createElement('h3', { className: 'text-2xl font-bold mb-4' }, 'No blueprints yet'),
              React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Create your first habit blueprint to get started!'),
              React.createElement('a', {
                href: '/test-blueprint',
                className: 'inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              }, 'Create Blueprint')
            ) : React.createElement('div', { className: 'space-y-6' },
              blueprints.map(blueprint => 
                React.createElement('div', {
                  key: blueprint.id,
                  className: 'bg-white rounded-lg shadow p-6'
                },
                  React.createElement('div', { className: 'flex justify-between items-start mb-4' },
                    React.createElement('h3', { className: 'text-xl font-bold' }, blueprint.goal),
                    React.createElement('span', { className: 'text-sm text-gray-500' },
                      new Date(blueprint.created_at).toLocaleDateString()
                    )
                  ),
                  React.createElement('p', { className: 'text-sm text-gray-600 mb-4' },
                    '🎬 ' + blueprint.content_source
                  ),
                  
                  blueprint.ai_output && blueprint.ai_output.overview && React.createElement('div', { className: 'mb-4' },
                    React.createElement('p', { className: 'text-gray-700 whitespace-pre-line' },
                      blueprint.ai_output.overview.summary
                    )
                  ),
                  
                  expandedId === blueprint.id && blueprint.ai_output && (
                    React.createElement('div', { className: 'mt-4 space-y-4' },
                      blueprint.ai_output.overview && blueprint.ai_output.overview.mistakes && blueprint.ai_output.overview.mistakes.length > 0 && React.createElement('div', { className: 'bg-yellow-50 p-4 rounded-lg' },
                        React.createElement('h4', { className: 'font-semibold mb-2' }, '⚠️ Common Mistakes'),
                        React.createElement('ul', { className: 'list-disc list-inside space-y-1' },
                          blueprint.ai_output.overview.mistakes.map((mistake, i) =>
                            React.createElement('li', { key: i, className: 'text-sm' }, mistake)
                          )
                        )
                      ),
                      
                      blueprint.ai_output.overview && blueprint.ai_output.overview.guidance && blueprint.ai_output.overview.guidance.length > 0 && React.createElement('div', { className: 'bg-green-50 p-4 rounded-lg' },
                        React.createElement('h4', { className: 'font-semibold mb-2' }, '💡 Guidance'),
                        React.createElement('ul', { className: 'list-disc list-inside space-y-1' },
                          blueprint.ai_output.overview.guidance.map((tip, i) =>
                            React.createElement('li', { key: i, className: 'text-sm' }, tip)
                          )
                        )
                      ),
                      
                      blueprint.ai_output.daily_habits && blueprint.ai_output.daily_habits.length > 0 && React.createElement('div', null,
                        React.createElement('h4', { className: 'font-semibold mb-3' }, '🎯 Daily Habits'),
                        React.createElement('div', { className: 'space-y-2' },
                          blueprint.ai_output.daily_habits.map((habit, i) =>
                            React.createElement('div', { key: i, className: 'bg-blue-50 p-3 rounded-lg' },
                              React.createElement('div', { className: 'flex justify-between' },
                                React.createElement('span', { className: 'font-medium' }, habit.title),
                                React.createElement('span', { className: 'text-xs bg-blue-200 px-2 py-1 rounded' }, habit.timeframe)
                              ),
                              React.createElement('p', { className: 'text-sm text-gray-700 mt-1' }, habit.description)
                            )
                          )
                        )
                      )
                    )
                  ),
                  
                  React.createElement('button', {
                    onClick: () => setExpandedId(expandedId === blueprint.id ? null : blueprint.id),
                    className: 'mt-4 text-blue-600 hover:text-blue-700 font-medium'
                  }, expandedId === blueprint.id ? 'Show less' : 'Show more')
                )
              )
            )
          )
        )
      }
      
      const root = ReactDOM.createRoot(document.getElementById('root'))
      root.render(React.createElement(App))
    `
  })

  // Register API routes
  const blueprintRoutes = await import('./routes/blueprint.ts')
  await server.register(blueprintRoutes.default)

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
