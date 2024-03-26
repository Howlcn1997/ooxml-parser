import { XmlNode } from '@/xmlNode';
import { Color, ColorTransform, Rgba, Scheme, System } from '@/parse/attrs/types';
import tinycolor from 'tinycolor2';
import OOXMLParser from '@/ooxmlParser';
interface ParseColorOptions {
  // 是否将 ColorTransform 合并到 rgba 中
  transformToRgba?: boolean;
  // 是否将 Scheme 通过 Theme 转换为 rgba
  schemeToRgba?: boolean;
}
const defaultOptions: ParseColorOptions = { transformToRgba: true, schemeToRgba: true };

/**
 * prNode 中必须含有color相关属性，例如srgbClr、schemeClr等
 * @param mergeTrans 是否将 ColorTransform 合并到 rgba 中
 * @returns
 */
export function parseColor(prNode: XmlNode, parser: OOXMLParser, opts?: ParseColorOptions): Color {
  const children = prNode.children;
  const color: Record<string, any> = {};

  const options = { ...defaultOptions, ...(opts || {}) };

  const colorNames = ['srgbClr', 'sysClr', 'schemeClr'];

  for (const child of children) {
    if (!colorNames.includes(child.name)) continue;

    const alpha = +(child.child('alpha')?.attrs?.val || 100000) / 100000;
    // transform
    const transform = getTransform(child);
    if (transform) color.transform = transform;

    const { scheme, system, rgba } = getScheme(child);
    if (scheme || system) color.scheme = scheme || system;
    if (rgba) return { ...color, rgba };

    if (scheme && options?.schemeToRgba) {
      color.rgba = schemeClr(scheme, parser);
    } else {
      color.rgba = tinycolor(`#${child.attrs.val}`).setAlpha(alpha).toRgb();
    }
    return color as Color;
  }

  return { rgba: { r: 0, g: 0, b: 0, a: 1 } };
}

function getTransform(node: XmlNode): ColorTransform | undefined {
  const lumMod = node.child('lumMod')?.attrs.val;
  const lumOff = node.child('lumOff')?.attrs.val;
  if (lumMod || lumOff) return { lumMod, lumOff };
}

function getScheme(node: XmlNode): { scheme?: Scheme; system?: System; rgba?: Rgba } {
  if (node.name === 'schemeClr') return { scheme: node.attrs.val };
  if (node.name === 'sysClr') return { system: node.attrs.val, rgba: tinycolor(`#${node.attrs.lastClr}`).toRgb() };
  return {};
}

function schemeClr(scheme: Scheme, parser: OOXMLParser): Rgba {
  const currentThemeIndex = 0;
  const themes = parser.store.get('themes');
  if (!themes) throw new Error('No themes loaded');

  const targetTheme = themes[currentThemeIndex];
  scheme = ({
    tx1: 'dk1',
    tx2: 'dk2',
    bg1: 'lt1',
    bg2: 'lt2',
  }[scheme as string] || scheme) as Scheme;

  const schemeColor = targetTheme.schemeClr[scheme] as Color;

  // TODO: 转换系统颜色
  // const systemColor = {
  //   rgba: { r: 0, g: 0, b: 0, a: 1 },
  //   transform: {},
  // };
  // if (systemColor) return systemColor.rgba;

  return schemeColor.rgba;
}
