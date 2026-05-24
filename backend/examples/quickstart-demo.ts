
/**
 * Forever AI - Quick Start Demo
 * 
 * 这个文件展示了如何使用 Forever AI 的核心功能
 */

import { logger } from '../core/logger';
import { knowledgeBase } from '../core/knowledge';
import { agentRepository, taskRepository, messageRepository } from '../core/database';
import { agentRegistry, messageBus } from '../core/multi-agent';

console.log('='.repeat(60));
console.log('🚀 Forever AI - Quick Start Demo');
console.log('='.repeat(60));

async function demo() {
  console.log('\n📝 1. 数据库操作演示');
  console.log('-'.repeat(60));

  // 创建 Agent
  const agent1 = await agentRepository.create({
    name: 'Alice',
    description: 'A friendly AI assistant',
    capabilities: ['chat', 'search', 'analysis'],
  });

  const agent2 = await agentRepository.create({
    name: 'Bob',
    description: 'A technical AI expert',
    capabilities: ['coding', 'debugging', 'architecture'],
  });

  console.log('✅ Agents created:', [agent1.name, agent2.name]);

  // 创建任务
  const task1 = await taskRepository.create({
    name: 'Research AI trends',
    description: 'Find and summarize latest AI development trends',
    status: 'pending',
    priority: 'high',
  });

  console.log('✅ Task created:', task1.name);

  // 创建消息
  const msg1 = await messageRepository.create({
    type: 'task',
    from: 'system',
    to: agent1.id,
    content: 'Please research the latest AI trends',
  });

  console.log('✅ Message created from system to', agent1.name);

  console.log('\n📚 2. 知识库操作演示');
  console.log('-'.repeat(60));

  // 添加文档到知识库
  await knowledgeBase.addDocument(
    'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
    { author: 'Microsoft', year: 2024 },
    'programming',
    ['typescript', 'javascript']
  );

  await knowledgeBase.addDocument(
    'Artificial intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems.',
    { author: 'Tech Encyclopedia', year: 2024 },
    'technical',
    ['ai', 'definition', 'basics']
  );

  await knowledgeBase.addDocument(
    'Multi-agent systems are composed of multiple intelligent agents interacting with each other.',
    { author: 'Forever AI Team', year: 2024 },
    'technical',
    ['multi-agent', 'collaboration', 'systems']
  );

  console.log('✅ 3 documents added to knowledge base');

  // 搜索知识库
  const searchResults = await knowledgeBase.query({
    text: 'What is TypeScript?',
    limit: 2,
  });

  console.log('🔍 Search results for "TypeScript":');
  searchResults.forEach((result, index) => {
    console.log(`  ${index + 1}. (Score: ${result.score.toFixed(3)}) ${result.item.content.substring(0, 80)}...`);
  });

  console.log('\n🤖 3. 多智能体协作演示');
  console.log('-'.repeat(60));

  // 注册 Agent 到注册中心
  agentRegistry.register({
    id: agent1.id,
    name: agent1.name,
    type: 'assistant',
    capabilities: agent1.capabilities,
    status: 'active',
  });

  agentRegistry.register({
    id: agent2.id,
    name: agent2.name,
    type: 'expert',
    capabilities: agent2.capabilities,
    status: 'active',
  });

  console.log('✅ Agents registered:', agentRegistry.getAllAgents().map(a => a.name));

  // 发送消息
  const message = {
    id: `msg_${Date.now()}`,
    type: 'message',
    from: agent1.id,
    to: agent2.id,
    content: 'Hey Bob, can you help with some TypeScript questions?',
    timestamp: new Date(),
  };

  messageBus.sendMessage(message);
  console.log('✅ Message sent from', agent1.name, 'to', agent2.name);

  console.log('\n📊 4. 统计信息');
  console.log('-'.repeat(60));
  console.log('Agents in DB:', agentRepository.count()); // agentRepository.count() is synchronous
  console.log('Tasks in DB:', taskRepository.count());
  console.log('Messages in DB:', messageRepository.count());
  
  const knowledgeStats = await knowledgeBase.getStatistics();
  console.log('Knowledge items:', knowledgeStats.totalDocuments);
  console.log('Active agents in registry:', agentRegistry.getAllAgents().length);
  console.log('Message queue stats:', messageBus.getQueueStats());

  console.log('\n🎉 Demo completed successfully!');
  console.log('='.repeat(60));
}

// 运行演示
demo().catch(error => {
  logger.error('demo', 'Demo failed', { error });
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
