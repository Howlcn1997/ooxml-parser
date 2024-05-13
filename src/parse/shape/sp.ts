import { XmlNode } from '@/xmlNode';
import { Shape } from './type';
import SlideBase from '../slide/slideBase';
import { removeEmptyIn } from '@/utils/tools';
import { parseFill, Fill, parseShapeEffect, parseGeometry, parseTxBody, parseXfrm } from '@/parse/attrs';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const xfrm = await parseXfrm(shape, slide);
  const { flipV, flipH, left, top, w, h } = xfrm;

  const id = ((shape.child('nvSpPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = (await parseFill(shapeProps, slide)) as Fill;
  const geometry = await parseGeometry(shapeProps, slide, xfrm);
  const txBody = await parseTxBody(shape.child('txBody'), slide);
  const effect = await parseShapeEffect(shapeProps.child('effectLst'), slide);
  return removeEmptyIn<Shape>({
    type: 'shape',
    id,
    flipH,
    flipV,
    fill,
    effect,
    txBody: txBody && slide.parser.config.textContentHandler(txBody),
    geometry,
    dimension: { w, h, left, top },
  });
}
