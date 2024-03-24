import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseShape from '.';

export default async function parse(shape: XmlNode, parse: OOXMLParser) {

  return {
    type: 'group',
    elements: (await Promise.all(shape.children.map(async i => await parseShape(i, parse)))).filter(Boolean),
  };
}
