import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

import { loadNodeModule, runtimeEnv } from '@/utils/env';
import { ContentTypes, Presentation, Theme } from '@/types';
import { readXmlFile } from '@/readXmlFile';
import { XmlNode } from '@/xmlNode';
import { Color } from '@/parse/attrs/types';
import { parseColor } from '@/parse/attrs/color';
import parseSlide from '@/parse/slide/slide';
import imageHandler from '@/handlers/imageHandler';
import audioHandler from '@/handlers/audioHandler';
import videoHandler from '@/handlers/videoHandler';
import fontHandler from '@/handlers/fontHandler';
import embedHandler from '@/handlers/embedHandler';

interface ParserConfig {
  // 自定义长度处理器
  lengthHandler: (pt: number) => number;
  // 自定义字体大小处理器
  fontSizeHandler: (pt: number) => number;
  // 自定义图片媒体(png,gif,etc)资源处理器
  imageHandler: (file: File) => Promise<string>;
  // 自定义音频(mp3,wav,etc)资源处理器
  audioHandler: (file: File) => Promise<string>;
  // 自定义视频(mp4,avi,etc)资源处理器
  videoHandler: (file: File) => Promise<string>;
  // 自定义字体(ttf,woff,etc)处理器
  fontHandler: (file: File) => Promise<string>;
  // 自定义嵌入内容(Excel,Word)处理器
  embedHandler: (file: File) => Promise<string>;
}

interface Store {
  contentTypes?: ContentTypes;
  presentation?: Presentation;
  themes?: Theme[];
  slides?: any[];
}

class OOXMLParser {
  zip: JSZip | undefined;
  store: Map<keyof Store, any> = new Map<keyof Store, any>([]);

  config: ParserConfig = {
    lengthHandler: pt => (pt / 3) * 4,
    fontSizeHandler: pt => (pt / 3) * 4,
    imageHandler,
    audioHandler,
    videoHandler,
    fontHandler,
    embedHandler,
  };

  private _fileCache: Record<string, any> = new Map<string, any>([]);

  constructor(config?: Partial<ParserConfig>) {
    this.config = { ...this.config, ...config };
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

  async parse(file: File) {
    this.zip = this.zip || (await this.loadFile(file));
    const contentTypes = await this.parseContentTypes();
    const presentation = await this.parsePresentation();
    await this.parseSlideMasters(contentTypes.slideMasters);
    await this.parseSlideLayouts(contentTypes.slideLayouts);
    await this.parseThemes(contentTypes.themes);
    const slides = await this.parseSlides([contentTypes.slides[2]]);
    // await this.parseSlideLayouts(contentTypes.slideLayouts);
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

  async parseThemes(paths: string[]): Promise<Theme[]> {
    if (this.store.has('themes')) return this.store.get('themes');

    const themeXmlNodes = await Promise.all(paths.map(i => this.readXmlFile(i)));
    const themes = themeXmlNodes.map(i => {
      const schemeClr: Record<string, Color> = {};

      i.child('themeElements')
        ?.child('clrScheme')
        ?.children.forEach((j: XmlNode) => (schemeClr[j.name] = parseColor(j, this)));

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
    for (const path of paths) {
      const slideLayouts = await this.readXmlFile(path);
    }
  }

  async parseSlideMasters(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    for (const path of paths) {
      const slideMaster = await this.readXmlFile(path);
    }
  }

  async parseSlides(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this.store.has('slides')) return this.store.get('slides');
    const slides = await Promise.all(paths.map(async i => await parseSlide(i, this)));
    this.store.set('slides', slides);
    return slides;
  }
}

export default OOXMLParser;
