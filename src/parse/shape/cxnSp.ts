import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { CxnShape } from './type';
import SlideBase from '../slide/slideBase';
import extractGeometry from '../attrs/geometry';

/**
 * 连接符图形(肘形连接符,直线连接符,曲线连接符...)
 */
export default async function parse(shape: XmlNode, slide: SlideBase): Promise<CxnShape> {
  const xfrm = await parseXfrm(shape, slide);
  const { flipV, flipH, left, top, w, h } = xfrm;

  const nvCxnSpPr = shape.child('nvCxnSpPr') as XmlNode;
  const id = (nvCxnSpPr.child('cNvPr') as XmlNode).attrs.id;

  const cNvCxnSpPr = nvCxnSpPr.child('cNvCxnSpPr') as XmlNode;
  const startId = cNvCxnSpPr.child('stCxn')?.attrs?.id;
  const endId = cNvCxnSpPr.child('endCxn')?.attrs?.id;

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = await parseFill(shapeProps, slide);
  const geometry = await extractGeometry(shapeProps, slide, xfrm);
  return {
    id,
    ...(startId ? { startId } : {}),
    ...(endId ? { endId } : {}),
    type: 'connectShape',
    flipH,
    flipV,
    fill,
    geometry,
    dimension: { w, h, left, top },
  };
}
