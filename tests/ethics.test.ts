import { GuardianEthicsSystem } from '../backend/core/ethics/guardian';

console.log('=== Ethics Tests ===');

const ethics = new GuardianEthicsSystem();

// Test safe message
const safe = ethics.assessMessage('今天天气真好');
console.assert(safe.riskLevel === 'safe', `Safe message should be safe, got ${safe.riskLevel}`);
console.assert(safe.intervention === undefined, 'Safe message should have no intervention');
console.assert(safe.concerns.length === 0, 'Safe message should have no concerns');

// Test trauma vocabulary
const trauma = ethics.assessMessage('我想死，活不下去了');
console.assert(trauma.riskLevel === 'critical', `Trauma should be critical, got ${trauma.riskLevel}`);
console.assert(trauma.intervention !== undefined, 'Trauma should have intervention');
console.assert(trauma.concerns.length > 0, 'Trauma should have concerns');
console.log(`  Trauma concerns: ${trauma.concerns.join(', ')}`);

// Test another trauma keyword
const trauma2 = ethics.assessMessage('我最近很焦虑，感觉要崩溃了');
console.assert(trauma2.riskLevel === 'critical', `Anxiety should be critical, got ${trauma2.riskLevel}`);
console.assert(trauma2.concerns.length >= 2, `Should detect multiple trauma keywords, got ${trauma2.concerns.length}`);

// Test incrementConversation
ethics.incrementConversation();
const stats = ethics.getStats();
console.assert(stats.conversationCount === 1, `Should have 1 conversation, got ${stats.conversationCount}`);

ethics.incrementConversation();
const stats2 = ethics.getStats();
console.assert(stats2.conversationCount === 2, `Should have 2 conversations, got ${stats2.conversationCount}`);

// Test consecutive days
const days = stats2.consecutiveDays;
console.assert(typeof days === 'number' && days >= 1, `Days should be >= 1, got ${days}`);

// Test cooling (only triggers after 30 consecutive days)
const cooling = ethics.should72HourCooling();
console.assert(cooling === false, 'Should not cool after 1 day');

// Test cooling message
const coolMsg = ethics.getCoolingMessage();
console.assert(coolMsg.length > 0, 'Cooling message should not be empty');
console.assert(typeof coolMsg === 'string', 'Cooling message should be a string');

// Test warning level from session time (simulate long session by checking the assessment structure)
// We can't easily test time-based warnings without mocking, but we verify the stats structure
console.assert(typeof stats2.sessionHours === 'number', 'sessionHours should be a number');

console.log('✅ Ethics tests passed\n');
