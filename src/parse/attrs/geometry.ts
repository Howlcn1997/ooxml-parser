import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { CustomGeometry, Xfrm, presetGeometry } from './types';
import parsePath from './path';
import { parseFill } from './fill';
import parseLine from './line';
// import { emusToPercentage } from '@/utils/unit';

export default async function parseGeometry(
  spPr: XmlNode,
  slide: SlideBase,
  xfrm: Xfrm
): Promise<CustomGeometry | presetGeometry> {
  const lineXmlNode = spPr.child('ln');
  const line = lineXmlNode ? await parseLine(lineXmlNode, slide) : null;
  const fill = lineXmlNode ? await parseFill(lineXmlNode, slide) : null;

  const custGeom = spPr.child('custGeom');

  if (custGeom) {
    const pathXmlNodes = custGeom.child('pathLst')?.allChild('path') as XmlNode[];
    const paths = pathXmlNodes.map(pathXmlNode => parsePath(pathXmlNode, slide, xfrm));
    return { name: 'custom', fill, line, paths } as CustomGeometry;
  }

  // TODO: presetName 对应的名称解析为paths
  const prstGeom = spPr.child('prstGeom') as XmlNode;
  const name = prstGeom.attrs.prst;

  const gdNodes = prstGeom.child('avLst')?.allChild('gd') || [];
  const avList = gdNodes.reduce((acc, gd: XmlNode) => ({ ...acc, [gd.attrs.name]: gd.attrs.fmla }), {});

  return { name, fill, line, avList };
}
