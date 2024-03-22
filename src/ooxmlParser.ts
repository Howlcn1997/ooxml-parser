import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

import { loadNodeModule, runtimeEnv } from './utils/env';
import { ContentTypes, Presentation, Theme } from './types';
import { readXmlFile } from './readXmlFile';
import { pt2px } from './attrs-parse/unit';
import { translate } from './config/translate';
// import { spParse, picParse } from './shape-parse';
import { XmlNode } from './xmlNode';
import { Color } from './attrs-parse/types';
import { parseColor } from './attrs-parse/color';

interface ParserOptions {
  lengthFactor: number;
  fontsizeFactor: number;
}

class OOXMLParser {
  zip: JSZip | undefined;
  parserOptions: ParserOptions = {
    lengthFactor: 96 / 914400,
    fontsizeFactor: 100 / 75,
  };
  store: Record<string, any> = new Map([]);

  async loadFile(file: File): Promise<JSZip> {
    const env = runtimeEnv();
    if (env === 'node') {
      const fs = loadNodeModule<typeof import('fs')>('fs');
      const path = loadNodeModule<typeof import('path')>('path');
      const file = fs.readFileSync(path.join(__dirname, '../assets/ppt/simple.pptx'));
      this.zip = await JSZip.loadAsync(file);
    } else {
      this.zip = await JSZip.loadAsync(file);
    }
    // 清理缓存
    this.store.clear();
    return this.zip;
  }

  async parse(file: File, options?: ParserOptions) {
    this.zip = this.zip || (await this.loadFile(file));
    this.parserOptions = options || this.parserOptions;
    const contentTypes = await this.parseContentTypes();
    const presentation = await this.parsePresentation();
    const themes = await this.parseThemes(contentTypes.themes);

    // const slides = await this.parseSlides(contentTypes.slides);
    // await this.parseSlideLayouts(contentTypes.slideLayouts);
    // await this.parseSlideMasters(contentTypes.slideMasters);

    // await this.parseSlide(contentTypes.slides[1]);
    return themes;
  }

  /**
   * doc: https://learn.microsoft.com/en-us/visualstudio/extensibility/the-structure-of-the-content-types-dot-xml-file?view=vs-2022
   */
  async parseContentTypes(): Promise<ContentTypes> {
    if (!this.zip) throw new Error('No zip file loaded');

    if (this.store.has('contentTypes')) return this.store.get('contentTypes');

    const result: ContentTypes = {
      slides: [],
      slideLayouts: [],
      slideMasters: [],
      themes: [],
    };

    const contentTypes = await readXmlFile(this.zip, '[Content_Types].xml');

    const overrides = contentTypes.allChild('Override');

    overrides.forEach((i: XmlNode) => {
      switch (i.attrs.ContentType) {
        case 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml':
          result.slides.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml':
          result.slideLayouts.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml':
          result.slideMasters.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.theme+xml':
          result.themes.push(i.attrs.PartName.substring(1));
          break;
      }
    });

    result.slides = result.slides.sort(sortSlideXml);
    result.slideLayouts = result.slideLayouts.sort(sortSlideXml);
    result.slideMasters = result.slideMasters.sort(sortSlideXml);
    result.themes = result.themes.sort(sortSlideXml);

    this.store.set('contentTypes', result);

    return result;

    function sortSlideXml(p1: string, p2: string): number {
      const n1 = /(\d+)\.xml/.exec(p1)?.[1];
      const n2 = /(\d+)\.xml/.exec(p2)?.[1];
      const r1 = n1 ? parseInt(n1) : 0;
      const r2 = n2 ? parseInt(n2) : 0;
      return r1 - r2;
    }
  }

  /**
   * doc: https://learn.microsoft.com/en-us/office/open-xml/presentation/structure-of-a-presentationml-document
   */
  async parsePresentation(): Promise<Presentation> {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('presentation')) return this.store.get('presentation');

    const result: Presentation = {
      slideMasterIdList: [],
      slideIdList: [],
      slideSize: {},
      noteSize: {},
      defaultTextStyle: {},
    };
    const presentation = await readXmlFile(this.zip, 'ppt/presentation.xml');

    presentation.children.forEach((i: XmlNode) => {
      if (i.name === 'sldMasterIdLst') {
        result.slideMasterIdList = i.child('sldMasterId')?.attrs['r:id'];
      } else if (i.name === 'sldIdLst') {
        result.slideIdList = i.allChild('sldId').map(j => j.attrs['r:id']);
      } else if (i.name === 'sldSz') {
        result.slideSize = i.attrs;
      } else if (i.name === 'notesSz') {
        result.noteSize = i.attrs;
      } else if (i.name === 'defaultTextStyle') {
        i.children.forEach((j: XmlNode) => {
          result.defaultTextStyle[j.name] = j.attrs;
        });
      }
    });

    this.store.set('presentation', result);

    return result;
  }

  async parseThemes(paths: string[]): Promise<Theme[]> {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('themes')) return this.store.get('themes');

    const themeXmlNodes = await Promise.all(paths.map(i => readXmlFile(this.zip as JSZip, i)));
    const themes = themeXmlNodes.map(i => {
      const clrScheme: Record<string, Color> = {};

      i.child('themeElements')
        ?.child('clrScheme')
        ?.children.forEach((j: XmlNode) => (clrScheme[j.name] = parseColor(j)));

      return { clrScheme } as Theme;
    });

    this.store.set('themes', themes);
    return themes;
  }

  async parseSlideLayouts(paths: string[]) {
    console.log('parseSlideLayouts', paths);
  }

  async parseSlideMasters(paths: string[]) {
    console.log('parseSlideMasters', paths);
  }

  async parseSlides(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    // 解析slide时使用object格式，方便快速查找
    const slide = await readXmlFile(this.zip, paths[1], 'object');
    const slideResult = this.parseSingleSlide(slide);
    // return [slideResult];
  }

  parseSingleSlide(slide: XmlNode) {}

  parsePic(node: XmlNode) {
    // const shapeProps = dataFromStrings(node, ['p:spPr', '0', 'children']);
    // return shapeProps;

    return node;
  }

  pt2pxOfObject(obj: Record<string, any>) {
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[translate(key)] = pt2px(obj[key], this.parserOptions, key);
    }
    return result;
  }
}

export default OOXMLParser;
