import { XmlNode } from '@/xmlNode';
import SlideBase from '../slide/slideBase';
import { Text } from './types';

export default async function parseText(shape: XmlNode, slide: SlideBase): Promise<Text | null> {
  const txBody = shape.child('txBody');
  if (!txBody) return null;
  // 正文属性
  const { pad, autoFix, writeMode } = parseTxBodyPr(txBody.child('bodyPr') as XmlNode, slide);
  // 文本列表样式
  const listStyle = txBody.child('lstStyle') as XmlNode;
  // 文本段落
  const pNodes = txBody.allChild('p') as XmlNode[];

  if (!pNodes.length) return null;

  return { pad, autoFix, writeMode, paragraphs: [] };
}

function parseTxBodyPr(txBodyPr: XmlNode, slide: SlideBase) {
  const lHandler = slide.parser.config.lengthHandler;

  const {
    vert,
    numCol = '1',
    rtlCol,
    anchor,
    anchorCtr,
    lIns = '90000',
    rIns = '90000',
    tIns = '46800',
    bIns = '46800',
  } = txBodyPr.attrs;

  return {
    pad: {
      l: lHandler(+lIns),
      t: lHandler(+tIns),
      r: lHandler(+rIns),
      b: lHandler(+bIns),
    },
    anchor,
    anchorCtr,
    numCol: +numCol,
    writeMode: vertToCssWriteMode(vert),
    autoFix: parseAutoFix(txBodyPr),
  };
}

function parseAutoFix(txBodyPr: XmlNode): Text['autoFix'] {
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

function vertToCssWriteMode(vert: string): Text['writeMode'] {
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

