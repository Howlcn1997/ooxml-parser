import { removeEmptyIn } from '@/utils/tools';
import { XmlNode } from '@/xmlNode';

export default function textEffect(effectNode: XmlNode) {
  const outerShadow = parseOuterShadow(effectNode.child('outerShdw'));
  const reflection = parseReflection(effectNode.child('reflection'));

  return removeEmptyIn({ outerShadow, reflection });
}

function parseOuterShadow(node: XmlNode | null) {
  if (!node) return null;

  const { blurRad, dist, dir, sx, sy, color } = node.attrs;
  return removeEmptyIn({ blurRad, dist, dir, sx, sy, color });
}

function parseReflection(node: XmlNode | null) {
  if (!node) return null;

  const { blurRad, dist, dir, sx, sy, color } = node.attrs;
  return removeEmptyIn({ blurRad, dist, dir, sx, sy, color });
}
