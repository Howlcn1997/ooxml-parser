import { Fill } from '../attrs/fill';
import { Line } from '../attrs/types';

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

export interface Base {
  type: string;
  fill?: Fill;
  line?: Line;
  // 大小
  size?: Size;
  pos?: Pos;
}

interface Size {
  width: number;
  height: number;
}

interface Pos {
  top: number;
  left: number;
}

export interface Shape extends Element {}

export interface Pic extends Element {}

export interface Group extends Element {}
