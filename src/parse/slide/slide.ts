/* eslint-disable  @typescript-eslint/no-explicit-any */

import OOXMLParser from '@/ooxmlParser';
import SlideBase from './slideBase';
export default class Slide extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(sldPath, parser);
  }
}
