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

export type ChartData = {
  colName: string;
  values: { rowName: string; values: string[]; shape?: Shape }[];
}[];

export interface LineChart {}

export interface Line3DChart {}

// doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.charts.barchart?view=openxml-2.8.1
export interface BarChart {
  title?: TextBody;
  grouping: string;
  data: any;
  valAx?: TextBody;
  catAx?: TextBody;
}

export interface Bar3DChart {}

export interface PieChart {
  title?: TextBody;
  data: any;
}

export interface Pie3DChart {}

export interface DoughnutChart {}

export interface AreaChart {}

export interface ScatterChart {}

export interface BubbleChart {}

export interface RadarChart {}

export interface SurfaceChart {}

export interface StockChart {
  name: string;
}

export type Chart =
  | (LineChart & { chartType: 'line' })
  | (Line3DChart & { chartType: 'line3D' })
  | (BarChart & { chartType: 'bar' })
  | (Bar3DChart & { chartType: 'bar3D' })
  | (PieChart & { chartType: 'pie' })
  | (Pie3DChart & { chartType: 'pie3D' })
  | (DoughnutChart & { chartType: 'doughnut' })
  | (AreaChart & { chartType: 'area' })
  | (ScatterChart & { chartType: 'scatter' })
  | (BubbleChart & { chartType: 'bubble' })
  | (RadarChart & { chartType: 'radar' })
  | (SurfaceChart & { chartType: 'surface' })
  | (StockChart & { chartType: 'stock' });

export interface Table {}

export interface Diagram {}

export interface Ole {}

type GraphicFrameBase =
  | (Chart & { type: 'chart' })
  | (Table & { type: 'table' })
  | (Diagram & { type: 'diagram' })
  | (Ole & { type: 'ole' });

export type GraphicFrame = GraphicFrameBase & { id: string; dimension: Dimension };

export interface Group extends BaseElement {}

export type Element = Shape | Pic | Group;
