import JSZip from 'jszip';
import { DocArrayNode, DocObjectNode } from './types';
import { XmlNode } from './xmlNode';

export async function readXmlFile(zip: JSZip, filename: string): Promise<XmlNode> {
  const zipFile = zip.file(filename);
  if (!zipFile) throw new Error(`File ${filename} not found`);

  const xmlString = await zipFile.async('string');
  const doc = xmlParser(xmlString);
  return new XmlNode(doc.children[0]);
}

export function xmlParser(xmlString: string) {
  return new DOMParser().parseFromString(xmlString, 'text/xml');
}

function parseNodeAttributes(node: Element) {
  const attributes: Record<string, string> = {};
  if (!node.attributes) return attributes;

  for (const attr of node.attributes) {
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

/**
 * 子元素作为children数组的形式返回doc的类JSON数据
 * 例：
 *  <parent id="1">
 *   <child1 id="2"></child1>
 *   <child2 id="3"></child2>
 *   <child2 id="4"></child2>
 *  </parent>
 * 转换为
 *  {
 *   tag: 'parent',
 *   id: '1',
 *   children: [
 *     {tag: 'child1', id: '2'},
 *     {tag: 'child2', id: '3'},
 *     {tag: 'child2', id: '4'}
 *   ]
 *  }
 */
export function docArrayLossless(doc: Document) {
  let order = 0;
  const documentDFS = (node: Element, parentNode?: DocArrayNode): DocArrayNode => {
    const currentNode: DocArrayNode = {
      tag: node.nodeName,
      attrs: parseNodeAttributes(node),
      parentNode,
      originNode: node,
      order: order++,
    };

    currentNode.children = Object.values(node.childNodes).map(i => documentDFS(i as Element, currentNode));
    return currentNode;
  };
  return documentDFS(doc.childNodes[0] as Element);
}

/**
 * 子元素作为父元素的key形式返回doc的类JSON数据,且当仅有一个子元素时，子元素不作为数组返回
 * 例:
 * <parent id="1">
 *  <child1 id="2"></child1>
 *  <child2 id="3"></child2>
 *  <child2 id="4"></child2>
 * </parent>
 * 转换为
 * {
 *  parent: {
 *   attrs: { id: '1' },
 *   child1: { attrs: { id: '2' } },
 *   child2: [{ attrs: { id: '3' } }, { attrs: { id: '4' } }]
 *  }
 * }
 */
export function docObjectLossless(doc: Document) {
  let order = 0;

  const documentDFS = (node: Element, parentNode?: DocObjectNode): DocObjectNode => {
    const currentNode: DocObjectNode = {
      attrs: parseNodeAttributes(node),
      parentNode,
      originNode: node,
      order: order++,
    };

    Object.values(node.childNodes).forEach(i => {
      const childNode = documentDFS(i as Element, currentNode);
      if (!currentNode[i.nodeName]) currentNode[i.nodeName] = childNode;
      else if (Array.isArray(currentNode[i.nodeName])) (currentNode[i.nodeName] as DocObjectNode[]).push(childNode);
      else currentNode[i.nodeName] = [currentNode[i.nodeName] as DocObjectNode, childNode];
    });

    return currentNode;
  };
  return documentDFS(doc.childNodes[0] as Element);
}

export function getValueByPaths(node: DocObjectNode, paths: string[]) {
  return paths.reduce((acc, key) => (acc ? acc[key] : acc), node as any);
}
