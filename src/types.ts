import { Color } from './attrs-parse/types';

export enum RuntimeEnv {
  Browser = 'browser',
  Node = 'node',
  Unknown = 'unknown',
}

export enum OOXMLFilenames {
  Content_Types = '[Content_Types]',
  Node = 'node',
  Unknown = 'unknown',
}

export interface ContentTypes {
  // 幻灯片文件地址
  slides: string[];
  // 幻灯片布局文件地址
  slideLayouts: string[];
  // 幻灯片主题文件地址
  slideMasters: string[];
  // 主题文件地址
  themes: string[];
}

export interface Presentation {
  slideMasterIdList: string[];
  slideIdList: string[];
  slideSize: Record<string, string>;
  noteSize: Record<string, string>;
  // 默认文本样式
  defaultTextStyle: Record<string, Record<string, string>>;
}

export interface Theme {
  clrScheme: Record<string, Color>;
  // majorFontScheme: Record<string, string>;
  // minorFontScheme: Record<string, string>;
}
