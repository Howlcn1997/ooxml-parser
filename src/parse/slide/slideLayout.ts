import OOXMLParser from '@/ooxmlParser';
import SlideBase from './slideBase';

export default class SlideLayout extends SlideBase {
  constructor(sldPath: string, parser: OOXMLParser) {
    super(sldPath, parser);
  }
}
