# Project Setup - Convergence App

## Prerequisites
- **Node.js**: v22.x LTS (recommended for production stability)
- **npm**: v10+ (comes with Node.js 22)
- **Docker**: Required for Supabase local development
- **Git**: For version control

## Initial Setup Commands

### 1. Verify Node.js Version
node --version # Should show v22.x.x
npm --version # Should show v10.x.x

### 2. Create Project Directory
mkdir convergence-app
cd convergence-app

### 3. Initialize Git Repository
git init

### 4. Create .gitignore File
Create a file named .gitignore in the project root with the following content:

Dependencies
node_modules/
.pnp
.pnp.js

Environment variables
.env
.env.local
.env.*.local

Build outputs
dist/
build/
.fastify/
*.tsbuildinfo

Logs
logs/
.log
npm-debug.log
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

Operating System
.DS_Store
Thumbs.db

IDE
.vscode/
.idea/
*.swp
*.swo
*~

Supabase
supabase/.branches
supabase/.temp
.supabase/

Testing
coverage/
.nyc_output/

Misc
.cache/

### 5. Create .env.example File
Create a file named .env.example as a template (this WILL be committed to git):

Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_local_anon_key_here

Google Gemini AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_key_here

Environment
NODE_ENV=development

Server Configuration
PORT=3000
HOST=0.0.0.0

### 6. Create Your Actual .env File
cp .env.example .env

**Important**: Edit .env and add your actual API keys. This file will NOT be committed to git.

**To get your Google AI API key:**
1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Create new API key or use existing
4. Copy key to .env file

### 7. Initialize Node.js Project
npm init -y

### 8. Install Core Dependencies
Fastify and React
npm install fastify @fastify/react @fastify/cors @fastify/env

Supabase
npm install @supabase/supabase-js

Google Gemini AI
npm install @google/generative-ai

YouTube Transcript
npm install youtube-transcript

Utilities
npm install axios zod dotenv

State Management
npm install zustand

UI Framework
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

### 9. Install Development Dependencies
npm install --save-dev typescript @types/node @types/react @types/react-dom
npm install --save-dev tsx nodemon
npm install --save-dev supabase

### 10. Initialize TypeScript
npx tsc --init

Update tsconfig.json with these settings:
{
"compilerOptions": {
"target": "ES2022",
"module": "commonjs",
"lib": ["ES2022"],
"jsx": "react-jsx",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true,
"moduleResolution": "node",
"resolveJsonModule": true,
"outDir": "./dist",
"rootDir": "./src"
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist"]
}

### 11. Initialize TailwindCSS
npx tailwindcss init -p

Update tailwind.config.js:
/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
"./src/**/*.{js,jsx,ts,tsx}",
],
theme: {
extend: {},
},
plugins: [],
}

### 12. Initialize Supabase Locally
npx supabase init
npx supabase start

**Save the output**: Supabase will display URLs and keys. Copy the anon key to your .env file.

### 13. Set Up Database Schema
1. Go to http://localhost:54323 (Supabase Studio)
2. Navigate to SQL Editor
3. Paste and run the SQL from SCHEMA.md

## Project Folder Structure

Create this folder structure manually or let Warp create it:

convergence-app/
├── .git/ # Git repository
├── .env # Environment variables (NOT in git)
├── .env.example # Template (IN git)
├── .gitignore # Git ignore rules
├── package.json # Dependencies
├── tsconfig.json # TypeScript config
├── tailwind.config.js # TailwindCSS config
├── postcss.config.js # PostCSS config
├── supabase/ # Supabase local files
│ ├── config.toml
│ └── migrations/
├── src/ # Source code
│ ├── server.ts # Fastify server entry point
│ ├── components/ # React components
│ │ ├── auth/ # Auth-related components
│ │ ├── blueprint/ # Blueprint-related components
│ │ └── ui/ # Reusable UI components (Shadcn)
│ ├── pages/ # Page components
│ │ ├── Home.tsx
│ │ ├── History.tsx
│ │ └── Login.tsx
│ ├── lib/ # Utilities and helpers
│ │ ├── supabase.ts # Supabase client setup
│ │ ├── gemini.ts # Gemini AI client setup
│ │ └── utils.ts # General utilities
│ ├── hooks/ # Custom React hooks
│ │ ├── useAuth.ts
│ │ └── useBlueprints.ts
│ ├── types/ # TypeScript types
│ │ ├── blueprint.ts
│ │ └── user.ts
│ ├── routes/ # Fastify API routes
│ │ ├── transcript.ts
│ │ ├── generate.ts
│ │ └── blueprints.ts
│ └── styles/ # Global styles
│ └── globals.css # Tailwind imports
└── DOCS/ # Documentation files
├── TECH_STACK.md
├── SCHEMA.md
├── rules.md
├── PLAN.md
├── PROJECT_SETUP.md
└── EXAMPLES.md

## Update package.json Scripts

Add these scripts to your package.json:

{
"scripts": {
"dev": "tsx watch src/server.ts",
"build": "tsc",
"start": "node dist/server.js",
"supabase:start": "npx supabase start",
"supabase:stop": "npx supabase stop",
"supabase:status": "npx supabase status"
}
}

## Verification Checklist

Before starting development, verify:

- [ ] Node.js 22.x installed (node --version)
- [ ] Git repository initialized (git status works)
- [ ] .env file created with actual API keys (Supabase + Google AI)
- [ ] .gitignore in place (.env should NOT show in git status)
- [ ] Dependencies installed (node_modules/ exists)
- [ ] Supabase running locally (npx supabase status)
- [ ] Database schema created (check Supabase Studio)
- [ ] TypeScript compiles (npx tsc --noEmit)

## First Run

Terminal 1: Start Supabase (if not already running)
npx supabase start

Terminal 2: Start development server
npm run dev

Open browser at http://localhost:3000

## Common Issues & Solutions

### Supabase won't start
- **Solution**: Ensure Docker is running
- Check ports 54321, 54323 aren't in use

### TypeScript errors
- **Solution**: Run npm install again
- Verify tsconfig.json settings match above

### Missing API keys
- **Solution**: Check .env file exists and has all keys
- Copy from .env.example and add real values
- Get Google AI key from https://aistudio.google.com/

### Can't connect to Supabase
- **Solution**: Run npx supabase status to get connection details
- Update SUPABASE_URL and SUPABASE_ANON_KEY in .env

### Gemini API errors
- **Solution**: Verify GOOGLE_AI_API_KEY in .env is correct
- Check free tier limits (1,500 requests/day)
- Ensure API key has Gemini API enabled

## Next Steps

1. Review PLAN.md to understand development phases
2. Start with Phase 1: Foundation & Setup (most is done!)
3. Move to Phase 2: Authentication Flow
4. Refer to rules.md for coding standards
5. Use EXAMPLES.md for sample data during testing

---

**Ready to code!** Follow the phases in PLAN.md and refer to rules.md for how Warp should write the code.
