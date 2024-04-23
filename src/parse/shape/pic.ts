import { XmlNode } from '@/xmlNode';
import parseXfrm from '@/parse/attrs/xfrm';
import { Fill, parseFill } from '../attrs/fill';
import { Pic } from './type';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Pic> {
  const { flipV, flipH, left, top, w, h } = await parseXfrm(shape, slide);
  const id = ((shape.child('nvSpPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;
  const fill = (await parseFill(shape, slide)) as Fill;
  return {
    id,
    type: 'pic',
    flipH,
    flipV,
    fill,
    dimension: { left, top, w, h },
  };
}
