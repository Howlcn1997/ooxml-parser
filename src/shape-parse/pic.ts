import { DocObjectNode, Theme } from '../types';

export default function parse(node: DocObjectNode, slide: DocObjectNode, theme: Theme) {
  console.log(slide, theme);
  return node;
}
