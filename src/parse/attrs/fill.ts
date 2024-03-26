import { XmlNode } from '@/xmlNode';
import { parseColor } from '@/parse/attrs/color';
import { Color } from '@/parse/attrs/types';
import OOXMLParser from '@/ooxmlParser';

export async function parseFill(elementPr: XmlNode, parser: OOXMLParser): Promise<Fill> {
  for (const child of elementPr.children) {
    switch (child.name) {
      case 'solidFill':
        return {
          type: 'solid',
          value: parseColor(child, parser),
        };
      case 'gradFill':
        return await parseGradientFill(child, parser);
      case 'blipFill':
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
    }
  }
  return { type: 'noFill' };
}

export async function parseGradientFill(node: XmlNode, parser: OOXMLParser): Promise<GradientFill> {
  let gradientType = node.child('path')?.attrs.path;
  const linear = node.child('lin');
  if (linear) gradientType = node.child('lin') && 'linear';

  const gsList = node
    .child('gsLst')
    ?.allChild('gs')
    .map(i => ({
      pos: +i.attrs.pos,
      color: parseColor(i, parser),
    }));
  console.log(node._node);

  return { type: 'gradient', value: { type: gradientType, gsList } } as GradientFill;
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
  value: { type: GradientFillType; angle: number; gsList: GradientStop[] };
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
