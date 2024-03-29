import JSZip from 'jszip';

export default async function transformer(type: string, embedPath: string, zip: JSZip.JSZipObject) {
  if (type === 'image') {
    const format = embedPath.split('.').pop();
    return `data:image/${format};base64,${await zip.async('base64')}`;
  }
  return `unknown type: ${type}-${embedPath}`;
}
