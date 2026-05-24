
/**
 * Forever AI - 主应用入口
 */

import express from 'express';
import envConfig from './core/config/env';
import { logger } from './core/logger';
import { restApiGateway } from './core/application/rest-api';
import { knowledgeBase, embeddingService, vectorStore } from './core/knowledge';
import { agentRegistry, messageBus } from './core/multi-agent';
import { agentRepository, taskRepository, messageRepository } from './core/database';

const app = express();
const PORT = envConfig.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 支持
app.use((req, res, next) =&gt; {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API 根路由
app.get('/api', (req, res) =&gt; {
  res.json({
    name: 'Forever AI API',
    version: '2.0.0',
    description: 'TypeScript-native AI Agent framework API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api',
      'GET /health',
      'GET /status',
      'GET /api/agents',
      'GET /api/agents/:id',
      'POST /api/messages',
      'GET /api/messages/stats',
      'GET /api/knowledge',
      'POST /api/knowledge',
      'POST /api/knowledge/query',
      'GET /api/database/stats',
    ],
  });
});

// 根路由
app.get('/', (req, res) =&gt; {
  res.json({
    name: 'Forever AI',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: 'Please use the API endpoints or refer to the README for more information.',
  });
});

// 健康检查
app.get('/health', async (req, res) =&gt; {
  const response = await restApiGateway.handleRequest({
    method: 'GET',
    path: '/health',
    headers: {},
    query: {},
  });
  res.status(response.status).json(response.body);
});

// 系统状态
app.get('/status', (req, res) =&gt; {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      nodeEnv: envConfig.NODE_ENV,
      port: PORT,
      logLevel: envConfig.LOG_LEVEL,
    },
    knowledge: {
      enabled: !!knowledgeBase,
      stats: knowledgeBase ? knowledgeBase.getStatistics() : null,
    },
    multiAgent: {
      agentCount: agentRegistry.getAllAgents().length,
      messageBusStats: messageBus.getQueueStats(),
    },
    database: {
      agentCount: agentRepository.count(),
      taskCount: taskRepository.count(),
      messageCount: messageRepository.count(),
    },
  });
});

// 代理 REST API 网关路由到 Express
app.all('/api/agents', async (req, res) =&gt; {
  const response = await restApiGateway.handleRequest({
    method: req.method as any,
    path: '/api/agents',
    headers: req.headers as any,
    query: req.query as any,
    body: req.body,
  });
  Object.entries(response.headers).forEach(([key, value]) =&gt; res.setHeader(key, value));
  res.status(response.status).json(response.body);
});

app.all('/api/agents/:id', async (req, res) =&gt; {
  const response = await restApiGateway.handleRequest({
    method: req.method as any,
    path: `/api/agents/${req.params.id}`,
    headers: req.headers as any,
    query: req.query as any,
    body: req.body,
  });
  Object.entries(response.headers).forEach(([key, value]) =&gt; res.setHeader(key, value));
  res.status(response.status).json(response.body);
});

app.all('/api/messages', async (req, res) =&gt; {
  const response = await restApiGateway.handleRequest({
    method: req.method as any,
    path: '/api/messages',
    headers: req.headers as any,
    query: req.query as any,
    body: req.body,
  });
  Object.entries(response.headers).forEach(([key, value]) =&gt; res.setHeader(key, value));
  res.status(response.status).json(response.body);
});

app.all('/api/messages/stats', async (req, res) =&gt; {
  const response = await restApiGateway.handleRequest({
    method: req.method as any,
    path: '/api/messages/stats',
    headers: req.headers as any,
    query: req.query as any,
    body: req.body,
  });
  Object.entries(response.headers).forEach(([key, value]) =&gt; res.setHeader(key, value));
  res.status(response.status).json(response.body);
});

// 知识库 API
app.get('/api/knowledge', (req, res) =&gt; {
  res.json({
    stats: knowledgeBase.getStatistics(),
    items: (vectorStore as any).items || [],
  });
});

app.post('/api/knowledge', async (req, res) =&gt; {
  try {
    const { content, metadata = {}, category = 'general', tags = [] } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await knowledgeBase.addDocument(
      content,
      metadata,
      category,
      tags
    );

    res.json({
      success: true,
      itemsCreated: result.itemsCreated,
      message: 'Document added successfully',
    });
  } catch (error) {
    logger.error('app:main', 'Failed to add document', { error });
    res.status(500).json({ error: 'Failed to add document', message: String(error) });
  }
});

app.post('/api/knowledge/query', async (req, res) =&gt; {
  try {
    const { text, limit = 5, category } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const results = await knowledgeBase.query({
      text,
      limit,
      ...(category &amp;&amp; { category }),
    });

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    logger.error('app:main', 'Failed to query knowledge', { error });
    res.status(500).json({ error: 'Failed to query knowledge', message: String(error) });
  }
});

// 数据库 API
app.get('/api/database/stats', (req, res) =&gt; {
  res.json({
    agents: agentRepository.count(),
    tasks: taskRepository.count(),
    messages: messageRepository.count(),
  });
});

// 初始化并启动服务器
async function bootstrap() {
  try {
    logger.info('app:main', 'Starting Forever AI...');

    // 初始化知识库
    logger.info('app:main', 'Initializing knowledge base...');

    // 初始化完成提示
    logger.info('app:main', 'System components initialized');

    // 添加一些示例数据到知识库
    await knowledgeBase.addDocument(
      'Forever AI is a TypeScript-native AI Agent framework featuring multi-agent orchestration, unified LLM adapter for 16+ platforms, 5 thinking strategies, end-to-end RAG pipeline, and comprehensive safety guardrails.',
      { author: 'Forever Team', date: new Date().toISOString() },
      'technical',
      ['forever', 'ai', 'framework']
    );

    await knowledgeBase.addDocument(
      'The architecture has 5 layers: Infrastructure, Core Capabilities, Agent Framework, Multi-Agent Collaboration, and Application Ecosystem.',
      { author: 'Forever Team', date: new Date().toISOString() },
      'technical',
      ['architecture', 'layers']
    );

    logger.info('app:main', 'Demo data added to knowledge base');

    // 启动服务器
    app.listen(PORT, () =&gt; {
      logger.info('app:main', 'Forever AI Server started', {
        port: PORT,
        url: `http://localhost:${PORT}`,
        nodeEnv: envConfig.NODE_ENV,
      });
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🚀 Forever AI - Server Started Successfully             ║
║                                                            ║
║    Local: http://localhost:${String(PORT).padEnd(49)}║
║                                                            ║
║    Available endpoints:                                    ║
║      - GET /                  (Home)                       ║
║      - GET /health            (Health Check)               ║
║      - GET /status            (System Status)              ║
║      - GET /api               (API Info)                   ║
║      - GET /api/agents        (List Agents)                ║
║      - GET /api/knowledge     (Knowledge Stats)            ║
║      - POST /api/knowledge    (Add Document)               ║
║      - POST /api/knowledge/query (Search Knowledge)        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // 优雅关闭
    process.on('SIGINT', async () =&gt; {
      logger.info('app:main', 'Shutting down...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('app:main', 'Failed to start server', { error });
    process.exit(1);
  }
}

// 启动应用
bootstrap();

export default app;
