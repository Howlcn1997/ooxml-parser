import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { Shape } from './type';

export default async function parse(shape: XmlNode, sldPath: string, parser: OOXMLParser): Promise<Shape> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parser);
  const fill = await parseFill(shape.child('spPr') as XmlNode, sldPath, parser);

  return {
    type: 'shape',
    flipH,
    flipV,
    fill,
    dimension: { width, height, left, top },
  };
}
