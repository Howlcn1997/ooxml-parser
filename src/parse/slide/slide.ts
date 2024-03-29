import OOXMLParser from '@/ooxmlParser';
import parseSlideBackground from '@/parse/slide/bg';
// import { Slide } from '@/parse/slide/types';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';

export default async function parseSlide(path: string, parser: OOXMLParser) {
  // slide图层层级关系: (slide.bg | slideLayout.bg) < slideLayout.spTree < slide.spTree
  // 背景
  const background = await parseSlideBackground(path, parser);
  // 元素
  const slide = await parser.readXmlFile(path);
  const spTree = slide.child('cSld')?.child('spTree');
  const elements = (
    await Promise.all(spTree?.children?.map((i: XmlNode) => parseShape(i, path, parser)) || [])
  )?.filter(Boolean);
  return { background, elements };
}
