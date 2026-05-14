/**
 * Forever - 测试运行器
 * 运行: npx tsx tests/run-all.ts
 */

const tests = [
  './emotion-engine.test.ts',
  './logger.test.ts',
  './event-bus.test.ts',
  './errors.test.ts',
  './config.test.ts',
  './ethics.test.ts',
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    await import(test);
    passed++;
  } catch (error: any) {
    console.error(`❌ ${test} FAILED:`, error.message);
    failed++;
  }
}

console.log('\n═══════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════');

if (failed > 0) process.exit(1);
