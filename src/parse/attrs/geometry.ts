import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { CustomGeometry, Xfrm, presetGeometry } from './types';
import parsePath from './path';
import { parseFill } from './fill';
// import { emusToPercentage } from '@/utils/unit';

export default async function extractGeometry(
  spPr: XmlNode,
  slide: SlideBase,
  xfrm: Xfrm
): Promise<CustomGeometry | presetGeometry> {
  const custGeom = spPr.child('custGeom');

  if (custGeom) {
    const pathXmlNodes = custGeom.child('pathLst')?.allChild('path') as XmlNode[];
    const paths = pathXmlNodes.map(pathXmlNode => parsePath(pathXmlNode, slide, xfrm));
    const lineXmlNode = spPr.child('ln');
    // const stroke = lineXmlNode ? parseLine(lineXmlNode, slide) : undefined;
    const fill = lineXmlNode ? await parseFill(lineXmlNode, slide) : undefined;
    return { name: 'custom', fill, paths } as CustomGeometry;
  }

  const prstGeom = spPr.child('prstGeom') as XmlNode;
  // 当前形状名称 rect roundRect...
  const name = prstGeom.attrs.prst;
//   const avList = (prstGeom.child('avLst') as XmlNode).children.map((gd: XmlNode) => ({
//     name: gd.attrs.name,
//     val: emusToPercentage(+gd.attrs.fmla.split(' ')[1]),
//   }));
  return { name };
}
