import { XmlNode } from '@/xmlNode';
import { parseColor } from '@/parse/attrs/color';
import { Color } from '@/parse/attrs/types';
import OOXMLParser from '@/ooxmlParser';
import { Percentage, angleToDegrees, emusAlphaToOpacity, emusToPercentage, emusToPt } from '../../utils/unit';
import JSZip from 'jszip';

export async function parseFill(elementPr: XmlNode, sldPath: string, parser: OOXMLParser): Promise<Fill> {
  for (const child of elementPr.children) {
    switch (child.name) {
      case 'solidFill':
        return parseSolidFill(child, parser);
      case 'gradFill':
        return await parseGradientFill(child, parser);
      case 'blipFill':
        return await parsePicFill(child, sldPath, parser);
      case 'pattFill':
        return await parsePatternFill(child, sldPath, parser);
      case 'noFill':
        return { type: 'noFill' };
    }
  }
  // 尝试解析默认填充
  return { type: 'noFill' };
}

export function parseSolidFill(node: XmlNode, parser: OOXMLParser): SolidFill {
  return {
    type: 'solid',
    value: parseColor(node, parser),
  };
}

export async function parseGradientFill(node: XmlNode, parser: OOXMLParser): Promise<GradientFill> {
  const rotateWithShape = node.attrs.rotWithShape === '1';

  const gsNodes = node.child('gsLst')?.allChild('gs') as XmlNode[];
  const gradientStopList = gsNodes.map(i => ({ pos: emusToPercentage(+i.attrs.pos), color: parseColor(i, parser) }));

  const linear = node.child('lin');
  if (linear)
    /**
     * 此处忽略lin.attrs.scaled属性
     *
     * scaled属性: a:lin 元素的 scaled 属性用于指定渐变是否应该被缩放以适应形状
     *            如果 scaled 属性的值为 1，则渐变将被缩放以填充形状的边界。这意味着渐变的开始和结束点将始终位于形状的边界上，无论形状的尺寸如何。
     *            如果 scaled 属性的值为 0 或未设置，则渐变将不会被缩放。这意味着渐变的开始和结束点将始终位于相同的位置，无论形状的尺寸如何。
     * 但目前scaled属性基本为1,故此忽略
     */
    return {
      type: 'gradient',
      value: {
        type: 'linear',
        rotateWithShape,
        gsList: gradientStopList,
        angle: angleToDegrees(linear.attrs.ang),
      },
    };

  const gradientType = node.child('path')?.attrs.path;
  const tileRect = node.child('tileRect');

  const t = emusToPercentage(+tileRect?.attrs?.t);
  const l = emusToPercentage(+tileRect?.attrs?.l);
  const r = emusToPercentage(+tileRect?.attrs?.r);
  const b = emusToPercentage(+tileRect?.attrs?.b);

  const top = isNaN(t) ? -+b : t < 0 ? 1 + t : t;
  const left = isNaN(l) ? -+r : l ? 1 + l : l;

  const origin = { top: isNaN(top) ? 0.5 : top, left: isNaN(left) ? 0.5 : left };

  switch (gradientType) {
    case 'rect':
      return { type: 'gradient', value: { type: 'rect', rotateWithShape, gsList: gradientStopList, origin } };
    case 'circle':
      return { type: 'gradient', value: { type: 'radial', rotateWithShape, gsList: gradientStopList, origin } };
  }
  return { type: 'gradient', value: { type: 'path', rotateWithShape, gsList: gradientStopList, origin } };
}

/**
 * 图片或纹理(纹理填充本质上也是图片填充)
 * doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.blipfill?view=openxml-2.8.1
 */
