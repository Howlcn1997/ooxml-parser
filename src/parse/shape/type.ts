import { Fill } from '../attrs/fill';
import { CustomGeometry, Line, TextContent, presetGeometry } from '../attrs/types';

export interface BaseElement {
  // 元素在slide中的唯一标识
  id: string;
  // 元素类型
  type: string;
  // 水平翻转
  flipH?: boolean;
  // 垂直翻转
  flipV?: boolean;
  // 旋转角度
  rotate?: number;
  // 填充
  fill?: Fill;
  // 线条
  line?: Line;
  // 位置尺寸
  dimension?: Dimension;
  // 阴影
  shadow?: any;
  // 发光
  light?: any;
  // 3d旋转
  rotate3d?: any;
}

interface Dimension {
  left: number;
  top: number;
  w: number;
  h: number;
}

export interface Shape extends BaseElement {
  type: 'shape';
  content: any;
  geometry: CustomGeometry | presetGeometry;
}

export interface CxnShape extends BaseElement {
  type: 'cxnShape';
  content?: TextContent;
  startId?: string;
  endId?: string;
  geometry: CustomGeometry | presetGeometry;
}

export interface Pic extends BaseElement {
  type: 'pic';
}

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;