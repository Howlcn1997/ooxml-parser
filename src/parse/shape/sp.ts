import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { Shape } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Shape> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, slide);
  const fill = await parseFill(shape.child('spPr') as XmlNode, slide);

  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    dimension: { width, height, left, top },
  };
}
