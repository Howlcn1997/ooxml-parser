import { parseFill } from '@/parse/attrs/fill';
import { Background, Rel } from '@/parse/slide/types';
import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
/**
 * 背景获取优先级 slide.bg > slideLayout.bg
 */
export default async function parseSlideBackground(slidePath: string, parser: OOXMLParser): Promise<Background> {
  const slide = await parser.readXmlFile(slidePath);
  const slideBg = slide.child('cSld')?.child('bg');

  if (slideBg) return await parseFill(slideBg.child('bgPr') as XmlNode, parser);

  const relLayout = Object.values(await parser.getSlideRels(slidePath, 'layout')).find(i => i.type === 'slideLayout');
  const relMaster = Object.values(await parser.getSlideRels(slidePath, 'layout')).find(i => i.type === 'slideMaster');

  if (!relLayout && !relMaster) return null;
  const relXmlFile = await parser.readXmlFile(((relLayout as Rel) || (relMaster as Rel)).target);
  const bg = relXmlFile.child('cSld')?.child('bg');

  if (bg) return await parseFill(bg.child('bgPr') as XmlNode, parser);

  return null;
}
