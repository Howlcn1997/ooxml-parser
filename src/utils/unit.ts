/**
 * ooxml中主要单位为EMUs，1pt=12700MUs 1cm = 360000EMUs
 * ┌───────┬──────────┬────────────┬─────────────────┬───────────┐
 * │  dxa  │    PT    │    Inch    │       CM        │   EMUs    │
 * │       │ (dxa/20) │ (dxa/1440) │ (dxa/1440*2.54) │ (dxa*635) │
 * ├───────┼──────────┼────────────┼─────────────────┼───────────┤
 * │ 1440  │    72    │     1      │      2.54       │   914400  │
 * └───────┴──────────┴────────────┴─────────────────┴───────────┘
 */
export function emusToPt(emus: number): number {
  return emus / 12700;
}

export function emusToCm(emus: number): number {
  return emus / 360000;
}

export function dxaToPt(emus: number) {
  return emus / 20;
}

export function ptToCm(pt: number) {
  return (pt * 2.54) / 72;
}

export function angleToDegrees(angle: number): number {
  return Math.round(angle / 60000);
}

export type Percentage = number; // [0, 1] 0% - 100%

export function emusAlphaToOpacity(alpha: number): Percentage {
  return 1 - alpha / 100000;
}

export function emusToPercentage(emus: number): Percentage {
  return emus / 100000;
}
