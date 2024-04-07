import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { CustomGeometry, Shape, presetGeometry } from './type';
import SlideBase from '../slide/slideBase';
import { emusToPercentage } from '@/utils/unit';
import parsePath from '../attrs/path';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const { flipV, flipH, left, top, w, h } = await parseXfrm(shape, slide);

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = await parseFill(shapeProps, slide);
  const geometry = await extractGeometry(shape, slide);
  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    geometry,
    dimension: { w, h, left, top },
  };
}

function extractGeometry(shape: XmlNode, slide: SlideBase) {
  const custGeom = (shape.child('spPr') as XmlNode).child('custGeom');

  if (custGeom) {
    console.log(shape._node);
    const pathXmlNodes = custGeom.child('pathLst')?.allChild('path') as XmlNode[];
    const paths = pathXmlNodes.map(pathXmlNode => parsePath(pathXmlNode, slide));
    return { name: 'custom', paths } as CustomGeometry;
  }

  const prstGeom = (shape.child('spPr') as XmlNode).child('prstGeom') as XmlNode;
  // 当前形状名称 rect roundRect...
  const name = prstGeom.attrs.prst;
  const avList = (prstGeom.child('avLst') as XmlNode).children.map((gd: XmlNode) => ({
    name: gd.attrs.name,
    val: emusToPercentage(+gd.attrs.fmla.split(' ')[1]),
  }));
  return { name, avList } as presetGeometry;
}


