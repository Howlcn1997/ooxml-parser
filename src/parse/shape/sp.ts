import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '../attrs/fill';
import { BaseElement } from './type';

export default async function parse(shape: XmlNode, parse: OOXMLParser): Promise<BaseElement> {
  const nonVisualProp = shape.child('nvSpPr');
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parse);
  const fill = await parseFill(shape.child('spPr') as XmlNode, parse);

  return {
    type: 'shape',
    name: nonVisualProp?.child('cNvPr')?.attrs.name,
    fill,
    pos: { left, top },
    size: { width, height, flipV, flipH },
  };
}
