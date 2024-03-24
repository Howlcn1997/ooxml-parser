import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

export default function parse(shape: XmlNode, parse: OOXMLParser) {
  const nonVisualProp = shape.child('nvPicPr');
  return {
    type: 'pic',
    name: nonVisualProp?.child('cNvPr')?.attrs.name,
  };
}
