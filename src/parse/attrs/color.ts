import { XmlNode } from '@/xmlNode';
import { Color, ColorTransform, Rgba, Scheme } from '@/parse/attrs/types';
import tinycolor from 'tinycolor2';
import OOXMLParser from '@/ooxmlParser';
interface ParseColorOptions {
  // 是否将 ColorTransform 合并到 rgba 中
  transform?: boolean;
  // 是否将 Scheme 通过 Theme 转换为 rgba
  scheme?: boolean;
}

/**
 * node 中必须含有color相关属性，例如srgbClr、schemeClr等
 * @param mergeTrans 是否将 ColorTransform 合并到 rgba 中
 * @returns
 */
export function parseColor(node: XmlNode, parser: OOXMLParser, opts?: ParseColorOptions): Color {
  const children = node.children;
  console.log(node)

  for (const child of children) {
    const color: Record<string, any> = {};
    const alpha = +(child.child('alpha')?.attrs?.val || 100000) / 100000;

    // transform
    const transform = getTransform(child);
    if (transform) color.transform = transform;

    const scheme = getScheme(child);
    if (scheme) color.scheme = scheme;

    switch (child.name) {
      case 'srgbClr':
        return { rgba: tinycolor(`#${child.attrs.val}`).setAlpha(alpha).toRgb(), transform };
      case 'sysClr':
        return {
          scheme: child.attrs.lastClr,
          rgba: tinycolor(child.attrs.lastClr).setAlpha(alpha).toRgb(),
          transform,
        };
      case 'schemeClr':
        return {
          scheme: child.attrs.val,
          rgba: tinycolor(child.attrs.val).setAlpha(alpha).toRgb(),
          transform: {},
        };
    }
  }
  return { scheme: 'accent1', rgba: tinycolor(`#000`).setAlpha(1).toRgb(), transform: {} };
}

function getTransform(node: XmlNode): ColorTransform | undefined {
  const lumMod = node.child('lumMod')?.attrs.val;
  const lumOff = node.child('lumOff')?.attrs.val;
  if (lumMod || lumOff) return { lumMod, lumOff };
}
function getScheme(node: XmlNode): Scheme | undefined {

}

function schemeClr(scheme: Scheme, parser: OOXMLParser): Rgba {
  const currentThemeIndex = 0;
  const themes = parser.store.get('themes');
  const targetTheme = themes[currentThemeIndex];

  const schemeColor = targetTheme.schemeClr[scheme] as Color | undefined;
  // TODO: 合并处理transform
  if (schemeColor) return schemeColor.rgba;

  // TODO: 转换系统颜色
  // const systemColor = {
  //   rgba: { r: 0, g: 0, b: 0, a: 1 },
  //   transform: {},
  // };
  // if (systemColor) return systemColor.rgba;

  return { r: 0, g: 0, b: 0, a: 1 };
}
