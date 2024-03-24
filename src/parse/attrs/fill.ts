import { XmlNode } from '@/xmlNode';
import { parseColor } from '@/parse/attrs/color';
import { Color } from '@/parse/attrs/types';
import OOXMLParser from '@/ooxmlParser';

enum FillType {
  Solid = 'solid',
  Gradient = 'gradient',
  Pattern = 'pattern',
  Picture = 'picture',
}

export interface Fill {
  type: FillType;
  value: Color | string;
}

export interface Gradient {}

export function parseFill(fillNode: XmlNode, parser: OOXMLParser): Fill {
  
  for (const child of fillNode.children) {
    switch (child.name) {
      case 'solidFill':
        return {
          type: FillType.Solid,
          value: parseColor(child),
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
  return {
    type: FillType.Solid,
    value: '000000',
  };
}

export function parseGradient() {}
