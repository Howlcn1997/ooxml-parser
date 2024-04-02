import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseShape from '.';
import SlideBase from '../slide/slideBase';

export default async function parse(shape: XmlNode, slide: SlideBase, parser: OOXMLParser) {
  return {
    type: 'group',
    elements: (await Promise.all(shape.children.map(async i => await parseShape(i, slide, parser)))).filter(Boolean),
  };
}
