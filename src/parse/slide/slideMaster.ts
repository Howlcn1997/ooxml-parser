import OOXMLParser from '@/ooxmlParser';
import SlideBase from './slideBase';

export default class SlideMaster extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(sldPath, parser);
  }
}
