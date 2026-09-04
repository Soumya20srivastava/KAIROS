# KAIROS - MCP-Based AI Automation Platform

KAIROS lets users give natural-language tasks to LLM agents, which convert them into structured tool calls and controlled multi-step automation through MCP (Model Context Protocol).

## Features

- **MCP Client/Tool Architecture** - LLM → structured tool calls → controlled execution → results
- **Multi-step Agent Workflows** - Complex automation pipelines with decision points
- **External API/Service Integrations** - GitHub, OpenAI, Anthropic, and custom integrations
- **Execution States, Logs & Errors** - Full observability of agent runs
- **Real Database Persistence** - Supabase/PostgreSQL with Row Level Security
- **Complete Authentication** - Register, login, email verification, password reset
- **User Data Isolation** - Each user sees only their own data
- **NERV-Inspired UI** - Dark futuristic interface with neon accents

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom NERV theme
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with RLS
- **MCP**: @modelcontextprotocol/sdk
- **LLM**: Anthropic Claude / OpenAI
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
cd KAIROS

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local
```

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=your-jwt-secret

# LLM / AI Configuration
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# External API Integrations
GITHUB_TOKEN=your-github-token

# MCP Configuration
MCP_SERVER_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_KAIROS_VERSION=1.0.0
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. Enable Email authentication in Supabase Auth settings
4. Configure email templates for verification and password reset

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
KAIROS/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── plans/          # Plans management
│   │   │   ├── decisions/      # Decision history
│   │   │   ├── runs/           # Agent runs
│   │   │   ├── tools/          # Tool registry
│   │   │   ├── evaluations/    # Evaluation results
│   │   │   └── settings/       # User settings
│   │   ├── api/                # API routes
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── verify-email/       # Email verification
│   │   ├── forgot-password/    # Password reset request
│   │   └── reset-password/     # Password reset form
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   └── providers/          # Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── mcp/                    # MCP server/client
│   ├── services/               # Business logic services
│   ├── stores/                 # Zustand state stores
│   └── types/                  # TypeScript type definitions
├── supabase/
│   └── schema.sql              # Database schema
├── tests/                      # Jest tests
└── public/                     # Static assets
```

## Architecture

### MCP Integration

KAIROS uses the Model Context Protocol (MCP) to expose tools to LLM agents:

1. **MCP Server** (`src/mcp/server/index.ts`) - Exposes KAIROS tools via stdio
2. **Tool Registry** - 7 built-in tools for objectives, plans, execution, data, decisions, APIs
3. **Agent Engine** (`src/services/agent-engine.ts`) - Orchestrates multi-step workflows

### Authentication Flow

```
Register → Email Verification → Login → Dashboard
                ↓
         Protected Routes
```

### Database Schema

- `profiles` - User profiles (extends auth.users)
- `objectives` - High-level automation goals
- `plans` - Structured plans with steps
- `agent_runs` - Execution instances
- `decisions` - Decision points during execution
- `tool_executions` - Individual tool call logs

All tables have RLS policies ensuring user data isolation.

## UI Theme

Inspired by Evangelion/NERV:
- Dark futuristic interface (black/deep red/charcoal base)
- Restrained neon cyan/red accents
- Technical HUD elements
- Animated panels and status indicators
- Distinctive typography (Orbitron, JetBrains Mono, Share Tech Mono)

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/objectives` | GET, POST | Objectives CRUD |
| `/api/plans` | GET, POST | Plans CRUD |
| `/api/runs` | GET, POST | Agent runs CRUD |
| `/api/dashboard/stats` | GET | Dashboard statistics |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci

# Watch mode
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by NERV from Evangelion
- Built with Next.js, Supabase, and MCP
- UI components inspired by shadcn/ui