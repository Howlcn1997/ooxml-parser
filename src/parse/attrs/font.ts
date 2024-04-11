import { XmlNode } from '@/xmlNode';

const langMap: Record<string, string> = {
  'en-US': 'latin',
  'zh-CN': 'ea',
};

export function fontSize() {}

export function fontFamily(node: XmlNode) {
  const { lang } = node.attrs;

  const target = langMap[lang] || 'latin';

  let latinNode = node.child(target);
  if (latinNode) return latinNode.attrs.typeface;

  latinNode = node.child('latin');
  if (latinNode) return latinNode.attrs.typeface;

  const eaNode = node.child('ea');
  if (eaNode) return eaNode.attrs.typeface;

  return '';
}
