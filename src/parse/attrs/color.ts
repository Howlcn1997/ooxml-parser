import { XmlNode } from '@/xmlNode';
import { Color } from '@/parse/attrs/types';
import tinycolor from 'tinycolor2';

// node 中必须含有color相关属性，例如srgbClr、schemeClr等
export function parseColor(node: XmlNode): Color {
  const children = node.children;

  for (const child of children) {
    const alpha = +(child.child('alpha')?.attrs?.val || 100000) / 100000;
    switch (child.name) {
      case 'sysClr':
        return { scheme: child.attrs.lastClr, rgba: tinycolor(`#000`).setAlpha(alpha).toRgb(), transform: {} };
      case 'srgbClr':
        return { rgba: tinycolor(`#${child.attrs.val}`).setAlpha(alpha).toRgb(), transform: {} };
      case 'schemeClr':
        return { scheme: child.attrs.val, rgba: tinycolor(`#000`).setAlpha(alpha).toRgb(), transform: {} };
    }
  }
  return { scheme: 'accent1', rgba: tinycolor(`#000`).setAlpha(1).toRgb(), transform: {} };
}
