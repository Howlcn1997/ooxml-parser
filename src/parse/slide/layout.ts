import OOXMLParser from '@/ooxmlParser';
import parseSlideBackground from '@/parse/slide/bg';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';

export default async function parseLayout(path: string, parser: OOXMLParser) {
  const background = await parseSlideBackground(path, parser);
  const slide = await parser.readXmlFile(path);
  const spTree = slide.child('cSld')?.child('spTree');
  const elements = (
    await Promise.all(spTree?.children?.map((i: XmlNode) => parseShape(i, path, parser)) || [])
  )?.filter(Boolean);
  return { background, elements };
}
