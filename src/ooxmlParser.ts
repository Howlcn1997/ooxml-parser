import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

import { loadNodeModule, runtimeEnv } from './utils/env';
import { DocArrayNode, DocObjectNode } from './types';
import { dataFromStrings, getValueByPaths, readXmlFile } from './readXmlFile';
import { pt2px } from './unit';
import { translate } from './config/translate';

interface ContentTypes {
  // 幻灯片文件地址
  slides: string[];
  // 幻灯片布局文件地址
  slideLayouts: string[];
  // 幻灯片主题文件地址
  slideMasters: string[];
  // 主题文件地址
  themes: string[];
}

interface Presentation {
  slideMasterIdList: string[];
  slideIdList: string[];
  slideSize: Record<string, string>;
  noteSize: Record<string, string>;
  // 默认文本样式
  defaultTextStyle: Record<string, Record<string, string>>;
}

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

    const slides = await this.parseSlides(contentTypes.slides);
    // await this.parseSlideLayouts(contentTypes.slideLayouts);
    // await this.parseSlideMasters(contentTypes.slideMasters);
    // await this.parseThemes(contentTypes.themes);
    // await this.parseSlide(contentTypes.slides[1]);
    return slides;
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
    if (!contentTypes.children) return result;

    const overrides = contentTypes.children.filter((i: DocArrayNode) => i.tag === 'Override');
    if (!overrides.length) return result;

    overrides.forEach((i: DocArrayNode) => {
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
    if (!presentation.children) return result;

    presentation.children.forEach((i: DocArrayNode) => {
      if (i.tag === 'p:sldMasterIdLst') {
        result.slideMasterIdList = i.children?.map((j: DocArrayNode) => j.attrs['r:id']) || [];
      } else if (i.tag === 'p:sldIdLst') {
        result.slideIdList = i.children?.map((j: DocArrayNode) => j.attrs['r:id']) || [];
      } else if (i.tag === 'p:sldSz') {
        result.slideSize = this.pt2pxOfObject(i.attrs);
      } else if (i.tag === 'p:notesSz') {
        result.noteSize = this.pt2pxOfObject(i.attrs);
      } else if (i.tag === 'p:defaultTextStyle') {
        i.children?.forEach((j: DocArrayNode) => {
          result.defaultTextStyle[j.tag] = this.pt2pxOfObject(j.attrs);
        });
      }
    });

    this.store.set('presentation', result);

    return result;
  }

  async parseSlides(paths: string[]) {
    if (!this.zip) throw new Error('No zip file loaded');
    // 解析slide时使用object格式，方便快速查找
    const slide = await readXmlFile(this.zip, paths[1], 'object');
    const slideResult = this.parseSingleSlide(slide);
    // return [slideResult];
  }

  parseSingleSlide(slide: DocObjectNode) {
    const shapeNode = getValueByPaths(slide, ['p:cSld', 'p:spTree']) as DocObjectNode;
    const shapes = [];
    Object.entries(shapeNode).forEach(([tag, node]) => {
      switch (tag) {
        case 'p:sp':
          shapes.push((Array.isArray(node) ? node : [node]).map(i => this.parseSp(i as DocObjectNode)));
          break;
        case 'p:pic':
          shapes.push((Array.isArray(node) ? node : [node]).map(i => this.parsePic(i as DocObjectNode)));
          break;
        default:
          return {
            type: 'unknown',
          };
      }
    });
    // return shapes;
  }

  parseSp(node: DocObjectNode) {
    console.log(node);
    return node;
  }

  parsePic(node: DocObjectNode) {
    // const shapeProps = dataFromStrings(node, ['p:spPr', '0', 'children']);
    // return shapeProps;

    return node;
  }

  async parseSlideLayouts(paths: string[]) {
    console.log('parseSlideLayouts', paths);
  }

  async parseSlideMasters(paths: string[]) {
    console.log('parseSlideMasters', paths);
  }

  async parseThemes(paths: string[]) {
    console.log('parseTheme', paths);
  }

  pt2px(pt: string, unitName?: string) {
    return pt2px(pt, this.parserOptions, unitName);
  }

  pt2pxOfObject(obj: Record<string, any>) {
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[translate(key)] = this.pt2px(obj[key], key);
    }
    return result;
  }
}

export default OOXMLParser;
