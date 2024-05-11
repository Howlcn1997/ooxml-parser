import { Percentage } from '@/utils/unit';
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

export interface TextContent {
  pad: any;
  writeMode: 'vertical-rl' | 'horizontal-tb';
  autoFix:
    | 'no' // 不自动调整
    | 'shape' // 根据文字调整形状大小（优先保证文字原样输出）
    | 'normal'; // 文字溢出时编排文字（根据形状大小按比例缩小字号）
  paragraphs: Paragraph[];
}

export interface Paragraph {
  algn: string;
  margin: {
    l: number;
    t: number;
    r: number;
    b: number;
  };
  lineHeight: Percentage;
  texts: Text[];
}

export interface Text {
  // 文本内容
  content: string;
  // 字号
  size: number;
  // 字体
  family?: string;
  // 字重
  // weight?: string;
  // 字间距
  spacing?: number;
  // 粗体
  bold?: boolean;
  // 斜体
  italic?: boolean;
  // 删除线
  strike?: string;
  // 下划线
  underline?: string;
  // 背景色
  highlight?: Color;
  // 文本填充
  fill?: Fill;
  // 文本轮廓
  line?: Line;
  // 效果
  effect?: TextEffect;
}

export interface Effect {
  // 阴影
  shadow?: Shadow;
  // 映像
  reflection?: Reflection;
  // 发光
  glow?: Glow;
  // 柔化边缘
  softEdge?: SoftEdge;
  // 3d格式
  bevel?: Bevel;
  // 3d旋转
  rotate3d?: Rotate3d;
}

export enum ShadowType {
  Preset = 'preset',
  Inner = 'inner',
  Outer = 'outer',
}

export interface Shadow {
  type: ShadowType;
  // 模糊度
  blurRad: number;
  // 模糊距离
  dist: number;
  // 模糊角度
  dir: number;
  // 阴影大小缩放
  scale: Percentage;
  // 阴影颜色
  color: Color;
}

export interface TextEffect extends Effect {}

export interface ShapeEffect extends Effect {}
/**
 * 映像 / 倒影
 * doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.reflection?view=openxml-3.0.1
 *
 * WPS,PowerPoint中的将startPos和endPos合并为“大小”
 */
export interface Reflection {
  align: string;
  blurRad: number;
  // 映像方向
  dir: number;
  // 映像距离
  dist: number;
  // 映像大小
  scale: Percentage;
  // 渐变开始透明度
  startAlpha: Percentage;
  // 渐变结束透明度
  endAlpha: Percentage;
  // 透明渐变开始位置
  startPos: Percentage;
  // 透明渐变结束位置
  endPos: Percentage;
  // 与形状一起旋转
  rotWithShape: boolean;
}

export interface Glow {
  // 发光半径(大小)
  radius: number;
  // 发光颜色
  color: Color;
}

export interface SoftEdge {
  // 发光半径(大小)
  radius: number;
}

export interface Bevel {}

export interface Rotate3d {}
