import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { Fill, parseFill } from '@/parse/attrs/fill';
import { Shape } from './type';
import SlideBase from '../slide/slideBase';
import extractGeometry from '../attrs/geometry';
import parseContent from '../attrs/textContent';
import { removeEmptyIn } from '@/utils/tools';
import { parseEffect } from '../attrs/effect';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const xfrm = await parseXfrm(shape, slide);
  const { flipV, flipH, left, top, w, h } = xfrm;

  const id = ((shape.child('nvSpPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = (await parseFill(shapeProps, slide)) as Fill;
  const geometry = await extractGeometry(shapeProps, slide, xfrm);
  const content = await parseContent(shape, slide);
  const effect = await parseEffect(shapeProps.child('effectLst'), slide) || undefined
  return removeEmptyIn({
    id,
    type: 'shape',
    flipH,
    flipV,
    fill,
    effect,
    content: content && slide.parser.config.textContentHandler(content),
    geometry,
    dimension: { w, h, left, top },
  });
}
