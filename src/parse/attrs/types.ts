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
  type: 'none' | '';
  // 线条宽度
  width: number;
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
