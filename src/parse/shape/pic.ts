import { XmlNode } from '@/xmlNode';
import { Fill, parseFill, parseXfrm } from '@/parse/attrs';
import { Pic } from './type';
import SlideBase from '../slide/slideBase';
import { removeEmptyIn } from '@/utils/tools';

export default async function parse(shape: XmlNode, slide: SlideBase): Promise<Pic> {
  const { flipV, flipH, left, top, w, h } = await parseXfrm(shape, slide);
  const id = ((shape.child('nvPicPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;
  const fill = (await parseFill(shape, slide)) as Fill;
  return removeEmptyIn<Pic>({
    type: 'pic',
    id,
    flipH,
    flipV,
    fill,
    dimension: { left, top, w, h },
  });
}
