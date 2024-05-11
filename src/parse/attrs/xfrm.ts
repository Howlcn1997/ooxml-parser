import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Xfrm } from './types';

/**
 * doc:
 * - https://learn.microsoft.com/zh-cn/dotnet/api/documentformat.openxml.linq.a.xfrm?view=openxml-3.0.1#documentformat-openxml-linq-a-xfrm
 * -
 * 解析 xfrm 元素
 */
export async function parseXfrm(shape: XmlNode, slide: SlideBase): Promise<Xfrm> {
  const shapePropNode = shape.child(`${shape.name}Pr`);

  const xfrmNode = (shapePropNode ? shapePropNode.child('xfrm') : shape.child('xfrm')) as XmlNode;

  const { flipV, flipH } = xfrmNode.attrs || {};

  const { x, y } = xfrmNode.child('off')?.attrs || { x: '0', y: '0' };
  const { cx, cy } = xfrmNode.child('ext')?.attrs || { cx: '0', cy: '0' };

  let left = parseInt(x);
  let top = parseInt(y);
  let width = parseInt(cx);
  let height = parseInt(cy);

  const groupXfrm = shape.parent?.child('grpSpPr')?.child('xfrm');
  if (groupXfrm) {
    const off = groupXfrm.child('off')?.attrs || { x: '0', y: '0' };
    const ext = groupXfrm.child('ext')?.attrs || { cx: '0', cy: '0' };
    const chOff = groupXfrm.child('chOff')?.attrs || { x: '0', y: '0' };
    const chExt = groupXfrm.child('chExt')?.attrs || { cx: cx, cy: cy };

    const cxRatio = +ext.cx / +chExt.cx;
    const cyRatio = +ext.cy / +chExt.cy;
    // 当shape处于组group中时, 则cx表示在组中的相对长度,  则元素绝对长度 = 父元素绝对长度 / 父元素相对长度(chcx) * 子元素相对长度(cx)
    width = +cx * cxRatio;
    height = +cy * cyRatio;
    // 当shape处于组group中时, 则x表示在组中的相对位置,  则组中元素位置 = 父元素绝对位置 / 父元素相对位置(chx) * 子元素相对位置(x)
    left = (left - parseInt(chOff.x)) * cxRatio + +off.x;
    top = (top - parseInt(chOff.y)) * cyRatio + +off.y;
  }

  const lengthHandler = slide.parser.config.lengthHandler;

  return {
    flipV: flipV === '1',
    flipH: flipH === '1',
    left: lengthHandler(left),
    top: lengthHandler(top),
    w: lengthHandler(width),
    h: lengthHandler(height),
  };
}
