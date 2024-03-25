import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import parseXfrm from '@/parse/attrs/xfrm';
import { parseFill } from '../attrs/fill';

export default async function parse(shape: XmlNode, parse: OOXMLParser) {
  const nonVisualProp = shape.child('nvSpPr');
  const xfrm = await parseXfrm(shape, parse);
  const fill = await parseFill(shape.child('spPr') as XmlNode, parse);

  console.log(shape._node, fill);

  return {
    type: 'shape',
    name: nonVisualProp?.child('cNvPr')?.attrs.name,
    xfrm,
  };
}
