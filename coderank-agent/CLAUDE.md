# CLAUDE.md — CodeRank Agent

## Overview
AI-powered coding assistant for the CodeRank platform. Uses an agentic loop with tool calling to help users with problems, courses, and code analysis.

## Commands
```bash
npm run dev           # Dev with nodemon (port 4000)
npm start             # Production (ts-node)
```

## Architecture
```
src/
  main.ts             # Express server, /agent/query endpoint
  api/                # HTTP client for coderank-api communication
  config/             # Environment config (dotenv)
  core/
    agent/            # Agentic loop (max 10 iterations)
    llm/              # LLM abstraction layer
      llm.factory.ts  # Factory for provider selection
      llm.interface.ts # Common interface
      providers/      # Gemini, Ollama, Groq implementations
    tools/            # Tool system
      tool.registry.ts # Registry for all available tools
      tool.interface.ts # Tool type definitions
      base/           # Base tool utilities
      problems/       # Problem-related tools
      courses/        # Course-related tools
  prompts/            # System prompts (role-aware)
```

## LLM Providers
- **Gemini** (default): `gemini-2.5-flash` via `@google/generative-ai`
- **Ollama**: Local models via `ollama` package
- **Groq**: Fast inference via `groq-sdk`

## Tool Pattern
Each tool follows this structure:
- Zod schema for parameter validation
- `name` and `description` for LLM function calling
- `execute()` method that calls coderank-api via authenticated HTTP
- Registered in `tool.registry.ts`

## API Communication
- Agent authenticates to coderank-api using Bearer token from user request
- Uses Axios HTTP client in `src/api/api-client.ts`
- Base URL configurable via `NESTJS_API_URL` env var

## Adding New Tools
1. Create tool file in appropriate `src/core/tools/` subdirectory
2. Define Zod schema for parameters
3. Implement `Tool` interface with name, description, schema, execute
4. Register in `tool.registry.ts`
