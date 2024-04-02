import { XmlNode } from '@/xmlNode';
import parseShape from '.';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase) {
  return {
    type: 'group',
    elements: (await Promise.all(shape.children.map(async i => await parseShape(i, slide)))).filter(Boolean),
  };
}
