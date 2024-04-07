import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { Shape } from './type';
import SlideBase from '../slide/slideBase';
import extractGeometry from '../attrs/geometry';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const xfrm = await parseXfrm(shape, slide);
  const { flipV, flipH, left, top, w, h } = xfrm;

  const id = ((shape.child('nvSpPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;

  const shapeProps = shape.child('spPr') as XmlNode;
  const fill = await parseFill(shapeProps, slide);
  const geometry = await extractGeometry(shapeProps, slide, xfrm);
  return {
    id,
    type: 'shape',
    flipH,
    flipV,
    fill,
    geometry,
    dimension: { w, h, left, top },
  };
}
