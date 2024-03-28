import OOXMLParser from '@/ooxmlParser';
import parseSlideBackground from '@/parse/slide/bg';
// import { Slide } from '@/parse/slide/types';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';
import { Background } from './types';

export default async function parseSlide(path: string, parser: OOXMLParser) {
  // slide图层层级关系: (slide.bg | slideLayout.bg) < slideLayout.spTree < slide.spTree

  // 背景
  const background = await parseSlideBackground(path, parser);
  // 元素
  const slide = await parser.readXmlFile(path);
  const elements = (
    await Promise.all(
      slide
        .child('cSld')
        ?.child('spTree')
        ?.children?.map((i: XmlNode) => parseShape(i, parser)) || []
    )
  )?.filter(Boolean);

  return { background, elements };
}

export  class Slide {
  path: string;
  parser: OOXMLParser;
  background?: Background;

  constructor(path: string, parser: OOXMLParser) {
    this.path = path;
    this.parser = parser;
  }
  async parse() {
    // 背景
    this.background = await parseSlideBackground(this.path, this.parser);
    // 元素
    const slide = await this.parser.readXmlFile(this.path);
    const elements = (
      await Promise.all(
        slide
          .child('cSld')
          ?.child('spTree')
          ?.children?.map((i: XmlNode) => parseShape(i, this.parser)) || []
      )
    )?.filter(Boolean);
  }
}
