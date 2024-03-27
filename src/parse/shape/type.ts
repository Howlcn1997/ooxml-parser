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
  name?: string;
  fill?: Fill;
  line?: Line;
  size?: Size;
  pos?: Pos;
}

interface Size {
  width: number;
  height: number;
  rotate?: number;
  //   // 水平翻转
  flipH?: boolean;
  //   // 垂直翻转
  flipV?: boolean;
}

interface Pos {
  top: number;
  left: number;
}

export interface Shape extends BaseElement {}

export interface Pic extends BaseElement {}

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;
