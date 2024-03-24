import OOXMLParser from '@/ooxmlParser';
import parseSlideBackground from '@/parse/slide/bg';
import { parseRelsBySlidePath } from '@/parse/slide/rels';
import { Slide } from '@/parse/slide/types';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';

export default async function parseSlide(path: string, parser: OOXMLParser): Promise<Slide> {
  const result: Record<string, any> = {};

  // slide图层层级关系: (slide.bg | slideLayout.bg) < slideLayout.spTree < slide.spTree

  // 背景
  result.background = await parseSlideBackground(path, parser);
  // 关联资源: 媒体资源 板式资源
  result.rels = await parseRelsBySlidePath(path, parser);
  // 元素
  const slide = await parser.readXmlFile(path);
  result.elements = (
    await Promise.all(
      slide
        .child('cSld')
        ?.child('spTree')
        ?.children?.map((i: XmlNode) => parseShape(i, parser)) || []
    )
  )?.filter(Boolean);

  return result as Slide;
}
