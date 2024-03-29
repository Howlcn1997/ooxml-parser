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

export function angleToDegrees(angle: string): number {
  return Math.round(+angle / 60000);
}
