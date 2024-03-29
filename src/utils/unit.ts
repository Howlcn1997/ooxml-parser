/**
 * ooxml中主要单位为EMUs，1pt=12700MUs 1cm = 360000EMUs
 * ┌───────┬──────────┬────────────┬─────────────────┬───────────┐
 * │  dxa  │    PT    │    Inch    │       CM        │   EMUs    │
 * │       │ (dxa/20) │ (dxa/1440) │ (dxa/1440*2.54) │ (dxa*635) │
 * ├───────┼──────────┼────────────┼─────────────────┼───────────┤
 * │ 1440  │    72    │     1      │      2.54       │   914400  │
 * └───────┴──────────┴────────────┴─────────────────┴───────────┘
 */
export function emusToPt(emus: number, handler?: (pt: number) => number): number {
  return handler ? handler(emus / 12700) : emus / 12700;
}

export function emusToCm(emus: number, handler?: (cm: number) => number): number {
  return handler ? handler(emus / 360000) : emus / 360000;
}

export function dxaToPt(emus: number, handler?: (pt: number) => number) {
  return handler ? handler(emus / 20) : emus / 20;
}

export function ptToCm(pt: number, handler?: (cm: number) => number) {
  return handler ? handler(pt * 2.54 / 72) : pt * 2.54 / 72;
}

export function angleToDegrees(angle: string): number {
  return Math.round(+angle / 60000);
}

export type Percentage = number; // [0, 1] 0% - 100%

export function emusAlphaToOpacity(alpha: number): Percentage {
  return 1 - alpha / 100000;
}

export function emusToPercentage(emus: number): Percentage {
  return emus / 100000;
}