import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Line } from './types';
import { Fill, parseFill } from './fill';

export default async function parseLine(lineNode: XmlNode | null, slide: SlideBase): Promise<Line | null> {
  if (!lineNode) return null;

  const w = slide.parser.config.lengthHandler(+(lineNode.attrs.w || '9525'));
  const cap = parseLineCap(lineNode);
  const join = parseLineJoin(lineNode);
  const fill = (await parseFill(lineNode, slide)) as Fill;

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
