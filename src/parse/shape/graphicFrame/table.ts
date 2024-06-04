import SlideBase from '@/parse/slide/slideBase';
import { XmlNode } from '@/xmlNode';
import { Table } from '@/parse/shape/type';

export async function parseTable(tableNode: XmlNode, slide: SlideBase): Promise<Table> {
  const rels = await slide.rels();
  const rel = rels[tableNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}
