import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Paragraph, TextContent, Text } from './types';
import { emusToPercentage } from '@/utils/unit';
import { parseFill } from './fill';
import parseLine from './line';
import { fontFamily } from './font';
import { removeEmptyIn } from '@/utils/tools';
import { parseEffect } from './effect';

export default async function parseContent(shape: XmlNode, slide: SlideBase): Promise<TextContent | undefined> {
  const txBody = shape.child('txBody');
  if (!txBody) return;
  // 正文属性
  const contentPr = textContentPr(txBody.child('bodyPr') as XmlNode, slide);
  // 文本列表样式
  // const listStyle = parseListStyle(txBody.child('lstStyle') as XmlNode);
  // 文本段落
  const paragraphs = await parseParagraphs(txBody.allChild('p') as XmlNode[], slide);

  if (!paragraphs.length) return;

  return { ...contentPr, paragraphs };
}

function textContentPr(txBodyPr: XmlNode, slide: SlideBase): Omit<TextContent, 'paragraphs'> {
  const lHandler = slide.parser.config.lengthHandler;

  const {
    vert,
    // anchor,
    // anchorCtr,
    // numCol = '1',
    lIns = '90000',
    rIns = '90000',
    tIns = '46800',
    bIns = '46800',
  } = txBodyPr.attrs;

  return {
    // anchor,
    // anchorCtr,
    // numCol: +numCol,
    writeMode: vertToCssWriteMode(vert),
    autoFix: parseAutoFix(txBodyPr),
    pad: {
      l: lHandler(+lIns),
      t: lHandler(+tIns),
      r: lHandler(+rIns),
      b: lHandler(+bIns),
    },
  };

  function parseAutoFix(txBodyPr: XmlNode): TextContent['autoFix'] {
    const children = txBodyPr.children;
    for (const child of children) {
      switch (child.name) {
        case 'noAutofit':
          return 'no';
        case 'spAutoFit':
          return 'shape';
        case 'normAutofit':
          return 'normal';
      }
    }
    return 'no';
  }

  function vertToCssWriteMode(vert: string): TextContent['writeMode'] {
    switch (vert) {
      // 横向
      case 'vert':
        return 'vertical-rl';
      case 'horz':
        return 'horizontal-tb';
      case 'vert90':
      case 'vert270':
      case 'wordArtVertRtl': // 文字堆积
        return 'vertical-rl';
      default:
        return 'horizontal-tb';
    }
  }
}

// function parseListStyle(listStyle: XmlNode) {
// }

function parseParagraphs(pNodes: XmlNode[], slide: SlideBase): Promise<Paragraph[]> {
  const autoNumberedBullet: Record<string, number> = {};

  const lHandler = slide.parser.config.lengthHandler;

  return Promise.all(
    pNodes.map(async pNode => {
      const { algn, buAutoNumType: atoType, lineHeight, margin } = parseParagraphProps(pNode);
      if (atoType) {
        autoNumberedBullet[atoType] = autoNumberedBullet[atoType] ? autoNumberedBullet[atoType] + 1 : 1;
      }
      const texts = await parseTexts(pNode, slide);

      return {
        algn,
        lineHeight,
        margin,
        texts,
      };
    })
  );

  /**
   * doc:
   * - https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.paragraphproperties?view=openxml-3.0.1
   */
  function parseParagraphProps(pNode: XmlNode): Omit<Paragraph, 'texts'> & { buAutoNumType?: string } {
    const pPr = pNode.child('pPr');

    const { algn = 'l', indent = '0', marL = '0', marR = '0', marT = '0', marB = '0' } = pPr?.attrs || {};
    const buAutoNumType = pPr?.child('buAutoNum')?.attrs?.type;
    const lineHeight = pPr?.child('lnSpc')?.child('spcPct')?.attrs?.val;

    return {
      algn,
      buAutoNumType,
      lineHeight: lineHeight ? emusToPercentage(+lineHeight) : 1,
      margin: {
        l: lHandler(+marL) + lHandler(+indent),
        r: lHandler(+marR),
        t: lHandler(+marT),
        b: lHandler(+marB),
      },
    };
  }

  function parseTexts(pNode: XmlNode, slide: SlideBase): Promise<Text[]> {
    const fszHandler = slide.parser.config.fontSizeHandler;
    const runNodes = pNode.allChild('r');

    return Promise.all(
      runNodes.map(async runNode => {
        const text: Record<string, any> = {};

        const runPropsNode = runNode.child('rPr') as XmlNode;
        const { sz: size = '1800', b, i, strike, u, spc } = runPropsNode.attrs;

        if (b) text.bold = b === '1';
        if (i) text.italic = i === '1';
        if (u) text.underline = u;
        if (strike) text.strike = strike;
        if (spc) text.spacing = fszHandler(+spc);

        text.fill = await parseFill(runPropsNode, slide, null);

        text.line = await parseLine(runPropsNode.child('ln'), slide);

        text.family = fontFamily(runPropsNode);

        text.highlight = await parseFill(runPropsNode.child('highlight'), slide, null);

        text.effect = await parseEffect(runPropsNode.child('effectLst'), slide);

        const tNode = runNode.child('t') as XmlNode;
        return removeEmptyIn({
          ...text,
          content: tNode.text,
          size: fszHandler(+size),
        });
      })
    );
  }
}
