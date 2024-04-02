import { parseFill } from '@/parse/attrs/fill';
import { Background, Rel } from '@/parse/slide/types';
import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import SlideBase from './slideBase';
/**
 * 背景获取优先级 slide.bg > slideLayout.bg
 */
export default async function parseSlideBackground(slide: SlideBase, parser: OOXMLParser): Promise<Background> {
  const slideXmlNode = await slide.xmlNode();
  const slideBgPr = slideXmlNode.child('cSld')?.child('bg')?.child('bgPr');

  if (slideBgPr) return await parseFill(slideBgPr as XmlNode, slide, parser);

  const relLayout = Object.values(await slide.rels('layout')).find(i => i.type === 'slideLayout');
  const relMaster = Object.values(await slide.rels('layout')).find(i => i.type === 'slideMaster');

  if (!relLayout && !relMaster) return null;
  const relXmlFile = await parser.readXmlFile(((relLayout as Rel) || (relMaster as Rel)).target);
  const bg = relXmlFile.child('cSld')?.child('bg');
  const bgPr = bg?.child('bgPr');
  const bgRef = bg?.child('bgRef');

  if (bgPr || bgRef) return await parseFill((bgPr || bgRef) as XmlNode, slide, parser);

  return null;
}
