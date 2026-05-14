import { ForeverError, LLMError, MemoryError, withRetry, CircuitBreaker } from '../backend/core/errors';

console.log('=== Error Tests ===');

// Test error types
const llmErr = new LLMError('API failed', 'LLM_TIMEOUT');
console.assert(llmErr.code === 'LLM_TIMEOUT', `Code should be LLM_TIMEOUT, got ${llmErr.code}`);
console.assert(llmErr.name === 'LLMError', `Name should be LLMError, got ${llmErr.name}`);

const memErr = new MemoryError('ChromaDB error', 'DB_CONNECTION');
console.assert(memErr instanceof ForeverError, 'MemoryError should extend ForeverError');
console.assert(memErr.code === 'DB_CONNECTION', `Code should be DB_CONNECTION, got ${memErr.code}`);
console.assert(memErr.name === 'MemoryError', `Name should be MemoryError, got ${memErr.name}`);

// Test withRetry
let attempts = 0;
const result = await withRetry(
  async () => {
    attempts++;
    if (attempts < 3) throw new Error('transient');
    return 'success';
  },
  { maxRetries: 3, baseDelay: 10, maxDelay: 50 }
);
console.assert(result === 'success', `Retry should return success, got ${result}`);
console.assert(attempts === 3, `Should retry 3 times, got ${attempts}`);

// Test withRetry - shouldRetry false
let noRetryAttempts = 0;
try {
  await withRetry(
    async () => { noRetryAttempts++; throw new Error('permanent'); },
    { maxRetries: 3, baseDelay: 10, maxDelay: 50, shouldRetry: () => false }
  );
} catch (e: any) {
  console.assert(e.message === 'permanent', 'Should throw permanent error');
}
console.assert(noRetryAttempts === 1, `Should not retry, got ${noRetryAttempts} attempts`);

// Test CircuitBreaker
const cb = new CircuitBreaker(3, 100);
console.assert(cb.getState() === 'closed', `Initial state should be closed, got ${cb.getState()}`);

for (let i = 0; i < 3; i++) {
  try { await cb.execute(() => { throw new Error('fail'); }); } catch {}
}
console.assert(cb.getState() === 'open', `Should be open after 3 failures, got ${cb.getState()}`);

// When open, should throw CIRCUIT_OPEN error
try {
  await cb.execute(() => 'should not run');
  console.assert(false, 'Should have thrown when circuit is open');
} catch (e: any) {
  console.assert(e.code === 'CIRCUIT_OPEN', `Should be CIRCUIT_OPEN, got ${e.code}`);
}

cb.reset();
console.assert(cb.getState() === 'closed', `Should be closed after reset, got ${cb.getState()}`);

// After reset, should work again
const resetResult = await cb.execute(() => 'works');
console.assert(resetResult === 'works', `Should work after reset, got ${resetResult}`);

console.log('✅ Error tests passed\n');
