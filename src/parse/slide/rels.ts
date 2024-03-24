import { XmlNode } from '@/xmlNode';
import OOXMLParser from '@/ooxmlParser';
import { Rel, SlideType } from '@/parse/slide/types';

export async function parseRels(path: string, parser: OOXMLParser): Promise<Rel[]> {
  const relsFile = await parser.readXmlFile(path);

  return relsFile.children.map((i: XmlNode) => ({
    type: i.attrs.Type.split('/').pop(),
    target: i.attrs.Target.replace('..', 'ppt'),
  }));
}

export function parseRelsBySlideName(name: string, parser: OOXMLParser, slideType: SlideType = SlideType.Slide) {
  return parseRels(`ppt/${slideType}s/_rels/${name}.rels`, parser);
}

export async function parseRelsBySlidePath(path: string, parser: OOXMLParser, slideType?: SlideType) {
  const slideFilename = path.split('/').pop() as string; // 'slide1.xml'
  return parseRelsBySlideName(slideFilename, parser, slideType);
}

export function handleRel(rels: Rel[], type: string) {
  return rels.find(i => i.type === type)?.target;
}

export function handleImageRel(rels: Rel[]) {
  return handleRel(rels, 'image');
}

export function handleSlideLayoutRel(rels: Rel[]) {}
