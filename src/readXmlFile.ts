import JSZip from 'jszip';

export async function readXmlFile(zip: JSZip, filename: string) {
  const zipFile = zip.file(filename);
  if (!zipFile) throw new Error(`File ${filename} not found`);

  const xmlString = await zipFile.async('string');
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
}
