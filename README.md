# Forever AI

> TypeScript-native AI Agent Framework

[![GitHub stars](https://img.shields.io/github/stars/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/badhope/forever?style=for-the-badge&color=6A5ACD)](https://github.com/badhope/forever/network)
[![License](https://img.shields.io/github/license/badhope/forever?style=for-the-badge&color=6A5ACD)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge)](https://nodejs.org/)

---

## 🌟 Overview

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
