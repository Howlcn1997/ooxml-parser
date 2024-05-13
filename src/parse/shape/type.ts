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

interface LineChart {
  chatType: 'line';
}

interface Line3DChart {
  chatType: 'line3D';
}

interface BarChart {
  chatType: 'bar';
}

interface Bar3DChart {
  chatType: 'bar3D';
}

interface PieChart {
  chatType: 'pie';
}

interface Pie3DChart {
  chatType: 'pie3D';
}

interface DoughnutChart {
  chatType: 'doughnut';
}

interface AreaChart {
  chatType: 'area';
}

interface ScatterChart {
  chatType: 'scatter';
}

interface BubbleChart {
  chatType: 'bubble';
}

interface RadarChart {
  chatType: 'radar';
}

interface SurfaceChart {
  chatType: 'surface';
}

interface StockChart {
  chatType: 'stock';
  name: string;
}

type ChartBase =
  | LineChart
  | Line3DChart
  | BarChart
  | Bar3DChart
  | PieChart
  | Pie3DChart
  | DoughnutChart
  | AreaChart
  | ScatterChart
  | BubbleChart
  | RadarChart
  | SurfaceChart
  | StockChart;

export interface Chart extends Omit<ChartBase, 'chatType'> {
  type: 'chart';
  chatType: ChartBase['chatType'];
}

export interface Table {
  type: 'table';
}

export interface Diagram {
  type: 'diagram';
}

export interface Ole {
  type: 'ole';
}

type GraphicFrameType = 'chart' | 'table' | 'diagram' | 'ole';

export interface GraphicFrame extends Chart, Table, Diagram, Ole {
  id: string;
  dimension: Dimension;
}

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;
