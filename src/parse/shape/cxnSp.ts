import { XmlNode } from '@/xmlNode';
import { CxnShape } from './type';
import SlideBase from '@/parse/slide/slideBase';
import { Fill, parseFill, parseGeometry, parseTxBody, parseXfrm } from '@/parse/attrs';
import { removeEmptyIn } from '@/utils/tools';

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
  const fill = (await parseFill(shapeProps, slide)) as Fill;
  const txBody = await parseTxBody(shape.child('txBody'), slide);
  const geometry = await parseGeometry(shapeProps, slide, xfrm);

  return removeEmptyIn<CxnShape>({
    type: 'cxnShape',
    id,
    startId,
    endId,
    flipH,
    flipV,
    fill,
    txBody,
    geometry,
    dimension: { w, h, left, top },
  });
}
