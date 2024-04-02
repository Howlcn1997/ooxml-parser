import { XmlNode } from '@/xmlNode';
import { Color, ColorTransform, Rgba, Scheme, System } from '@/parse/attrs/types';
import tinycolor from 'tinycolor2';
import OOXMLParser from '@/ooxmlParser';
import { emusToPercentage } from '@/utils/unit';
interface ParseColorOptions {
  // 是否将 ColorTransform 合并到 rgba 中
  transformToRgba?: boolean;
  // 是否将 Scheme 通过 Theme 转换为 rgba
  schemeToRgba?: boolean;
  // schemeClr 颜色对应关系
  clrMap?: Record<string, string>;
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
      color.rgba = schemeClr(scheme, parser, defaultOptions.clrMap);
    } else {
      color.rgba = tinycolor(`#${child.attrs.val}`).setAlpha(alpha).toRgb();
    }
    return color as Color;
  }

  return { rgba: { r: 0, g: 0, b: 0, a: 1 } };
}

function getTransform(node: XmlNode): ColorTransform {
  const result: ColorTransform = {};
  const lumMod = node.child('lumMod')?.attrs.val;
  const lumOff = node.child('lumOff')?.attrs.val;

  if (lumMod) result.lumMod = emusToPercentage(+lumMod);
  if (lumOff) result.lumOff = emusToPercentage(+lumOff);

  return result;
}

function getScheme(node: XmlNode): { scheme?: Scheme; system?: System; rgba?: Rgba } {
  if (node.name === 'schemeClr') return { scheme: node.attrs.val };
  if (node.name === 'sysClr') return { system: node.attrs.val, rgba: tinycolor(`#${node.attrs.lastClr}`).toRgb() };
  return {};
}

function schemeClr(scheme: Scheme, parser: OOXMLParser, clrMap?: Record<string, string>): Rgba {
  const theme = parser.store.get('theme');
  // if (!theme) throw new Error('No theme loaded');
  if (!theme) return { r: 0, g: 0, b: 0, a: 1 };
  clrMap = clrMap || {
    accent1: 'accent1',
    accent2: 'accent2',
    accent3: 'accent3',
    accent4: 'accent4',
    accent5: 'accent5',
    accent6: 'accent6',
    folHlink: 'folHlink',
    hlink: 'hlink',
    dk1: 'dk1',
    dk2: 'dk2',
    lt1: 'lt1',
    lt2: 'lt2',
    tx1: 'dk1', // dk1
    tx2: 'dk2', // dk2
    bg1: 'lt1', // lt1
    bg2: 'lt2', // lt2
  };
  scheme = (clrMap[scheme as string] || scheme) as Scheme;

  const schemeColor = theme.schemeClr[scheme] as Color;

  // TODO: 转换系统颜色
  // const systemColor = {
  //   rgba: { r: 0, g: 0, b: 0, a: 1 },
  //   transform: {},
  // };
  // if (systemColor) return systemColor.rgba;

  return schemeColor.rgba;
}
