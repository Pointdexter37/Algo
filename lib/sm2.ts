export function calculateSM2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let nextInterval: number;
  let nextRepetitions: number;
  let nextEaseFactor: number;

  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    nextRepetitions = 0;
    nextInterval = 1;
  }

  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  return { nextInterval, nextRepetitions, nextEaseFactor };
}
