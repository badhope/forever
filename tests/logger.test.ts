import { logger, LogLevel } from '../backend/core/logger';

console.log('=== Logger Tests ===');

// Test log level filtering
const logs: any[] = [];
const testHandler = (entry: any) => { logs.push(entry); };

// Set level to INFO so DEBUG is filtered
logger.setLevel(LogLevel.INFO);
logger.addHandler(testHandler);

logger.debug('test', 'should not appear');
logger.info('test', 'info message');
logger.warn('test', 'warn message');
logger.error('test', 'error message');

// defaultHandler also receives logs, but testHandler only captures what passes the level filter
// At INFO level, DEBUG is filtered, so testHandler should receive 3 entries
console.assert(logs.length === 3, `Expected 3 logs (DEBUG filtered), got ${logs.length}`);
console.assert(logs[0].level === 'INFO', `First log should be INFO, got ${logs[0].level}`);
console.assert(logs[1].level === 'WARN', `Second log should be WARN, got ${logs[1].level}`);
console.assert(logs[2].level === 'ERROR', `Third log should be ERROR, got ${logs[2].level}`);
console.assert(logs[0].module === 'test', `Module should be test, got ${logs[0].module}`);

logger.removeHandler(testHandler);

// Test createModule
const mod = logger.createModule('mymod');
console.assert(typeof mod.info === 'function', 'createModule should return info function');
console.assert(typeof mod.error === 'function', 'createModule should return error function');
console.assert(typeof mod.debug === 'function', 'createModule should return debug function');
console.assert(typeof mod.warn === 'function', 'createModule should return warn function');

console.log('✅ Logger tests passed\n');