export async function parsePicFill(node: XmlNode, sldPath: string, parser: OOXMLParser): Promise<PicFill> {
  const value: Record<string, any> = {};

  value.rotateWithShape = node.attrs.rotWithShape === '1';

  const tileNode = node.child('tile');
  if (tileNode) value.tile = parseTile(tileNode, parser);
  else {
    const fillRectNode = node.child('stretch')?.child('fillRect');
    if (fillRectNode) value.dimension = parseRect(fillRectNode);
  }
  const blipNode = node.child('blip');

  const alpha = blipNode?.child('alphaModFix')?.attrs?.amt;
  value.opacity = alpha ? emusAlphaToOpacity(+alpha) : 1;

  const embedId = blipNode?.attrs['r:embed'];
  const rels = await parser.getSlideRels(sldPath, 'slide');

  const { type, target } = rels[embedId];
  const zipFile = (await parser.readFile(target)) as JSZip.JSZipObject;
  value.url = await parser.config.embedTransformer(type, target, zipFile);

  return { type: 'pic', value } as PicFill;

  /**
   * 平铺
   * doc: https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.tile?view=openxml-2.8.1
   */
  function parseTile(tile: XmlNode, parser: OOXMLParser): FillTile {
    const { tx, ty, sx, sy, flip, algn } = tile.attrs;
    return {
      offX: emusToPt(+tx, parser.config.lengthHandler),
      offY: emusToPt(+ty, parser.config.lengthHandler),
      radioX: emusToPercentage(+sx),
      radioY: emusToPercentage(+sy),
      flip,
      algn,
    };
  }

  function parseRect(rect: XmlNode): PicFillDimension {
    const { l, t, r, b } = rect.attrs;
    return {
      top: emusToPercentage(+t),
      right: emusToPercentage(+r),
      bottom: emusToPercentage(+b),
      left: emusToPercentage(+l),
    };
  }
}

// 图案
/**
 * 
 * doc:
 * - https://learn.microsoft.com/zh-cn/dotnet/api/documentformat.openxml.drawing.patternfill?view=openxml-3.0.1
 * - https://learn.microsoft.com/zh-cn/dotnet/api/documentformat.openxml.drawing.presetpatternvalues?view=openxml-3.0.1
 * - 
 */
export async function parsePatternFill(node: XmlNode, sldPath: string, parser: OOXMLParser): Promise<PatternFill> {
  const { prst: preset } = node.attrs;
  const fgClr = node.child('fgClr');
  const bgClr = node.child('bgClr');
  return {
    type: 'pattern',
    value: {
      preset,
    },
  } as PatternFill;
}

// ============== tools ================

// ============== types ================
export type Fill = NoFill | SolidFill | GradientFill | PatternFill | PicFill;

type NoFill = { type: 'noFill' };

export interface SolidFill {
  type: 'solid';
  value: Color;
}

type GradientFillType = 'linear' | 'radial' | 'rect' | 'path';
interface GradientStop {
  pos: Percentage;
  color: Color;
}
export interface GradientFill {
  type: 'gradient';
  value: {
    type: GradientFillType;
    gsList: GradientStop[];
    angle?: number;
    origin?: { top: Percentage; left: Percentage };
    rotateWithShape: boolean;
  };
}

// 图案填充
export interface PatternFill {
  type: 'pattern';
  value: {
    rotateWithShape: boolean;
    preset: string;
  };
}

type FillTileFlip =
  | 'none' // None
  | 'x' // Horizontal
  | 'y' // Vertical
  | 'xy'; // Horizontal and vertical

type FillTileAlgn =
  | 'b' // Bottom
  | 'bl' // Bottom left
  | 'br' // Bottom right
  | 'ctr' // Center
  | 'l' // Left
  | 'r' // Right
  | 't' // Top
  | 'tl' // Top left
  | 'tr'; // Top right

interface FillTile {
  offX: number; // 偏移量X
  offY: number; // 偏移量Y
  radioX: Percentage; // 水平缩放比例（刻度X）
  radioY: Percentage; // 垂直缩放比例（刻度Y）
  flip: FillTileFlip; // 对齐方式
  algn: FillTileAlgn; // 镜像类型
}

// 图片填充尺寸
interface PicFillDimension {
  top: Percentage;
  right: Percentage;
  bottom: Percentage;
  left: Percentage;
}

// 图片或纹理填充
export interface PicFill {
  type: 'pic';
  value: {
    rotateWithShape: boolean;
    opacity: Percentage;
    url: string;
    tile?: FillTile;
    dimension?: PicFillDimension;
  };
}
