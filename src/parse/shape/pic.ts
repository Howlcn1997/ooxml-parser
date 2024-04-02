import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '../attrs/fill';
import { Pic } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Pic> {
  const { flipV, flipH, left, top, width, height } = await parseXfrm(shape, slide);
  const fill = await parseFill(shape, slide);
  return {
    type: 'pic',
    flipH,
    flipV,
    fill,
    dimension: { left, top, width, height },
  };
}
