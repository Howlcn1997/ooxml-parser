import { XmlNode } from '@/xmlNode';
import parseShape from '.';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase) {
  const id = ((shape.child('nvGrpSpPr') as XmlNode).child('cNvPr') as XmlNode).attrs.id;
  return {
    type: 'group',
    id,
    elements: (await Promise.all(shape.children.map(async i => await parseShape(i, slide)))).filter(Boolean),
  };
}
