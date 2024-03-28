import OOXMLParser from '@/ooxmlParser';
import { Rels } from '@/parse/slide/types';

export async function parseRels(path: string, parser: OOXMLParser): Promise<Rels> {
  const relsFile = await parser.readXmlFile(path);
  return relsFile.children.reduce((rels, i) => {
    rels[i.attrs.Id] = {
      type: i.attrs.Type.split('/').pop(),
      target: i.attrs.Target.replace('..', 'ppt'),
    };
    return rels;
  }, {} as Rels);
}

export async function parseRelsByOriginPath(path: string, parser: OOXMLParser) {
  const filename = path.split('/').pop() as string; // 'slide1.xml'
  const fileType = filename.replace(/\d+\.xml/, '');
  return await parseRels(`ppt/${fileType}s/_rels/${filename}.rels`, parser);
}
