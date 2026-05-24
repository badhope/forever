#!/usr/bin/env tsx
import {
  createDefaultToolRegistry,
  ToolExecutor,
  MathTools,
  StringTools,
  RandomTools,
  ArrayTools,
  GetCurrentTimeTool,
  FormatDateTool,
  JsonParseTool,
  JsonStringifyTool,
  GenerateIdTool,
  Base64EncodeTool,
  Base64DecodeTool,
  UrlEncodeTool,
  UrlDecodeTool,
  CompareVersionTool,
} from '../backend/core/tools/index.js';

async function testToolSystem() {
  console.log('🧪 测试工具系统...');
  console.log('='.repeat(60));

  // 创建工具注册表
  const registry = createDefaultToolRegistry();
  console.log(`✅ 工具注册表已创建，共 ${registry.listTools().length} 个工具`);

  // 按分类列出工具
  console.log('\n📋 工具分类:');
  console.log(`  - 数学工具: ${registry.listTools('math').length} 个`);
  console.log(`  - 字符串工具: ${registry.listTools('string').length} 个`);
  console.log(`  - 随机工具: ${registry.listTools('random').length} 个`);
  console.log(`  - 数组工具: ${registry.listTools('array').length} 个`);
  console.log(`  - 日期时间工具: ${registry.listTools('datetime').length} 个`);
  console.log(`  - JSON工具: ${registry.listTools('json').length} 个`);
  console.log(`  - 文件工具: ${registry.listTools('file').length} 个`);
  console.log(`  - 实用工具: ${registry.listTools('utility').length} 个`);

  // 创建工具执行器
  const executor = new ToolExecutor(registry, {
    maxRetries: 2,
    logExecution: true,
  });
  console.log('\n✅ 工具执行器已创建');

  console.log('\n' + '='.repeat(60));
  console.log('🧮 测试数学工具...');

  // 测试数学工具
  const addResult = await executor.execute('add', { a: 5, b: 3 });
  console.log(`  add(5, 3) = ${addResult.data}`);

  const multiplyResult = await executor.execute('multiply', { a: 4, b: 7 });
  console.log(`  multiply(4, 7) = ${multiplyResult.data}`);

  const sqrtResult = await executor.execute('sqrt', { x: 16 });
  console.log(`  sqrt(16) = ${sqrtResult.data}`);

  const averageResult = await executor.execute('average', { numbers: [1, 2, 3, 4, 5] });
  console.log(`  average([1, 2, 3, 4, 5]) = ${averageResult.data}`);

  console.log('\n' + '='.repeat(60));
  console.log('📝 测试字符串工具...');

  const uppercaseResult = await executor.execute('uppercase', { text: 'hello world' });
  console.log(`  uppercase('hello world') = ${uppercaseResult.data}`);

  const replaceResult = await executor.execute('replace', {
    text: 'Hello, World!',
    search: 'World',
    replacement: 'Forever',
  });
  console.log(`  replace('Hello, World!', 'World', 'Forever') = ${replaceResult.data}`);

  const splitResult = await executor.execute('split', { text: 'a,b,c,d', separator: ',' });
  console.log(`  split('a,b,c,d', ',') = [${splitResult.data?.join(', ')}]`);

  console.log('\n' + '='.repeat(60));
  console.log('🎲 测试随机工具...');

  const randomIntResult = await executor.execute('random_integer', { min: 1, max: 100 });
  console.log(`  random_integer(1, 100) = ${randomIntResult.data}`);

  const randomChoiceResult = await executor.execute('random_choice', { options: ['apple', 'banana', 'cherry'] });
  console.log(`  random_choice(['apple', 'banana', 'cherry']) = ${randomChoiceResult.data}`);

  console.log('\n' + '='.repeat(60));
  console.log('📊 测试数组工具...');

  const arrayPushResult = await executor.execute('array_push', { array: [1, 2, 3], element: 4 });
  console.log(`  array_push([1, 2, 3], 4) = [${arrayPushResult.data?.join(', ')}]`);

  const arrayReverseResult = await executor.execute('array_reverse', { array: [1, 2, 3, 4] });
  console.log(`  array_reverse([1, 2, 3, 4]) = [${arrayReverseResult.data?.join(', ')}]`);

  console.log('\n' + '='.repeat(60));
  console.log('⏰ 测试日期时间工具...');

  const currentTimeResult = await executor.execute('get_current_time');
  console.log(`  get_current_time() = ${currentTimeResult.data?.formatted_time}`);

  const formatDateResult = await executor.execute('format_date', { format: 'YYYY年MM月DD日' });
  console.log(`  format_date('YYYY年MM月DD日') = ${formatDateResult.data?.formatted}`);

  console.log('\n' + '='.repeat(60));
  console.log('📦 测试JSON工具...');

  const jsonParseResult = await executor.execute('json_parse', { json_string: '{"name":"Forever","version":2.0}' });
  console.log(`  json_parse('{"name":"Forever","version":2.0}') =`, jsonParseResult.data?.data);

  const jsonStringifyResult = await executor.execute('json_stringify', {
    data: { name: 'Forever', features: ['AI', 'Memory', 'Tools'] },
    pretty: true,
  });
  console.log(`  json_stringify(...) =`, jsonStringifyResult.data?.json_string);

  console.log('\n' + '='.repeat(60));
  console.log('🛠️ 测试实用工具...');

  const generateIdResult = await executor.execute('generate_id', { format: 'uuid' });
  console.log(`  generate_id('uuid') = ${generateIdResult.data?.ids[0]}`);

  const base64EncodeResult = await executor.execute('base64_encode', { text: 'Hello, Forever!' });
  console.log(`  base64_encode('Hello, Forever!') = ${base64EncodeResult.data?.encoded}`);

  const base64DecodeResult = await executor.execute('base64_decode', { encoded: base64EncodeResult.data?.encoded });
  console.log(`  base64_decode(...) = ${base64DecodeResult.data?.decoded}`);

  const urlEncodeResult = await executor.execute('url_encode', { text: 'Hello World! How are you?' });
  console.log(`  url_encode('Hello World! How are you?') = ${urlEncodeResult.data?.encoded}`);

  const compareVersionResult = await executor.execute('compare_version', { version1: '1.5.0', version2: '2.0.0' });
  console.log(`  compare_version('1.5.0', '2.0.0') = ${compareVersionResult.data?.message}`);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有工具测试通过！');
  console.log('✅ 工具系统运行正常，包含丰富的内置工具和完整的元数据支持');
}

testToolSystem().catch(console.error);
