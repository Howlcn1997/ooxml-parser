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

// class Shape {
//   shape: XmlNode;
//   slide: Slide;
//   parser: OOXMLParser;

//   constructor(shape: XmlNode, slide: Slide, parser: OOXMLParser) {
//     this.shape = shape;
//     this.parser = parser;
//   }
//   async parse() {
//     switch (this.shape.name) {
//       case 'sp':
//         return await spParse(this.shape, this.parser);
//       case 'pic':
//         return await picParse(this.shape, this.parser);
//       case 'grpSp':
//         return await groupParse(this.shape, this.parser);
//     }
//     return null;
//   }
// }
