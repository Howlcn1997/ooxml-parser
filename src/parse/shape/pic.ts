import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '../attrs/fill';

export default async function parse(shape: XmlNode, parser: OOXMLParser) {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parser);
  const fill = await parseFill(shape, parser);
  return {
    type: 'pic',
    fill,
    pos: { left, top },
    size: { width, height, flipV, flipH },
  };
}
