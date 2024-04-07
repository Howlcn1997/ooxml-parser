/* eslint-disable  @typescript-eslint/no-explicit-any */
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
import { emusToPt, ptToCm } from './utils/unit';
import Slide from './parse/slide/slide';
import SlideMaster from './parse/slide/slideMaster';
import SlideLayout from './parse/slide/slideLayout';

interface ParserConfig {
  // 自定义长度处理器
  lengthHandler: (emus: number) => number;
  // 自定义字体大小处理器
  fontSizeHandler: (emus: number) => number;
  // 自定义字体(ttf,woff,etc)处理器
  fontHandler: (file: File) => Promise<string>;
  // 自定义嵌入内容(Excel,Word,image,video,audio,...)处理器
  embedTransformer: (type: string, embedPath: string, zip: JSZip.JSZipObject) => Promise<string>;
}

class OOXMLParser {
  zip: JSZip | undefined;

  config: ParserConfig;
  defaultConfig: ParserConfig = {
    lengthHandler: emus => Math.round((ptToCm(emusToPt(emus)) + Number.EPSILON) * 100) / 100,
    fontSizeHandler: emus => emusToPt(emus),
    fontHandler,
    embedTransformer,
  };

  private _contentTypes: any;
  private _presentation: any;
  private _themes: any = {};

  private _slides: any = {};
  private _slideLayouts: any = {};
  private _slideMasters: any = {};

  // private _notes: any = {};
  // private _notesMasters: any = {};

  private _rels: any = {};

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
    const presentation = await this.presentation();
    const contentTypes = await this.contentTypes();
    // await this.slides(contentTypes.slides);
    await this.slides([contentTypes.slides[7]]);

    const themePaths = Object.keys(this._themes).sort(sortXml);
    const slidePaths = Object.keys(this._slides).sort(sortXml);

    return {
      slideSize: presentation.slideSize,
      noteSize: presentation.noteSize,
      themes: themePaths.map(path => this._themes[path]),
      slides: slidePaths.map(path => this._slides[path]),
    };

    function sortXml(p1: string, p2: string): number {
      const n1 = /(\d+)\.xml/.exec(p1)?.[1];
      const n2 = /(\d+)\.xml/.exec(p2)?.[1];
      const r1 = n1 ? parseInt(n1) : 0;
      const r2 = n2 ? parseInt(n2) : 0;
      return r1 - r2;
    }
  }

  /**
   * doc: https://learn.microsoft.com/en-us/visualstudio/extensibility/the-structure-of-the-content-types-dot-xml-file?view=vs-2022
   */
  async contentTypes(): Promise<ContentTypes> {
    if (!this.zip) throw new Error('No zip file loaded');

    if (this._contentTypes) return this._contentTypes;

    this._contentTypes = {
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
          this._contentTypes.slides.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml':
          this._contentTypes.slideLayouts.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml':
          this._contentTypes.slideMasters.push(i.attrs.PartName.substring(1));
          break;
        case 'application/vnd.openxmlformats-officedocument.theme+xml':
          this._contentTypes.themes.push(i.attrs.PartName.substring(1));
          break;
      }
    });

    return this._contentTypes;
  }

  async rels(path: string): Promise<Rels> {
    if (this._rels[path]) return this._rels[path];

    const relsFile = await this.readXmlFile(path);
    this._rels[path] = relsFile.children.reduce((rels, i) => {
      const type = i.attrs.Type.split('/').pop();
      const target = i.attrs.Target.replace('..', 'ppt');
      return { ...rels, [i.attrs.Id]: { type, target } };
    }, {});
    return this._rels[path];
  }

  /**
   * doc: https://learn.microsoft.com/en-us/office/open-xml/presentation/structure-of-a-presentationml-document
   */
  async presentation(): Promise<Presentation> {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this._presentation) return this._presentation;

    this._presentation = {
      slideMasterIdList: [],
      slideIdList: [],
      slideSize: {},
      noteSize: {},
      defaultTextStyle: {},
    };
    const presentation = await this.readXmlFile('ppt/presentation.xml');

    presentation.children.forEach((i: XmlNode) => {
      if (i.name === 'sldMasterIdLst') {
        this._presentation.slideMasterIdList = i.child('sldMasterId')?.attrs['r:id'];
      } else if (i.name === 'sldIdLst') {
        this._presentation.slideIdList = i.allChild('sldId').map(j => j.attrs['r:id']);
      } else if (i.name === 'sldSz') {
        this._presentation.slideSize = {
          w: this.config.lengthHandler(i.attrs.cx),
          h: this.config.lengthHandler(i.attrs.cy),
        };
      } else if (i.name === 'notesSz') {
        this._presentation.noteSize = {
          w: this.config.lengthHandler(i.attrs.cx),
          h: this.config.lengthHandler(i.attrs.cy),
        };
      } else if (i.name === 'defaultTextStyle') {
        i.children.forEach((j: XmlNode) => {
          this._presentation.defaultTextStyle[j.name] = j.attrs;
        });
      }
    });

    return this._presentation;
  }
  /**
   * 主题
   */
  async theme(path: string): Promise<Theme> {
    if (this._themes[path]) return this._themes[path];

    const themeXmlNode = await this.readXmlFile(path);
    const schemeClr: Record<string, Color> = {};

    const themeElements = themeXmlNode.child('themeElements');

    const children = themeElements?.child('clrScheme')?.children;
    if (!children) return { schemeClr };

    for (const child of children) {
      schemeClr[child.name] = await parseColor(child, null);
    }

    // const fillStyleLst = themeElements?.child('fmtScheme')?.child('fillStyleLst');
    // if (fillStyleLst) {
    //   const fillNodes = fillStyleLst.children;
    //   for (const fillNode of fillNodes) {
    //     const color = await parseFill(fillNode, null);
    //     schemeClr[fillStyle.name] = { ...color, ...fillStyle.attrs };
    //   }
    // }

    this._themes[path] = { schemeClr };
    return this._themes[path];
  }

  async themes(paths: string[]): Promise<Theme[]> {
    return await Promise.all(paths.map(path => this.theme(path)));
  }

  /**
   * 版式
   */
  slideLayout(path: string): SlideLayout {
    if (this._slideLayouts[path]) return this._slideLayouts[path];
    this._slideLayouts[path] = new SlideLayout(path, this);
    return this._slideLayouts[path];
  }

  slideLayouts(paths: string[]): SlideLayout[] {
    return paths.map(path => this.slideLayout(path));
  }

  /**
   * 母版
   */
  slideMaster(path: string): SlideMaster {
    if (this._slideMasters[path]) return this._slideMasters[path];
    this._slideMasters[path] = new SlideMaster(path, this);
    return this._slideMasters[path];
  }

  slideMasters(paths: string[]): SlideMaster[] {
    return paths.map(path => this.slideMaster(path));
  }
  /**
   * 幻灯片
   */
  async slide(path: string) {
    if (!this.zip) throw new Error('No zip file loaded');
    if (this._slides[path]) return this._slides[path];
    this._slides[path] = await new Slide(path, this).parse();
    return this._slides[path];
  }

  async slides(paths: string[]) {
    return Promise.all(paths.map(path => this.slide(path)));
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
