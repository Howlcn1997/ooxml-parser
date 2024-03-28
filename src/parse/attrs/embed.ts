import OOXMLParser from '@/ooxmlParser';

export function parseMedia<T>(rId: string, parser: OOXMLParser, format: T) {
  return 'media-base64-string';
}

export function parseEmbedding(rId: string, parser: OOXMLParser) {
  return 'embed-base64-string';
}
