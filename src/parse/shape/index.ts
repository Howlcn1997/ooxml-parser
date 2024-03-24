import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';

import spParse from '@/parse/shape/sp';
import picParse from '@/parse/shape/pic';
import groupParse from '@/parse/shape/group';
import { Element } from './type';

export default async function parseShape(shape: XmlNode, parser: OOXMLParser): Promise<Element | null> {
  switch (shape.name) {
    // case 'nvGrpSpPr':
    //   return null;
    // case 'grpSpPr':
    //   return null;
    case 'sp':
      return await spParse(shape, parser);
    case 'pic':
      return await picParse(shape, parser);
    case 'grpSp':
      return await groupParse(shape, parser);
  }
  return null;
}
