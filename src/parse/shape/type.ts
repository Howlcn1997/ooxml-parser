import { Fill } from '../attrs/fill';
import { CustomGeometry, Effect, Line, TextBody, presetGeometry } from '../attrs/types';

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
  // 效果
  effect?: Effect;
}

interface Dimension {
  left: number;
  top: number;
  w: number;
  h: number;
}

export interface Shape extends BaseElement {
  type: 'shape';
  txBody?: TextBody;
  geometry: CustomGeometry | presetGeometry;
}

export interface CxnShape extends Omit<Shape, 'type'> {
  type: 'cxnShape';
  startId?: string;
  endId?: string;
}

export interface Pic extends BaseElement {
  type: 'pic';
}

export interface GraphicFrame extends BaseElement {
  type: Chart['type'] | Table['type'] | Diagram['type'];
}

export interface Chart {
  type: 'chart';
}

export interface Table {
  type: 'table';
}

export interface Diagram {
  type: 'diagram';
}

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;
