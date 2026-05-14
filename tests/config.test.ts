import { loadConfig, validateConfig } from '../backend/core/config';

console.log('=== Config Tests ===');

// Test loadConfig returns valid structure
const config = loadConfig();
console.assert(typeof config === 'object', 'Config should be an object');
console.assert(typeof config.llm === 'object', 'Config.llm should exist');
console.assert(typeof config.memory === 'object', 'Config.memory should exist');
console.assert(typeof config.tts === 'object', 'Config.tts should exist');
console.assert(typeof config.dataDir === 'string', 'Config.dataDir should be string');
console.assert(config.dataDir.length > 0, 'Config.dataDir should not be empty');

// Test specific defaults
console.assert(typeof config.llm.provider === 'string', 'llm.provider should be string');
console.assert(typeof config.llm.temperature === 'number', 'llm.temperature should be number');
console.assert(typeof config.memory.enabled === 'boolean', 'memory.enabled should be boolean');
console.assert(typeof config.tts.enabled === 'boolean', 'tts.enabled should be boolean');
console.assert(typeof config.ethics === 'object', 'Config.ethics should exist');
console.assert(typeof config.avatar === 'object', 'Config.avatar should exist');

// Test validateConfig with empty object (no errors expected for empty partial config)
const errors1 = validateConfig({});
console.assert(Array.isArray(errors1), 'validateConfig should return array');
console.assert(errors1.length === 0, `Empty config should have no errors, got ${errors1.length}`);

// Test validateConfig with invalid values
const errors2 = validateConfig({
  llm: { provider: '', apiKey: '', temperature: 5, maxTokens: -1 },
  memory: { enabled: true, chromaPath: '', reflectionInterval: -1, decayInterval: -1, decayRate: 2 },
  ethics: { maxDailyConversations: 0, maxConsecutiveDays: 0, maxSessionHours: -1, coolingThreshold: 5 },
  tts: { enabled: true, provider: '' },
});
console.assert(Array.isArray(errors2), 'validateConfig should return array');
console.assert(errors2.length > 0, `Invalid config should have errors, got ${errors2.length}`);
console.log(`  Validation errors (${errors2.length}): ${errors2.join('; ')}`);

console.log('✅ Config tests passed\n');
