type Scheme =
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'
  | 'accent6'
  | 'bg1'
  | 'bg2'
  | 'folHlink'
  | 'folHyperlink'
  | 'hlink'
  | 'hyperlink'
  | 'dk1'
  | 'dk2'
  | 'lt1'
  | 'lt2'
  | 'tx1'
  | 'tx2';

export interface Color {
  // css中的opacity为 不透明度, transparency = 100% - opacity
  rgba: { r: number; g: number; b: number; a: number };
  scheme?: Scheme;
  transform?: ColorTransform;
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

export interface Line {}
