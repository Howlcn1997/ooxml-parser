import JSZip from 'jszip';
import { loadNodeModule, runtimeEnv } from '@/utils/env';
import { ContentTypes, Presentation, Theme } from '@/types';
import { readXmlFile } from '@/readXmlFile';
import { XmlNode } from '@/xmlNode';
import fontHandler from '@/handlers/fontHandler';
import embedTransformer from '@/handlers/embedTransformer';

import { parseColor } from './parse/attrs/color';
import { Color } from './parse/attrs/types';

import { Rels } from './parse/slide/types';
import parseSlide from './parse/slide/master';
import parseMaster from './parse/slide/master';
import parseLayout from './parse/slide/layout';
import { ptToCm } from './utils/unit';

interface ParserConfig {
  // 自定义长度处理器
  lengthHandler: (pt: number) => number;
  // 自定义字体大小处理器
  fontSizeHandler: (pt: number) => number;
  // 自定义字体(ttf,woff,etc)处理器
  fontHandler: (file: File) => Promise<string>;
  // 自定义嵌入内容(Excel,Word,image,video,audio,...)处理器
  embedTransformer: (type: string, embedPath: string, zip: JSZip.JSZipObject) => Promise<string>;
}

interface Store {
  contentTypes?: ContentTypes;
  presentation?: Presentation;
  themes?: Theme[];
  slides?: any[];
  layouts?: any[];
  masters?: any[];
}

class OOXMLParser {
  zip: JSZip | undefined;
  store: Map<keyof Store, any> = new Map<keyof Store, any>([]);

  config: ParserConfig;
  defaultConfig: ParserConfig = {
    lengthHandler: pt => Math.round((ptToCm(pt) + Number.EPSILON) * 100) / 100,
    fontSizeHandler: pt => pt,
    fontHandler,
    embedTransformer,
  };



  private _relsCache = new Map<string, Rels>([]);
  private _fileCache = new Map<string, any>([]);

  constructor(config?: Partial<ParserConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }

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

  async readXmlFile(path: string, log?: boolean): Promise<XmlNode> {
    // TODO: 当zip未加载时, 则延迟响应, 当超时时, 抛出异常
    if (!this.zip) throw new Error('No zip file loaded, please loadFile first');
    if (this._fileCache.has(path)) return this._fileCache.get(path);

    const theFile = await readXmlFile(this.zip, path, log);
    this._fileCache.set(path, theFile);
    return theFile;
  }

  async readFile(path: string): Promise<JSZip.JSZipObject | null> {
    if (!this.zip) throw new Error('No zip file loaded, please loadFile first');
    return await this.zip.file(path);
  }

  async parse(file: File) {
    this.zip = this.zip || (await this.loadFile(file));
    await this.parsePresentation();
    const contentTypes = await this.parseContentTypes();
    await this.parseThemes(contentTypes.themes);
    // await this.parseSlideMasters(contentTypes.slideMasters);
    // await this.parseSlideLayouts(contentTypes.slideLayouts);
    // await this.parseSlides(contentTypes.slides);
    await this.parseSlides([contentTypes.slides[6]]);
    return this.store;
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

    const contentTypes = await this.readXmlFile('[Content_Types].xml');

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

  async getSlideRels(slidePath: string, scope: 'master' | 'layout' | 'slide' = 'slide'): Promise<Rels> {
    const cacheKey = `${scope}::${slidePath}`;
    if (this._relsCache.has(cacheKey)) return this._relsCache.get(cacheKey) as Rels;

    const slideNumber = (slidePath.split('/').pop() as string).match(/\d+/);

    const targetRelsPath = {
      master: `ppt/slideMasters/_rels/slideMaster${slideNumber}.xml.rels`,
      layout: `ppt/slideLayouts/_rels/slideLayout${slideNumber}.xml.rels`,
      slide: `ppt/slides/_rels/slide${slideNumber}.xml.rels`,
    }[scope];

    const relsFile = await this.readXmlFile(targetRelsPath);
    return relsFile.children.reduce((rels, i) => {
      rels[i.attrs.Id] = {
        type: i.attrs.Type.split('/').pop(),
        target: i.attrs.Target.replace('..', 'ppt'),
      };
      return rels;
    }, {} as Rels);
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
    const presentation = await this.readXmlFile('ppt/presentation.xml');

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
  /**
   * 主题
   */
  async parseThemes(paths: string[]): Promise<Theme[]> {
    if (this.store.has('themes')) return this.store.get('themes');

    const themeXmlNodes = await Promise.all(paths.map(i => this.readXmlFile(i)));
    const themes = themeXmlNodes.map(i => {
      const schemeClr: Record<string, Color> = {};

      i.child('themeElements')
        ?.child('clrScheme')
        ?.children.forEach((j: XmlNode) => (schemeClr[j.name] = parseColor(j, this, { schemeToRgba: false })));

      return { schemeClr } as Theme;
    });

    this.store.set('themes', themes);
    return themes;
  }

  /**
   * 版式
   */
  async parseSlideLayouts(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('layouts')) return this.store.get('layouts');
    const layouts = await Promise.all(paths.map(async layoutPath => await parseLayout(layoutPath, this)));
    this.store.set('layouts', layouts);
    return layouts;
  }
  /**
   * 母版
   */
  async parseSlideMasters(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('masters')) return this.store.get('masters');
    const masters = await Promise.all(paths.map(async masterPath => await parseMaster(masterPath, this)));
    this.store.set('masters', masters);
    return masters;
  }
  /**
   * 幻灯片
   */
  async parseSlides(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('slides')) return this.store.get('slides');
    const slides = await Promise.all(paths.map(async sldPath => await parseSlide(sldPath, this)));
    this.store.set('slides', slides);
    return slides;
  }

  async allXmlFile() {
    if (!this.zip) throw new Error('No zip file loaded');
    const _zipFiles = { ...this.zip.files } as Record<string, any>;
    const filePaths = Object.keys(_zipFiles);
    for (const path of filePaths) {
      _zipFiles[path] = ((await this.readXmlFile(path)) as any)._node;
    }
    return _zipFiles;
  }
}

export default OOXMLParser;
