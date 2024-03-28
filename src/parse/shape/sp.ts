import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '@/parse/attrs/fill';
import { BaseElement } from './type';

export default async function parse(shape: XmlNode, parser: OOXMLParser): Promise<BaseElement> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parser);
  const fill = await parseFill(shape.child('spPr') as XmlNode, parser);

  return {
    type: 'shape',
    fill,
    pos: { left, top },
    size: { width, height, flipV, flipH },
  };
}
