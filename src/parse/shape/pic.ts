import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '../attrs/fill';
import { Pic } from './type';

export default async function parse(shape: XmlNode, sldPath: string, parser: OOXMLParser): Promise<Pic> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, parser);
  const fill = await parseFill(shape, sldPath, parser);
  return {
    type: 'pic',
    flipH,
    flipV,
    fill,
    dimension: { left, top, width, height },
  };
}
