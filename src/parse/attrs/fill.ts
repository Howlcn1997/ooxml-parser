import { XmlNode } from '@/xmlNode';
import { parseColor } from '@/parse/attrs/color';
import { Color } from '@/parse/attrs/types';
import OOXMLParser from '@/ooxmlParser';

export async function parseFill(elementPr: XmlNode, parser: OOXMLParser): Fill | null {
  for (const child of elementPr.children) {
    switch (child.name) {
      case 'solidFill':
        return {
          type: FillType.Solid,
          value: parseColor(child, parser),
        };
      case 'gradFill':
        return {
          type: FillType.Gradient,
          value: 'gradient',
        };
      case 'blipFill':
        return {
          type: FillType.Picture,
          value: 'picture',
        };
      case 'patternFill':
        return {
          type: FillType.Pattern,
          value: 'pattern',
        };
    }
  }
  return null;
}

export function parseGradientFill() {}

export function parsePicFill() {}

export function parsePatternFill() {}

export function parseBlipFill() {}

enum FillType {
  Solid = 'solid',
  Gradient = 'gradient',
  Pattern = 'pattern',
  Picture = 'picture',
}

export interface Fill {
  type: string;
  value: SolidFill | GradientFill | PicFill | PatternFill | BlipFill;
}

type SolidFill = Color;

export interface GradientFill {
  type: 'linear' | 'radial' | 'rect' | 'path';
  angle: number;
  gsList: GradientStop[];
}

export interface GradientStop {
  pos: number;
  color: Color;
}

export interface PicFill {}

// 纹理填充
export interface PatternFill {}
// 图案填充
export interface BlipFill {}
