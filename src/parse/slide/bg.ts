import { parseFill } from '@/parse/attrs/fill';
import { Background, Rel } from '@/parse/slide/types';
import { parseRelsBySlidePath } from '@/parse/slide/rels';
import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
/**
 * 背景获取优先级 slide.bg > slideLayout.bg
 */
export default async function parseSlideBackground(slidePath: string, parser: OOXMLParser): Promise<Background> {
  const slide = await parser.readXmlFile(slidePath);
  const slideBg = slide.child('cSld')?.child('bg');

  if (slideBg) return await parseFill(slideBg.child('bgPr') as XmlNode, parser);

  const rels: Rel[] = await parseRelsBySlidePath(slidePath, parser);
  const relSlideLayout = rels.find(i => i.type === 'slideLayout');

  if (!relSlideLayout) return null;

  const slideLayout = await parser.readXmlFile(relSlideLayout.target);
  const slideLayoutBg = slideLayout.child('cSld')?.child('bg');

  if (slideLayoutBg) return await parseFill(slideLayoutBg.child('bgPr') as XmlNode, parser);

  return null;
}
