import { XmlNode } from '@/xmlNode';
import { Color, ColorTransform } from '@/parse/attrs/types';
import tinycolor from 'tinycolor2';
import { emusToPercentage } from '@/utils/unit';
import SlideBase from '../slide/slideBase';
import { presetColor } from '@/config/presetColor';
interface ParseColorOptions {
  // 是否将 ColorTransform 合并到 rgba 中
  transformToRgba?: boolean;
  // schemeClr 颜色对应关系
  clrMap?: Record<string, string>;
  defaultColor?: Color;
}
const defaultOptions = {
  transformToRgba: true,
  defaultColor: { rgba: { r: 0, g: 0, b: 0, a: 1 }, transform: {} },
};

/**
 * node 中必须含有color相关属性，例如srgbClr、schemeClr等
 * @param mergeTrans 是否将 ColorTransform 合并到 rgba 中
 * @returns
 */
export async function parseColor(node: XmlNode, slide: SlideBase | null, opts?: ParseColorOptions): Promise<Color> {
  const children = node.children;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const color: Record<string, any> = {};

  const options = { ...defaultOptions, ...(opts || {}) };

  for (const child of children) {
    switch (child.name) {
      case 'sysClr':
        color.scheme = child.attrs.val;
        color.rgba = tinycolor(`#${child.attrs.lastClr}`);
        break;
      case 'schemeClr':
        color.scheme = child.attrs.val;
        break;
      case 'srgbClr':
        color.rgba = tinycolor(`#${child.attrs.val}`);
        break;
      case 'prstClr':
        color.rgba = tinycolor(`rgb (${presetColor[child.attrs.val] || '0,0,0'})`);
        break;
      default:
        continue;
    }

    const transform = getTransform(child);

    let alpha = child.child('alpha')?.attrs?.val;
    alpha = alpha ? emusToPercentage(+alpha) : emusToPercentage(100000);

    if (color.rgba) return { ...color, transform, rgba: color.rgba.setAlpha(alpha).toRgb() };

    if (slide) {
      const schemeClr = (await slide.theme()).schemeClr[color.scheme];
      return {
        ...schemeClr,
        ...color,
        rgba: { ...schemeClr.rgba, a: alpha },
      };
    }
  }

  return options.defaultColor as Color;
}

function getTransform(node: XmlNode): ColorTransform {
  const result: ColorTransform = {};
  const lumMod = node.child('lumMod')?.attrs.val;
  const lumOff = node.child('lumOff')?.attrs.val;

  if (lumMod) result.lumMod = emusToPercentage(+lumMod);
  if (lumOff) result.lumOff = emusToPercentage(+lumOff);

  return result;
}
