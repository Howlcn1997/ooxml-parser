import { XmlNode } from '../xmlNode';
import { parseColor } from './color';
import { Color } from './types';

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

export function parseFill(fillNode: XmlNode): Fill {
  console.log('fillNode', fillNode);
  for (const child of fillNode.children) {
    if (child.name === 'solidFill') {
      return {
        type: FillType.Solid,
        value: parseColor(child),
      };
    }
  }
  return {
    type: FillType.Solid,
    value: '000000',
  };
}
