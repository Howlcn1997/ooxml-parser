import JSZip from 'jszip';
import { XmlNode } from './xmlNode';

export async function readXmlFile(zip: JSZip, filename: string, log: boolean = false): Promise<XmlNode> {
  const zipFile = zip.file(filename);
  if (!zipFile) throw new Error(`File ${filename} not found`);

  const xmlString = await zipFile.async('string');
  const doc = xmlParser(xmlString);

  if (log) console.log(doc);

  return new XmlNode(doc.children[0]);
}

export function xmlParser(xmlString: string) {
  return new DOMParser().parseFromString(xmlString, 'text/xml');
}
