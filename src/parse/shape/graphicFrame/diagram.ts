import SlideBase from '@/parse/slide/slideBase';
import { XmlNode } from '@/xmlNode';
import { Diagram } from '@/parse/shape/type';

export async function parseDiagram(diagramNode: XmlNode, slide: SlideBase): Promise<Diagram> {
  const rels = await slide.rels();
  const rel = rels[diagramNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}
