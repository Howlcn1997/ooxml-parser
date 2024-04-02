/* eslint-disable  @typescript-eslint/no-explicit-any */
import OOXMLParser from '@/ooxmlParser';
import { XmlNode } from '@/xmlNode';
import parseShape from '@/parse/shape';
import { Background, Rel, Rels } from './types';
import { Shape } from '../shape/type';
import parseSlideBackground from './background';
import SlideLayout from './slideLayout';
import SlideMaster from './slideMaster';
import { Theme } from '@/types';

export enum SlideType {
  Slide = 'slide',
  SlideLayout = 'slideLayout',
  SlideMaster = 'slideMaster',
}

export default class SlideBase {
  private _background: any;
  private _elements: any;
  private _rels: any;
  private _theme: any;

  type: SlideType;
  sldPath: string;
  parser: OOXMLParser;

  constructor(type: SlideType, sldPath: string, parser: OOXMLParser) {
    this.type = type;
    this.sldPath = sldPath;
    this.parser = parser;
  }

  async xmlNode(): Promise<XmlNode> {
    return await this.parser.readXmlFile(this.sldPath);
  }

  async background(): Promise<Background> {
    if (this._background) return this._background;
    this._background = await parseSlideBackground(this);
    return this._background;
  }

  async elements(): Promise<Shape[]> {
    if (this._elements) return this._elements;
    const slide = await this.parser.readXmlFile(this.sldPath);
    const spTree = slide.child('cSld')?.child('spTree');
    this._elements = (await Promise.all(spTree?.children?.map((i: XmlNode) => parseShape(i, this)) || []))?.filter(
      Boolean
    );
    return this._elements;
  }

  /**
   * @returns 当前Slide的关联项
   */
  async rels(): Promise<Rels> {
    if (this._rels) return this._rels;
    const slideNumber = getSlideNumber(this.sldPath);
    return await this.parser.rels(`ppt/${this.type}s/_rels/${this.type}${slideNumber}.xml.rels`);

    function getSlideNumber(str: string): string {
      return (str.split('/').pop() as string).match(/\d+/)?.[0] as string;
    }
  }

  /**
   * 只有Slide才有版式
   * @returns 当前Slide关联的版式
   */
  async layout(): Promise<SlideLayout | null> {
    if (this.type === SlideType.Slide) {
      const rels = await this.rels();
      const layout = Object.values(rels).find(i => i.type === 'slideLayout') as Rel;
      return this.parser.slideLayout(layout.target);
    }
    return null;
  }

  /**
   * 只有slideLayout才有母版
   * @returns 当前Slide关联的母版
   */
  async master(): Promise<SlideMaster | null> {
    if (this.type === SlideType.SlideLayout) {
      const rels = await this.rels();
      const masterRel = Object.values(rels).find(i => i.type === 'slideMaster') as Rel;
      return this.parser.slideMaster(masterRel.target);
    }
    return null;
  }

  /**
   * @returns 当前Slide关联的主题
   */
  async theme(): Promise<Theme> {
    if (this._theme) return this._theme;

    let theme;
    const rels = await this.rels();
    const themeRel = Object.values(rels).find(i => i.type === 'theme');
    if (themeRel) theme = await this.parser.theme(themeRel.target);

    if (!theme) {
      const layoutRels = (await this.layout())?.rels();
      const layoutThemeRel = Object.values(layoutRels || {}).find(i => i.type === 'theme');
      if (layoutThemeRel) theme = await this.parser.theme(layoutThemeRel.target);
    }

    if (!theme) {
      const masterRels = (await this.master())?.rels();
      const masterThemeRel = Object.values(masterRels || {}).find(i => i.type === 'theme');
      if (masterThemeRel) theme = await this.parser.theme(masterThemeRel.target);
    }

    theme = theme || (await this.parser.theme('ppt/theme/theme1.xml'));

    const schemeClr = theme.schemeClr;

    const clrMap = await this.clrMap();
    const mergeSchemeClr = Object.keys(clrMap).reduce(
      (clr, clrMapKey) => ({ ...clr, [clrMapKey]: schemeClr[clrMap[clrMapKey]] }),
      { ...schemeClr }
    );

    return (this._theme = { ...theme, schemeClr: mergeSchemeClr });
  }

  async clrMap(): Promise<Record<string, string>> {
    const xmlNode = await this.xmlNode();
    const clrMapNode = xmlNode.child('clrMap');
    if (clrMapNode) return clrMapNode.attrs;

    const clrMapOvr = xmlNode.child('clrMapOvr');
    if (clrMapOvr) {
      const masterClrMap = clrMapOvr.child('masterClrMap');
      if (masterClrMap) return await (this.master() as any).clrMap();

      const overrideClrMapping = clrMapOvr.child('overrideClrMapping');
      if (overrideClrMapping) return overrideClrMapping.attrs;
    }

    return {
      accent1: 'accent1',
      accent2: 'accent2',
      accent3: 'accent3',
      accent4: 'accent4',
      accent5: 'accent5',
      accent6: 'accent6',
      folHlink: 'folHlink',
      hlink: 'hlink',
      dk1: 'dk1',
      dk2: 'dk2',
      lt1: 'lt1',
      lt2: 'lt2',
      tx1: 'dk1',
      tx2: 'dk2',
      bg1: 'lt1',
      bg2: 'lt2',
    };
  }

  // 生成JSON
  async parse() {
    // await this.master();
    // console.log(this.type, await this.layout());
    return { background: await this.background(), elements: await this.elements() };
  }
  // 生成XML String
  async format(): Promise<string> {
    return `<bg></bg>
    <spTree></spTree>`;
  }
}
