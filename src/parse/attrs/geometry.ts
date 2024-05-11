import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { CustomGeometry, Xfrm, presetGeometry } from './types';
import { parseFill, parseLine, parsePath } from '@/parse/attrs';

import { removeEmptyIn } from '@/utils/tools';

export async function parseGeometry(
  spPr: XmlNode,
  slide: SlideBase,
  xfrm: Xfrm
): Promise<CustomGeometry | presetGeometry> {
  const lineXmlNode = spPr.child('ln');
  const line = await parseLine(lineXmlNode, slide);
  const fill = await parseFill(lineXmlNode, slide);

  const custGeom = spPr.child('custGeom');

  if (custGeom) {
    const pathXmlNodes = custGeom.child('pathLst')?.allChild('path') as XmlNode[];
    const paths = pathXmlNodes.map(pathXmlNode => parsePath(pathXmlNode, slide, xfrm));
    return removeEmptyIn<CustomGeometry>({ name: 'custom', fill, line, paths });
  }

  // TODO: presetName 对应的名称解析为paths
  const prstGeom = spPr.child('prstGeom') as XmlNode;
  const name = prstGeom.attrs.prst;

  const gdNodes = prstGeom.child('avLst')?.allChild('gd') || [];
  const avList = gdNodes.reduce((acc, gd: XmlNode) => ({ ...acc, [gd.attrs.name]: gd.attrs.fmla }), {});

  return removeEmptyIn<presetGeometry>({ name, fill, line, avList });
}
