/* eslint-disable  @typescript-eslint/no-explicit-any */

import OOXMLParser from '@/ooxmlParser';
import SlideBase, { SlideType } from './slideBase';
export default class Slide extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(SlideType.Slide, sldPath, parser);
  }
}
