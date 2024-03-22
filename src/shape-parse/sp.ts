import { Theme } from '../types';
import { XmlNode } from '../xmlNode';

export default function parse(node: XmlNode, slide: XmlNode, theme: Theme) {
  console.log(slide, theme);
  return node;
}
