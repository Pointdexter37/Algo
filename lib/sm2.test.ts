import { calculateSM2 } from './sm2';
import assert from 'assert';

function runTests() {
  console.log("Running SM-2 algorithm tests...");

  // Test 1: First review, quality >= 3
  let res = calculateSM2(4, 0, 2.5, 0);
  assert.strictEqual(res.nextInterval, 1);
  assert.strictEqual(res.nextRepetitions, 1);
  // ease factor = 2.5 + (0.1 - (5-4)*(0.08 + (5-4)*0.02)) = 2.5 + 0.1 - 1*0.1 = 2.5
  assert.strictEqual(Math.round(res.nextEaseFactor * 100) / 100, 2.5);
  console.log("Test 1 passed.");

  // Test 2: Second review, quality >= 3
  res = calculateSM2(4, 1, 2.5, 1);
  assert.strictEqual(res.nextInterval, 6);
  assert.strictEqual(res.nextRepetitions, 2);
  assert.strictEqual(Math.round(res.nextEaseFactor * 100) / 100, 2.5);
  console.log("Test 2 passed.");

  // Test 3: Third review, quality >= 3
  res = calculateSM2(4, 2, 2.5, 6);
  assert.strictEqual(res.nextInterval, 15); // 6 * 2.5 = 15
  assert.strictEqual(res.nextRepetitions, 3);
  assert.strictEqual(Math.round(res.nextEaseFactor * 100) / 100, 2.5);
  console.log("Test 3 passed.");

  // Test 4: Quality < 3
  res = calculateSM2(2, 3, 2.5, 15);
  assert.strictEqual(res.nextInterval, 1);
  assert.strictEqual(res.nextRepetitions, 0);
  console.log("Test 4 passed.");

  // Test 5: Ease factor lower bound
  res = calculateSM2(0, 0, 1.3, 0);
  assert.strictEqual(res.nextEaseFactor, 1.3);
  console.log("Test 5 passed.");

  console.log("All tests passed!");
}

runTests();
