import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Line } from './types';
import { parseFill } from './fill';

export default async function parseLine(lineNode: XmlNode, slide: SlideBase): Promise<Line> {
  const w = slide.parser.config.lengthHandler(+lineNode.attrs.w);
  const cap = parseLineCap(lineNode);
  const join = parseLineJoin(lineNode);
  const fill = await parseFill(lineNode, slide);

  return { w, cap, join, fill };
}

export function parseLineCap(lineNode: XmlNode) {
  const cap = lineNode.attrs.cap || 'sq';
  if (cap === 'sq') return 'square';
  if (cap === 'rnd') return 'round';
  return 'butt';
}

export function parseLineJoin(lineNode: XmlNode) {
  for (const child of lineNode.children) {
    if (child.name === 'round') return 'round';
    if (child.name === 'bevel') return 'bevel';
  }
  return 'miter';
}
