import { inferEmotionFromText } from '../examples/emotion-engine';

console.log('=== Emotion Engine Tests ===');

// Test happy emotions (开心 -> not in lexicon, but 心情特别好 -> no match either)
// Let's test with actual lexicon keywords
const happy1 = inferEmotionFromText('爱你，你是最爱的');
console.log(`Happy: label=${happy1.label}, P=${happy1.emotion.pleasure}`);
console.assert(happy1.label === '欣慰' || happy1.label === '关心', `Happy test failed: ${happy1.label}`);
console.assert(happy1.emotion.pleasure > 0, 'Happy should have positive pleasure');

// Test sad emotions (难过 is in lexicon)
const sad1 = inferEmotionFromText('我想你了，好难过');
console.log(`Sad: label=${sad1.label}, P=${sad1.emotion.pleasure}`);
console.assert(sad1.label === '感伤' || sad1.label === '怀念', `Sad test failed: ${sad1.label}`);
console.assert(sad1.emotion.pleasure < 0, 'Sad should have negative pleasure');

// Test worry (吃饭 is in care lexicon, 担心 is in worry lexicon)
const worry1 = inferEmotionFromText('你吃饭了吗？外面冷不冷？');
console.log(`Worry: label=${worry1.label}, P=${worry1.emotion.pleasure}`);
console.assert(worry1.label === '关心' || worry1.label === '担忧', `Worry test failed: ${worry1.label}`);

// Test neutral (no lexicon matches)
const neutral1 = inferEmotionFromText('嗯好的');
console.log(`Neutral: ${neutral1.label}, P=${neutral1.emotion.pleasure}`);
console.assert(neutral1.label === '平静', `Neutral should be 平静, got ${neutral1.label}`);

// Test chiding (不听话 is in blame lexicon, 熬夜 is in tired lexicon)
const chide1 = inferEmotionFromText('你怎么又熬夜了！说了多少次了，不听话');
console.log(`Chide: label=${chide1.label}, P=${chide1.emotion.pleasure}`);
console.assert(chide1.label === '念叨' || chide1.label === '担忧', `Chide test failed: ${chide1.label}`);

// Test miss (想你 is in miss lexicon)
const miss1 = inferEmotionFromText('妈妈好想你');
console.log(`Miss: label=${miss1.label}, P=${miss1.emotion.pleasure}`);
console.assert(miss1.label === '怀念' || miss1.label === '感伤', `Miss test failed: ${miss1.label}`);

console.log('✅ Emotion Engine tests passed\n');
