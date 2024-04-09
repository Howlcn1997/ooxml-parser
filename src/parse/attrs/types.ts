import { Fill } from './fill';

export type Scheme =
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'
  | 'accent6'
  | 'folHlink'
  | 'hlink'
  | 'dk1'
  | 'dk2'
  | 'lt1'
  | 'lt2'
  | 'tx1' // dk1
  | 'tx2' // dk2
  | 'bg1' // lt1
  | 'bg2'; // lt2

export type System = 'windowText' | 'window' | 'highlight' | 'highlightText';

export interface Color {
  // css中的opacity为 不透明度, transparency = 100% - opacity
  rgba: Rgba;
  scheme?: Scheme;
  transform?: ColorTransform;
}

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * doc:
 * - https://learn.microsoft.com/en-us/previous-versions/office/developer/office-2007/dd560821(v=office.12)?redirectedfrom=MSDN#customizing-theme-aware-colors
 * - https://stackoverflow.com/questions/19886180/whats-the-difference-between-lummod-lumoff-and-tint-shade-in-drawingml-colors
 */
export interface ColorTransform {
  // 亮度百分比
  lumMod?: number;
  // 亮度偏移
  lumOff?: number;
}

/**
 * 线条
 * doc:
 *  - https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.linq.a.ln?view=openxml-3.0.1
 *  - https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.outline?view=openxml-3.0.1
 */
export interface Line {
  // 线条宽度
  w: number;
  // 线条颜色
  fill: Fill;
  /**
   * 线条头部样式(此处将ooxml规范转化为svg规范)
   * doc: https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-linecap
   */
  cap: 'butt' | 'round' | 'square';
  /**
   * 线条连接处样式(此处将ooxml规范转化为svg规范)
   * doc: https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-linejoin
   */
  join: 'miter' | 'round' | 'bevel';
}

export interface Xfrm {
  flipV: boolean;
  flipH: boolean;
  left: number;
  top: number;
  w: number;
  h: number;
}

export interface CustomGeometry {
  name: string;
  paths: string[];
  line: Line | null;
  fill: Fill | null;
}

export interface presetGeometry {
  name: string;
  // paths: string[];
  line: Line | null;
  fill: Fill | null;
  // 几何形状的调整值列表
  avList: Record<string, string>;
}

export interface Text {
  pad: any;
  writeMode: 'vertical-rl' | 'horizontal-tb';
  autoFix:
    | 'no' // 不自动调整
    | 'shape' // 根据文字调整形状大小（优先保证文字原样输出）
    | 'normal'; // 文字溢出时编排文字（根据形状大小按比例缩小字号）
  paragraphs: Paragraph[];
}

export interface Paragraph {
  margin: any;
  indent: any;
  items: ParagraphItem[];
}

export interface ParagraphItem {
  // 字号
  fontSize: number;
  // 粗体
  bold: boolean;
  // 斜体
  italic: boolean;
  // 文本填充
  fill: Fill;
  // 文本轮廓
  line: Line;
  // 文本阴影
  shadow?: any;
  // 文本发光
  light?: any;
  // 文本3d旋转
  rotate3d?: any;
}
