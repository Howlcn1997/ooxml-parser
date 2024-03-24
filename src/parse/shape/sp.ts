import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';

export default async function parse(shape: XmlNode, parse: OOXMLParser) {
  const nonVisualProp = shape.child('nvSpPr');
  const xfrm = await parseXfrm(shape, parse);

  return {
    type: 'shape',
    name: nonVisualProp?.child('cNvPr')?.attrs.name,
    xfrm,
  };
}
