import OOXMLParser from '@/ooxmlParser';
import SlideBase, { SlideType } from './slideBase';

export default class SlideLayout extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(SlideType.SlideLayout, sldPath, parser);
  }
}
