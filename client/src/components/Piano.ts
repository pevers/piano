export const pianoKeys = {
  "C/4": 240,
  "D/4": 270,
  "E/4": 304,
  "F/4": 321,
  "G/4": 361,
  "A/4": 404.5,
  "B/4": 454.5,
  "C/5": 484,
};
export type Key = keyof typeof pianoKeys;
export const pianoEntries = Object.entries<number>(pianoKeys);

export type PianoStave = {
  keys: Key[];
  duration?: number;
  color?: string;
  font?: string;
};

export const keyFromFrequency = (frequency: number): Key => {
  let lastDiff = Math.abs(frequency - pianoEntries[0][1]);
  for (let i = 1; i < pianoEntries.length; i++) {
    const diff = Math.abs(frequency - pianoEntries[i][1]);
    if (diff > lastDiff) {
      // Nothing improved, let's go
      return pianoEntries[i - 1][0] as Key;
    }
    lastDiff = diff;
  }
  return pianoEntries[pianoEntries.length - 1][0] as Key;
};

export const randomKey = (): Key => {
  const index = Math.floor(Math.random() * pianoEntries.length);
  return Object.keys(pianoKeys)[index] as Key;
};
