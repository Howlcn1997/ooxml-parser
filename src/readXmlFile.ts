import JSZip from 'jszip';

export async function readXmlFile(zip: JSZip, filename: string): Promise<DNode> {
  const zipFile = zip.file(filename);
  if (!zipFile) throw new Error(`File ${filename} not found`);

  const xmlString = await zipFile.async('string');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  return doc2Json(doc);
}

export function doc2Json(doc: Document) {
    console.dir(doc)
    // return {};
    return documentDFS<Element>(doc.childNodes[0]);

  function documentDFS<T>(node: T extends Node, parentNode?: DNode) {
    const currentNode: DNode = {
      tag: node.nodeName,
      attributes: parseNodeAttributes<T>(node),
      children: Object.values(node.childNodes).map(i => documentDFS(i, currentNode)),
      parentNode,
      originNode: node,
    };
    return currentNode;
  }

  function parseNodeAttributes<T>(node: T) {
    const attributes: Record<string, string> = {};
    for (const attr of node.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }
}

interface DNode {
  tag: string;
  attributes: { [key: string]: string };
  children: DNode[];
  parentNode?: DNode;
  originNode: Node;
}
