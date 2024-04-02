/* eslint-disable  @typescript-eslint/no-explicit-any */
import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';
import { Background, Rels } from './types';
import { Shape } from '../shape/type';
import parseSlideBackground from './background';

export default class SlideBase {
  private _background: any;
  private _elements: any;
  private _rels: any = {};

  sldPath: string;
  parser: OOXMLParser;

  constructor(sldPath: string, parser: OOXMLParser) {
    this.sldPath = sldPath;
    this.parser = parser;
  }

  async xmlNode(): Promise<XmlNode> {
    return await this.parser.readXmlFile(this.sldPath);
  }

  async background(): Promise<Background> {
    if (this._background) return this._background;
    this._background = await parseSlideBackground(this, this.parser);
    return this._background;
  }

  async elements(): Promise<Shape[]> {
    if (this._elements) return this._elements;
    const slide = await this.parser.readXmlFile(this.sldPath);
    const spTree = slide.child('cSld')?.child('spTree');
    this._elements = (
      await Promise.all(spTree?.children?.map((i: XmlNode) => parseShape(i, this, this.parser)) || [])
    )?.filter(Boolean);
    return this._elements;
  }

  async rels(scope: 'master' | 'layout' | 'slide' = 'slide'): Promise<Rels> {
    if (this._rels[scope]) return this._rels[scope];
    const slideNumber = (this.sldPath.split('/').pop() as string).match(/\d+/);

    const targetRelsPath = {
      master: `ppt/slideMasters/_rels/slideMaster${slideNumber}.xml.rels`,
      layout: `ppt/slideLayouts/_rels/slideLayout${slideNumber}.xml.rels`,
      slide: `ppt/slides/_rels/slide${slideNumber}.xml.rels`,
    }[scope];

    this._rels[scope] = await this.parser.rels(targetRelsPath);
    return this._rels[scope];
  }
  // 生成JSON
  async parse() {
    return { background: await this.background(), elements: await this.elements() };
  }
  // 生成XML String
  async format(): Promise<string> {
    return `<bg></bg>
    <spTree></spTree>`;
  }
}
