import { Fill } from '../attrs/fill';
import { Line } from '../attrs/types';

// export interface Element {
//   type: string;
//   // 水平翻转
//   filpH?: boolean;
//   // 垂直翻转
//   flipV?: boolean;
//   width?: number;
//   height?: number;
//   // 内边距
//   padding?: number[];
// }

export interface BaseElement {
  type: string;
  // 水平翻转
  flipH?: boolean;
  // 垂直翻转
  flipV?: boolean;
  // 旋转角度
  rotate?: number;
  fill?: Fill;
  line?: Line;
  dimension?: Dimension;
}

interface Dimension {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Shape extends BaseElement {}

export interface Pic extends BaseElement {}

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;
