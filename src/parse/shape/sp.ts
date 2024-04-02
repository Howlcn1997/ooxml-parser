import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { Shape } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase, parser: OOXMLParser): Promise<Shape> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parser);
  const fill = await parseFill(shape.child('spPr') as XmlNode, slide, parser);

  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    dimension: { width, height, left, top },
  };
}
