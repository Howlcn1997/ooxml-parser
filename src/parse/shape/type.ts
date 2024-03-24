export interface Element {
  type: string;
  // 水平翻转
  filpH?: boolean;
  // 垂直翻转
  flipV?: boolean;
  width?: number;
  height?: number;
  // 内边距
  padding?: number[];
}

export interface Shape extends Element {}

export interface Pic extends Element {}

export interface Group extends Element {}
