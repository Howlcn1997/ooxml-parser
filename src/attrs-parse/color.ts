import { XmlNode } from '../xmlNode';
import { Color } from './types';

// node 中必须含有color相关属性，例如srgbClr、schemeClr等
export function parseColor(node: XmlNode): Color {
  const children = node.children;
  for (const child of children) {
    switch (child.name) {
      case 'sysClr':
        return { type: 'sys', value: child.attrs.lastClr };
      case 'srgbClr':
        return { type: 'srgb', value: child.attrs.val };
      case 'schemeClr':
        return { type: 'scheme', value: child.attrs.val };
    }
  }
  return { type: 'unknown', value: '' };
}
