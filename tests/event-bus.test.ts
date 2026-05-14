import { eventBus } from '../backend/core/event-bus';

console.log('=== Event Bus Tests ===');

// Test basic on/emit
let received = 0;
const unsub = eventBus.on('test:event', () => { received++; });
await eventBus.emit('test:event');
console.assert(received === 1, `Expected 1, got ${received}`);
unsub();
await eventBus.emit('test:event');
console.assert(received === 1, `Should not receive after unsubscribe, got ${received}`);

// Test once
let onceReceived = 0;
eventBus.once('test:once', () => { onceReceived++; });
await eventBus.emit('test:once');
await eventBus.emit('test:once');
console.assert(onceReceived === 1, `Once should fire only once, got ${onceReceived}`);

// Test async handler
const order: number[] = [];
eventBus.on('test:async', async () => {
  order.push(1);
  await new Promise(r => setTimeout(r, 10));
  order.push(2);
});
eventBus.on('test:async', () => { order.push(3); });
await eventBus.emit('test:async');
console.assert(order[0] === 1 && order[1] === 2 && order[2] === 3, `Async order wrong: ${order}`);

// Test listenerCount
const count = eventBus.listenerCount('test:async');
console.assert(count === 2, `Expected 2 listeners, got ${count}`);

// Cleanup
eventBus.removeAllListeners('test:event');
eventBus.removeAllListeners('test:once');
eventBus.removeAllListeners('test:async');

console.log('✅ Event Bus tests passed\n');
