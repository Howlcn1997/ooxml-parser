import SlideBase from "@/parse/slide/slideBase";
import { XmlNode } from "@/xmlNode";
import { Ole } from "@/parse/shape/type";

export async function parseOle(oleNode: XmlNode, slide: SlideBase): Promise<Ole> {
  const rels = await slide.rels();
  const rel = rels[oleNode.attrs['r:id']];
  const chartXmlNode = await slide.parser.readXmlFile(rel.target);
  console.log('🚀 ~ parseChart ~ chartXmlNode._node:', chartXmlNode);
  return {};
}
