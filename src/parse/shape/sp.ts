import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { CustomGeometry, Shape, presetGeometry } from './type';
import SlideBase from '../slide/slideBase';
import { emusToPercentage } from '@/utils/unit';
import parsePath from '../attrs/path';
import { Xfrm } from '../attrs/types';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const xfrm = await parseXfrm(shape, slide);
  const { flipV, flipH, left, top, w, h } = xfrm;

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = await parseFill(shapeProps, slide);
  const geometry = await extractGeometry(shapeProps, slide, xfrm);
  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    geometry,
    dimension: { w, h, left, top },
  };
}

async function extractGeometry(spPr: XmlNode, slide: SlideBase, xfrm: Xfrm) {
  const custGeom = spPr.child('custGeom');
  console.log(spPr._node);
  
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
  const avList = (prstGeom.child('avLst') as XmlNode).children.map((gd: XmlNode) => ({
    name: gd.attrs.name,
    val: emusToPercentage(+gd.attrs.fmla.split(' ')[1]),
  }));
  return { name, avList } as presetGeometry;
}
