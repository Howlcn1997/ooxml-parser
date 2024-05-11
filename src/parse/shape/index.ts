import { XmlNode } from '@/xmlNode';

import spParse from '@/parse/shape/sp';
import cxnSpParse from '@/parse/shape/cxnSp';
import picParse from '@/parse/shape/pic';
import groupParse from '@/parse/shape/group';
import graphicFrameParse from '@/parse/shape/graphicFrame';

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
      return await cxnSpParse(shape, slide);
    case 'graphicFrame':
      return await graphicFrameParse(shape, slide);
    case 'AlternateContent':
      // console.log('🚀 ~ parseShape ~ AlternateContent:', shape._node);
      return null;
    case 'grpSp':
      return await groupParse(shape, slide);
  }
  return null;
}
