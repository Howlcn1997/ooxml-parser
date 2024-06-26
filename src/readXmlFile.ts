import JSZip from 'jszip';
import jsdom from 'jsdom';
import { XmlNode } from './xmlNode';
import { runtimeEnv } from './utils/env';
import { RuntimeEnv } from './types';

export async function readXmlFile(zip: JSZip, filename: string): Promise<XmlNode> {
  const zipFile = zip.file(filename);
  if (!zipFile) throw new Error(`File ${filename} not found`);

  const xmlString = await zipFile.async('string');
  const doc = xmlParser(xmlString);

  return new XmlNode(doc.children[0]);
}

export function xmlParser(xmlString: string) {
  const env = runtimeEnv();
  if (env === RuntimeEnv.Browser) {
    return new DOMParser().parseFromString(xmlString, 'text/xml');
  }
  return new jsdom.JSDOM(xmlString, { contentType: 'text/xml' }).window.document;
}
