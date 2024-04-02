import OOXMLParser from '@/ooxmlParser';
import parseSlideBackground from '@/parse/slide/background';
// import { Slide } from '@/parse/slide/types';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';
import { Background, Rels } from './types';
import { Shape } from '../shape/type';

export default async function parseSlide(path: string, parser: OOXMLParser) {
  // slide图层层级关系: (slide.bg | slideLayout.bg) < slideLayout.spTree < slide.spTree
  // 背景
  const background = await parseSlideBackground(path, parser);
  // 元素
  const slide = await parser.readXmlFile(path);
  const spTree = slide.child('cSld')?.child('spTree');
  const elements = (
    await Promise.all(spTree?.children?.map((i: XmlNode) => parseShape(i, path, parser)) || [])
  )?.filter(Boolean);
  return { background, elements };
}

class Slide {
  private _background: any;
  private _elements: any;
  private _rels: any;

  sldPath: string;
  parser: OOXMLParser;

  constructor(sldPath: string, parser: OOXMLParser) {
    this.sldPath = sldPath;
    this.parser = parser;
  }

  async background(): Promise<Background> {
    if (this._background) return this._background;
    return this._background;
  }

  async elements(): Promise<Shape[]> {
    if (this._elements) return this._elements;
    return this._elements;
  }

  async rels(): Promise<Rels> {
    if (this._rels) return this._rels;
    return this._rels;
  }
}
