import { XmlNode } from '@/xmlNode';

import spParse from '@/parse/shape/sp';
import picParse from '@/parse/shape/pic';
import groupParse from '@/parse/shape/group';
import { Element } from './type';
import Slide from '../slide/slideBase';

export default async function parseShape(shape: XmlNode, slide: Slide): Promise<Element | null> {
  switch (shape.name) {
    // case 'nvGrpSpPr':
    //   return null;
    // case 'grpSpPr':
    //   return null;
    case 'sp':
      return await spParse(shape, slide);
    case 'pic':
      return await picParse(shape, slide);
    case 'cxnSp':
      return null;
    case 'graphicFrame':
      return null;
    case 'AlternateContent':
      return null;
    case 'grpSp':
      return await groupParse(shape, slide);
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
