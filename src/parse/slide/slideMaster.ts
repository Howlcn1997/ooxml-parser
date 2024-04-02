import OOXMLParser from '@/ooxmlParser';
import SlideBase, { SlideType } from './slideBase';

export default class SlideMaster extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(SlideType.SlideMaster, sldPath, parser);
  }
}
