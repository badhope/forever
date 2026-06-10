# Forever

> TypeScript-native AI agent framework, built for the awkward corner of
> "I want to keep talking to this person who's gone" and the more useful
> corner of "I want a long-running agent that actually gets better at my
> job over weeks, not turns".

The name is half joke, half ambition. Don't read too much into it.

---

## What's here

- A multi-agent runtime (coordinator / delegator / swarm patterns) you can
  embed in a Node service or a CLI.
- 16+ LLM adapters behind one interface — switch providers without
  rewriting prompts.
- RAG pipeline with a real vector store, not "we shove embeddings in
  Postgres and call it done".
- MCP support and a graph-based workflow engine when the linear plan
  gets long.
- Safety guardrails (rate limits, content filters, escalation hooks)
  because the worst thing an agent can do is to act too fast.

## What's not here (yet)

- Production-grade memory that survives container restarts. The current
  Prisma-backed memory works but is not what I'd ship to a customer
  billing for the agent.
- A hosted version. This is a framework; you bring the box.
- A public roadmap. I work on it when I work on it.

## Quick start

```bash
git clone https://github.com/badhope/forever.git
cd forever
pnpm install
pnpm dev
```

That's it. The first run walks you through provider config and drops you
into the TUI.

---



Forever AI is a TypeScript-native AI Agent framework featuring multi-agent orchestration, unified LLM adapter, RAG pipeline, and comprehensive safety guardrails.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-Agent System** | Coordinator, Delegator, Swarm collaboration patterns |
| 📚 **RAG Pipeline** | End-to-end knowledge base with vector store |
| 💾 **Database Layer** | Memory storage with Prisma support |
| 🔧 **Built-in Tools** | Calculator, File operations, Search, etc. |
| 📊 **REST API** | Express server with comprehensive endpoints |
| 🧪 **Testing** | Vitest testing with 55+ test cases |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/badhope/forever.git
cd forever

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your configuration

# Run
npm run dev
```

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
# Node Environment
NODE_ENV=development
PORT=3000

# Database (memory mode by default)
DATABASE_URL=memory://localhost

# Vector Database (memory mode by default)
VECTOR_DB_PROVIDER=memory

# LLM Configuration (optional)
OPENAI_API_KEY=your-api-key-here
```

## 📁 Project Structure

```
forever/
├── backend/
│   ├── core/
│   │   ├── agent/           # Agent framework
│   │   ├── multi-agent/     # Multi-agent collaboration
│   │   ├── knowledge/       # RAG & knowledge base
│   │   ├── database/        # Database layer
│   │   ├── llm/            # LLM adapters
│   │   ├── tools/          # Tool system
│   │   ├── infrastructure/ # Config, logging, errors
│   │   └── application/    # API & server
│   ├── main.ts             # Server entry point
│   └── examples/            # Example scripts
├── prisma/                  # Database schema
├── tests/                   # Test files
├── package.json
└── README.md
```

## 🌐 API Endpoints

- `GET /` - Project info
- `GET /health` - Health check
- `GET /status` - System status
- `GET /api` - API info
- `GET /api/agents` - List agents
- `GET /api/knowledge` - Knowledge base stats
- `POST /api/knowledge` - Add document
- `POST /api/knowledge/query` - Query knowledge base

## 🧪 Testing

```bash
# Run all tests
npm test

# Type check
npm run typecheck
```

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
**Made with ❤️</p>
