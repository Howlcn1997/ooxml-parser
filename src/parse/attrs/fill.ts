import { XmlNode } from '@/xmlNode';
import { parseColor } from '@/parse/attrs/color';
import { Color } from '@/parse/attrs/types';
import OOXMLParser from '@/ooxmlParser';
import { angleToDegrees } from './unit';

export async function parseFill(elementPr: XmlNode, parser: OOXMLParser): Promise<Fill> {
  for (const child of elementPr.children) {
    switch (child.name) {
      case 'solidFill':
        return parseSolidFill(child, parser);
      case 'gradFill':
        return await parseGradientFill(child, parser);
      case 'picFill':
        return {
          type: 'pic',
          value: 'picture',
        } as Fill;
      case 'patternFill':
        return {
          type: 'pattern',
          value: 'pattern',
        } as Fill;
      case 'blipFill':
        return {
          type: 'blip',
          value: 'blip',
        } as Fill;
      case 'noFill':
        return { type: 'noFill' };
    }
  }
  // 尝试解析默认填充
  return { type: 'noFill' };
}

export function parseSolidFill(node: XmlNode, parser: OOXMLParser): SolidFill {
  return {
    type: 'solid',
    value: parseColor(node, parser),
  };
}

export async function parseGradientFill(node: XmlNode, parser: OOXMLParser): Promise<GradientFill> {
  const gsNodes = node.child('gsLst')?.allChild('gs') as XmlNode[];
  const gradientStopList = gsNodes.map(i => ({
    pos: +i.attrs.pos / 1000,
    color: parseColor(i, parser),
  })) as GradientStop[];

  const linear = node.child('lin');
  if (linear)
    /**
     * 此处忽略lin.attrs.scaled属性
     *
     * scaled属性: a:lin 元素的 scaled 属性用于指定渐变是否应该被缩放以适应形状
     *            如果 scaled 属性的值为 1，则渐变将被缩放以填充形状的边界。这意味着渐变的开始和结束点将始终位于形状的边界上，无论形状的尺寸如何。
     *            如果 scaled 属性的值为 0 或未设置，则渐变将不会被缩放。这意味着渐变的开始和结束点将始终位于相同的位置，无论形状的尺寸如何。
     * 但目前scaled属性基本为1,故此忽略
     */
    return {
      type: 'gradient',
      value: {
        type: 'linear',
        gsList: gradientStopList,
        angle: angleToDegrees(linear.attrs.ang),
      },
    };

  const gradientType = node.child('path')?.attrs.path;
  const tileRect = node.child('tileRect');

  const t = +tileRect?.attrs?.t / 1000;
  const l = +tileRect?.attrs?.l / 1000;
  const r = +tileRect?.attrs?.r / 1000;
  const b = +tileRect?.attrs?.b / 1000;

  const top = isNaN(t) ? -+b : t < 0 ? 100 + t : t;
  const left = isNaN(l) ? -+r : l ? 100 + l : l;

  const origin = { top: isNaN(top) ? 50 : top, left: isNaN(left) ? 50 : left };

  switch (gradientType) {
    case 'rect':
      return { type: 'gradient', value: { type: 'rect', gsList: gradientStopList, origin } } as GradientFill;
    case 'circle':
      return { type: 'gradient', value: { type: 'radial', gsList: gradientStopList, origin } } as GradientFill;
  }
  return { type: 'gradient', value: { type: 'path', gsList: gradientStopList, origin } } as GradientFill;
}

export function parsePicFill() {}

export function parsePatternFill() {}

export function parseBlipFill() {}

export type Fill = NoFill | SolidFill | GradientFill | PicFill | PatternFill | BlipFill;

type NoFill = { type: 'noFill' };

export interface SolidFill {
  type: 'solid';
  value: Color;
}

export type GradientFillType = 'linear' | 'radial' | 'rect' | 'path';
export interface GradientStop {
  pos: number;
  color: Color;
}
export interface GradientFill {
  type: 'gradient';
  value: { type: GradientFillType; gsList: GradientStop[]; angle?: number; origin?: { top: number; left: number } };
}

export interface PicFill {
  type: 'pic';
  value: any; // base64 | url | file
}

// 纹理填充
export interface PatternFill {
  type: 'pattern';
  value: any;
}

// 图案填充
export interface BlipFill {
  type: 'blip';
  value: any;
}
